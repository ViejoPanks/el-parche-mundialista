-- ============================================================
-- TESTS DE LA MIGRACIÓN 004 (códigos de invitación)
-- ============================================================
-- Ejecutar en parche-dev DESPUÉS de aplicar la migración 004.
--
-- Estos tests verifican:
--   1. La función generate_invite_code genera códigos únicos
--   2. El trigger asigna código automáticamente al crear grupo
--   3. Las funciones RPC funcionan
--
-- ⚠️ NO ejecutar en producción.
-- ============================================================

BEGIN;

-- ============================================================
-- TEST 1: La función genera códigos válidos
-- ============================================================

DO $$
DECLARE
  v_code VARCHAR(10);
  v_codes TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    v_code := generate_invite_code();
    v_codes := array_append(v_codes, v_code);

    -- Validar longitud
    IF length(v_code) <> 8 THEN
      RAISE EXCEPTION 'TEST 1 FAIL: código % tiene longitud %, esperado 8', v_code, length(v_code);
    END IF;

    -- Validar que no contenga caracteres confusos
    IF v_code ~ '[01OILoil]' THEN
      RAISE EXCEPTION 'TEST 1 FAIL: código % contiene caracteres confusos', v_code;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ TEST 1 OK: 5 códigos generados: %', array_to_string(v_codes, ', ');
END $$;


-- ============================================================
-- TEST 2: El trigger asigna código al crear grupo
-- ============================================================
-- Necesitamos un usuario en profiles para hacer este test.
-- Usamos uno de los TEST_ que creamos en la migración de tests previos.

DO $$
DECLARE
  v_test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  v_group_id INTEGER;
  v_invite_code VARCHAR(10);
BEGIN
  -- Crear grupo SIN especificar invite_code
  INSERT INTO groups (name, description, created_by)
  VALUES ('TEST_Grupo_Trigger', 'Grupo para test del trigger', v_test_user_id)
  RETURNING id, invite_code INTO v_group_id, v_invite_code;

  IF v_invite_code IS NULL OR v_invite_code = '' THEN
    RAISE EXCEPTION 'TEST 2 FAIL: el trigger NO asignó invite_code';
  END IF;

  IF length(v_invite_code) <> 8 THEN
    RAISE EXCEPTION 'TEST 2 FAIL: invite_code tiene longitud %, esperado 8', length(v_invite_code);
  END IF;

  RAISE NOTICE '✅ TEST 2 OK: grupo creado con código %', v_invite_code;

  -- Limpiar
  DELETE FROM groups WHERE id = v_group_id;
END $$;


-- ============================================================
-- TEST 3: count_group_members funciona
-- ============================================================

DO $$
DECLARE
  v_test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  v_test_user_id_2 UUID := '00000000-0000-0000-0000-000000000002';
  v_group_id INTEGER;
  v_count INTEGER;
BEGIN
  INSERT INTO groups (name, created_by)
  VALUES ('TEST_Grupo_Count', v_test_user_id)
  RETURNING id INTO v_group_id;

  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, v_test_user_id, 'admin'),
         (v_group_id, v_test_user_id_2, 'member');

  v_count := count_group_members(v_group_id);

  IF v_count <> 2 THEN
    RAISE EXCEPTION 'TEST 3 FAIL: esperaba 2 miembros, obtuvo %', v_count;
  END IF;

  RAISE NOTICE '✅ TEST 3 OK: count_group_members devuelve %', v_count;

  -- Limpiar
  DELETE FROM group_members WHERE group_id = v_group_id;
  DELETE FROM groups WHERE id = v_group_id;
END $$;


-- ============================================================
-- TEST 4: códigos generados son únicos
-- ============================================================

DO $$
DECLARE
  v_codes TEXT[] := ARRAY[]::TEXT[];
  v_code VARCHAR(10);
  i INTEGER;
BEGIN
  FOR i IN 1..20 LOOP
    v_code := generate_invite_code();
    IF v_code = ANY(v_codes) THEN
      RAISE EXCEPTION 'TEST 4 FAIL: código duplicado generado: %', v_code;
    END IF;
    v_codes := array_append(v_codes, v_code);
  END LOOP;

  RAISE NOTICE '✅ TEST 4 OK: 20 códigos únicos generados';
END $$;


COMMIT;

-- ============================================================
-- Resumen
-- ============================================================
-- Si llegaste hasta acá sin EXCEPTIONS, todos los tests pasaron.
-- Verás los mensajes "✅ TEST N OK" en el panel de mensajes.
--
-- Para ver los mensajes en Supabase SQL Editor:
-- Después de ejecutar, busca en los logs (panel de la derecha)
-- los NOTICE messages.
-- ============================================================
