-- ============================================================
-- Migración 010: Lógica de bloqueo de predicciones de partidos
-- ============================================================
-- Cada predicción se bloquea individualmente al kickoff de su
-- partido. Las predicciones del Sprint 1 ya tenían policies,
-- esta migración las refina y agrega una función helper.
--
-- Cambios:
--   1. Función is_match_locked(match_id) retorna boolean
--   2. Refinar RLS policies de predictions con la función
--   3. Agregar WITH CHECK al UPDATE para evitar cambiar match_id
--
-- Dependencias: 001_initial_schema.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Función helper: ¿este partido ya empezó?
-- ============================================================

CREATE OR REPLACE FUNCTION is_match_locked(p_match_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT kickoff_at FROM matches WHERE id = p_match_id) <= NOW(),
    FALSE
  );
$$;

COMMENT ON FUNCTION is_match_locked IS
'Retorna TRUE si el partido ya pasó su kickoff (predicciones bloqueadas).';

GRANT EXECUTE ON FUNCTION is_match_locked(INTEGER) TO authenticated;


-- ============================================================
-- 2. Refinar policies de predictions
-- ============================================================
-- Limpiamos las policies anteriores y creamos versiones más
-- claras y robustas.

DROP POLICY IF EXISTS "predictions_read_own_or_after_kickoff" ON predictions;
DROP POLICY IF EXISTS "predictions_write_own_before_kickoff" ON predictions;
DROP POLICY IF EXISTS "predictions_update_own_before_kickoff" ON predictions;
DROP POLICY IF EXISTS "predictions_select_own" ON predictions;
DROP POLICY IF EXISTS "predictions_insert_own_unlocked" ON predictions;
DROP POLICY IF EXISTS "predictions_update_own_unlocked" ON predictions;
DROP POLICY IF EXISTS "predictions_delete_own_unlocked" ON predictions;

-- SELECT: el usuario siempre puede ver SUS predicciones.
-- Después del kickoff de un partido, también puede ver las de
-- los demás (útil para mostrar predicciones cruzadas en el grupo).
CREATE POLICY "predictions_select_own_or_after_kickoff" ON predictions
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_match_locked(match_id)
  );

-- INSERT: solo puedes insertar tu propia predicción y solo si
-- el partido no ha empezado.
CREATE POLICY "predictions_insert_own_unlocked" ON predictions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND NOT is_match_locked(match_id)
  );

-- UPDATE: solo puedes actualizar tu propia predicción y solo si
-- el partido no ha empezado. El WITH CHECK evita que cambies
-- match_id o user_id (no se puede mover una predicción a otro
-- partido o ponerla en otro usuario).
CREATE POLICY "predictions_update_own_unlocked" ON predictions
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND NOT is_match_locked(match_id)
  )
  WITH CHECK (
    user_id = auth.uid()
    AND NOT is_match_locked(match_id)
  );

-- DELETE: opcional, solo por si el usuario quiere borrar su
-- predicción antes del kickoff
CREATE POLICY "predictions_delete_own_unlocked" ON predictions
  FOR DELETE USING (
    user_id = auth.uid()
    AND NOT is_match_locked(match_id)
  );


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('010', 'Match predictions: per-match lockout function and refined RLS')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- SELECT is_match_locked(1);                              -- false (aún no es 11 jun)
-- SELECT policyname, cmd FROM pg_policies
-- WHERE tablename = 'predictions' ORDER BY policyname;
-- Debería mostrar 4 policies: select, insert, update, delete
