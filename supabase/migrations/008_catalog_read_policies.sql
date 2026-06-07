-- ============================================================
-- Migración 008: Policies de lectura para tablas de catálogo
-- ============================================================
-- Habilita RLS y crea policies de SELECT en teams, players,
-- matches y tournament_results para que cualquier usuario
-- autenticado pueda leerlas.
--
-- Estos datos son catálogo público dentro de la app: cualquier
-- jugador necesita ver los equipos, partidos y jugadores para
-- hacer sus predicciones.
--
-- Dependencias: 001_initial_schema.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. teams: lectura para todos los autenticados
-- ============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teams_read_all" ON teams;
CREATE POLICY "teams_read_all" ON teams
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 2. players: lectura para todos los autenticados
-- ============================================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "players_read_all" ON players;
CREATE POLICY "players_read_all" ON players
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. matches: lectura para todos los autenticados
-- ============================================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_read_all" ON matches;
CREATE POLICY "matches_read_all" ON matches
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. tournament_results: lectura para todos los autenticados
-- ============================================================
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tournament_results_read_all" ON tournament_results;
CREATE POLICY "tournament_results_read_all" ON tournament_results
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('008', 'Add read policies for catalog tables: teams, players, matches, tournament_results')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- Después de aplicar, debes ver las 4 policies:
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE tablename IN ('teams','players','matches','tournament_results')
-- ORDER BY tablename;
