-- ============================================================
-- Migración 016: Reapertura temporal de predicciones especiales
-- ============================================================
-- Contexto: al terminar la fase de grupos y conocerse los 32
-- clasificados, se reabrió la ventana de predicciones especiales
-- (campeón, subcampeón, tercer lugar, goleador, mejor jugador)
-- por ~24h. Originalmente (migración 009) se bloqueaban al kickoff
-- del primer partido (11 jun) y quedaban bloqueadas para siempre.
--
-- Mecanismo: todo el bloqueo (UI, Server Action y RLS) se decide a
-- partir de get_predictions_lockout_at() / are_special_predictions_locked().
-- Se redefine el cierre a una fecha futura fija. Es auto-expirante:
-- al pasar esa fecha, vuelve a quedar bloqueado sin intervención.
--
-- NOTA: ajusta el timestamp de abajo al valor REAL que aplicaste en
-- producción por el SQL Editor, para que el historial coincida.
--
-- Dependencias: 009_special_predictions_lockout.sql
-- ============================================================

BEGIN;

-- 1) Nuevo cierre (fecha fija futura, hora Colombia -05).
--    ⬅️ AJUSTA a la fecha/hora que realmente usaste.
CREATE OR REPLACE FUNCTION get_predictions_lockout_at()
RETURNS TIMESTAMPTZ
LANGUAGE sql STABLE AS $$
  SELECT TIMESTAMPTZ '2026-06-29 20:00:00-05';
$$;

COMMENT ON FUNCTION get_predictions_lockout_at IS
'Retorna el timestamp de cierre de las predicciones especiales. Reabierto temporalmente en mig 016 (knockout). Auto-expira al pasar la fecha.';

-- 2) Bloqueado = ya pasó ese cierre. Lee de la función de arriba
--    para mantener una sola fuente de verdad de la fecha.
CREATE OR REPLACE FUNCTION are_special_predictions_locked()
RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(get_predictions_lockout_at() <= NOW(), FALSE);
$$;

COMMENT ON FUNCTION are_special_predictions_locked IS
'TRUE si ya pasó el cierre de predicciones especiales (ver get_predictions_lockout_at).';

-- Permisos (idempotente; se mantienen los de 009)
GRANT EXECUTE ON FUNCTION get_predictions_lockout_at() TO authenticated;
GRANT EXECUTE ON FUNCTION are_special_predictions_locked() TO authenticated;

-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('016', 'Reopen special predictions for ~24h at start of knockout (temporary, self-expiring)')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Para revertir a la lógica original (atada al partido #1):
-- volver a correr los CREATE OR REPLACE de la migración 009.
-- No es urgente: al pasar la fecha de arriba, queda bloqueado igual.
-- ============================================================
