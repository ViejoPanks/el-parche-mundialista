-- ============================================================
-- Migración 001: Schema inicial de El Parche Mundialista
-- ============================================================
-- Crea todas las tablas, tipos, índices, RLS policies, vistas
-- y triggers básicos del sistema.
--
-- Dependencias: 000_migration_tracking.sql
-- ============================================================

-- ============================================================
-- 1. TIPOS ENUM (valores fijos del sistema)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE match_phase AS ENUM (
    'group',        -- Fase de grupos
    'r32',          -- Dieciseisavos (formato 2026)
    'r16',          -- Octavos
    'qf',           -- Cuartos
    'sf',           -- Semifinales
    'third_place',  -- Tercer puesto
    'final'         -- Final
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status AS ENUM (
    'scheduled',    -- Programado
    'live',         -- En vivo
    'finished',     -- Terminado, listo para calcular puntos
    'cancelled',    -- Cancelado (anula predicciones)
    'postponed'     -- Aplazado
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE member_role AS ENUM (
    'admin',        -- Creador del grupo
    'member'        -- Participante normal
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. CATÁLOGOS (datos del torneo)
-- ============================================================

-- Selecciones participantes
CREATE TABLE IF NOT EXISTS teams (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(3) NOT NULL UNIQUE,  -- ARG, COL, BRA
  flag_url    TEXT,
  group_name  CHAR(1)                       -- 'A', 'B', ... 'L' (12 grupos)
);

-- Jugadores (para predicciones de goleador y mejor jugador)
CREATE TABLE IF NOT EXISTS players (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  team_id     INTEGER REFERENCES teams(id),
  position    VARCHAR(30),
  photo_url   TEXT
);

-- Partidos del torneo
CREATE TABLE IF NOT EXISTS matches (
  id                       SERIAL PRIMARY KEY,
  phase                    match_phase NOT NULL,
  match_number             INTEGER UNIQUE,           -- número oficial FIFA
  team_local_id            INTEGER REFERENCES teams(id),
  team_visitante_id        INTEGER REFERENCES teams(id),
  kickoff_at               TIMESTAMPTZ NOT NULL,     -- hora oficial del partido
  venue                    VARCHAR(150),
  -- Resultados
  goals_local_90           INTEGER,                  -- goles al final del tiempo reglamentario
  goals_visitante_90       INTEGER,
  winner_advance_team_id   INTEGER REFERENCES teams(id),  -- quién pasó (incluye penales)
  status                   match_status DEFAULT 'scheduled',
  finished_at              TIMESTAMPTZ,
  CONSTRAINT different_teams CHECK (team_local_id <> team_visitante_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- ============================================================
-- 3. USUARIOS Y GRUPOS
-- ============================================================

-- Perfil de usuario (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  VARCHAR(80) NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos privados (ej: "Amigos del barrio", "Oficina")
CREATE TABLE IF NOT EXISTS groups (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  description       TEXT,
  invite_code       VARCHAR(10) NOT NULL UNIQUE,    -- código corto para unirse
  created_by        UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

-- Miembros de cada grupo
CREATE TABLE IF NOT EXISTS group_members (
  group_id     INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role         member_role DEFAULT 'member',
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- ============================================================
-- 4. PREDICCIONES
-- ============================================================

-- Predicción de un usuario para un partido específico
CREATE TABLE IF NOT EXISTS predictions (
  id                       SERIAL PRIMARY KEY,
  user_id                  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id                 INTEGER NOT NULL REFERENCES matches(id),
  pred_local               INTEGER NOT NULL CHECK (pred_local >= 0 AND pred_local <= 20),
  pred_visitante           INTEGER NOT NULL CHECK (pred_visitante >= 0 AND pred_visitante <= 20),
  pred_winner_advance      INTEGER REFERENCES teams(id),
  points_earned            INTEGER DEFAULT 0,
  is_exact                 BOOLEAN DEFAULT FALSE,
  is_diff_correct          BOOLEAN DEFAULT FALSE,
  is_advance_correct       BOOLEAN DEFAULT FALSE,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);

-- Predicciones especiales (una sola fila por usuario, para todo el torneo)
CREATE TABLE IF NOT EXISTS special_predictions (
  user_id                  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  champion_team_id         INTEGER REFERENCES teams(id),
  runner_up_team_id        INTEGER REFERENCES teams(id),
  third_place_team_id      INTEGER REFERENCES teams(id),
  top_scorer_player_id     INTEGER REFERENCES players(id),
  best_player_id           INTEGER REFERENCES players(id),
  points_earned            INTEGER DEFAULT 0,
  locked_at                TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. RESULTADOS OFICIALES DEL TORNEO
-- ============================================================

CREATE TABLE IF NOT EXISTS tournament_results (
  id                       INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  champion_team_id         INTEGER REFERENCES teams(id),
  runner_up_team_id        INTEGER REFERENCES teams(id),
  third_place_team_id      INTEGER REFERENCES teams(id),
  top_scorer_player_ids    INTEGER[],
  best_player_id           INTEGER REFERENCES players(id),
  finalized_at             TIMESTAMPTZ
);

-- ============================================================
-- 6. VISTA: TABLA DE POSICIONES POR GRUPO
-- ============================================================

CREATE OR REPLACE VIEW group_leaderboard AS
SELECT
  gm.group_id,
  p.id AS user_id,
  p.display_name,
  p.avatar_url,
  COALESCE(SUM(pr.points_earned), 0) + COALESCE(MAX(sp.points_earned), 0) AS total_points,
  COALESCE(SUM(CASE WHEN pr.is_exact THEN 1 ELSE 0 END), 0) AS exact_count,
  COALESCE(SUM(CASE WHEN pr.is_diff_correct THEN 1 ELSE 0 END), 0) AS diff_count,
  COALESCE(SUM(CASE WHEN pr.is_advance_correct THEN 1 ELSE 0 END), 0) AS advance_count,
  COALESCE(MAX(sp.points_earned), 0) AS special_points,
  gm.joined_at
FROM group_members gm
JOIN profiles p ON p.id = gm.user_id
LEFT JOIN predictions pr ON pr.user_id = p.id
LEFT JOIN special_predictions sp ON sp.user_id = p.id
GROUP BY gm.group_id, p.id, p.display_name, p.avatar_url, gm.joined_at
ORDER BY
  total_points DESC,
  exact_count DESC,
  diff_count DESC,
  special_points DESC,
  advance_count DESC,
  gm.joined_at ASC;

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_predictions ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Groups
DROP POLICY IF EXISTS "groups_read_member" ON groups;
CREATE POLICY "groups_read_member" ON groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "groups_insert_authenticated" ON groups;
CREATE POLICY "groups_insert_authenticated" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Group members
DROP POLICY IF EXISTS "members_read_own_groups" ON group_members;
CREATE POLICY "members_read_own_groups" ON group_members
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "members_join_group" ON group_members;
CREATE POLICY "members_join_group" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Predicciones: visibles solo para el dueño antes del cierre,
-- y para todos los miembros del grupo después del kickoff
DROP POLICY IF EXISTS "predictions_read_own_or_after_kickoff" ON predictions;
CREATE POLICY "predictions_read_own_or_after_kickoff" ON predictions
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = predictions.match_id AND m.kickoff_at <= NOW()
    )
  );

DROP POLICY IF EXISTS "predictions_write_own_before_kickoff" ON predictions;
CREATE POLICY "predictions_write_own_before_kickoff" ON predictions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.kickoff_at > NOW()
    )
  );

DROP POLICY IF EXISTS "predictions_update_own_before_kickoff" ON predictions;
CREATE POLICY "predictions_update_own_before_kickoff" ON predictions
  FOR UPDATE USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id AND m.kickoff_at > NOW()
    )
  );

-- Predicciones especiales
DROP POLICY IF EXISTS "special_read_own" ON special_predictions;
CREATE POLICY "special_read_own" ON special_predictions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "special_write_own_unlocked" ON special_predictions;
CREATE POLICY "special_write_own_unlocked" ON special_predictions
  FOR ALL USING (
    user_id = auth.uid() AND (locked_at IS NULL OR locked_at > NOW())
  );

-- ============================================================
-- 8. TRIGGER: actualizar updated_at automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_predictions_updated ON predictions;
CREATE TRIGGER trg_predictions_updated
  BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_special_updated ON special_predictions;
CREATE TRIGGER trg_special_updated
  BEFORE UPDATE ON special_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Registrar migración aplicada
-- ============================================================
INSERT INTO schema_migrations (version, description)
VALUES ('001', 'Initial schema: types, tables, RLS, leaderboard view, triggers')
ON CONFLICT (version) DO NOTHING;
