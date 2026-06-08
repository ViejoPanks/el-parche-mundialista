-- ============================================================
-- Migración 011: Función RPC para tabla de posiciones
-- ============================================================
-- La vista group_leaderboard (Sprint 1) hace JOINs entre
-- group_members, profiles, predictions y special_predictions.
-- Para evitar problemas de RLS al leerla desde el frontend y
-- garantizar que solo veas los grupos donde eres miembro,
-- creamos una función SECURITY DEFINER que devuelve el
-- leaderboard de un grupo específico, validando membresía.
--
-- Dependencias: 001_initial_schema.sql, 007_fix_rls_recursion.sql
-- ============================================================

BEGIN;

-- ============================================================
-- Función: leaderboard de un grupo (con validación de membresía)
-- ============================================================

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
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
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


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('011', 'RPC function get_group_leaderboard with membership validation and ranking')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- Como miembro de un grupo (reemplaza N por un group_id real):
-- SELECT * FROM get_group_leaderboard(N);
-- Debería devolver las filas ordenadas con la columna rank (1, 2, 3...)
