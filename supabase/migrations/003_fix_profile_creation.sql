-- ============================================================
-- Migración 003: Fix de creación automática de perfiles
-- ============================================================
-- Soluciona el problema donde los usuarios se crean en auth.users
-- pero no aparecen en la tabla public.profiles.
--
-- Cambios:
--   1. Agrega política RLS para INSERT en profiles (faltaba)
--   2. Crea trigger que genera el perfil automáticamente al
--      registrarse un usuario en auth.users
--   3. Repara usuarios huérfanos existentes (en auth pero sin perfil)
--
-- Dependencias: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. Política RLS para INSERT en profiles
-- ============================================================
-- Permite que un usuario inserte su PROPIO perfil (no el de otros)

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_insert_own" ON profiles IS
'Permite que un usuario autenticado inserte solamente su propio perfil. El id debe coincidir con auth.uid().';


-- ============================================================
-- 2. Trigger automático: crear perfil al registrarse
-- ============================================================
-- Cuando aparece un nuevo registro en auth.users (signup completado),
-- este trigger inserta automáticamente la fila correspondiente en
-- public.profiles, extrayendo nombre y avatar de los metadatos del
-- usuario (que vienen de Google OAuth o del signup con email).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    -- Buscar nombre en este orden de preferencia:
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',     -- signup manual
      NEW.raw_user_meta_data->>'full_name',         -- Google OAuth
      NEW.raw_user_meta_data->>'name',              -- otros providers
      split_part(NEW.email, '@', 1),                -- fallback: parte del email
      'Usuario'                                      -- último fallback
    ),
    -- Avatar (puede venir de Google o ser null)
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.handle_new_user IS
'Trigger function que crea automáticamente un perfil cuando un usuario se registra. Se ejecuta con SECURITY DEFINER para saltarse RLS.';

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 3. Reparar usuarios huérfanos existentes
-- ============================================================
-- Crea perfiles para usuarios que están en auth.users pero
-- no tienen fila en profiles (por ejemplo, los que se registraron
-- antes de aplicar este fix).

INSERT INTO public.profiles (id, display_name, avatar_url)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1),
    'Usuario'
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
  AND u.email IS NOT NULL  -- evitar usuarios sistema
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('003', 'Fix automatic profile creation: RLS policy + trigger + repair orphan users')
ON CONFLICT (version) DO NOTHING;
