-- ============================================================
-- Migración 004: Códigos de invitación para grupos
-- ============================================================
-- Cambios:
--   1. Función generate_invite_code() — genera códigos únicos
--      de 8 caracteres alfanuméricos sin caracteres confusos
--   2. Trigger que asigna el código automáticamente al crear grupo
--   3. Política RLS para lookup público por invite_code
--   4. Política RLS para que admin pueda eliminar/editar su grupo
--   5. Política RLS para salir de un grupo
--
-- Dependencias: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. Función para generar códigos de invitación únicos
-- ============================================================
-- Genera códigos de 8 caracteres alfanuméricos.
-- Excluye caracteres confusos: 0, O, I, 1, L, l, i, o
-- Caracteres válidos: A-H, J, K, M-N, P-Z, 2-9 (24 letras + 8 números)

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(10) AS $$
DECLARE
  v_chars  TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code   VARCHAR(10);
  v_exists BOOLEAN;
  v_attempts INTEGER := 0;
BEGIN
  LOOP
    v_code := '';
    -- Generar 8 caracteres aleatorios
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(v_chars, (floor(random() * length(v_chars)) + 1)::INTEGER, 1);
    END LOOP;

    -- Verificar que no exista
    SELECT EXISTS(SELECT 1 FROM groups WHERE invite_code = v_code) INTO v_exists;

    EXIT WHEN NOT v_exists;

    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      RAISE EXCEPTION 'No se pudo generar un código único después de 10 intentos';
    END IF;
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_invite_code IS
'Genera un código de invitación de 8 caracteres alfanuméricos único, excluyendo caracteres confusos (0/O/1/I/L).';


-- ============================================================
-- 2. Trigger: asignar código automáticamente al crear grupo
-- ============================================================

CREATE OR REPLACE FUNCTION trg_set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_groups_invite_code ON groups;

CREATE TRIGGER trg_groups_invite_code
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_invite_code();


-- ============================================================
-- 3. Permitir hacer NULL el invite_code temporalmente
-- ============================================================
-- Como el trigger lo genera antes de insertar, podemos hacerlo NULL
-- en el INSERT y que el trigger lo llene. Esto simplifica la lógica
-- desde Next.js.

ALTER TABLE groups ALTER COLUMN invite_code DROP NOT NULL;


-- ============================================================
-- 4. Política RLS para lookup por invite_code
-- ============================================================
-- Permite que cualquier usuario autenticado pueda buscar un grupo
-- por su invite_code (necesario para la función "unirse a grupo").
-- Sin esto, el RLS bloquearía la búsqueda porque el usuario aún
-- no es miembro.
--
-- Esta política coexiste con "groups_read_member" gracias a que
-- en RLS los policies son OR (basta que una se cumpla).

DROP POLICY IF EXISTS "groups_read_by_invite_code" ON groups;

CREATE POLICY "groups_read_by_invite_code" ON groups
  FOR SELECT
  USING (auth.role() = 'authenticated');

COMMENT ON POLICY "groups_read_by_invite_code" ON groups IS
'Permite a usuarios autenticados leer grupos por su invite_code para unirse.';


-- ============================================================
-- 5. Política RLS: el admin puede actualizar/eliminar su grupo
-- ============================================================

DROP POLICY IF EXISTS "groups_update_admin" ON groups;

CREATE POLICY "groups_update_admin" ON groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "groups_delete_admin" ON groups;

CREATE POLICY "groups_delete_admin" ON groups
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

COMMENT ON POLICY "groups_update_admin" ON groups IS
'Solo el admin de un grupo puede modificar su nombre/descripción.';


-- ============================================================
-- 6. Política RLS: salir de un grupo (DELETE en group_members)
-- ============================================================

DROP POLICY IF EXISTS "members_leave_own" ON group_members;

CREATE POLICY "members_leave_own" ON group_members
  FOR DELETE
  USING (user_id = auth.uid());

COMMENT ON POLICY "members_leave_own" ON group_members IS
'Un usuario puede salir de un grupo (eliminarse a sí mismo). El admin no debería poder salir si es el único.';


-- ============================================================
-- 7. Función helper: contar miembros de un grupo
-- ============================================================
-- Útil para validar el límite de 50 miembros

CREATE OR REPLACE FUNCTION count_group_members(p_group_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM group_members
    WHERE group_id = p_group_id
  );
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================
-- 8. Función helper: el creador entra automáticamente como admin
-- ============================================================
-- Cuando se crea un grupo, el creador debe ser miembro con rol admin.
-- En lugar de hacer 2 INSERTs desde Next.js (uno a groups y otro a
-- group_members), creamos esta función RPC que hace todo de forma atómica.

CREATE OR REPLACE FUNCTION create_group_with_admin(
  p_name VARCHAR(100),
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR(100),
  description TEXT,
  invite_code VARCHAR(10),
  created_by UUID,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_group_id INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF char_length(trim(p_name)) < 3 THEN
    RAISE EXCEPTION 'El nombre del grupo debe tener al menos 3 caracteres';
  END IF;

  -- Crear el grupo
  INSERT INTO groups (name, description, created_by)
  VALUES (trim(p_name), nullif(trim(p_description), ''), v_user_id)
  RETURNING groups.id INTO v_group_id;

  -- Agregar al creador como admin
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'admin');

  -- Devolver el grupo creado
  RETURN QUERY
    SELECT g.id, g.name, g.description, g.invite_code, g.created_by, g.created_at
    FROM groups g
    WHERE g.id = v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION create_group_with_admin IS
'Crea un grupo y agrega al usuario actual como admin de forma atómica. Usar desde Next.js con supabase.rpc().';


-- ============================================================
-- 9. Función helper: unirse a grupo por código
-- ============================================================
-- Hace lookup del invite_code, valida límite de miembros,
-- y agrega al usuario al grupo.

CREATE OR REPLACE FUNCTION join_group_by_code(
  p_invite_code VARCHAR(10)
)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR(100),
  description TEXT,
  invite_code VARCHAR(10),
  created_by UUID,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_group_id INTEGER;
  v_member_count INTEGER;
  v_already_member BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Buscar grupo por código (case-insensitive y trimmed)
  SELECT g.id INTO v_group_id
  FROM groups g
  WHERE upper(g.invite_code) = upper(trim(p_invite_code));

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Código de invitación inválido';
  END IF;

  -- Verificar si ya es miembro
  SELECT EXISTS(
    SELECT 1 FROM group_members
    WHERE group_id = v_group_id AND user_id = v_user_id
  ) INTO v_already_member;

  IF v_already_member THEN
    RAISE EXCEPTION 'Ya eres miembro de este grupo';
  END IF;

  -- Validar límite de 50 miembros
  v_member_count := count_group_members(v_group_id);
  IF v_member_count >= 50 THEN
    RAISE EXCEPTION 'Este grupo alcanzó el límite de 50 miembros';
  END IF;

  -- Agregar al usuario
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'member');

  -- Devolver el grupo
  RETURN QUERY
    SELECT g.id, g.name, g.description, g.invite_code, g.created_by, g.created_at
    FROM groups g
    WHERE g.id = v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION join_group_by_code IS
'Une al usuario actual a un grupo por código de invitación. Valida límite de 50 miembros y duplicados.';


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('004', 'Group invite codes: generation, RLS policies, helper functions for create/join')
ON CONFLICT (version) DO NOTHING;
