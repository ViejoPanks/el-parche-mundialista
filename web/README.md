# 🏆 web/ — Frontend de El Parche Mundialista

Aplicación web Next.js 14 (App Router) + Supabase + Tailwind.

## 🚀 Setup local (primera vez)

### 1. Instalar dependencias

```bash
cd web
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con las credenciales de **parche-dev**:

- Ve a [Supabase Dashboard](https://supabase.com/dashboard) → `parche-dev` → Settings → API
- Copia el **Project URL** y la **anon key**
- Pégalas en `.env.local`

### 3. Configurar Google OAuth en Supabase

(Solo necesario una vez por proyecto Supabase)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → Credenciales
2. Crea un OAuth 2.0 Client ID:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - Tu URL de producción de Vercel
   - **Authorized redirect URIs:**
     - `https://ydmdzgbyopgnqqfjrniq.supabase.co/auth/v1/callback` (parche-dev)
     - `https://yllrlzbophavwpacnyut.supabase.co/auth/v1/callback` (parche-prod)
3. En Supabase Dashboard → Authentication → Providers → Google
   - Activa "Enable Sign in with Google"
   - Pega el **Client ID** y **Client Secret**
4. Repetir el paso 3 en parche-prod

### 4. Configurar URLs en Supabase

En cada proyecto Supabase: **Authentication → URL Configuration**

- **Site URL:**
  - parche-dev: `http://localhost:3000`
  - parche-prod: tu URL de Vercel (cuando tengas)
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `https://tu-dominio-vercel.vercel.app/auth/callback`

### 5. Levantar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura

```
web/
├── app/
│   ├── auth/callback/route.ts     # Handler de OAuth
│   ├── login/page.tsx             # Página de login
│   ├── signup/page.tsx            # Página de registro
│   ├── protected/page.tsx         # Dashboard (protegido)
│   ├── layout.tsx                 # Layout raíz
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Estilos Tailwind
├── components/
│   └── auth/
│       ├── login-form.tsx         # Form de login
│       ├── signup-form.tsx        # Form de signup
│       └── logout-button.tsx      # Botón salir
├── lib/
│   └── supabase/
│       ├── client.ts              # Cliente para Client Components
│       ├── server.ts              # Cliente para Server Components
│       └── middleware.ts          # Helper para middleware
├── middleware.ts                  # Refresca sesión + protege rutas
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🛠 Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # ESLint
npm run typecheck  # Verificar tipos sin emitir
```

## 🔐 Flujo de autenticación

1. **Email/Password:**
   - Usuario llena form → `signUp()` → Supabase envía email de confirmación
   - Usuario hace clic en email → `/auth/callback?code=xxx` → `exchangeCodeForSession()`
   - Se crea perfil en `profiles` si no existe
   - Redirige a `/protected`

2. **Google OAuth:**
   - Usuario hace clic en "Google" → `signInWithOAuth({ provider: 'google' })`
   - Google redirige a `/auth/callback?code=xxx`
   - Se intercambia el code por sesión
   - Se crea perfil con datos de Google (avatar incluido)

## 📌 Rutas

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Pública | Landing page |
| `/login` | Pública | Iniciar sesión |
| `/signup` | Pública | Crear cuenta |
| `/auth/callback` | Pública | Callback de OAuth/email |
| `/protected` | 🔒 Protegida | Dashboard del usuario |
| `/grupos/*` | 🔒 Protegida | (próximamente) |
| `/predicciones/*` | 🔒 Protegida | (próximamente) |
| `/perfil/*` | 🔒 Protegida | (próximamente) |

El middleware (`middleware.ts`) bloquea las rutas protegidas si no hay sesión.

## 🐛 Troubleshooting

### "Invalid login credentials"
- Email o contraseña incorrectos
- Si te registraste con Google, no puedes usar email/password con esa cuenta

### "Email not confirmed"
- Revisa spam/promociones de tu email
- En dev, puedes deshabilitar la confirmación: Supabase → Authentication → Settings → "Enable email confirmations" = OFF (solo en dev)

### Google login me devuelve error
- Verifica que `Authorized redirect URIs` en Google Console coincide con la URL de Supabase
- Verifica que `Client ID` y `Client Secret` están bien copiados en Supabase

### Después de login me redirige a /login otra vez
- Probablemente la cookie de sesión no se está guardando
- Verifica que estás usando `https://` en producción (las cookies seguras lo requieren)
