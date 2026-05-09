-- ============================================================
-- Migración 000: Tabla de tracking de migraciones
-- ============================================================
-- Esta migración SIEMPRE va primero. Sin ella no se puede
-- llevar registro de qué migraciones se han aplicado en cada
-- ambiente (dev / prod).
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  version       VARCHAR(10) PRIMARY KEY,
  applied_at    TIMESTAMPTZ DEFAULT NOW(),
  description   TEXT NOT NULL,
  applied_by    TEXT DEFAULT CURRENT_USER
);

COMMENT ON TABLE schema_migrations IS
'Registro de migraciones aplicadas. Antes de aplicar una migración nueva, verificar con: SELECT * FROM schema_migrations ORDER BY version;';

-- Registrar esta misma migración
INSERT INTO schema_migrations (version, description)
VALUES ('000', 'Migration tracking table')
ON CONFLICT (version) DO NOTHING;
