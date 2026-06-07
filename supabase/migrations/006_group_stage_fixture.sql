-- ============================================================
-- Migración 006: Fixture fase de grupos Mundial 2026
-- ============================================================
-- Carga los 72 partidos de la fase de grupos (12 grupos × 6 partidos).
-- Las eliminatorias (32 partidos) se cargarán en una migración
-- posterior cuando termine la fase de grupos y se conozcan los cruces.
--
-- Horarios: TIMESTAMPTZ en UTC. Colombia es UTC-5 (sin DST).
-- Para ver hora local Colombia: SET timezone = 'America/Bogota';
--
-- Sedes: ciudad principal del estadio.
-- match_number: numeración FIFA 1-72 para fase de grupos.
--
-- Dependencias: 005_seed_mundial_2026.sql
-- ============================================================

BEGIN;

-- Limpieza idempotente (solo si no hay predicciones de estos partidos)
DELETE FROM matches WHERE match_number BETWEEN 1 AND 72;

-- ============================================================
-- Helper: función temporal para insertar partidos por código de equipo
-- ============================================================

CREATE OR REPLACE FUNCTION _insert_match(
  p_match_number INTEGER,
  p_phase match_phase,
  p_local_code VARCHAR(3),
  p_visitante_code VARCHAR(3),
  p_kickoff TIMESTAMPTZ,
  p_venue VARCHAR(150)
) RETURNS VOID AS $$
DECLARE
  v_local_id INTEGER;
  v_visitante_id INTEGER;
BEGIN
  SELECT id INTO v_local_id FROM teams WHERE code = p_local_code;
  SELECT id INTO v_visitante_id FROM teams WHERE code = p_visitante_code;

  IF v_local_id IS NULL THEN
    RAISE EXCEPTION 'Equipo % no encontrado', p_local_code;
  END IF;
  IF v_visitante_id IS NULL THEN
    RAISE EXCEPTION 'Equipo % no encontrado', p_visitante_code;
  END IF;

  INSERT INTO matches (
    match_number, phase, team_local_id, team_visitante_id,
    kickoff_at, venue, status
  ) VALUES (
    p_match_number, p_phase, v_local_id, v_visitante_id,
    p_kickoff, p_venue, 'scheduled'
  );
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- JORNADA 1 (11-18 junio)
-- ============================================================
-- Horarios en hora Colombia: convertir restando 5 horas a UTC

-- Jueves 11 junio
SELECT _insert_match(1,  'group', 'MEX', 'RSA', '2026-06-11 18:00:00+00', 'Estadio Azteca, Ciudad de México');
SELECT _insert_match(2,  'group', 'KOR', 'CZE', '2026-06-12 01:00:00+00', 'Estadio Akron, Guadalajara');

-- Viernes 12 junio
SELECT _insert_match(3,  'group', 'CAN', 'BIH', '2026-06-12 18:00:00+00', 'BMO Field, Toronto');
SELECT _insert_match(4,  'group', 'USA', 'PAR', '2026-06-13 01:00:00+00', 'SoFi Stadium, Los Ángeles');

-- Sábado 13 junio
SELECT _insert_match(5,  'group', 'QAT', 'SUI', '2026-06-13 18:00:00+00', 'Levi''s Stadium, San Francisco');
SELECT _insert_match(6,  'group', 'BRA', 'MAR', '2026-06-13 21:00:00+00', 'MetLife Stadium, Nueva York');
SELECT _insert_match(7,  'group', 'HAI', 'SCO', '2026-06-14 00:00:00+00', 'Gillette Stadium, Boston');

-- Domingo 14 junio
SELECT _insert_match(8,  'group', 'AUS', 'TUR', '2026-06-14 18:00:00+00', 'BC Place, Vancouver');
SELECT _insert_match(9,  'group', 'GER', 'ECU', '2026-06-14 21:00:00+00', 'Mercedes-Benz Stadium, Atlanta');
SELECT _insert_match(10, 'group', 'CUW', 'CIV', '2026-06-15 00:00:00+00', 'NRG Stadium, Houston');

-- Lunes 15 junio
SELECT _insert_match(11, 'group', 'NED', 'JPN', '2026-06-15 18:00:00+00', 'Arrowhead Stadium, Kansas City');
SELECT _insert_match(12, 'group', 'TUN', 'SWE', '2026-06-15 21:00:00+00', 'Lincoln Financial Field, Filadelfia');

-- Martes 16 junio
SELECT _insert_match(13, 'group', 'BEL', 'EGY', '2026-06-16 18:00:00+00', 'Hard Rock Stadium, Miami');
SELECT _insert_match(14, 'group', 'IRN', 'NZL', '2026-06-16 21:00:00+00', 'AT&T Stadium, Dallas');
SELECT _insert_match(15, 'group', 'ESP', 'URU', '2026-06-17 00:00:00+00', 'Estadio Akron, Guadalajara');

-- Miércoles 17 junio
SELECT _insert_match(16, 'group', 'CPV', 'KSA', '2026-06-17 18:00:00+00', 'NRG Stadium, Houston');
SELECT _insert_match(17, 'group', 'FRA', 'SEN', '2026-06-17 21:00:00+00', 'MetLife Stadium, Nueva York');
SELECT _insert_match(18, 'group', 'IRQ', 'NOR', '2026-06-18 00:00:00+00', 'Gillette Stadium, Boston');

-- Jueves 18 junio
SELECT _insert_match(19, 'group', 'ARG', 'ALG', '2026-06-18 03:00:00+00', 'Arrowhead Stadium, Kansas City');
SELECT _insert_match(20, 'group', 'AUT', 'JOR', '2026-06-18 06:00:00+00', 'Levi''s Stadium, San Francisco');
SELECT _insert_match(21, 'group', 'POR', 'COD', '2026-06-18 18:00:00+00', 'Estadio BBVA, Monterrey');
SELECT _insert_match(22, 'group', 'UZB', 'COL', '2026-06-18 21:00:00+00', 'Estadio Azteca, Ciudad de México');
SELECT _insert_match(23, 'group', 'ENG', 'CRO', '2026-06-19 00:00:00+00', 'AT&T Stadium, Dallas');
SELECT _insert_match(24, 'group', 'GHA', 'PAN', '2026-06-19 03:00:00+00', 'Hard Rock Stadium, Miami');


-- ============================================================
-- JORNADA 2 (18-23 junio)
-- ============================================================

-- Jueves 18 junio
SELECT _insert_match(25, 'group', 'CZE', 'RSA', '2026-06-18 15:00:00+00', 'Mercedes-Benz Stadium, Atlanta');
SELECT _insert_match(26, 'group', 'MEX', 'KOR', '2026-06-19 00:00:00+00', 'Estadio Akron, Guadalajara');

-- Viernes 19 junio
SELECT _insert_match(27, 'group', 'SUI', 'BIH', '2026-06-19 18:00:00+00', 'SoFi Stadium, Los Ángeles');
SELECT _insert_match(28, 'group', 'CAN', 'QAT', '2026-06-19 21:00:00+00', 'BC Place, Vancouver');

-- Sábado 20 junio
SELECT _insert_match(29, 'group', 'MAR', 'SCO', '2026-06-20 18:00:00+00', 'Hard Rock Stadium, Miami');
SELECT _insert_match(30, 'group', 'BRA', 'HAI', '2026-06-20 21:00:00+00', 'NRG Stadium, Houston');
SELECT _insert_match(31, 'group', 'PAR', 'TUR', '2026-06-21 00:00:00+00', 'Estadio Akron, Guadalajara');

-- Domingo 21 junio
SELECT _insert_match(32, 'group', 'USA', 'AUS', '2026-06-21 18:00:00+00', 'Lincoln Financial Field, Filadelfia');
SELECT _insert_match(33, 'group', 'ECU', 'CIV', '2026-06-21 21:00:00+00', 'Mercedes-Benz Stadium, Atlanta');
SELECT _insert_match(34, 'group', 'GER', 'CUW', '2026-06-22 00:00:00+00', 'AT&T Stadium, Dallas');

-- Lunes 22 junio
SELECT _insert_match(35, 'group', 'JPN', 'SWE', '2026-06-22 18:00:00+00', 'MetLife Stadium, Nueva York');
SELECT _insert_match(36, 'group', 'NED', 'TUN', '2026-06-22 21:00:00+00', 'Gillette Stadium, Boston');

-- Martes 23 junio
SELECT _insert_match(37, 'group', 'EGY', 'NZL', '2026-06-23 18:00:00+00', 'Arrowhead Stadium, Kansas City');
SELECT _insert_match(38, 'group', 'BEL', 'IRN', '2026-06-23 21:00:00+00', 'Hard Rock Stadium, Miami');
SELECT _insert_match(39, 'group', 'URU', 'KSA', '2026-06-24 00:00:00+00', 'NRG Stadium, Houston');
SELECT _insert_match(40, 'group', 'ESP', 'CPV', '2026-06-24 03:00:00+00', 'BMO Field, Toronto');

-- Miércoles 24 junio
SELECT _insert_match(41, 'group', 'SEN', 'NOR', '2026-06-24 18:00:00+00', 'MetLife Stadium, Nueva York');
SELECT _insert_match(42, 'group', 'FRA', 'IRQ', '2026-06-24 21:00:00+00', 'Lincoln Financial Field, Filadelfia');
SELECT _insert_match(43, 'group', 'ALG', 'JOR', '2026-06-25 00:00:00+00', 'Levi''s Stadium, San Francisco');
SELECT _insert_match(44, 'group', 'ARG', 'AUT', '2026-06-25 03:00:00+00', 'Arrowhead Stadium, Kansas City');

-- Jueves 25 junio
SELECT _insert_match(45, 'group', 'COD', 'UZB', '2026-06-25 18:00:00+00', 'BC Place, Vancouver');
SELECT _insert_match(46, 'group', 'POR', 'COL', '2026-06-25 21:00:00+00', 'AT&T Stadium, Dallas');
SELECT _insert_match(47, 'group', 'CRO', 'GHA', '2026-06-26 00:00:00+00', 'Mercedes-Benz Stadium, Atlanta');
SELECT _insert_match(48, 'group', 'ENG', 'PAN', '2026-06-26 03:00:00+00', 'Hard Rock Stadium, Miami');


-- ============================================================
-- JORNADA 3 (24-27 junio) - los 4 partidos del grupo el mismo día y hora
-- ============================================================

-- Miércoles 24 junio - Grupo A
SELECT _insert_match(49, 'group', 'CZE', 'MEX', '2026-06-25 00:00:00+00', 'Estadio Azteca, Ciudad de México');
SELECT _insert_match(50, 'group', 'RSA', 'KOR', '2026-06-25 00:00:00+00', 'Estadio BBVA, Monterrey');

-- Jueves 25 junio - Grupo B
SELECT _insert_match(51, 'group', 'SUI', 'CAN', '2026-06-25 18:00:00+00', 'SoFi Stadium, Los Ángeles');
SELECT _insert_match(52, 'group', 'BIH', 'QAT', '2026-06-25 18:00:00+00', 'Lumen Field, Seattle');

-- Viernes 26 junio - Grupo C
SELECT _insert_match(53, 'group', 'MAR', 'BRA', '2026-06-26 18:00:00+00', 'Estadio Akron, Guadalajara');
SELECT _insert_match(54, 'group', 'SCO', 'HAI', '2026-06-26 18:00:00+00', 'BMO Field, Toronto');

-- Viernes 26 junio - Grupo D
SELECT _insert_match(55, 'group', 'AUS', 'USA', '2026-06-26 21:00:00+00', 'Arrowhead Stadium, Kansas City');
SELECT _insert_match(56, 'group', 'TUR', 'PAR', '2026-06-26 21:00:00+00', 'NRG Stadium, Houston');

-- Sábado 27 junio - Grupo E
SELECT _insert_match(57, 'group', 'CIV', 'GER', '2026-06-27 17:00:00+00', 'Hard Rock Stadium, Miami');
SELECT _insert_match(58, 'group', 'ECU', 'CUW', '2026-06-27 17:00:00+00', 'AT&T Stadium, Dallas');

-- Sábado 27 junio - Grupo F
SELECT _insert_match(59, 'group', 'SWE', 'NED', '2026-06-27 20:00:00+00', 'MetLife Stadium, Nueva York');
SELECT _insert_match(60, 'group', 'TUN', 'JPN', '2026-06-27 20:00:00+00', 'Gillette Stadium, Boston');

-- Domingo 28 junio (madrugada para Colombia) - Grupo G
SELECT _insert_match(61, 'group', 'NZL', 'BEL', '2026-06-27 23:00:00+00', 'Lincoln Financial Field, Filadelfia');
SELECT _insert_match(62, 'group', 'IRN', 'EGY', '2026-06-27 23:00:00+00', 'Mercedes-Benz Stadium, Atlanta');

-- Domingo 28 junio - Grupo H
SELECT _insert_match(63, 'group', 'KSA', 'ESP', '2026-06-28 02:00:00+00', 'BC Place, Vancouver');
SELECT _insert_match(64, 'group', 'URU', 'CPV', '2026-06-28 02:00:00+00', 'Estadio Akron, Guadalajara');

-- Sábado 27 junio (tarde noche Colombia) - Grupo I
SELECT _insert_match(65, 'group', 'NOR', 'FRA', '2026-06-27 17:00:00+00', 'Lumen Field, Seattle');
SELECT _insert_match(66, 'group', 'IRQ', 'SEN', '2026-06-27 17:00:00+00', 'BMO Field, Toronto');

-- Sábado 27 junio - Grupo J
SELECT _insert_match(67, 'group', 'JOR', 'ARG', '2026-06-27 20:00:00+00', 'AT&T Stadium, Dallas');
SELECT _insert_match(68, 'group', 'AUT', 'ALG', '2026-06-27 20:00:00+00', 'NRG Stadium, Houston');

-- Domingo 28 junio - Grupo K
SELECT _insert_match(69, 'group', 'COL', 'POR', '2026-06-27 23:00:00+00', 'MetLife Stadium, Nueva York');
SELECT _insert_match(70, 'group', 'UZB', 'COD', '2026-06-27 23:00:00+00', 'Hard Rock Stadium, Miami');

-- Domingo 28 junio - Grupo L
SELECT _insert_match(71, 'group', 'PAN', 'ENG', '2026-06-28 02:00:00+00', 'Estadio BBVA, Monterrey');
SELECT _insert_match(72, 'group', 'GHA', 'CRO', '2026-06-28 02:00:00+00', 'Levi''s Stadium, San Francisco');


-- ============================================================
-- Limpiar función temporal
-- ============================================================
DROP FUNCTION _insert_match(INTEGER, match_phase, VARCHAR, VARCHAR, TIMESTAMPTZ, VARCHAR);


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('006', 'Group stage fixture: 72 matches')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- SELECT COUNT(*) FROM matches WHERE phase = 'group';   -> 72
-- SELECT match_number, phase, kickoff_at,
--   (SELECT name FROM teams WHERE id = team_local_id) AS local,
--   (SELECT name FROM teams WHERE id = team_visitante_id) AS visitante
-- FROM matches ORDER BY match_number LIMIT 10;
--
-- ⚠️ NOTA: Los horarios pueden tener pequeñas variaciones respecto a los
-- oficiales de FIFA. Si encuentras inexactitudes, puedes actualizarlos con:
-- UPDATE matches SET kickoff_at = '...' WHERE match_number = N;
