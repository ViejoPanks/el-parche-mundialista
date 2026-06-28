-- ============================================================
-- Migración 015: Fix de puntuación en empates (diferencia de goles)
-- ============================================================
-- BUG: calculate_match_points excluía los empates de la categoría
-- 'diff' (Diferencia + ganador) por la condición `v_actual_diff <> 0`.
-- Un empate predicho con marcador distinto (p. ej. 1-1 vs 2-2) tiene
-- la misma diferencia de goles (0 = 0), así que según el reglamento
-- v1.0 debe valer "Diferencia + ganador" (3 pts en grupos), no
-- "Solo ganador" (1 pt).
--
-- FIX: eliminar la condición `AND v_actual_diff <> 0`. Como la
-- diferencia es con signo, una diferencia igual ya garantiza el mismo
-- resultado (mismo ganador o empate), por lo que es seguro quitarla.
--
-- Incluye recálculo de todos los partidos ya finalizados para
-- corregir los puntos históricos afectados.
--
-- Dependencias: 002_calculate_points_functions.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Reemplazar calculate_match_points con la lógica corregida
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
        -- FIX: se elimina `AND v_actual_diff <> 0`.
        -- La diferencia con signo ya garantiza el mismo resultado,
        -- así que un empate predicho (diff 0) sobre un empate real
        -- (diff 0) con marcador distinto cuenta como 'diff'.
        WHEN (pr.pred_local - pr.pred_visitante) = v_actual_diff
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

ALTER FUNCTION calculate_match_points(INTEGER) SECURITY DEFINER;

-- ============================================================
-- 2. Recalcular todos los partidos ya finalizados
-- ============================================================
-- Idempotente: recalcula desde cero. Las predicciones no-empate
-- quedan igual; las de empate con marcador distinto se corrigen.
DO $$
DECLARE
  m RECORD;
BEGIN
  FOR m IN SELECT id FROM matches WHERE status = 'finished' ORDER BY match_number LOOP
    PERFORM calculate_match_points(m.id);
  END LOOP;
END $$;

-- ============================================================
-- 3. Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('015', 'Fix: draws count as diff (goal difference) per reglamento v1.0; recalc finished matches')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación sugerida (correr aparte)
-- ============================================================
-- Ver predicciones de empate que ahora son 'diff':
-- SELECT p.user_id, p.match_id, p.pred_local, p.pred_visitante,
--        m.goals_local_90, m.goals_visitante_90, p.points_earned, p.is_diff_correct
-- FROM predictions p
-- JOIN matches m ON m.id = p.match_id
-- WHERE m.status = 'finished'
--   AND m.goals_local_90 = m.goals_visitante_90       -- empates reales
--   AND p.pred_local = p.pred_visitante               -- predijo empate
--   AND NOT (p.pred_local = m.goals_local_90)          -- pero marcador distinto
-- ORDER BY p.match_id;
