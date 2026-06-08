-- ============================================================
-- Migración 011 (CORREGIDA): RPC para tabla de posiciones
-- ============================================================
-- Corrige el error "column reference user_id is ambiguous":
-- calificamos las columnas con su tabla/vista de origen.
--
-- Si ya aplicaste la versión anterior de la 011, esta la
-- reemplaza (CREATE OR REPLACE).
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
  -- Validar que el usuario actual es miembro del grupo.
  -- Calificamos gm.user_id explícitamente para evitar ambigüedad
  -- con la columna user_id que esta función retorna.
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
    gl.total_points,
    gl.exact_count,
    gl.diff_count,
    gl.advance_count,
    gl.special_points,
    gl.joined_at,
    ROW_NUMBER() OVER (
      ORDER BY
        gl.total_points DESC,
        gl.exact_count DESC,
        gl.diff_count DESC,
        gl.special_points DESC,
        gl.advance_count DESC,
        gl.joined_at ASC
    ) AS rank
  FROM group_leaderboard gl
  WHERE gl.group_id = p_group_id;
END;
$$;

COMMENT ON FUNCTION get_group_leaderboard IS
'Devuelve la tabla de posiciones de un grupo con ranking calculado. Valida que el usuario actual sea miembro. SECURITY DEFINER para leer la vista sin problemas de RLS.';

GRANT EXECUTE ON FUNCTION get_group_leaderboard(INTEGER) TO authenticated;

-- Registrar (idempotente; ya existe la 011 pero por si acaso)
INSERT INTO schema_migrations (version, description)
VALUES ('011', 'RPC function get_group_leaderboard with membership validation and ranking')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- SELECT * FROM get_group_leaderboard(N);  -- reemplaza N por tu group_id
-- Ya no debe dar el error "column reference user_id is ambiguous"
