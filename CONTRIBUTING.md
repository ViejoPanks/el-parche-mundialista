# 🤝 Guía de Contribución — El Parche Mundialista

¡Gracias por tu interés en contribuir! Este documento explica las convenciones del proyecto.

## 🌳 Estrategia de branches

- `main` — rama de producción. **Nunca push directo.** Solo merges desde PRs.
- `develop` — rama de desarrollo continuo (opcional, si trabajamos varios)
- `feat/<nombre>` — para nuevas funcionalidades
- `fix/<nombre>` — para corrección de bugs
- `docs/<nombre>` — para cambios solo de documentación
- `chore/<nombre>` — tareas de mantenimiento

**Ejemplos:**
```
feat/auth-google
fix/cierre-predicciones-zona-horaria
docs/readme-instalacion
chore/upgrade-nextjs
```

## 📝 Convención de commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/) en español:

```
<tipo>(<alcance opcional>): <descripción corta>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat` — nueva funcionalidad
- `fix` — corrección de bug
- `docs` — solo documentación
- `style` — formato (no afecta lógica)
- `refactor` — refactorización sin cambio de comportamiento
- `perf` — mejora de performance
- `test` — agregar o ajustar tests
- `chore` — tareas de mantenimiento, dependencias

**Ejemplos:**
```
feat(auth): agregar login con Google
fix(predicciones): corregir cierre en zona horaria de Bogotá
docs(readme): actualizar pasos de instalación
refactor(db): simplificar query de tabla de posiciones
```

## 🔀 Pull Requests

1. **Antes de empezar:** revisa que no haya un PR abierto del mismo tema
2. **Crea tu branch desde `main`:** `git checkout -b feat/mi-feature`
3. **Haz commits pequeños y descriptivos**
4. **Asegúrate que pase el CI** (lint + typecheck)
5. **Abre el PR** usando la plantilla
6. **Espera revisión** y responde comentarios

## ✅ Antes de hacer push

```bash
# Lint
npm run lint

# Typecheck
npm run typecheck

# Build de prueba
npm run build
```

## 🐛 Reportar bugs

Usa la plantilla de issues `bug_report.md`. Incluye:
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Navegador/dispositivo

## 💡 Proponer mejoras

Usa la plantilla de issues `feature_request.md`. Explica:
- Qué problema resuelve
- Solución propuesta
- Alternativas consideradas

## 📐 Estilo de código

- **TypeScript estricto** (no `any` salvo casos justificados)
- **Tailwind** para todos los estilos (no CSS modules salvo excepción)
- **Server Components por defecto**, Client Components solo cuando sea necesario
- **Validación con Zod** en toda mutación
- **Comentarios en español** (es un proyecto colombiano 🇨🇴)

## 🧪 Tests

Todavía sin suite formal. Por ahora, smoke tests manuales antes de merge.

---

¿Dudas? Abre un issue o escribe en el grupo del proyecto.
