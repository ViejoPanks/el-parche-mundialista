-- ============================================================
-- Migración 009: Lógica de bloqueo de predicciones especiales
-- ============================================================
-- Las predicciones especiales (campeón, runner-up, tercer lugar,
-- goleador, mejor jugador) se bloquean al kickoff del primer
-- partido del torneo (México vs Sudáfrica - match_number = 1).
--
-- Cambios:
--   1. Función get_predictions_lockout_at() retorna timestamp del bloqueo
--   2. Función are_special_predictions_locked() retorna boolean
--   3. Reescribir RLS policies para special_predictions con bloqueo automático
--
-- Dependencias: 001_initial_schema.sql, 006_group_stage_fixture.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Función: timestamp en que se bloquean las predicciones
-- ============================================================
-- Retorna el kickoff del primer partido del torneo.
-- NULL si todavía no hay partido número 1 cargado.

CREATE OR REPLACE FUNCTION get_predictions_lockout_at()
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
AS $$
  SELECT kickoff_at FROM matches WHERE match_number = 1 LIMIT 1;
$$;

COMMENT ON FUNCTION get_predictions_lockout_at IS
'Retorna el timestamp en que se bloquean las predicciones especiales (kickoff del primer partido).';


-- ============================================================
-- 2. Función: ¿ya pasó el bloqueo?
-- ============================================================

CREATE OR REPLACE FUNCTION are_special_predictions_locked()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT kickoff_at FROM matches WHERE match_number = 1 LIMIT 1) <= NOW(),
    FALSE
  );
$$;

COMMENT ON FUNCTION are_special_predictions_locked IS
'Retorna TRUE si ya pasó el kickoff del primer partido (predicciones bloqueadas).';

-- Permitir que usuarios autenticados llamen estas funciones
GRANT EXECUTE ON FUNCTION get_predictions_lockout_at() TO authenticated;
GRANT EXECUTE ON FUNCTION are_special_predictions_locked() TO authenticated;


-- ============================================================
-- 3. Reescribir policies de special_predictions
-- ============================================================
-- La policy original tenía un "FOR ALL" que mezclaba SELECT con writes.
-- Vamos a separarlas: lectura siempre, escritura solo si no está bloqueado.

DROP POLICY IF EXISTS "special_read_own" ON special_predictions;
DROP POLICY IF EXISTS "special_write_own_unlocked" ON special_predictions;
DROP POLICY IF EXISTS "special_insert_own_unlocked" ON special_predictions;
DROP POLICY IF EXISTS "special_update_own_unlocked" ON special_predictions;
DROP POLICY IF EXISTS "special_delete_own_unlocked" ON special_predictions;

-- SELECT: el usuario puede ver SU predicción siempre
CREATE POLICY "special_read_own" ON special_predictions
  FOR SELECT USING (user_id = auth.uid());

-- INSERT: solo si no está bloqueado
CREATE POLICY "special_insert_own_unlocked" ON special_predictions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND NOT are_special_predictions_locked()
  );

-- UPDATE: solo si no está bloqueado
CREATE POLICY "special_update_own_unlocked" ON special_predictions
  FOR UPDATE USING (
    user_id = auth.uid()
    AND NOT are_special_predictions_locked()
  );

-- DELETE: solo si no está bloqueado (raro, pero por completitud)
CREATE POLICY "special_delete_own_unlocked" ON special_predictions
  FOR DELETE USING (
    user_id = auth.uid()
    AND NOT are_special_predictions_locked()
  );


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('009', 'Special predictions: automatic lockout at first match kickoff')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- Verificar funciones:
-- SELECT get_predictions_lockout_at();        -- debe retornar '2026-06-11 18:00:00+00'
-- SELECT are_special_predictions_locked();    -- debe retornar false (aún no es 11 jun)
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'special_predictions';
-- Debería mostrar 4 policies: read_own, insert_own_unlocked, update_own_unlocked, delete_own_unlocked
