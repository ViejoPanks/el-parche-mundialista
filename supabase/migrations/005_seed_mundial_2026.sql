-- ============================================================
-- Migración 005: Seed de equipos y jugadores del Mundial 2026
-- ============================================================
-- Carga los 48 equipos clasificados con sus grupos y banderas,
-- y los jugadores estrella de cada selección (para predicciones
-- de goleador y mejor jugador).
--
-- Datos basados en el sorteo oficial del 5 de diciembre de 2025
-- y los resultados del repechaje del 31 de marzo de 2026.
--
-- Dependencias: 001_initial_schema.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EQUIPOS (48 selecciones, 12 grupos de 4)
-- ============================================================

-- Limpieza idempotente (por si la migración se re-ejecuta)
-- Solo borra si las tablas dependientes no tienen datos para evitar
-- borrar predicciones existentes.
DELETE FROM teams WHERE code IN (
  'MEX','RSA','KOR','CZE','CAN','BIH','QAT','SUI','BRA','MAR','HAI','SCO',
  'USA','PAR','AUS','TUR','GER','CUW','CIV','ECU','NED','JPN','SWE','TUN',
  'BEL','EGY','IRN','NZL','ESP','CPV','KSA','URU','FRA','SEN','IRQ','NOR',
  'ARG','ALG','AUT','JOR','POR','COD','UZB','COL','ENG','CRO','GHA','PAN'
);

INSERT INTO teams (name, code, flag_url, group_name) VALUES
-- Grupo A
('México',          'MEX', 'https://flagcdn.com/w320/mx.png',     'A'),
('Sudáfrica',       'RSA', 'https://flagcdn.com/w320/za.png',     'A'),
('Corea del Sur',   'KOR', 'https://flagcdn.com/w320/kr.png',     'A'),
('Chequia',         'CZE', 'https://flagcdn.com/w320/cz.png',     'A'),
-- Grupo B
('Canadá',          'CAN', 'https://flagcdn.com/w320/ca.png',     'B'),
('Bosnia',          'BIH', 'https://flagcdn.com/w320/ba.png',     'B'),
('Catar',           'QAT', 'https://flagcdn.com/w320/qa.png',     'B'),
('Suiza',           'SUI', 'https://flagcdn.com/w320/ch.png',     'B'),
-- Grupo C
('Brasil',          'BRA', 'https://flagcdn.com/w320/br.png',     'C'),
('Marruecos',       'MAR', 'https://flagcdn.com/w320/ma.png',     'C'),
('Haití',           'HAI', 'https://flagcdn.com/w320/ht.png',     'C'),
('Escocia',         'SCO', 'https://flagcdn.com/w320/gb-sct.png', 'C'),
-- Grupo D
('Estados Unidos',  'USA', 'https://flagcdn.com/w320/us.png',     'D'),
('Paraguay',        'PAR', 'https://flagcdn.com/w320/py.png',     'D'),
('Australia',       'AUS', 'https://flagcdn.com/w320/au.png',     'D'),
('Turquía',         'TUR', 'https://flagcdn.com/w320/tr.png',     'D'),
-- Grupo E
('Alemania',        'GER', 'https://flagcdn.com/w320/de.png',     'E'),
('Curazao',         'CUW', 'https://flagcdn.com/w320/cw.png',     'E'),
('Costa de Marfil', 'CIV', 'https://flagcdn.com/w320/ci.png',     'E'),
('Ecuador',         'ECU', 'https://flagcdn.com/w320/ec.png',     'E'),
-- Grupo F
('Países Bajos',    'NED', 'https://flagcdn.com/w320/nl.png',     'F'),
('Japón',           'JPN', 'https://flagcdn.com/w320/jp.png',     'F'),
('Suecia',          'SWE', 'https://flagcdn.com/w320/se.png',     'F'),
('Túnez',           'TUN', 'https://flagcdn.com/w320/tn.png',     'F'),
-- Grupo G
('Bélgica',         'BEL', 'https://flagcdn.com/w320/be.png',     'G'),
('Egipto',          'EGY', 'https://flagcdn.com/w320/eg.png',     'G'),
('Irán',            'IRN', 'https://flagcdn.com/w320/ir.png',     'G'),
('Nueva Zelanda',   'NZL', 'https://flagcdn.com/w320/nz.png',     'G'),
-- Grupo H
('España',          'ESP', 'https://flagcdn.com/w320/es.png',     'H'),
('Cabo Verde',      'CPV', 'https://flagcdn.com/w320/cv.png',     'H'),
('Arabia Saudí',    'KSA', 'https://flagcdn.com/w320/sa.png',     'H'),
('Uruguay',         'URU', 'https://flagcdn.com/w320/uy.png',     'H'),
-- Grupo I
('Francia',         'FRA', 'https://flagcdn.com/w320/fr.png',     'I'),
('Senegal',         'SEN', 'https://flagcdn.com/w320/sn.png',     'I'),
('Irak',            'IRQ', 'https://flagcdn.com/w320/iq.png',     'I'),
('Noruega',         'NOR', 'https://flagcdn.com/w320/no.png',     'I'),
-- Grupo J
('Argentina',       'ARG', 'https://flagcdn.com/w320/ar.png',     'J'),
('Argelia',         'ALG', 'https://flagcdn.com/w320/dz.png',     'J'),
('Austria',         'AUT', 'https://flagcdn.com/w320/at.png',     'J'),
('Jordania',        'JOR', 'https://flagcdn.com/w320/jo.png',     'J'),
-- Grupo K
('Portugal',        'POR', 'https://flagcdn.com/w320/pt.png',     'K'),
('RD del Congo',    'COD', 'https://flagcdn.com/w320/cd.png',     'K'),
('Uzbekistán',      'UZB', 'https://flagcdn.com/w320/uz.png',     'K'),
('Colombia',        'COL', 'https://flagcdn.com/w320/co.png',     'K'),
-- Grupo L
('Inglaterra',      'ENG', 'https://flagcdn.com/w320/gb-eng.png', 'L'),
('Croacia',         'CRO', 'https://flagcdn.com/w320/hr.png',     'L'),
('Ghana',           'GHA', 'https://flagcdn.com/w320/gh.png',     'L'),
('Panamá',          'PAN', 'https://flagcdn.com/w320/pa.png',     'L');

-- ============================================================
-- 2. JUGADORES ESTRELLA
-- ============================================================
-- Jugadores principales de cada selección (4-6 por equipo top,
-- 2-3 por equipos menores). Son los relevantes para las
-- predicciones de "goleador" y "mejor jugador".
--
-- Posiciones: GK (portero), DEF (defensa), MID (mediocampo), FWD (delantero)
-- ============================================================

-- Función helper para insertar jugadores por código de equipo
DO $$
DECLARE
  v_team_id INTEGER;
BEGIN

-- ARGENTINA
SELECT id INTO v_team_id FROM teams WHERE code = 'ARG';
INSERT INTO players (name, team_id, position) VALUES
  ('Lionel Messi',         v_team_id, 'FWD'),
  ('Julián Álvarez',       v_team_id, 'FWD'),
  ('Lautaro Martínez',     v_team_id, 'FWD'),
  ('Enzo Fernández',       v_team_id, 'MID'),
  ('Emiliano Martínez',    v_team_id, 'GK');

-- BRASIL
SELECT id INTO v_team_id FROM teams WHERE code = 'BRA';
INSERT INTO players (name, team_id, position) VALUES
  ('Vinicius Junior',      v_team_id, 'FWD'),
  ('Rodrygo',              v_team_id, 'FWD'),
  ('Endrick',              v_team_id, 'FWD'),
  ('Casemiro',             v_team_id, 'MID'),
  ('Alisson',              v_team_id, 'GK');

-- FRANCIA
SELECT id INTO v_team_id FROM teams WHERE code = 'FRA';
INSERT INTO players (name, team_id, position) VALUES
  ('Kylian Mbappé',        v_team_id, 'FWD'),
  ('Ousmane Dembélé',      v_team_id, 'FWD'),
  ('Aurélien Tchouaméni',  v_team_id, 'MID'),
  ('William Saliba',       v_team_id, 'DEF'),
  ('Mike Maignan',         v_team_id, 'GK');

-- ESPAÑA
SELECT id INTO v_team_id FROM teams WHERE code = 'ESP';
INSERT INTO players (name, team_id, position) VALUES
  ('Lamine Yamal',         v_team_id, 'FWD'),
  ('Nico Williams',        v_team_id, 'FWD'),
  ('Pedri',                v_team_id, 'MID'),
  ('Rodri',                v_team_id, 'MID'),
  ('Unai Simón',           v_team_id, 'GK');

-- INGLATERRA
SELECT id INTO v_team_id FROM teams WHERE code = 'ENG';
INSERT INTO players (name, team_id, position) VALUES
  ('Jude Bellingham',      v_team_id, 'MID'),
  ('Bukayo Saka',          v_team_id, 'FWD'),
  ('Phil Foden',           v_team_id, 'MID'),
  ('Harry Kane',           v_team_id, 'FWD'),
  ('Jordan Pickford',      v_team_id, 'GK');

-- PORTUGAL
SELECT id INTO v_team_id FROM teams WHERE code = 'POR';
INSERT INTO players (name, team_id, position) VALUES
  ('Cristiano Ronaldo',    v_team_id, 'FWD'),
  ('Bernardo Silva',       v_team_id, 'MID'),
  ('Bruno Fernandes',      v_team_id, 'MID'),
  ('Rúben Dias',           v_team_id, 'DEF'),
  ('Diogo Costa',          v_team_id, 'GK');

-- ALEMANIA
SELECT id INTO v_team_id FROM teams WHERE code = 'GER';
INSERT INTO players (name, team_id, position) VALUES
  ('Jamal Musiala',        v_team_id, 'MID'),
  ('Florian Wirtz',        v_team_id, 'MID'),
  ('Joshua Kimmich',       v_team_id, 'MID'),
  ('Kai Havertz',          v_team_id, 'FWD'),
  ('Marc-André ter Stegen', v_team_id, 'GK');

-- PAÍSES BAJOS
SELECT id INTO v_team_id FROM teams WHERE code = 'NED';
INSERT INTO players (name, team_id, position) VALUES
  ('Frenkie de Jong',      v_team_id, 'MID'),
  ('Cody Gakpo',           v_team_id, 'FWD'),
  ('Memphis Depay',        v_team_id, 'FWD'),
  ('Virgil van Dijk',      v_team_id, 'DEF'),
  ('Bart Verbruggen',      v_team_id, 'GK');

-- BÉLGICA
SELECT id INTO v_team_id FROM teams WHERE code = 'BEL';
INSERT INTO players (name, team_id, position) VALUES
  ('Kevin De Bruyne',      v_team_id, 'MID'),
  ('Jérémy Doku',          v_team_id, 'FWD'),
  ('Romelu Lukaku',        v_team_id, 'FWD'),
  ('Youri Tielemans',      v_team_id, 'MID'),
  ('Thibaut Courtois',     v_team_id, 'GK');

-- CROACIA
SELECT id INTO v_team_id FROM teams WHERE code = 'CRO';
INSERT INTO players (name, team_id, position) VALUES
  ('Luka Modrić',          v_team_id, 'MID'),
  ('Mateo Kovačić',        v_team_id, 'MID'),
  ('Andrej Kramarić',      v_team_id, 'FWD'),
  ('Joško Gvardiol',       v_team_id, 'DEF'),
  ('Dominik Livaković',    v_team_id, 'GK');

-- COLOMBIA
SELECT id INTO v_team_id FROM teams WHERE code = 'COL';
INSERT INTO players (name, team_id, position) VALUES
  ('Luis Díaz',            v_team_id, 'FWD'),
  ('James Rodríguez',      v_team_id, 'MID'),
  ('Jhon Durán',           v_team_id, 'FWD'),
  ('Richard Ríos',         v_team_id, 'MID'),
  ('Camilo Vargas',        v_team_id, 'GK');

-- URUGUAY
SELECT id INTO v_team_id FROM teams WHERE code = 'URU';
INSERT INTO players (name, team_id, position) VALUES
  ('Darwin Núñez',         v_team_id, 'FWD'),
  ('Federico Valverde',    v_team_id, 'MID'),
  ('Rodrigo Bentancur',    v_team_id, 'MID'),
  ('Ronald Araújo',        v_team_id, 'DEF'),
  ('Sergio Rochet',        v_team_id, 'GK');

-- MÉXICO
SELECT id INTO v_team_id FROM teams WHERE code = 'MEX';
INSERT INTO players (name, team_id, position) VALUES
  ('Edson Álvarez',        v_team_id, 'MID'),
  ('Hirving Lozano',       v_team_id, 'FWD'),
  ('Santiago Giménez',     v_team_id, 'FWD'),
  ('Raúl Jiménez',         v_team_id, 'FWD'),
  ('Guillermo Ochoa',      v_team_id, 'GK');

-- USA
SELECT id INTO v_team_id FROM teams WHERE code = 'USA';
INSERT INTO players (name, team_id, position) VALUES
  ('Christian Pulisic',    v_team_id, 'FWD'),
  ('Weston McKennie',      v_team_id, 'MID'),
  ('Tyler Adams',          v_team_id, 'MID'),
  ('Gio Reyna',            v_team_id, 'MID'),
  ('Matt Turner',          v_team_id, 'GK');

-- MARRUECOS
SELECT id INTO v_team_id FROM teams WHERE code = 'MAR';
INSERT INTO players (name, team_id, position) VALUES
  ('Achraf Hakimi',        v_team_id, 'DEF'),
  ('Hakim Ziyech',         v_team_id, 'MID'),
  ('Youssef En-Nesyri',    v_team_id, 'FWD'),
  ('Yassine Bounou',       v_team_id, 'GK');

-- SENEGAL
SELECT id INTO v_team_id FROM teams WHERE code = 'SEN';
INSERT INTO players (name, team_id, position) VALUES
  ('Sadio Mané',           v_team_id, 'FWD'),
  ('Idrissa Gueye',        v_team_id, 'MID'),
  ('Kalidou Koulibaly',    v_team_id, 'DEF'),
  ('Édouard Mendy',        v_team_id, 'GK');

-- SUIZA
SELECT id INTO v_team_id FROM teams WHERE code = 'SUI';
INSERT INTO players (name, team_id, position) VALUES
  ('Granit Xhaka',         v_team_id, 'MID'),
  ('Breel Embolo',          v_team_id, 'FWD'),
  ('Manuel Akanji',        v_team_id, 'DEF'),
  ('Yann Sommer',          v_team_id, 'GK');

-- JAPÓN
SELECT id INTO v_team_id FROM teams WHERE code = 'JPN';
INSERT INTO players (name, team_id, position) VALUES
  ('Kaoru Mitoma',         v_team_id, 'FWD'),
  ('Takefusa Kubo',        v_team_id, 'MID'),
  ('Wataru Endo',          v_team_id, 'MID'),
  ('Takumi Minamino',      v_team_id, 'MID');

-- COREA DEL SUR
SELECT id INTO v_team_id FROM teams WHERE code = 'KOR';
INSERT INTO players (name, team_id, position) VALUES
  ('Son Heung-min',        v_team_id, 'FWD'),
  ('Kim Min-jae',          v_team_id, 'DEF'),
  ('Lee Kang-in',          v_team_id, 'MID'),
  ('Hwang Hee-chan',       v_team_id, 'FWD');

-- AUSTRALIA
SELECT id INTO v_team_id FROM teams WHERE code = 'AUS';
INSERT INTO players (name, team_id, position) VALUES
  ('Mathew Ryan',          v_team_id, 'GK'),
  ('Ajdin Hrustic',        v_team_id, 'MID'),
  ('Awer Mabil',           v_team_id, 'FWD');

-- ECUADOR
SELECT id INTO v_team_id FROM teams WHERE code = 'ECU';
INSERT INTO players (name, team_id, position) VALUES
  ('Moisés Caicedo',       v_team_id, 'MID'),
  ('Piero Hincapié',       v_team_id, 'DEF'),
  ('Pervis Estupiñán',     v_team_id, 'DEF'),
  ('Enner Valencia',       v_team_id, 'FWD');

-- NORUEGA
SELECT id INTO v_team_id FROM teams WHERE code = 'NOR';
INSERT INTO players (name, team_id, position) VALUES
  ('Erling Haaland',       v_team_id, 'FWD'),
  ('Martin Ødegaard',      v_team_id, 'MID'),
  ('Alexander Sørloth',    v_team_id, 'FWD'),
  ('Sander Berge',         v_team_id, 'MID');

-- EGIPTO
SELECT id INTO v_team_id FROM teams WHERE code = 'EGY';
INSERT INTO players (name, team_id, position) VALUES
  ('Mohamed Salah',        v_team_id, 'FWD'),
  ('Mohamed Hegazi',       v_team_id, 'DEF'),
  ('Trezeguet',            v_team_id, 'MID');

-- COSTA DE MARFIL
SELECT id INTO v_team_id FROM teams WHERE code = 'CIV';
INSERT INTO players (name, team_id, position) VALUES
  ('Nicolas Pépé',         v_team_id, 'FWD'),
  ('Franck Kessié',        v_team_id, 'MID'),
  ('Eric Bailly',          v_team_id, 'DEF');

-- CANADÁ
SELECT id INTO v_team_id FROM teams WHERE code = 'CAN';
INSERT INTO players (name, team_id, position) VALUES
  ('Alphonso Davies',      v_team_id, 'DEF'),
  ('Jonathan David',       v_team_id, 'FWD'),
  ('Stephen Eustáquio',    v_team_id, 'MID');

-- PARAGUAY
SELECT id INTO v_team_id FROM teams WHERE code = 'PAR';
INSERT INTO players (name, team_id, position) VALUES
  ('Miguel Almirón',       v_team_id, 'FWD'),
  ('Antonio Sanabria',     v_team_id, 'FWD'),
  ('Gustavo Gómez',        v_team_id, 'DEF');

-- TURQUÍA
SELECT id INTO v_team_id FROM teams WHERE code = 'TUR';
INSERT INTO players (name, team_id, position) VALUES
  ('Arda Güler',           v_team_id, 'MID'),
  ('Hakan Çalhanoğlu',     v_team_id, 'MID'),
  ('Kenan Yıldız',         v_team_id, 'FWD'),
  ('Kerem Aktürkoğlu',     v_team_id, 'FWD');

-- DEMÁS EQUIPOS (jugadores más representativos)
SELECT id INTO v_team_id FROM teams WHERE code = 'SUE'; -- por si acaso
SELECT id INTO v_team_id FROM teams WHERE code = 'SWE';
INSERT INTO players (name, team_id, position) VALUES
  ('Alexander Isak',       v_team_id, 'FWD'),
  ('Viktor Gyökeres',      v_team_id, 'FWD'),
  ('Dejan Kulusevski',     v_team_id, 'MID');

-- CHEQUIA
SELECT id INTO v_team_id FROM teams WHERE code = 'CZE';
INSERT INTO players (name, team_id, position) VALUES
  ('Patrik Schick',        v_team_id, 'FWD'),
  ('Tomáš Souček',         v_team_id, 'MID');

-- BOSNIA
SELECT id INTO v_team_id FROM teams WHERE code = 'BIH';
INSERT INTO players (name, team_id, position) VALUES
  ('Edin Džeko',           v_team_id, 'FWD'),
  ('Miralem Pjanić',       v_team_id, 'MID');

-- ARABIA SAUDÍ
SELECT id INTO v_team_id FROM teams WHERE code = 'KSA';
INSERT INTO players (name, team_id, position) VALUES
  ('Salem Al-Dawsari',     v_team_id, 'FWD'),
  ('Mohammed Kanno',       v_team_id, 'MID');

-- CABO VERDE
SELECT id INTO v_team_id FROM teams WHERE code = 'CPV';
INSERT INTO players (name, team_id, position) VALUES
  ('Ryan Mendes',          v_team_id, 'FWD'),
  ('Bebé',                 v_team_id, 'FWD');

-- AUSTRIA
SELECT id INTO v_team_id FROM teams WHERE code = 'AUT';
INSERT INTO players (name, team_id, position) VALUES
  ('David Alaba',          v_team_id, 'DEF'),
  ('Marko Arnautović',     v_team_id, 'FWD'),
  ('Marcel Sabitzer',      v_team_id, 'MID');

-- ARGELIA
SELECT id INTO v_team_id FROM teams WHERE code = 'ALG';
INSERT INTO players (name, team_id, position) VALUES
  ('Riyad Mahrez',         v_team_id, 'FWD'),
  ('Ismaël Bennacer',      v_team_id, 'MID');

-- ESCOCIA
SELECT id INTO v_team_id FROM teams WHERE code = 'SCO';
INSERT INTO players (name, team_id, position) VALUES
  ('Andy Robertson',       v_team_id, 'DEF'),
  ('Scott McTominay',      v_team_id, 'MID'),
  ('John McGinn',          v_team_id, 'MID');

-- HAITÍ
SELECT id INTO v_team_id FROM teams WHERE code = 'HAI';
INSERT INTO players (name, team_id, position) VALUES
  ('Duckens Nazon',        v_team_id, 'FWD'),
  ('Frantzdy Pierrot',     v_team_id, 'FWD');

-- IRÁN
SELECT id INTO v_team_id FROM teams WHERE code = 'IRN';
INSERT INTO players (name, team_id, position) VALUES
  ('Mehdi Taremi',         v_team_id, 'FWD'),
  ('Sardar Azmoun',        v_team_id, 'FWD');

-- NUEVA ZELANDA
SELECT id INTO v_team_id FROM teams WHERE code = 'NZL';
INSERT INTO players (name, team_id, position) VALUES
  ('Chris Wood',           v_team_id, 'FWD'),
  ('Marko Stamenić',       v_team_id, 'MID');

-- IRAK
SELECT id INTO v_team_id FROM teams WHERE code = 'IRQ';
INSERT INTO players (name, team_id, position) VALUES
  ('Aymen Hussein',        v_team_id, 'FWD'),
  ('Ali Adnan',            v_team_id, 'DEF');

-- JORDANIA
SELECT id INTO v_team_id FROM teams WHERE code = 'JOR';
INSERT INTO players (name, team_id, position) VALUES
  ('Mousa Al-Tamari',      v_team_id, 'FWD'),
  ('Yazan Al-Naimat',      v_team_id, 'FWD');

-- UZBEKISTÁN
SELECT id INTO v_team_id FROM teams WHERE code = 'UZB';
INSERT INTO players (name, team_id, position) VALUES
  ('Eldor Shomurodov',     v_team_id, 'FWD'),
  ('Abbosbek Fayzullaev',  v_team_id, 'MID');

-- RD CONGO
SELECT id INTO v_team_id FROM teams WHERE code = 'COD';
INSERT INTO players (name, team_id, position) VALUES
  ('Cédric Bakambu',       v_team_id, 'FWD'),
  ('Yoane Wissa',          v_team_id, 'FWD'),
  ('Chancel Mbemba',       v_team_id, 'DEF');

-- GHANA
SELECT id INTO v_team_id FROM teams WHERE code = 'GHA';
INSERT INTO players (name, team_id, position) VALUES
  ('Mohammed Kudus',       v_team_id, 'MID'),
  ('Antoine Semenyo',      v_team_id, 'FWD'),
  ('Thomas Partey',        v_team_id, 'MID');

-- PANAMÁ
SELECT id INTO v_team_id FROM teams WHERE code = 'PAN';
INSERT INTO players (name, team_id, position) VALUES
  ('José Fajardo',         v_team_id, 'FWD'),
  ('Aníbal Godoy',         v_team_id, 'MID');

-- TÚNEZ
SELECT id INTO v_team_id FROM teams WHERE code = 'TUN';
INSERT INTO players (name, team_id, position) VALUES
  ('Wahbi Khazri',         v_team_id, 'FWD'),
  ('Hannibal Mejbri',      v_team_id, 'MID');

-- CATAR
SELECT id INTO v_team_id FROM teams WHERE code = 'QAT';
INSERT INTO players (name, team_id, position) VALUES
  ('Akram Afif',           v_team_id, 'FWD'),
  ('Almoez Ali',           v_team_id, 'FWD');

-- SUDÁFRICA
SELECT id INTO v_team_id FROM teams WHERE code = 'RSA';
INSERT INTO players (name, team_id, position) VALUES
  ('Percy Tau',            v_team_id, 'FWD'),
  ('Themba Zwane',         v_team_id, 'MID');

-- CURAZAO
SELECT id INTO v_team_id FROM teams WHERE code = 'CUW';
INSERT INTO players (name, team_id, position) VALUES
  ('Leandro Bacuna',       v_team_id, 'MID'),
  ('Tahith Chong',         v_team_id, 'MID');

END $$;


-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('005', 'Seed of teams (48) and star players for Mundial 2026')
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================
-- Después de aplicar, deberías ver:
-- SELECT COUNT(*) FROM teams;     -> 48
-- SELECT COUNT(*) FROM players;   -> ~150
-- SELECT group_name, COUNT(*) FROM teams GROUP BY group_name ORDER BY group_name;
--   Debería mostrar 12 grupos (A-L) con 4 equipos cada uno
