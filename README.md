# ⚽ El Parche Mundialista

> La polla del Mundial 2026 para vivir cada partido con tu parche y tus colegas.

Web app para crear pollas privadas (quinielas) entre amigos y compañeros de trabajo durante la **Copa Mundial de la FIFA 2026**. Predice marcadores, suma puntos y compite por el ranking del grupo.

---

## ✨ Características

- 🔐 Grupos privados con código de invitación (separa "amigos" de "trabajo")
- ⚽ Predicciones por partido con cierre automático al pitazo inicial
- 🏆 Predicciones especiales (campeón, goleador, mejor jugador)
- 📊 Tabla de posiciones en tiempo real con criterios de desempate
- 🔔 Recordatorios antes de cada partido
- 📱 Funciona como PWA (instalable en celular sin pasar por stores)
- 💸 **Sin manejo de dinero** dentro de la app (cada grupo lo administra por fuera)

---

## 🛠 Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend / DB / Auth | Supabase (PostgreSQL) |
| Datos del torneo | API-Football |
| Hosting | Vercel |
| Notificaciones | Web Push API + Supabase Realtime |

---

## 🚀 Cómo correr el proyecto

### Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- API key de [API-Football](https://www.api-football.com/) (plan gratis basta)

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/[tu-usuario]/el-parche-mundialista.git
cd el-parche-mundialista/web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves de Supabase y API-Football

# 4. Correr el esquema en Supabase
# Ir a Supabase → SQL Editor → pegar y ejecutar /supabase/schema.sql

# 5. Cargar datos seed (equipos y fixture)
# Ejecutar /supabase/seed.sql

# 6. Levantar el proyecto
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y listo. ⚡

---

## 📁 Estructura del proyecto

```
el-parche-mundialista/
├── docs/                      # Documentación completa
│   ├── reglamento.md          # Reglas oficiales de la polla
│   ├── arquitectura.md        # Stack y decisiones técnicas
│   └── decisiones.md          # ADRs (decisiones de arquitectura)
├── supabase/
│   ├── schema.sql             # Esquema de base de datos
│   ├── seed.sql               # Equipos y fixture (TBD)
│   └── functions/             # Edge Functions de cálculo de puntos
├── web/                       # App Next.js
│   ├── app/                   # Rutas de la app
│   ├── components/            # Componentes UI
│   └── lib/                   # Helpers y clientes
└── .env.example
```

---

## 📋 Reglamento

Ver el reglamento completo en [`docs/reglamento.md`](./docs/reglamento.md).

**Resumen de puntuación:**
- Marcador exacto: 5 pts (grupos) hasta 10 pts (final)
- Diferencia + ganador: 3 pts hasta 6 pts
- Solo ganador: 1 pt hasta 2 pts
- Bonus "quién pasa de fase" en eliminatorias: +2 pts
- Predicciones especiales: hasta 75 pts bonus

---

## 🗺 Roadmap

- [x] Definición de reglamento
- [x] Esquema de base de datos
- [ ] Función de cálculo de puntos (Edge Function)
- [ ] Auth + creación de grupos
- [ ] Pantalla de predicciones
- [ ] Tabla de posiciones
- [ ] Notificaciones push
- [ ] Pulir UI y deploy a producción
- [ ] **Fecha objetivo: 10 de junio 2026** (un día antes del primer partido)

---

## 🤝 Contribuciones

Proyecto personal. Si eres parte del parche y quieres aportar, escríbeme.

---

## 📄 Licencia

MIT — úsalo, modifícalo, comparte. Solo no me culpes si tu equipo pierde 🤷‍♂️

---

## ⚠️ Disclaimer legal

Esta app es para entretenimiento entre grupos privados. **No procesa dinero**, no es un sitio de apuestas y no requiere licencia de Coljuegos. La administración del dinero (si aplica entre los participantes) es responsabilidad de cada grupo y se maneja por fuera de la plataforma.
