-- ============================================================
-- Migración 012: Integración con API-Football
-- ============================================================
-- Agrega columnas para mapear nuestros equipos y partidos con
-- los IDs de API-Football, y precarga los api_team_id de los 48
-- equipos del Mundial 2026.
--
-- Dependencias: 001_initial_schema.sql, 005_seed_mundial_2026.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Columnas de mapeo
-- ============================================================

ALTER TABLE teams ADD COLUMN IF NOT EXISTS api_team_id INTEGER;
COMMENT ON COLUMN teams.api_team_id IS 'ID del equipo en API-Football.';
CREATE INDEX IF NOT EXISTS idx_teams_api_team_id ON teams(api_team_id);

ALTER TABLE matches ADD COLUMN IF NOT EXISTS api_fixture_id INTEGER;
COMMENT ON COLUMN matches.api_fixture_id IS 'ID del fixture en API-Football.';
CREATE INDEX IF NOT EXISTS idx_matches_api_fixture_id ON matches(api_fixture_id);

-- ============================================================
-- 2. Mapeo de api_team_id (los 48 equipos del Mundial 2026)
-- ============================================================
-- Mapeo por NUESTRO código FIFA. Donde el código de API-Football
-- difiere del nuestro, igual mapeamos por nuestro código y usamos
-- el id correcto de la API.
--
-- Diferencias de código detectadas (nuestro -> API-Football):
--   COD (RD Congo) -> API usa code 'CGO', id 1508
--   CUW (Curazao)  -> API usa code 'CUR', id 5530

-- Coinciden código exacto
UPDATE teams SET api_team_id = 1    WHERE code = 'BEL';  -- Belgium
UPDATE teams SET api_team_id = 2    WHERE code = 'FRA';  -- France
UPDATE teams SET api_team_id = 3    WHERE code = 'CRO';  -- Croatia
UPDATE teams SET api_team_id = 5    WHERE code = 'SWE';  -- Sweden
UPDATE teams SET api_team_id = 6    WHERE code = 'BRA';  -- Brazil
UPDATE teams SET api_team_id = 7    WHERE code = 'URU';  -- Uruguay
UPDATE teams SET api_team_id = 8    WHERE code = 'COL';  -- Colombia
UPDATE teams SET api_team_id = 9    WHERE code = 'ESP';  -- Spain
UPDATE teams SET api_team_id = 10   WHERE code = 'ENG';  -- England
UPDATE teams SET api_team_id = 11   WHERE code = 'PAN';  -- Panama
UPDATE teams SET api_team_id = 12   WHERE code = 'JPN';  -- Japan
UPDATE teams SET api_team_id = 13   WHERE code = 'SEN';  -- Senegal
UPDATE teams SET api_team_id = 15   WHERE code = 'SUI';  -- Switzerland
UPDATE teams SET api_team_id = 16   WHERE code = 'MEX';  -- Mexico
UPDATE teams SET api_team_id = 17   WHERE code = 'KOR';  -- South Korea
UPDATE teams SET api_team_id = 20   WHERE code = 'AUS';  -- Australia
UPDATE teams SET api_team_id = 22   WHERE code = 'IRN';  -- Iran
UPDATE teams SET api_team_id = 23   WHERE code = 'KSA';  -- Saudi Arabia
UPDATE teams SET api_team_id = 25   WHERE code = 'GER';  -- Germany
UPDATE teams SET api_team_id = 26   WHERE code = 'ARG';  -- Argentina
UPDATE teams SET api_team_id = 27   WHERE code = 'POR';  -- Portugal
UPDATE teams SET api_team_id = 28   WHERE code = 'TUN';  -- Tunisia
UPDATE teams SET api_team_id = 31   WHERE code = 'MAR';  -- Morocco
UPDATE teams SET api_team_id = 32   WHERE code = 'EGY';  -- Egypt
UPDATE teams SET api_team_id = 770  WHERE code = 'CZE';  -- Czech Republic
UPDATE teams SET api_team_id = 775  WHERE code = 'AUT';  -- Austria
UPDATE teams SET api_team_id = 777  WHERE code = 'TUR';  -- Türkiye
UPDATE teams SET api_team_id = 1090 WHERE code = 'NOR';  -- Norway
UPDATE teams SET api_team_id = 1108 WHERE code = 'SCO';  -- Scotland
UPDATE teams SET api_team_id = 1113 WHERE code = 'BIH';  -- Bosnia & Herzegovina
UPDATE teams SET api_team_id = 1118 WHERE code = 'NED';  -- Netherlands
UPDATE teams SET api_team_id = 1501 WHERE code = 'CIV';  -- Ivory Coast
UPDATE teams SET api_team_id = 1504 WHERE code = 'GHA';  -- Ghana
UPDATE teams SET api_team_id = 1531 WHERE code = 'RSA';  -- South Africa
UPDATE teams SET api_team_id = 1532 WHERE code = 'ALG';  -- Algeria
UPDATE teams SET api_team_id = 1533 WHERE code = 'CPV';  -- Cape Verde
UPDATE teams SET api_team_id = 1548 WHERE code = 'JOR';  -- Jordan
UPDATE teams SET api_team_id = 1567 WHERE code = 'IRQ';  -- Iraq
UPDATE teams SET api_team_id = 1568 WHERE code = 'UZB';  -- Uzbekistan
UPDATE teams SET api_team_id = 1569 WHERE code = 'QAT';  -- Qatar
UPDATE teams SET api_team_id = 2380 WHERE code = 'PAR';  -- Paraguay
UPDATE teams SET api_team_id = 2382 WHERE code = 'ECU';  -- Ecuador
UPDATE teams SET api_team_id = 2384 WHERE code = 'USA';  -- USA
UPDATE teams SET api_team_id = 2386 WHERE code = 'HAI';  -- Haiti
UPDATE teams SET api_team_id = 4673 WHERE code = 'NZL';  -- New Zealand
UPDATE teams SET api_team_id = 5529 WHERE code = 'CAN';  -- Canada

-- Diferencias de código (nuestro código != código API, mapeamos por NUESTRO código)
UPDATE teams SET api_team_id = 1508 WHERE code = 'COD';  -- RD del Congo (API: CGO / "Congo DR")
UPDATE teams SET api_team_id = 5530 WHERE code = 'CUW';  -- Curazao (API: CUR / "Curaçao")

-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('012', 'API-Football integration: api_team_id (48 teams) and api_fixture_id columns')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- Debe dar 48 (todos los equipos mapeados, ninguno NULL):
-- SELECT COUNT(*) FROM teams WHERE api_team_id IS NOT NULL;
--
-- Si algún equipo quedó sin mapear, revísalo:
-- SELECT code, name FROM teams WHERE api_team_id IS NULL;
