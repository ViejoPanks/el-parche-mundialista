-- ============================================================
-- Migración 011 (CORREGIDA v2): RPC para tabla de posiciones
-- ============================================================
-- Corrige dos errores:
--   1. "column reference user_id is ambiguous" → alias gm.user_id
--   2. "Returned type integer does not match expected type bigint"
--      → cast explícito de todas las columnas numéricas a BIGINT
--
-- Usa CREATE OR REPLACE, así que reemplaza la versión anterior.
--
-- Dependencias: 001_initial_schema.sql, 007_fix_rls_recursion.sql
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION get_group_leaderboard(p_group_id INTEGER)
RETURNS TABLE (
  user_id UUID,
  display_name VARCHAR(80),
  avatar_url TEXT,
  total_points BIGINT,
  exact_count BIGINT,
  diff_count BIGINT,
  advance_count BIGINT,
  special_points BIGINT,
  joined_at TIMESTAMPTZ,
  rank BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar que el usuario actual es miembro del grupo
  IF NOT EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = p_group_id
      AND gm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes acceso a este grupo';
  END IF;

  RETURN QUERY
  SELECT
    gl.user_id,
    gl.display_name,
    gl.avatar_url,
    -- Cast explícito a BIGINT para que coincida con el tipo declarado
    gl.total_points::BIGINT,
    gl.exact_count::BIGINT,
    gl.diff_count::BIGINT,
    gl.advance_count::BIGINT,
    gl.special_points::BIGINT,
    gl.joined_at,
    ROW_NUMBER() OVER (
      ORDER BY
        gl.total_points DESC,
        gl.exact_count DESC,
        gl.diff_count DESC,
        gl.special_points DESC,
        gl.advance_count DESC,
        gl.joined_at ASC
    )::BIGINT AS rank
  FROM group_leaderboard gl
  WHERE gl.group_id = p_group_id;
END;
$$;

COMMENT ON FUNCTION get_group_leaderboard IS
'Devuelve la tabla de posiciones de un grupo con ranking calculado. Valida membresía. SECURITY DEFINER + casts BIGINT explícitos.';

GRANT EXECUTE ON FUNCTION get_group_leaderboard(INTEGER) TO authenticated;

INSERT INTO schema_migrations (version, description)
VALUES ('011', 'RPC function get_group_leaderboard with membership validation and ranking')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación (desde la APP, no desde SQL Editor)
-- ============================================================
-- En el SQL Editor saldrá "No tienes acceso a este grupo" porque
-- auth.uid() es NULL ahí. Eso es NORMAL. Prueba desde la app
-- recargando /grupos/[id]/tabla
