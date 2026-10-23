# Implementation Plan: Creación de frases integrada

**Branch**: `main` (rama Git actual; sin crear rama) | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: `specs/003-create-phrases/spec.md`

**Feature ID**: `003-create-phrases`. El campo BRANCH de setup-plan es el identificador de contexto de Spec Kit; no acredita una rama Git con ese nombre.

## Summary

Documentación retrospectiva del flujo existente: entrada validada localmente, comprobación remota, decisión explícita de guardado, confirmación cuando la API la exige y actualización del listado. No se modifica código ni se añaden funcionalidades.

`PhraseForm → usePhraseForm → useValidatePhrase / useSavePhrase → phraseService → phraseData → httpClient`. React Hook Form y Zod normalizan la entrada. TanStack Query administra las mutaciones y la invalidación del listado; los mappers adaptan las respuestas. La página seleccionada se conserva al guardar.

## Technical Context

**Language/Version**: TypeScript ~6.0.3 y React ^19.3.1; rangos declarados en package.json.

**Primary Dependencies**: Vite ^8.3.4, React Hook Form ^7.90.0, @hookform/resolvers ^6.0.0, Zod ^4.6.7, TanStack React Query ^5.104.5, Axios ^1.20.0 y Tailwind CSS ^4.3.3. Sin nuevas dependencias.

**Storage**: Persistencia delegada a API externa; formulario, resultados y caché de QueryClient en memoria. No se infiere almacenamiento del backend.

**Testing**: Vitest ^5.0.5, jsdom, Testing Library y MSW existentes; archivos `*.spec.ts`/`*.spec.tsx` junto al código; `pnpm test`. AGENTS.md describe un estado anterior sin runner; se documenta la configuración real.

**Target Platform**: Navegador, ruta `/`, interfaz actual en español.

**Project Type**: SPA React + TypeScript + Vite en apps/frontend.

**Performance Goals**: Sin metas medidas de latencia o concurrencia. Bloqueo local de operaciones simultáneas, sin garantía de idempotencia entre intentos manuales.

**Constraints**: 1–280 puntos de código tras trim, al menos una letra y caracteres permitidos por Zod. Comprobación previa; confirmación definida por API; sin control local de vencimiento ni reintentos automáticos de mutación. Base URL y CORS compatibles con API real.

**Scale/Scope**: Un formulario integrado con listado compartido de páginas de 20; tres historias existentes. Sin cambios del backend, algoritmos de similitud, autenticación ni nuevas operaciones.

## Constitution Check

Gates evaluados antes de Phase 0 y después de Phase 1:

| Principio / restricción | Evidencia | Antes | Después |
| --- | --- | --- | --- |
| I. Screaming Architecture | Componentes, hooks, interfaces, servicio, DTO y mappers pertenecen a features/phrases. | PASS | PASS |
| II. Clear Responsibilities | Esquema de entrada, coordinación, mutaciones y transporte en módulos separados existentes. | PASS | PASS |
| III. Simplicity | Solo documentación; sin nuevas dependencias ni abstracciones. | PASS | PASS |
| IV. Consistent TypeScript and React | Tipos y hooks existentes; no se modifica código ni se extienden sus diferencias de formato. | PASS | PASS |
| V. Verified Behavior | Quickstart distingue inspección, comandos y escenarios manuales pendientes. | PASS | PASS |
| Tecnología y workflow | React, TypeScript, Vite y pnpm; sin cambio visual, lockfile ni output versionado. | PASS | PASS |

Los gates de esta entrega documental no certifican por sí solos integración real ni ejecución manual.

## Project Structure

### Documentation (this feature)

```text
specs/003-create-phrases/
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

`tasks.md` corresponde a una fase posterior y no se genera aquí.

### Source Code (frontend root)

```text
src/
├── features/phrases/
│   ├── pages/phrases/phrases.page.tsx
│   ├── components/phrase-form/
│   │   ├── phrase-form.component.tsx
│   │   ├── phrase-form.schema.ts
│   │   └── use-phrase-form.hook.ts
│   ├── components/phrase-form-feedback/
│   ├── components/phrase-validation-feedback/
│   ├── components/phrase-list/
│   ├── hooks/save-phrase.hook.ts
│   ├── hooks/validate-phrase.hook.ts
│   ├── hooks/phrases-list.hook.ts
│   ├── services/phrases.service.ts
│   ├── data/phrases.data.ts
│   ├── data/phrases.dto.ts
│   ├── interfaces/phrase.interfaces.ts
│   ├── interfaces/phrase-match-type.enum.ts
│   └── mappers/phrases.mapper.ts
├── shared/api/http-client.ts
├── shared/utils/get-error-message.ts
├── shared/interfaces/problem-details.interface.ts
├── providers/query.provider.tsx
└── test/test-setup.ts
```

**Structure Decision**: Conservar organización por capacidad de negocio y pruebas junto al módulo; no crear ni mover código fuente.

## Phase 0 — Research

[research.md](research.md) resuelve decisiones con código, configuración y pruebas locales. No quedan aclaraciones de diseño pendientes; disponibilidad y prefijo del backend son prerrequisitos de ejecución.

## Phase 1 — Design & Contracts

- [data-model.md](data-model.md): entidades, reglas y transiciones existentes.
- [contracts/http-contract.md](contracts/http-contract.md): interfaz consumida de comprobación y creación.
- [contracts/ui-contract.md](contracts/ui-contract.md): comportamiento visible y trazabilidad de requisitos.
- [quickstart.md](quickstart.md): comandos y escenarios de verificación.

## Complexity Tracking

Sin excepciones introducidas a la constitución ni complejidad adicional.
