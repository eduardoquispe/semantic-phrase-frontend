# Implementation Plan: Listado de frases guardadas

**Branch**: `main` (rama Git actual; sin crear rama) | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: `specs/002-list-phrases/spec.md`

**Feature ID**: `002-list-phrases`. El campo BRANCH devuelto por setup-plan es el identificador de contexto de Spec Kit; no acredita una rama Git con ese nombre.

## Summary

Documentación retrospectiva del listado implementado en `/`: colección compartida, páginas de 20 frases, fecha local, contador global y actualización después de guardar conservando página. La spec existente se conserva; no se modifica código ni se añaden funcionalidades.

El recorrido es `PhraseList → usePhrasesList → phraseService.list → phraseData.list → httpClient`. Los mappers convierten fechas y TanStack Query administra caché por página. Se registran las limitaciones actuales de carga, error, vacío y singular.

## Technical Context

**Language/Version**: TypeScript ~6.0.3 y React ^19.3.1, rangos declarados en package.json.

**Primary Dependencies**: Vite ^8.3.4, TanStack React Query ^5.104.5, Axios ^1.20.0, React Router DOM ^7.18.4 y Tailwind CSS ^4.3.3. Sin cambios de dependencias.

**Storage**: Persistencia delegada a API externa; caché en memoria de QueryClient. No se verifica el almacenamiento del backend ni hay persistencia local del listado.

**Testing**: Vitest ^5.0.5, jsdom, Testing Library y MSW; pruebas `*.spec.ts`/`*.spec.tsx` junto al código; `pnpm test`. Son recursos existentes aunque AGENTS.md todavía describe un estado sin runner.

**Target Platform**: Navegador; validación manual prevista a 320 y 1280 px con teclado.

**Project Type**: SPA React + Vite en apps/frontend.

**Performance Goals**: Sin objetivo de latencia medido. Consultas de 20 elementos y lista con máximo de 360 px y scroll interno; no constituyen garantía de rendimiento.

**Constraints**: Orden y metadatos recibidos; fechas locales; sin mensajes de carga/error, búsqueda, eliminación ni tamaño configurable. API y CORS compatibles con el origen del navegador.

**Scale/Scope**: Una ruta, colección compartida y cuatro historias. Casos de 0, 1, 20, 21 y 45 registros. Sin instantánea garantizada frente a cambios concurrentes.

## Constitution Check

Gates evaluados antes de Phase 0 y después de Phase 1:

| Principio / restricción | Evidencia | Antes | Después |
| --- | --- | --- | --- |
| I. Screaming Architecture | Feature phrases posee componentes, hooks, servicio, interfaces, DTO y mappers; transporte y botón son compartidos. | PASS | PASS |
| II. Clear Responsibilities | Presentación, consulta, transformación y transporte separados en módulos existentes. | PASS | PASS |
| III. Simplicity | Solo documentación; ninguna dependencia ni abstracción nueva. | PASS | PASS |
| IV. Consistent TypeScript and React | Se describen tipos y hooks existentes; no se modifica código ni se extienden sus inconsistencias de formato. | PASS | PASS |
| V. Verified Behavior | Quickstart define comandos y escenarios, distinguiendo inspección, pruebas y revisión manual. | PASS | PASS |
| Tecnología y workflow | React, TypeScript, Vite y pnpm existentes; sin cambio visual, lockfile ni output generado. | PASS | PASS |

Los gates documentales no certifican por sí mismos los escenarios de navegador. No se introducen violaciones a la constitución.

## Project Structure

### Documentation (this feature)

```text
specs/002-list-phrases/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── http-contract.md
    └── ui-contract.md
```

`tasks.md` corresponde a una fase posterior; no se genera en este trabajo.

### Source Code (frontend root)

```text
src/
├── app/app.router.tsx
├── providers/query.provider.tsx
├── features/phrases/
│   ├── pages/phrases/
│   ├── components/phrase-list/
│   ├── components/phrase-list-item/
│   ├── components/phrase-pagination/
│   ├── hooks/phrases-list.hook.ts
│   ├── hooks/save-phrase.hook.ts
│   ├── interfaces/phrase.interfaces.ts
│   ├── services/phrases.service.ts
│   ├── data/phrases.data.ts
│   ├── data/phrases.dto.ts
│   └── mappers/phrases.mapper.ts
├── shared/api/http-client.ts
└── test/test-setup.ts
```

**Structure Decision**: Conservar organización por capacidad de negocio y pruebas junto al módulo. No crear ni mover código fuente.

## Phase 0 — Research

[research.md](research.md) resuelve decisiones con código, configuración y pruebas locales. No quedan aclaraciones de diseño pendientes. La disponibilidad y el prefijo del backend son prerrequisitos de ejecución, incluida la discrepancia de .env.example.

## Phase 1 — Design & Contracts

- [data-model.md](data-model.md): entidades, validaciones observadas y estados.
- [contracts/http-contract.md](contracts/http-contract.md): interfaz consumida de la API.
- [contracts/ui-contract.md](contracts/ui-contract.md): comportamiento visible y trazabilidad FR/US.
- [quickstart.md](quickstart.md): preparación, comandos y escenarios de validación.

## Complexity Tracking

Sin excepciones a la constitución ni complejidad adicional.
