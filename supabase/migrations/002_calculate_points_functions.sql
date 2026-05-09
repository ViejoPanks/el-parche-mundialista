-- ============================================================
-- Migración 002: Funciones de cálculo de puntos
-- ============================================================
-- Implementa la matriz de puntuación del reglamento v1.0
-- y el trigger automático que recalcula puntos cuando un
-- partido pasa a 'finished'.
--
-- Dependencias: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. MATRIZ DE PUNTUACIÓN
-- ============================================================
-- Devuelve los puntos según el tipo de acierto y la fase.
-- Acierto: 'exact', 'diff', 'winner', 'none'

CREATE OR REPLACE FUNCTION get_phase_points(
  p_phase match_phase,
  p_acierto TEXT
)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    -- Marcador exacto
    WHEN p_acierto = 'exact' THEN
      CASE p_phase
        WHEN 'group'       THEN 5
        WHEN 'r32'         THEN 6   -- dieciseisavos (formato 2026)
        WHEN 'r16'         THEN 6   -- octavos
        WHEN 'qf'          THEN 7
        WHEN 'sf'          THEN 9
        WHEN 'third_place' THEN 10
        WHEN 'final'       THEN 10
      END

    -- Diferencia + ganador
    WHEN p_acierto = 'diff' THEN
      CASE p_phase
        WHEN 'group'       THEN 3
        WHEN 'r32'         THEN 4
        WHEN 'r16'         THEN 4
        WHEN 'qf'          THEN 5
        WHEN 'sf'          THEN 6
        WHEN 'third_place' THEN 6
        WHEN 'final'       THEN 6
      END

    -- Solo ganador
    WHEN p_acierto = 'winner' THEN
      CASE p_phase
        WHEN 'group'       THEN 1
        WHEN 'r32'         THEN 1
        WHEN 'r16'         THEN 1
        WHEN 'qf'          THEN 2
        WHEN 'sf'          THEN 2
        WHEN 'third_place' THEN 2
        WHEN 'final'       THEN 2
      END

    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_phase_points IS
'Devuelve los puntos según el tipo de acierto (exact/diff/winner/none) y la fase del partido. Implementa la matriz del reglamento v1.0.';


-- ============================================================
-- 2. FUNCIÓN PRINCIPAL: calculate_match_points
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_match_points(p_match_id INTEGER)
RETURNS TABLE (
  predictions_processed INTEGER,
  total_points_awarded INTEGER
) AS $$
DECLARE
  v_match           RECORD;
  v_actual_winner   TEXT;       -- 'local', 'visitante', 'draw'
  v_actual_diff     INTEGER;    -- diferencia de goles real
  v_processed       INTEGER := 0;
  v_total_points    INTEGER := 0;
BEGIN
  SELECT * INTO v_match
  FROM matches
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match % no encontrado', p_match_id;
  END IF;

  IF v_match.status <> 'finished' THEN
    RAISE EXCEPTION 'Match % no está terminado (status=%)', p_match_id, v_match.status;
  END IF;

  IF v_match.goals_local_90 IS NULL OR v_match.goals_visitante_90 IS NULL THEN
    RAISE EXCEPTION 'Match % no tiene goles registrados', p_match_id;
  END IF;

  v_actual_winner := CASE
    WHEN v_match.goals_local_90 > v_match.goals_visitante_90 THEN 'local'
    WHEN v_match.goals_local_90 < v_match.goals_visitante_90 THEN 'visitante'
    ELSE 'draw'
  END;

  v_actual_diff := v_match.goals_local_90 - v_match.goals_visitante_90;

  WITH prediction_evaluation AS (
    SELECT
      pr.id,
      pr.user_id,
      pr.match_id,
      CASE
        WHEN pr.pred_local = v_match.goals_local_90
          AND pr.pred_visitante = v_match.goals_visitante_90
          THEN 'exact'
        WHEN (pr.pred_local - pr.pred_visitante) = v_actual_diff
          AND v_actual_diff <> 0
          THEN 'diff'
        WHEN (pr.pred_local > pr.pred_visitante AND v_actual_winner = 'local')
          OR (pr.pred_local < pr.pred_visitante AND v_actual_winner = 'visitante')
          OR (pr.pred_local = pr.pred_visitante AND v_actual_winner = 'draw')
          THEN 'winner'
        ELSE 'none'
      END AS acierto,
      CASE
        WHEN v_match.phase IN ('r32', 'r16', 'qf', 'sf', 'third_place', 'final')
          AND pr.pred_winner_advance IS NOT NULL
          AND pr.pred_winner_advance = v_match.winner_advance_team_id
          THEN TRUE
        ELSE FALSE
      END AS advance_correct
    FROM predictions pr
    WHERE pr.match_id = p_match_id
  )
  UPDATE predictions p
  SET
    points_earned = get_phase_points(v_match.phase, pe.acierto)
                    + CASE WHEN pe.advance_correct THEN 2 ELSE 0 END,
    is_exact = (pe.acierto = 'exact'),
    is_diff_correct = (pe.acierto = 'diff'),
    is_advance_correct = pe.advance_correct,
    updated_at = NOW()
  FROM prediction_evaluation pe
  WHERE p.id = pe.id;

  GET DIAGNOSTICS v_processed = ROW_COUNT;

  SELECT COALESCE(SUM(points_earned), 0) INTO v_total_points
  FROM predictions
  WHERE match_id = p_match_id;

  RETURN QUERY SELECT v_processed, v_total_points;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_match_points IS
'Calcula y actualiza los puntos de todas las predicciones de un partido. Se llama automáticamente al pasar status=finished, o manualmente para recálculo.';


-- ============================================================
-- 3. PREDICCIONES ESPECIALES
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_special_points()
RETURNS TABLE (
  users_processed INTEGER,
  total_points_awarded INTEGER
) AS $$
DECLARE
  v_results      RECORD;
  v_processed    INTEGER := 0;
  v_total_points INTEGER := 0;
BEGIN
  SELECT * INTO v_results
  FROM tournament_results
  WHERE id = 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No hay resultados oficiales del torneo cargados todavía. Insertar fila en tournament_results.';
  END IF;

  IF v_results.finalized_at IS NULL THEN
    RAISE EXCEPTION 'Los resultados del torneo no están finalizados (finalized_at IS NULL).';
  END IF;

  UPDATE special_predictions sp
  SET
    points_earned =
      CASE WHEN sp.champion_team_id = v_results.champion_team_id THEN 25 ELSE 0 END
      + CASE WHEN sp.runner_up_team_id = v_results.runner_up_team_id THEN 15 ELSE 0 END
      + CASE WHEN sp.third_place_team_id = v_results.third_place_team_id THEN 10 ELSE 0 END
      + CASE WHEN sp.top_scorer_player_id = ANY(v_results.top_scorer_player_ids) THEN 15 ELSE 0 END
      + CASE WHEN sp.best_player_id = v_results.best_player_id THEN 10 ELSE 0 END,
    updated_at = NOW();

  GET DIAGNOSTICS v_processed = ROW_COUNT;

  SELECT COALESCE(SUM(points_earned), 0) INTO v_total_points
  FROM special_predictions;

  RETURN QUERY SELECT v_processed, v_total_points;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_special_points IS
'Calcula los puntos de las predicciones especiales (campeón, subcampeón, tercer lugar, goleador, mejor jugador). Se ejecuta una vez al finalizar el torneo.';


-- ============================================================
-- 4. PARTIDOS CANCELADOS
-- ============================================================

CREATE OR REPLACE FUNCTION handle_cancelled_match(p_match_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_affected INTEGER;
BEGIN
  UPDATE predictions
  SET
    points_earned = 0,
    is_exact = FALSE,
    is_diff_correct = FALSE,
    is_advance_correct = FALSE,
    updated_at = NOW()
  WHERE match_id = p_match_id;

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION handle_cancelled_match IS
'Anula todas las predicciones de un partido cancelado. Todos reciben 0 pts, sin penalización.';


-- ============================================================
-- 5. TRIGGER AUTOMÁTICO
-- ============================================================

CREATE OR REPLACE FUNCTION trg_match_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finished'
     AND (OLD.status IS DISTINCT FROM 'finished')
     AND NEW.goals_local_90 IS NOT NULL
     AND NEW.goals_visitante_90 IS NOT NULL
  THEN
    PERFORM calculate_match_points(NEW.id);
  END IF;

  IF NEW.status = 'cancelled'
     AND (OLD.status IS DISTINCT FROM 'cancelled')
  THEN
    PERFORM handle_cancelled_match(NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_finished ON matches;

CREATE TRIGGER trg_match_finished
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trg_match_status_change();

COMMENT ON TRIGGER trg_match_finished ON matches IS
'Cuando un partido pasa a finished o cancelled, calcula/anula los puntos automáticamente.';


-- ============================================================
-- 6. PERMISOS (importante para Supabase)
-- ============================================================

ALTER FUNCTION calculate_match_points(INTEGER) SECURITY DEFINER;
ALTER FUNCTION calculate_special_points() SECURITY DEFINER;
ALTER FUNCTION handle_cancelled_match(INTEGER) SECURITY DEFINER;
ALTER FUNCTION trg_match_status_change() SECURITY DEFINER;


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('002', 'Functions and trigger for points calculation')
ON CONFLICT (version) DO NOTHING;
