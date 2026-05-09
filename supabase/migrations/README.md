# 🗄️ Migraciones de Base de Datos

Sistema de migraciones versionadas para mantener sincronizados los ambientes **dev** y **prod** de Supabase.

## 📋 ¿Qué es una migración?

Un archivo SQL que representa un cambio incremental en la base de datos. Cada migración:

- Tiene un **número secuencial** (`001`, `002`, `003`...)
- Es **inmutable** una vez aplicada en producción (nunca se edita)
- Se **registra** en la tabla `schema_migrations` al final de su ejecución

## 📁 Migraciones actuales

| Archivo | Descripción |
|---|---|
| `000_migration_tracking.sql` | Crea la tabla `schema_migrations` que trackea qué se aplicó |
| `001_initial_schema.sql` | Tipos, tablas, índices, RLS, vista `group_leaderboard` |
| `002_calculate_points_functions.sql` | Funciones de cálculo de puntos + trigger automático |
| `003_fix_profile_creation.sql` | Fix de creación automática de perfiles (RLS + trigger en auth.users) |

## 🚀 Aplicar migraciones

### Primera vez (proyecto nuevo)

En **cada** ambiente (dev y prod), aplica las migraciones **en orden**:

1. Ve a Supabase Dashboard → SQL Editor → New query
2. Pega el contenido de `000_migration_tracking.sql` → Run
3. Pega el contenido de `001_initial_schema.sql` → Run
4. Pega el contenido de `002_calculate_points_functions.sql` → Run
5. Pega el contenido de `003_fix_profile_creation.sql` → Run

### Verificar que se aplicaron bien

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

Deberías ver las 4 migraciones con sus timestamps.

## 🔄 Workflow para nuevas migraciones

Cuando necesites cambiar la DB:

1. Crea archivo `00X_descripcion.sql` en esta carpeta
2. Termina el archivo con:
   ```sql
   INSERT INTO schema_migrations (version, description)
   VALUES ('00X', 'Descripción corta')
   ON CONFLICT (version) DO NOTHING;
   ```
3. **Probar en parche-dev** (Supabase SQL Editor)
4. Si funciona → commit a GitHub
5. **Aplicar en parche-prod**
6. ✅ Sincronizados

## ⚠️ Reglas de oro

### NO
- ❌ Editar una migración ya aplicada en prod (crea otra que la corrija)
- ❌ Saltarse números (de 005 a 010)
- ❌ Aplicar cambios en prod sin pasar por dev primero
- ❌ Olvidar el `INSERT INTO schema_migrations` al final

### SÍ
- ✅ Migraciones idempotentes (`CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, `DROP POLICY IF EXISTS`)
- ✅ Migraciones pequeñas y enfocadas
- ✅ Comentarios al inicio explicando qué hace
- ✅ Probar en dev siempre antes de prod
- ✅ Backup antes de migraciones destructivas

## 🔑 Convención de nombres

```
NNN_descripcion_corta_en_snake_case.sql
```

Donde `NNN` es un número de 3 dígitos con padding (`001`, `010`, `100`).

## 📚 Referencias

- [Supabase Database Migrations Best Practices](https://supabase.com/docs/guides/deployment/database-migrations)
- ADR-010 en `docs/decisiones.md`
- Página "11. Ambientes y Migraciones" en Notion
