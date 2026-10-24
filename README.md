# Semantic Phrase App — Frontend

Frontend de **Semantic Phrase App**: una herramienta colaborativa para gestionar frases cortas. Antes de guardar una frase nueva, el sistema la valida contra las ya existentes (coincidencia textual exacta o semántica/vectorial) y muestra si hay una posible coincidencia; el usuario decide si guarda igual, edita o cancela. La lista de frases guardadas es compartida (paginada) y cualquier persona puede eliminar una frase.

## Stack técnico

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router v7
- TanStack React Query v5
- React Hook Form + Zod (`@hookform/resolvers`)
- Axios
- Vitest + React Testing Library + MSW (tests)

## Requisitos previos

- Node **22.12.0** (versión validada del proyecto)
- pnpm (vs. npm/yarn: instalación más rápida y `node_modules` estricto, sin dependencias fantasma; mismo gestor que usa el backend)
- Backend accesible en la URL que se configure en `.env`

## Cómo levantar el proyecto

1. Ubicarse en `apps/frontend`.
2. Instalar dependencias:
   ```bash
   pnpm install
   ```
3. Copiar `.env.example` a `.env` y configurar `VITE_API_BASE_URL`:
   ```bash
   cp .env.example .env
   ```
   Valor local esperado: `http://localhost:3000/api`.
4. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
   Por defecto abre en `http://localhost:5173`.

Si cambias `.env`, reinicia `pnpm dev` para que Vite recargue las variables.

Para probar el build de producción:

```bash
pnpm build
pnpm preview
```

## Variables de entorno

| Variable            | Descripción                                                          | Valor local                    |
| ------------------- | -------------------------------------------------------------------- | ------------------------------ |
| `VITE_API_BASE_URL` | Base URL usada por el cliente HTTP (`src/shared/api/http-client.ts`) | `http://localhost:3000/api/v1` |

## Scripts disponibles

| Script         | Descripción                                 |
| -------------- | ------------------------------------------- |
| `pnpm dev`     | Levanta el servidor de desarrollo (Vite)    |
| `pnpm build`   | Type-check (`tsc -b`) + build de producción |
| `pnpm lint`    | Corre ESLint sobre el proyecto              |
| `pnpm test`    | Corre la suite de tests con Vitest          |
| `pnpm preview` | Sirve el build de producción localmente     |

## Estructura del proyecto

```
src/
├── app/                     # router + composición raíz
├── providers/               # QueryClientProvider (TanStack Query)
├── features/
│   └── phrases/             # único feature: pages/components/hooks/services/data/dto/mappers/interfaces/utils
└── shared/                  # cliente HTTP, UI genérica, iconos, utils cross-cutting
```

Arquitectura por capas dentro de cada feature: `pages` (composición) → `components` (presentación) → `hooks` (estado/flujo) → `services` (lógica de app) → `data` (HTTP) → `dto`/`mappers` (traducción del contrato de API). Más detalle de convenciones en `AGENTS.md`.

## Pruebas

Validado con Node 22.12.0. Se usa jsdom 26 para mantener la compatibilidad con esta versión de Node.

Ejecuta `pnpm test` para correr toda la suite con Vitest, React Testing Library y MSW (mocks de HTTP). Los tests viven junto al archivo que cubren, con el nombre `<archivo>.spec.ts(x)`. No requieren un backend activo.

Para revisar tipos, lint y compilación, ejecuta también `pnpm lint` y `pnpm build`.

## Lint y estilo de código

ESLint (flat config) con reglas de TypeScript, React Hooks y React Refresh. No hay Prettier configurado; el estilo se mantiene manualmente: 2 espacios de indentación, comillas simples, sin punto y coma, y nombres de archivo en kebab-case con sufijo de responsabilidad (`.page.tsx`, `.component.tsx`, `.hook.ts`, `.service.ts`, etc.). Detalle completo en `AGENTS.md`.

**Limitación conocida:** el backend sí usa Prettier (`pnpm run format`); aquí no, por lo que el formato depende de la disciplina manual descrita arriba. No hay un motivo documentado para la asimetría entre ambas apps.

## Conexión con el backend

Las llamadas HTTP usan el cliente compartido `src/shared/api/http-client.ts` (Axios, `baseURL` desde `VITE_API_BASE_URL`). Endpoints consumidos:

- `POST /v1/phrases` — crear/guardar una frase
- `GET /v1/phrases?page=&limit=` — listar frases (paginado)
- `POST /v1/phrase-validations` — validar una frase contra las existentes
- `DELETE /v1/phrases/:id` — eliminar una frase
