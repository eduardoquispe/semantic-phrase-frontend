# Implementation Plan: F001 — Interfaz Principal y Listado de Frases

**Branch**: `main` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-main-phrase-list/spec.md`; solicitud de planificación con `speckit-plan`, `screaming-architecture`, lógica sencilla y separación entre shared UI y componentes de la feature. La spec conserva su estado Draft; este plan no declara su aprobación ni implementa código.

## Summary

Sustituir el starter por la ruta `/` con cabecera, introducción, formulario vacío y tres frases ilustrativas. Conservar la composición aprobada, retirar advertencia precargada, galería y pie de maqueta y añadir el paginador simple autorizado. Los controles no consultan servicios, modifican las muestras ni anuncian resultados de negocio.

Una página del feature `phrases` compone piezas presentacionales y controles nativos estilizados. El paginador solo necesita dos condiciones de presentación. No se requieren hooks propios, servicios, API ni providers de datos.

## Technical Context

**Language/Version**: TypeScript `~6.0.3`, React y React DOM `^19.3.1`, según package.json actual.

**Primary Dependencies**: Vite `^8.3.4`, React Router DOM `^7.18.4`, Tailwind CSS y `@tailwindcss/vite` `^4.3.3`, pnpm. Ya declarados; falta activar Tailwind en Vite/CSS. Axios, Query, RHF y Zod están declarados pero no se utilizan en F001.

**Storage**: Ninguno; muestras locales readonly, sin localStorage ni seeds.

**Testing**: Lint, build y revisión manual de [quickstart.md](quickstart.md). Vitest, Testing Library y MSW están declarados pero no hay script ni configuración de pruebas. No añadir infraestructura automática para esta entrega visual.

**Target Platform**: Navegador web móvil y escritorio; español, teclado y controles HTML accesibles.

**Project Type**: SPA en `apps/frontend`; una ruta y una feature.

**Performance Goals**: Renderizar sin esperar backend y sin solicitudes de negocio. Sin objetivo de latencia remota para una entrega sin integración.

**Constraints**: Máximo 1440 px; dos columnas desde 1024 px, acciones en fila desde 640 px, controles de al menos 44 px, lista con máximo 360 px y scroll propio. DM Sans 400–700 y respaldo sans-serif. Tailwind compilado, sin CDN, SCSS ni UI kit. Sin nuevas dependencias.

**Scale/Scope**: Tres muestras, formulario inicial y cuatro estados visuales de paginación; sin navegación funcional ni registro, validación o eliminación.

## Constitution Check

Resultado previo a Phase 0: **PASS**, aplicando expresamente las convenciones solicitadas. Resultado posterior a Phase 1: **PASS**, con las mismas decisiones.

| Gate | Antes de investigación | Después del diseño |
| --- | --- | --- |
| I. Screaming Architecture | Un feature phrases; páginas propias | Formulario, listado, filas, paginador y muestras dentro de phrases |
| II. Responsabilidades | Separar composición y presentación | Página compone, componentes reciben props, shared no importa features/app |
| III. Simplicidad | Solo capacidades de F001 | Dos condiciones para paginación; sin capas, estado remoto o abstracciones especulativas |
| IV. Convenciones | Resolver discrepancia de nombres explícitamente | B03-D13 solicitado: kebab-case y sufijos; símbolos PascalCase, dos espacios, comillas simples, sin punto y coma |
| V. Verificación | Definir checks de implementación | Quickstart cubre US1–US4, lint/build y capturas; no se afirman checks de código ejecutados |
| Tecnología y entrega | React/TypeScript/Vite/pnpm | Frontend actual; sin dependencias nuevas; lockfile si cambia alguna; capturas en PR |

La petición explícita de seguir `screaming-architecture` resuelve para este trabajo la discrepancia con los archivos PascalCase de AGENTS.md: se aplica kebab-case con sufijos B03-D13. No se modifica AGENTS.md, la constitución ni el estado de aprobación de la spec.

Button e Input son las primitivas transversales previstas expresamente por B03-D11 y la separación shared UI solicitada por el usuario. Esta decisión no autoriza extraer contenido de frases a shared. El paginador no tiene consumo transversal demostrado y permanece en la feature, conforme al principio de shared mínimo.

## Project Structure

### Documentation (this feature)

```text
specs/001-main-phrase-list/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/ui-contract.md
└── quickstart.md
```

`tasks.md` corresponde a speckit-tasks y no se genera en este comando.

### Source Code (frontend project root)

```text
src/
├── main.tsx
├── index.css
├── app/
│   ├── app.component.tsx
│   └── app.router.tsx
├── features/phrases/
│   ├── pages/phrases/
│   │   ├── index.ts
│   │   └── phrases.page.tsx
│   └── components/
│       ├── phrase-form/
│       │   ├── index.ts
│       │   └── phrase-form.component.tsx
│       ├── phrase-list/
│       │   ├── index.ts
│       │   ├── phrase-list.component.tsx
│       │   ├── phrase-list.types.ts
│       │   └── phrase-list.examples.ts
│       ├── phrase-list-item/
│       │   ├── index.ts
│       │   ├── phrase-list-item.component.tsx
│       │   └── phrase-list-item.types.ts
│       └── phrase-pagination/
│           ├── index.ts
│           ├── phrase-pagination.component.tsx
│           └── phrase-pagination.types.ts
└── shared/components/ui/
    ├── button/
    │   ├── index.ts
    │   └── button.component.tsx
    └── input/
        ├── index.ts
        └── input.component.tsx
```

**Structure Decision**: Conservar main.tsx y StrictMode; importar el root desde app/app.component.tsx y registrar únicamente `/` en app/app.router.tsx. Reemplazar el starter y retirar App.tsx/App.css cuando dejen de usarse. index.html configura idioma y título; vite.config.ts activa Tailwind y index.css contiene su import y los estilos globales. No mover la aplicación a apps/web.

| Unidad | Responsabilidad |
| --- | --- |
| PhrasesPage | Cabecera, introducción, grid y composición; sin componentes extra de layout/marca para un único consumidor |
| PhraseForm | Tarjeta, label, ayuda, input, contador inicial y acciones; textos y semántica propios de frases |
| PhraseList | Tarjeta, total, región desplazable, filas, aviso y paginador inicial |
| PhraseListItem | Texto, time y Eliminar específico; reutilizado para las tres filas |
| PhrasePagination | Props page/totalPages; Atrás si page > 1, Siguiente disabled si page >= totalPages |
| Button | Botón nativo, foco y variantes visuales usadas, sin etiquetas de negocio |
| Input | Input nativo estilizado y atributos HTML, sin label, contador ni reglas de frases |

PhrasesPage importa los ejemplos desde el índice público de phrase-list y los pasa a PhraseList. El tipo de fila reside en phrase-list-item.types.ts, exportado desde su unidad; listado y ejemplos pueden usarlo. No crear un modelo de frase persistida para datos ilustrativos. Tipos triviales pueden permanecer junto al componente; no crear archivos vacíos.

Cada unidad exporta explícitamente por index.ts. App importa la página pública; página importa componentes; componentes importan shared. Los internos importan hermanos directamente. Sin barrel global, aliases nuevos, Card/Badge/Modal, hooks, servicios, schemas, API, DTOs, mappers o carpetas vacías.

## Phase 0 — Research

Completada en [research.md](research.md), usando fuentes locales y revisión delegada de fronteras. Decisiones de alcance, dependencias, naming, separación, muestras, paginación y verificación resueltas. Las discrepancias de integración futura no bloquean F001.

## Phase 1 — Design & Contracts

- [data-model.md](data-model.md): datos mínimos de presentación y límites de estado.
- [contracts/ui-contract.md](contracts/ui-contract.md): ruta, componentes y comportamiento visible.
- [quickstart.md](quickstart.md): escenarios de validación US1–US4.

OpenAPI queda intacto y sin conexión. No hay aclaraciones técnicas pendientes para este alcance.

## Complexity Tracking

Sin violaciones pendientes que requieran excepciones. Naming resuelto por la instrucción explícita del usuario; paginador dentro de la feature para evitar una extracción prematura.
