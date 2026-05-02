# 📝 Decisiones Técnicas (ADRs) — El Parche Mundialista

> ADR = Architecture Decision Record. Cada decisión importante queda registrada con su contexto y por qué se tomó. Útil cuando vuelvas en 3 meses y te preguntes "¿por qué hice esto así?".

---

## ADR-001: Web App (PWA) en lugar de App Nativa

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
El usuario inicialmente quería una app móvil para iOS y Android.

### Decisión
Construir una **Progressive Web App (PWA)** en lugar de apps nativas.

### Consecuencias

**Positivas:**
- Sin costos de publicación (USD 124 ahorrados)
- Sin tiempos de revisión de stores
- Actualizaciones instantáneas sin esperar aprobación
- Una sola base de código para todas las plataformas
- App stores pueden rechazar apps de "pollas/quinielas" por considerarse gambling
- Compartir es solo enviar un link

**Negativas:**
- Notificaciones push en iOS son limitadas (mejor en Android y desktop)
- No aparece en App Store / Google Play (algunos usuarios esperan eso)
- Algunas APIs nativas no están disponibles (no las necesitamos)

---

## ADR-002: La app NO maneja dinero

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
La idea original era que los participantes aportaran plata vía la app.

### Decisión
La app **solo registra puntajes**. El dinero se maneja por fuera del sistema (Nequi, Daviplata, transferencia, efectivo).

### Razones
- **Legal:** Coljuegos regula juegos de suerte y azar en Colombia. Manejar dinero requiere licencia.
- **Técnico:** Evita integrar pasarela de pagos, KYC, retiros, conciliación.
- **App Stores:** Rechazan apps de gambling sin licencias por país.
- **Confianza:** La administración del dinero entre conocidos ya tiene canales establecidos.

### Consecuencias
- Cada grupo asigna un "tesorero" que maneja el pote por fuera.
- La app gana en simplicidad y en velocidad de desarrollo.
- Si en futuro se quiere monetizar, sería como SaaS (cobrar a empresas por administrar pollas corporativas), no como casa de apuestas.

---

## ADR-003: Stack — Next.js + Supabase + Vercel

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
Necesitamos un stack que sea: gratis o muy barato, rápido de implementar, mantenible por una sola persona, y robusto.

### Decisión
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend/DB/Auth:** Supabase (PostgreSQL)
- **Hosting:** Vercel

### Alternativas consideradas

| Stack | Por qué no |
|---|---|
| FlutterFlow + Firebase | No-code limita extensibilidad, costo USD 30/mes |
| MERN + AWS | Demasiado boilerplate para proyecto pequeño |
| Rails + Heroku | Heroku ya no tiene plan gratis, Rails es overkill |
| Bubble | Web-first pero las apps móviles son wrappers lentos |

### Razones
- Free tier suficiente para uso esperado (50-200 usuarios totales)
- PostgreSQL relacional es ideal para datos relacionados (usuarios, grupos, partidos)
- Server Components reducen JS en cliente (importante en móvil)
- Una sola plataforma maneja auth + DB + storage + realtime
- Vercel + Supabase + Next.js tienen integración oficial documentada

---

## ADR-004: Sistema de puntuación con multiplicadores suaves

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
Hay tres modelos de puntuación posibles: plano (mismos puntos toda la polla), agresivo (final vale 6x grupos), o intermedio.

### Decisión
**Multiplicadores suaves**: la final vale 2x los partidos de grupos.

| Acierto | Grupos | Final |
|---|---|---|
| Marcador exacto | 5 pts | 10 pts (2x) |

### Razones
- Mantiene viva la competencia hasta el final sin invalidar lo hecho en grupos
- Evita que la polla se decida toda en los últimos 3 partidos
- Más justo con quien acertó muchos partidos de grupos
- Es un balance solicitado explícitamente por el dueño del proyecto

### Alternativas descartadas
- **Plano:** quien acumula al inicio gana, no incentiva seguir jugando
- **Agresivo (6x):** demasiada varianza, frustra a quien viene haciendo bien la polla

---

## ADR-005: Predicciones especiales bloqueables al inicio del torneo

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
¿Cuándo se cierran las predicciones de campeón, goleador, etc.?

### Decisión
Las predicciones especiales se cierran **al pitazo inicial del primer partido del Mundial** (11 de junio 2026). Una vez cerradas, no se pueden modificar.

### Razones
- Si se permitiera cambiar después, perderían sentido (cambiar campeón en cuartos cuando ya hay favoritos claros)
- Premia al que arriesga desde el día 1
- Es la práctica estándar en pollas serias

### Implementación técnica
Campo `locked_at` en tabla `special_predictions`. Lógica en RLS impide UPDATE si `locked_at < NOW()`.

---

## ADR-006: Marcador del 90' como base para puntos, ganador final para "quién pasa"

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
En eliminatorias, los partidos pueden ir a prórroga y/o penales. ¿Qué cuenta?

### Decisión
- Para puntos de **marcador**: solo el resultado al final del tiempo reglamentario (90' + adición)
- Para bonus de **"quién pasa de fase"**: el ganador final (incluye prórroga y penales)

### Razones
- Es la convención FIFA y de la mayoría de pollas internacionales
- Justifica que existan ambas mecánicas (marcador y bonus de avance)
- Permite que alguien acierte el bonus aunque falle el marcador exacto

### Implementación técnica
Tabla `matches` separa `goals_local_90` y `goals_visitante_90` del campo `winner_advance_team_id`.

---

## ADR-007: Row Level Security activado en todas las tablas sensibles

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
Sin RLS, cualquier usuario autenticado puede leer/modificar la DB sin restricción.

### Decisión
**Activar RLS en `profiles`, `groups`, `group_members`, `predictions`, `special_predictions`** con políticas estrictas.

### Política clave
> Las predicciones de un usuario solo son visibles para él **antes** del pitazo inicial. Después del cierre, los miembros del grupo pueden verlas.

### Razones
- Sin esta política, alguien podría espiar las predicciones de otros y "copiarlas"
- La seguridad a nivel de DB es más robusta que a nivel de app
- Cumple con buenas prácticas de Supabase

### Trade-off
- Las queries son un poco más lentas
- Hay que ser cuidadoso al escribir políticas (un error puede bloquear funcionalidad legítima)

---

## ADR-008: API-Football como fuente de datos

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada (revisable)

### Contexto
Necesitamos fixture y resultados en tiempo real del Mundial 2026.

### Decisión
Usar **API-Football** (api-football.com) como fuente primaria.

### Alternativas consideradas

| API | Pros | Contras |
|---|---|---|
| **API-Football** ✅ | Plan gratis 100 req/día, soporte Mundial específico, documentación completa | Plan gratis limitado |
| Football-Data.org | Gratis ilimitado para algunas ligas | Cobertura del Mundial puede ser básica |
| Sportradar | Datos premium | Caro, requiere contrato |
| Scrapeo manual | Cero costo | Frágil, ilegal en algunos términos de servicio |

### Estrategia para no quemar requests gratis
- Caché agresivo en Supabase
- Cron solo corre en días de partido
- Solo consulta partidos en estado "in progress" o "recently finished"
- Estimado: 30-50 requests/día durante el Mundial

---

## ADR-009: Cierre de predicciones en el servidor, no en el cliente

**Fecha:** Mayo 2026
**Estado:** ✅ Aceptada

### Contexto
¿Cómo bloquear predicciones cuando empieza un partido?

### Decisión
La validación de "el partido aún no comienza" se hace en **el servidor** (Server Action + RLS policy con `kickoff_at > NOW()`), no en el cliente.

### Razones
- Si la validación fuera solo en cliente, alguien con DevTools puede saltarla y predecir un partido en curso
- RLS de Postgres hace cumplir la regla a nivel de DB, imposible de evadir
- Server Actions garantizan que la mutación pase por validación server-side

---

## Plantilla para nuevas decisiones

```markdown
## ADR-XXX: [Título corto]

**Fecha:** [fecha]
**Estado:** ✅ Aceptada / 🔄 Propuesta / ❌ Rechazada / 🗑 Reemplazada por ADR-YYY

### Contexto
[¿Qué problema estamos resolviendo?]

### Decisión
[¿Qué decidimos hacer?]

### Razones
[¿Por qué esta opción y no otra?]

### Consecuencias
[Qué cambia, qué trade-offs aceptamos]
```
