-- ============================================================
-- Migración 013: Corrección del fixture de fase de grupos
-- ============================================================
-- Corrige equipos, fechas/horas y sedes de los 72 partidos de
-- fase de grupos según la planeación oficial FIFA, que difería
-- de la carga inicial (migración 006).
--
-- Este cambio se aplicó primero manualmente en parche-prod y
-- luego se replicó a parche-dev. Esta migración lo deja
-- versionado para reconstrucciones futuras.
--
-- El emparejamiento de equipos es por CÓDIGO (estable entre
-- ambientes), no por team_id interno.
--
-- NOTA: esta migración NO toca goles ni status de partidos ya
-- jugados; solo corrige la estructura del fixture. Los
-- resultados los gestiona el sync de API-Football.
--
-- Dependencias: 006_group_stage_fixture.sql
-- ============================================================

BEGIN;

UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'MEX'), team_visitante_id = (SELECT id FROM teams WHERE code = 'RSA'), kickoff_at = '2026-06-11 19:00:00+00', venue = 'Estadio Azteca, Ciudad de México', phase = 'group' WHERE match_number = 1;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'KOR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CZE'), kickoff_at = '2026-06-12 02:00:00+00', venue = 'Estadio Akron, Guadalajara', phase = 'group' WHERE match_number = 2;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CAN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'BIH'), kickoff_at = '2026-06-12 19:00:00+00', venue = 'BMO Field, Toronto', phase = 'group' WHERE match_number = 3;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'USA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'PAR'), kickoff_at = '2026-06-13 01:00:00+00', venue = 'SoFi Stadium, Los Ángeles', phase = 'group' WHERE match_number = 4;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'HAI'), team_visitante_id = (SELECT id FROM teams WHERE code = 'SCO'), kickoff_at = '2026-06-14 01:00:00+00', venue = 'Lincoln Financial Field, Filadelfia', phase = 'group' WHERE match_number = 5;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'AUS'), team_visitante_id = (SELECT id FROM teams WHERE code = 'TUR'), kickoff_at = '2026-06-14 04:00:00+00', venue = 'BC Place, Vancouver', phase = 'group' WHERE match_number = 6;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'BRA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'MAR'), kickoff_at = '2026-06-13 22:00:00+00', venue = 'MetLife Stadium, Nueva York', phase = 'group' WHERE match_number = 7;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'QAT'), team_visitante_id = (SELECT id FROM teams WHERE code = 'SUI'), kickoff_at = '2026-06-13 19:00:00+00', venue = 'Levi''s Stadium, San Francisco', phase = 'group' WHERE match_number = 8;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CIV'), team_visitante_id = (SELECT id FROM teams WHERE code = 'ECU'), kickoff_at = '2026-06-14 23:00:00+00', venue = 'Lincoln Financial Field, Filadelfia', phase = 'group' WHERE match_number = 9;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'GER'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CUW'), kickoff_at = '2026-06-14 17:00:00+00', venue = 'NRG Stadium, Houston', phase = 'group' WHERE match_number = 10;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'NED'), team_visitante_id = (SELECT id FROM teams WHERE code = 'JPN'), kickoff_at = '2026-06-14 20:00:00+00', venue = 'AT&T Stadium, Dallas', phase = 'group' WHERE match_number = 11;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'SWE'), team_visitante_id = (SELECT id FROM teams WHERE code = 'TUN'), kickoff_at = '2026-06-15 02:00:00+00', venue = 'Estadio BBVA, Monterrey', phase = 'group' WHERE match_number = 12;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'KSA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'URU'), kickoff_at = '2026-06-15 22:00:00+00', venue = 'Hard Rock Stadium, Miami', phase = 'group' WHERE match_number = 13;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ESP'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CPV'), kickoff_at = '2026-06-15 16:00:00+00', venue = 'Mercedes-Benz Stadium, Atlanta', phase = 'group' WHERE match_number = 14;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'IRN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'NZL'), kickoff_at = '2026-06-16 01:00:00+00', venue = 'SoFi Stadium, Los Ángeles', phase = 'group' WHERE match_number = 15;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'BEL'), team_visitante_id = (SELECT id FROM teams WHERE code = 'EGY'), kickoff_at = '2026-06-15 19:00:00+00', venue = 'Lumen Field, Seattle', phase = 'group' WHERE match_number = 16;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'FRA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'SEN'), kickoff_at = '2026-06-16 19:00:00+00', venue = 'MetLife Stadium, Nueva York', phase = 'group' WHERE match_number = 17;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'IRQ'), team_visitante_id = (SELECT id FROM teams WHERE code = 'NOR'), kickoff_at = '2026-06-16 22:00:00+00', venue = 'Gillette Stadium, Boston', phase = 'group' WHERE match_number = 18;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ARG'), team_visitante_id = (SELECT id FROM teams WHERE code = 'ALG'), kickoff_at = '2026-06-17 01:00:00+00', venue = 'Arrowhead Stadium, Kansas City', phase = 'group' WHERE match_number = 19;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'AUT'), team_visitante_id = (SELECT id FROM teams WHERE code = 'JOR'), kickoff_at = '2026-06-17 04:00:00+00', venue = 'Levi''s Stadium, San Francisco', phase = 'group' WHERE match_number = 20;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'GHA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'PAN'), kickoff_at = '2026-06-17 23:00:00+00', venue = 'BMO Field, Toronto', phase = 'group' WHERE match_number = 21;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ENG'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CRO'), kickoff_at = '2026-06-17 20:00:00+00', venue = 'AT&T Stadium, Dallas', phase = 'group' WHERE match_number = 22;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'POR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'COD'), kickoff_at = '2026-06-17 17:00:00+00', venue = 'NRG Stadium, Houston', phase = 'group' WHERE match_number = 23;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'UZB'), team_visitante_id = (SELECT id FROM teams WHERE code = 'COL'), kickoff_at = '2026-06-18 02:00:00+00', venue = 'Estadio Azteca, Ciudad de México', phase = 'group' WHERE match_number = 24;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CZE'), team_visitante_id = (SELECT id FROM teams WHERE code = 'RSA'), kickoff_at = '2026-06-18 16:00:00+00', venue = 'Mercedes-Benz Stadium, Atlanta', phase = 'group' WHERE match_number = 25;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'SUI'), team_visitante_id = (SELECT id FROM teams WHERE code = 'BIH'), kickoff_at = '2026-06-18 19:00:00+00', venue = 'SoFi Stadium, Los Ángeles', phase = 'group' WHERE match_number = 26;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CAN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'QAT'), kickoff_at = '2026-06-18 22:00:00+00', venue = 'BC Place, Vancouver', phase = 'group' WHERE match_number = 27;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'MEX'), team_visitante_id = (SELECT id FROM teams WHERE code = 'KOR'), kickoff_at = '2026-06-19 01:00:00+00', venue = 'Estadio Akron, Guadalajara', phase = 'group' WHERE match_number = 28;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'BRA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'HAI'), kickoff_at = '2026-06-20 01:00:00+00', venue = 'Lincoln Financial Field, Filadelfia', phase = 'group' WHERE match_number = 29;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'SCO'), team_visitante_id = (SELECT id FROM teams WHERE code = 'MAR'), kickoff_at = '2026-06-19 22:00:00+00', venue = 'Gillette Stadium, Boston', phase = 'group' WHERE match_number = 30;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'TUR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'PAR'), kickoff_at = '2026-06-20 04:00:00+00', venue = 'Levi''s Stadium, San Francisco', phase = 'group' WHERE match_number = 31;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'USA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'AUS'), kickoff_at = '2026-06-19 19:00:00+00', venue = 'Lumen Field, Seattle', phase = 'group' WHERE match_number = 32;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'GER'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CIV'), kickoff_at = '2026-06-20 20:00:00+00', venue = 'BMO Field, Toronto', phase = 'group' WHERE match_number = 33;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ECU'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CUW'), kickoff_at = '2026-06-21 00:00:00+00', venue = 'Arrowhead Stadium, Kansas City', phase = 'group' WHERE match_number = 34;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'NED'), team_visitante_id = (SELECT id FROM teams WHERE code = 'SWE'), kickoff_at = '2026-06-20 17:00:00+00', venue = 'NRG Stadium, Houston', phase = 'group' WHERE match_number = 35;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'TUN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'JPN'), kickoff_at = '2026-06-21 04:00:00+00', venue = 'Estadio BBVA, Monterrey', phase = 'group' WHERE match_number = 36;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'URU'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CPV'), kickoff_at = '2026-06-21 22:00:00+00', venue = 'Hard Rock Stadium, Miami', phase = 'group' WHERE match_number = 37;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ESP'), team_visitante_id = (SELECT id FROM teams WHERE code = 'KSA'), kickoff_at = '2026-06-21 16:00:00+00', venue = 'Mercedes-Benz Stadium, Atlanta', phase = 'group' WHERE match_number = 38;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'BEL'), team_visitante_id = (SELECT id FROM teams WHERE code = 'IRN'), kickoff_at = '2026-06-21 19:00:00+00', venue = 'SoFi Stadium, Los Ángeles', phase = 'group' WHERE match_number = 39;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'NZL'), team_visitante_id = (SELECT id FROM teams WHERE code = 'EGY'), kickoff_at = '2026-06-22 01:00:00+00', venue = 'BC Place, Vancouver', phase = 'group' WHERE match_number = 40;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'NOR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'SEN'), kickoff_at = '2026-06-23 00:00:00+00', venue = 'MetLife Stadium, Nueva York', phase = 'group' WHERE match_number = 41;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'FRA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'IRQ'), kickoff_at = '2026-06-22 21:00:00+00', venue = 'Lincoln Financial Field, Filadelfia', phase = 'group' WHERE match_number = 42;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ARG'), team_visitante_id = (SELECT id FROM teams WHERE code = 'AUT'), kickoff_at = '2026-06-22 17:00:00+00', venue = 'AT&T Stadium, Dallas', phase = 'group' WHERE match_number = 43;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'JOR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'ALG'), kickoff_at = '2026-06-23 03:00:00+00', venue = 'Levi''s Stadium, San Francisco', phase = 'group' WHERE match_number = 44;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ENG'), team_visitante_id = (SELECT id FROM teams WHERE code = 'GHA'), kickoff_at = '2026-06-23 20:00:00+00', venue = 'Gillette Stadium, Boston', phase = 'group' WHERE match_number = 45;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'PAN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CRO'), kickoff_at = '2026-06-23 23:00:00+00', venue = 'BMO Field, Toronto', phase = 'group' WHERE match_number = 46;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'POR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'UZB'), kickoff_at = '2026-06-23 17:00:00+00', venue = 'NRG Stadium, Houston', phase = 'group' WHERE match_number = 47;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'COL'), team_visitante_id = (SELECT id FROM teams WHERE code = 'COD'), kickoff_at = '2026-06-24 02:00:00+00', venue = 'Estadio Akron, Guadalajara', phase = 'group' WHERE match_number = 48;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'SCO'), team_visitante_id = (SELECT id FROM teams WHERE code = 'BRA'), kickoff_at = '2026-06-24 22:00:00+00', venue = 'Hard Rock Stadium, Miami', phase = 'group' WHERE match_number = 49;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'MAR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'HAI'), kickoff_at = '2026-06-24 22:00:00+00', venue = 'Mercedes-Benz Stadium, Atlanta', phase = 'group' WHERE match_number = 50;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'SUI'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CAN'), kickoff_at = '2026-06-24 19:00:00+00', venue = 'BC Place, Vancouver', phase = 'group' WHERE match_number = 51;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'BIH'), team_visitante_id = (SELECT id FROM teams WHERE code = 'QAT'), kickoff_at = '2026-06-24 19:00:00+00', venue = 'Lumen Field, Seattle', phase = 'group' WHERE match_number = 52;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CZE'), team_visitante_id = (SELECT id FROM teams WHERE code = 'MEX'), kickoff_at = '2026-06-25 01:00:00+00', venue = 'Estadio Azteca, Ciudad de México', phase = 'group' WHERE match_number = 53;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'RSA'), team_visitante_id = (SELECT id FROM teams WHERE code = 'KOR'), kickoff_at = '2026-06-25 01:00:00+00', venue = 'Estadio BBVA, Monterrey', phase = 'group' WHERE match_number = 54;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CUW'), team_visitante_id = (SELECT id FROM teams WHERE code = 'CIV'), kickoff_at = '2026-06-25 20:00:00+00', venue = 'Lincoln Financial Field, Filadelfia', phase = 'group' WHERE match_number = 55;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ECU'), team_visitante_id = (SELECT id FROM teams WHERE code = 'GER'), kickoff_at = '2026-06-25 20:00:00+00', venue = 'MetLife Stadium, Nueva York', phase = 'group' WHERE match_number = 56;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'JPN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'SWE'), kickoff_at = '2026-06-25 23:00:00+00', venue = 'AT&T Stadium, Dallas', phase = 'group' WHERE match_number = 57;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'TUN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'NED'), kickoff_at = '2026-06-25 23:00:00+00', venue = 'Arrowhead Stadium, Kansas City', phase = 'group' WHERE match_number = 58;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'TUR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'USA'), kickoff_at = '2026-06-26 02:00:00+00', venue = 'SoFi Stadium, Los Ángeles', phase = 'group' WHERE match_number = 59;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'PAR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'AUS'), kickoff_at = '2026-06-26 02:00:00+00', venue = 'Levi''s Stadium, San Francisco', phase = 'group' WHERE match_number = 60;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'NOR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'FRA'), kickoff_at = '2026-06-26 19:00:00+00', venue = 'Gillette Stadium, Boston', phase = 'group' WHERE match_number = 61;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'SEN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'IRQ'), kickoff_at = '2026-06-26 19:00:00+00', venue = 'BMO Field, Toronto', phase = 'group' WHERE match_number = 62;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'EGY'), team_visitante_id = (SELECT id FROM teams WHERE code = 'IRN'), kickoff_at = '2026-06-27 03:00:00+00', venue = 'Lumen Field, Seattle', phase = 'group' WHERE match_number = 63;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'NZL'), team_visitante_id = (SELECT id FROM teams WHERE code = 'BEL'), kickoff_at = '2026-06-27 03:00:00+00', venue = 'BC Place, Vancouver', phase = 'group' WHERE match_number = 64;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CPV'), team_visitante_id = (SELECT id FROM teams WHERE code = 'KSA'), kickoff_at = '2026-06-27 00:00:00+00', venue = 'NRG Stadium, Houston', phase = 'group' WHERE match_number = 65;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'URU'), team_visitante_id = (SELECT id FROM teams WHERE code = 'ESP'), kickoff_at = '2026-06-27 00:00:00+00', venue = 'Estadio Akron, Guadalajara', phase = 'group' WHERE match_number = 66;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'PAN'), team_visitante_id = (SELECT id FROM teams WHERE code = 'ENG'), kickoff_at = '2026-06-27 21:00:00+00', venue = 'MetLife Stadium, Nueva York', phase = 'group' WHERE match_number = 67;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'CRO'), team_visitante_id = (SELECT id FROM teams WHERE code = 'GHA'), kickoff_at = '2026-06-27 21:00:00+00', venue = 'Lincoln Financial Field, Filadelfia', phase = 'group' WHERE match_number = 68;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'ALG'), team_visitante_id = (SELECT id FROM teams WHERE code = 'AUT'), kickoff_at = '2026-06-28 02:00:00+00', venue = 'Arrowhead Stadium, Kansas City', phase = 'group' WHERE match_number = 69;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'JOR'), team_visitante_id = (SELECT id FROM teams WHERE code = 'ARG'), kickoff_at = '2026-06-28 02:00:00+00', venue = 'AT&T Stadium, Dallas', phase = 'group' WHERE match_number = 70;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'COL'), team_visitante_id = (SELECT id FROM teams WHERE code = 'POR'), kickoff_at = '2026-06-27 23:30:00+00', venue = 'Hard Rock Stadium, Miami', phase = 'group' WHERE match_number = 71;
UPDATE matches SET team_local_id = (SELECT id FROM teams WHERE code = 'COD'), team_visitante_id = (SELECT id FROM teams WHERE code = 'UZB'), kickoff_at = '2026-06-27 23:30:00+00', venue = 'Mercedes-Benz Stadium, Atlanta', phase = 'group' WHERE match_number = 72;

-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('013', 'Fix group stage fixture: correct teams, dates and venues per FIFA')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- IMPORTANTE: re-mapeo de API-Football
-- ============================================================
-- Como cambiaron los equipos de algunos partidos, los
-- api_fixture_id previos pueden haber quedado desalineados.
-- Después de aplicar esta migración, vuelve a correr el mapeo:
--   POST /api/admin/map-fixtures  (botón "Mapear fixtures" en /admin)
-- en AMBOS ambientes, para que cada partido apunte al fixture
-- correcto de API-Football.
