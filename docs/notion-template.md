# 🏆 El Parche Mundialista — Workspace Notion

> Plantilla para copiar y pegar en tu Notion. Cada sección es una página o subpágina sugerida.

---

## 📋 Página principal: El Parche Mundialista

**Tagline:** La polla del Mundial 2026 para vivir cada partido con el parche.

**Status:** 🟡 En desarrollo
**Inicio del torneo:** 11 de junio 2026
**Fecha objetivo de lanzamiento:** 5 de junio 2026

### Quick Links
- 🔗 GitHub: [pendiente crear]
- 🌐 URL producción: [pendiente]
- 🎨 Figma / Diseños: [pendiente]
- 📊 Dashboard Supabase: [pendiente]

---

## 📁 Estructura sugerida del workspace

```
🏆 El Parche Mundialista
│
├── 📖 1. Visión y Alcance
├── 📋 2. Reglamento de la Polla
├── 🛠 3. Stack Técnico y Arquitectura
├── 💾 4. Base de Datos
├── 🗺 5. Roadmap
├── 📝 6. Decisiones Técnicas (ADRs)
├── 🎯 7. Sprints / Tareas
├── 🐛 8. Bugs y Mejoras
├── 📚 9. Recursos y Referencias
└── 💡 10. Ideas para v2
```

---

## 📖 1. Visión y Alcance

### Objetivo
Crear una plataforma web para que grupos de amigos y compañeros de trabajo organicen pollas privadas durante el Mundial 2026, sin necesidad de manejar dinero dentro de la app.

### Usuarios objetivo
- **Primario:** Mi parche de amigos (~15-20 personas)
- **Secundario:** Mis compañeros de trabajo (~30-50 personas)
- **Eventual:** Otros grupos que quieran usarla

### Qué SÍ hace la app
- ✅ Crear grupos privados con código de invitación
- ✅ Registrar predicciones de marcador por partido
- ✅ Hacer predicciones especiales (campeón, goleador)
- ✅ Calcular puntos automáticamente
- ✅ Mostrar tabla de posiciones en tiempo real
- ✅ Notificar antes de cada partido

### Qué NO hace la app
- ❌ Procesar pagos o manejar dinero
- ❌ Apuestas con casas externas
- ❌ Pollas con desconocidos (todo es por invitación)
- ❌ Streaming de partidos

### Métricas de éxito
- 50+ usuarios activos durante el Mundial
- 80%+ de usuarios predicen al menos 50 partidos
- 0 bugs críticos durante la final
- Que los participantes pidan repetir en la próxima Copa América

---

## 📋 2. Reglamento de la Polla

> Copiar el contenido completo de `docs/reglamento.md` aquí, o adjuntarlo como subpágina.

**Resumen rápido:**
- Marcador exacto: 5-10 pts según fase
- Diferencia + ganador: 3-6 pts
- Solo ganador: 1-2 pts
- Bonus "quién pasa de fase": +2 pts en eliminatorias
- Predicciones especiales (campeón, goleador, etc.): hasta 75 pts
- Total máximo teórico: ~703 pts

---

## 🛠 3. Stack Técnico y Arquitectura

### Stack
| Capa | Tecnología | Costo |
|---|---|---|
| Frontend | Next.js 14 + Tailwind | $0 |
| Backend/DB | Supabase | $0 (free tier) |
| Datos fútbol | API-Football | $0 (100 req/día) |
| Hosting | Vercel | $0 (Hobby) |
| Dominio | .co o .com | ~$15/año |

**Costo total mensual estimado:** < USD 2

### Diagrama
[Pegar diagrama de `docs/arquitectura.md` o hacer uno con Excalidraw embed]

---

## 💾 4. Base de Datos

### Tablas principales
| Tabla | Filas estimadas | Para qué |
|---|---|---|
| `teams` | 48 | Selecciones del Mundial |
| `players` | ~1,500 | Jugadores convocados |
| `matches` | 104 | Partidos del torneo |
| `profiles` | 50-200 | Usuarios de la app |
| `groups` | 5-20 | Grupos privados |
| `group_members` | 100-500 | Membresías |
| `predictions` | 5,000-20,000 | Predicciones por partido |
| `special_predictions` | = profiles | Predicciones especiales por usuario |

### Esquema completo
[Adjuntar `schema.sql` como archivo o subpágina con el contenido]

### Notas importantes
- Row Level Security está activado en todas las tablas sensibles
- Las predicciones solo son visibles después del pitazo inicial
- Constraint `UNIQUE (user_id, match_id)` en predictions previene duplicados

---

## 🗺 5. Roadmap

### Sprint 1 — Fundación (Semana 1)
- [ ] Crear repo en GitHub
- [ ] Bootstrap de proyecto Next.js
- [ ] Crear proyecto en Supabase
- [ ] Correr schema.sql
- [ ] Configurar deploy a Vercel
- [ ] Cargar seed de equipos y fixture

### Sprint 2 — Auth y Grupos (Semana 2)
- [ ] Login con Google (Supabase Auth)
- [ ] Creación de perfil al primer login
- [ ] Crear grupo (genera código de invitación)
- [ ] Unirse a grupo por código
- [ ] Listar mis grupos

### Sprint 3 — Predicciones (Semana 3)
- [ ] Pantalla de partidos próximos
- [ ] Formulario de predicción
- [ ] Validación de fecha de cierre
- [ ] Ver mis predicciones
- [ ] Pantalla de predicciones especiales

### Sprint 4 — Cálculo y Posiciones (Semana 4)
- [ ] Edge Function de cálculo de puntos
- [ ] Cron job que sincroniza con API-Football
- [ ] Tabla de posiciones por grupo
- [ ] Detalle de puntos por partido
- [ ] Realtime para actualización automática

### Sprint 5 — Pulido y Lanzamiento (Semana 5)
- [ ] PWA (manifest + service worker)
- [ ] Notificaciones push
- [ ] Onboarding para nuevos usuarios
- [ ] Tests con grupo piloto
- [ ] Deploy final a producción
- [ ] Compartir con amigos y oficina

### Hito final: 5 de junio 2026
**Buffer:** 6 días antes del primer partido para resolver bugs.

---

## 📝 6. Decisiones Técnicas (ADRs)

> Copiar contenido de `docs/decisiones.md` o adjuntarlo.

**Decisiones clave:**
1. Web App (PWA) en lugar de nativa
2. Sin manejo de dinero
3. Stack Next.js + Supabase + Vercel
4. Multiplicadores suaves (final = 2x grupos)
5. Predicciones especiales bloqueables al inicio
6. Marcador del 90' para puntos, ganador final para "quién pasa"
7. Row Level Security en todas las tablas sensibles
8. API-Football como fuente de datos
9. Validación server-side de cierre de predicciones

---

## 🎯 7. Sprints / Tareas

> Recomendación: usar la base de datos "Tareas" de Notion con vistas:
> - Por sprint
> - Kanban (To Do / In Progress / Done)
> - Por estado de bloqueo

### Plantilla de tarea
- **Título**
- **Sprint**: [1, 2, 3, 4, 5]
- **Estado**: [Backlog, To Do, En progreso, Done]
- **Prioridad**: [Alta, Media, Baja]
- **Estimado**: [horas]
- **Bloqueada por**: [otra tarea]
- **Notas técnicas**: [implementación]

---

## 🐛 8. Bugs y Mejoras

> Base de datos para tracking. Plantilla:
> - **Título**
> - **Tipo**: [Bug, Mejora, Feature request]
> - **Severidad**: [Crítico, Alto, Medio, Bajo]
> - **Reportado por**: [usuario]
> - **Fecha**: [date]
> - **Estado**: [Abierto, En progreso, Resuelto, No reproducible]

---

## 📚 9. Recursos y Referencias

### Documentación oficial
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [API-Football Docs](https://www.api-football.com/documentation-v3)

### Mundial 2026
- [Web oficial FIFA 2026](https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026)
- Fixture oficial: [pendiente publicación]
- Sedes: USA + Canadá + México

### Referencias de UI
- [Linear](https://linear.app) — para inspiración de diseño minimalista
- [SofaScore](https://sofascore.com) — referencia de mostrar fixtures
- [Diseños de pollas existentes en Dribbble](https://dribbble.com/search/world-cup-pool)

### Comunidad técnica
- Discord de Supabase
- Subreddit r/nextjs

---

## 💡 10. Ideas para v2 (Post-Mundial)

> Cosas que NO entran en v1 pero serían chéveres después.

- 🎯 **Multiplicadores de confianza:** asignar 1x/2x/3x a tus predicciones
- 🃏 **Comodines:** 2-3 "doble puntos" por jugador en partidos clave
- 🏅 **Logros y badges:** "Predijo 5 marcadores exactos seguidos", "Acertó al campeón"
- 💬 **Chat por grupo:** trash-talk amigable
- 📈 **Estadísticas avanzadas:** % de aciertos por equipo, racha máxima
- 🎨 **Personalización del grupo:** logo, colores, banner
- 🌎 **Soporte multi-torneo:** Copa América, Champions, Eurocopa
- 💸 **Pasarela de pagos OPCIONAL** (con licencia legal):
  - Solo si se quiere pivotar a producto serio
  - Requiere licencia Coljuegos
  - Otro proyecto, no v2 directo
- 📱 **App nativa:** si la PWA se queda corta en notificaciones iOS

---

## ✅ Checklist de configuración inicial del workspace

Cuando importes a Notion:

- [ ] Crear página principal "El Parche Mundialista"
- [ ] Crear las 10 subpáginas listadas arriba
- [ ] Configurar databases: Tareas, Bugs, Decisiones
- [ ] Conectar el repo de GitHub vía la integración de Notion
- [ ] Compartir el workspace solo con quien colabore (privado)
- [ ] Configurar plantilla de "ADR" en la base de Decisiones
- [ ] Hacer la primera revisión del roadmap

---

¡Buena polla, parcero! 🇨🇴⚽
