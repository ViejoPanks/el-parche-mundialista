# 🏗 Arquitectura Técnica — El Parche Mundialista

## Visión general

Web app responsive (PWA) construida con un stack moderno, gratuito en su capa de uso esperado, y diseñada para mantenerse simple sin sobre-ingeniería.

```
┌─────────────────────────────────────────────────┐
│              USUARIOS (móvil/desktop)            │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│        FRONTEND — Next.js 14 (Vercel)           │
│   - App Router                                   │
│   - Server Components + Server Actions           │
│   - Tailwind CSS                                 │
│   - PWA (manifest + service worker)             │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────────┐  ┌────────────────────┐
│    SUPABASE      │  │   API-FOOTBALL      │
│   - Auth         │  │   - Fixture         │
│   - PostgreSQL   │  │   - Resultados live │
│   - Realtime     │  │   - Goleadores      │
│   - Edge Funcs   │  └────────────────────┘
│   - Storage      │           ▲
└──────────────────┘           │
        ▲                      │
        └──────────────────────┘
        Cron job (cada hora en días de partido)
```

---

## Stack detallado

### Frontend: Next.js 14

**Por qué:**
- React Server Components reducen el JS enviado al cliente (importante en móviles)
- App Router es el estándar actual y se integra perfecto con Supabase
- Vercel lo despliega gratis con SSL, CDN global, previews por PR

**Librerías clave:**
- `@supabase/ssr` — cliente oficial para auth con Server Components
- `tailwindcss` — estilos
- `lucide-react` — íconos
- `date-fns` + `date-fns-tz` — manejo de zonas horarias (crítico para cierres de partidos)
- `zod` — validación de inputs
- `react-hook-form` — formularios de predicción

### Backend: Supabase

**Servicios usados:**

| Servicio | Para qué |
|---|---|
| **Auth** | Login con Google + Email/Password |
| **PostgreSQL** | Toda la data (ver `docs/database.md`) |
| **Row Level Security** | Bloquear ver predicciones de otros antes del cierre |
| **Edge Functions** | Cálculo de puntos cuando termina un partido |
| **Realtime** | Tabla de posiciones que se actualiza sin recargar |
| **Storage** | Avatares de usuarios (opcional) |

**Plan:** Free tier de Supabase basta hasta 500 MB de datos y 50K MAU.

### Datos del torneo: API-Football

**Por qué esta API:**
- Tiene endpoint específico del Mundial (`league=1`)
- Plan gratis: 100 requests/día (suficiente con caché)
- Devuelve fixture, resultados, lineups, goleadores

**Estrategia de uso:**
- Carga inicial: descargar todos los partidos del Mundial 2026 una vez (1 request)
- Durante el torneo: cron que corre cada 30 min en días de partido, solo consulta partidos en curso o recién terminados
- Cache agresivo en Supabase para no quemar requests

**Alternativa:** Football-Data.org (también gratis, otra opción de respaldo).

### Hosting: Vercel

- Deploy desde GitHub automático
- Plan Hobby gratis (suficiente para uso personal)
- Cron jobs incluidos en el plan

---

## Flujos clave

### Flujo 1: Usuario predice un partido

```
1. Usuario abre /partidos
2. Server Component consulta partidos próximos desde Supabase
3. Usuario llena formulario de predicción
4. Server Action valida:
   - El partido aún no comienza (kickoff_at > NOW())
   - Goles entre 0 y 20
   - El usuario pertenece a algún grupo
5. INSERT/UPDATE en tabla predictions
6. Toast de confirmación
```

### Flujo 2: Cálculo de puntos al terminar un partido

```
1. Cron job de Vercel corre cada 30 min en días de partido
2. Llama a API-Football pidiendo partidos con status=FT
3. Para cada partido nuevo terminado:
   a. UPDATE matches SET status='finished', goals_local_90=..., goals_visitante_90=...
   b. Trigger en Postgres llama a Edge Function calculate_points(match_id)
   c. Edge Function recorre todas las predictions de ese partido
   d. Aplica matriz de puntuación según phase
   e. UPDATE predictions SET points_earned=...
4. Realtime notifica al frontend → tabla de posiciones se refresca
```

### Flujo 3: Crear/unirse a un grupo

```
Crear:
1. Usuario presiona "Crear grupo"
2. Server Action genera invite_code aleatorio (6 chars)
3. INSERT groups + INSERT group_members con rol=admin

Unirse:
1. Usuario ingresa código en /unirme
2. Server Action busca el grupo por invite_code
3. Si existe: INSERT group_members
4. Redirige a /grupo/[id]
```

---

## Decisiones de diseño importantes

### ¿Por qué web app y no app nativa?

- Cero costo de publicación (vs USD 99/año Apple + USD 25 Google)
- Cero tiempo de revisión de stores
- Actualizaciones instantáneas
- Stores rechazan apps de "gambling" sin licencia, aunque solo sean de puntos
- Una PWA bien hecha se siente nativa

### ¿Por qué no manejar dinero?

- Coljuegos en Colombia regula juegos de azar; manejar dinero requiere licencia
- App stores rechazan apps de apuestas sin certificación
- Reduce drásticamente la complejidad técnica (sin pasarela, sin KYC, sin retiros)
- El dinero entre conocidos se maneja mejor por canales que ya usan (Nequi, etc.)

### ¿Por qué Supabase y no Firebase?

- PostgreSQL > Firestore para datos relacionales (que es exactamente nuestro caso: usuarios, grupos, partidos, predicciones, todos relacionados)
- Row Level Security permite hacer la seguridad a nivel de DB, no de app
- SQL es más fácil de razonar que reglas de Firestore
- Plan gratis más generoso

### ¿Por qué Edge Functions y no triggers de DB para calcular puntos?

- Las funciones en Postgres son posibles pero menos flexibles
- Edge Functions permiten logging, retry logic, y consultar APIs externas si hace falta
- Más fácil de testear

---

## Seguridad

### Autenticación
- Supabase Auth con OAuth Google (recomendado) + Email/Password como fallback
- Tokens JWT manejados automáticamente por `@supabase/ssr`

### Autorización
- **Row Level Security activado en TODAS las tablas sensibles**
- Política clave: las predicciones solo son visibles después del pitazo inicial
- Esto previene que alguien espíe predicciones de otros antes del partido

### Validación
- Toda mutación pasa por Server Actions (no API routes públicas)
- Validación con Zod tanto en cliente como servidor
- CHECK constraints en la DB (goles 0-20, equipos diferentes, etc.)

---

## Performance

### Estrategias

- **Server Components:** la mayoría del contenido es server-rendered, JS mínimo en cliente
- **Caching:** datos de partidos cacheados en Vercel CDN, invalidación con `revalidatePath`
- **Realtime selectivo:** solo se conecta WebSocket en la página de tabla de posiciones
- **Imágenes:** Next/Image con optimización automática para banderas y avatares

### Métricas objetivo

- Lighthouse > 90 en mobile
- LCP < 2s
- TTI < 3s
- Soporte completo offline para ver predicciones ya hechas

---

## Costos estimados

| Servicio | Plan | Costo mensual |
|---|---|---|
| Vercel | Hobby | USD 0 |
| Supabase | Free | USD 0 |
| API-Football | Gratis (100 req/día) | USD 0 |
| Dominio (.co o .com) | — | ~USD 1-2/mes prorrateado |
| **Total** | | **< USD 2/mes** |

Si crece más allá del free tier:
- Supabase Pro: USD 25/mes
- API-Football Pro: USD 19/mes

---

## Próximos pasos técnicos

1. ✅ Schema SQL diseñado
2. 🔜 Edge Function de cálculo de puntos
3. 🔜 Seed con equipos del Mundial 2026
4. 🔜 Bootstrap del proyecto Next.js
5. 🔜 Auth + grupos
6. 🔜 Pantalla de predicciones
7. 🔜 Tabla de posiciones con Realtime
8. 🔜 PWA (manifest + service worker)
9. 🔜 Notificaciones push
10. 🔜 Deploy a producción
