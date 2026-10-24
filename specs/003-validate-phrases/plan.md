# Implementation Plan: Validación de frases integrada

**Branch**: `main` (rama Git actual; sin crear rama) | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: `specs/003-validate-phrases/spec.md`

**Feature ID**: `003-validate-phrases`. El campo BRANCH de setup-plan identifica el contexto de Spec Kit, no una rama Git creada.

**Estado**: Implementada. Registro retrospectivo al 2026-10-23 por instrucción del usuario; sin cambios de aplicación.

## Summary

Plan retrospectivo de la validación existente: reglas locales, comprobación remota sin creación, resultado sin confirmación o con advertencia, recuperación ante errores e invalidación del resultado al editar. El alcance termina en habilitar la acción posterior de [F004](../004-create-phrases/spec.md); no modifica la aplicación.

Flujo existente: `PhraseForm → usePhraseForm → useValidatePhrase → phraseService → phrasesMappers / phraseData → httpClient`. Zod y React Hook Form validan y recortan el texto; TanStack Query conserva el resultado temporal. La presentación interpreta `requiresConfirmation` y el tipo de coincidencia; no calcula similitud ni invalida el listado al comprobar.

## Technical Context

**Language/Version**: TypeScript ~6.0.3, React ^19.3.1; rangos declarados en package.json.

**Primary Dependencies**: Vite ^8.3.4, React Hook Form ^7.90.0, @hookform/resolvers ^6.0.0, Zod ^4.6.7, TanStack React Query ^5.104.5, Axios ^1.20.0 y Tailwind CSS ^4.3.3. Sin nuevas dependencias.

**Storage**: Texto y resultado de mutación en memoria del frontend. La API puede conservar una comprobación temporal; no se infiere su tecnología de persistencia. Validar no crea una frase.

**Testing**: Vitest ^5.0.5, jsdom, Testing Library y MSW ya configurados; `pnpm test`, archivos `*.spec.ts` y `*.spec.tsx` junto al código. La descripción de AGENTS.md sin runner corresponde al scaffold anterior.

**Target Platform**: Navegador, SPA en ruta `/`, interfaz en español; no se verifica idioma automáticamente.

**Project Type**: Frontend React + TypeScript + Vite en apps/frontend.

**Performance Goals**: Sin objetivo de latencia ni carga medido. Un intento en curso por formulario mediante bloqueo de interfaz y referencia síncrona; no implica idempotencia entre intentos manuales.

**Constraints**: Hasta 280 puntos de código después de trim, al menos 3 letras, sin emojis ni controles (misma regla que el backend). Sin reintentos automáticos, umbrales locales, cuenta regresiva ni comprobación local del vencimiento. Integración requiere base URL y CORS compatibles.

**Scale/Scope**: Un formulario, cuatro historias y diez requisitos. Creación corresponde a F004 y listado a F002. Sin cambios de backend, autenticación, edición de frases guardadas ni procesamiento masivo.

## Constitution Check

Evaluación previa a Phase 0 y posterior a Phase 1:

| Principio / restricción | Evidencia de la entrega | Antes | Después |
| --- | --- | --- | --- |
| I. Screaming Architecture | Se documentan módulos existentes bajo features/phrases y utilidades compartidas. | PASS | PASS |
| II. Clear Responsibilities | Esquema, coordinación, mutación, adaptación y transporte separados. | PASS | PASS |
| III. Simplicity | Solo artefactos documentales; sin dependencias ni abstracciones nuevas. | PASS | PASS |
| IV. Consistent TypeScript and React | Se conservan tipos, hooks y componentes actuales sin modificar código. | PASS | PASS |
| V. Verified Behavior | Quickstart define comprobaciones y distingue pruebas automatizadas de validación manual real. | PASS | PASS |
| Tecnología y workflow | React, TypeScript, Vite y pnpm existentes; sin cambios visuales ni output versionado. | PASS | PASS |

Estos gates evalúan el diseño documental; no certifican por sí solos pruebas ejecutadas, integración real ni rendimiento. No se introducen excepciones a la constitución.

## Project Structure

### Documentation (this feature)

```text
specs/003-validate-phrases/
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

`tasks.md` pertenece a la fase posterior y no se genera con este comando.

### Source Code (frontend root)

```text
src/
├── features/phrases/
│   ├── pages/phrases/phrases.page.tsx
│   ├── components/phrase-form/
│   │   ├── phrase-form.component.tsx
│   │   ├── phrase-form.schema.ts
│   │   ├── use-phrase-form.hook.ts
│   │   └── *.spec.tsx
│   ├── components/phrase-form-feedback/
│   ├── components/phrase-validation-feedback/
│   ├── hooks/validate-phrase.hook.ts
│   ├── hooks/validate-phrase.hook.spec.tsx
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

**Structure Decision**: Mantener los módulos de la capacidad phrases, sus pruebas colocadas junto al código y el cliente HTTP compartido. No mover ni crear código fuente.

## Phase 0 — Research

[research.md](research.md) consolida decisiones verificadas en código y pruebas locales. No quedan aclaraciones de diseño pendientes. Disponibilidad y configuración de la API son prerrequisitos operativos.

## Phase 1 — Design & Contracts

- [data-model.md](data-model.md): entidades y estados de validación.
- [contracts/http-contract.md](contracts/http-contract.md): contrato consumido de comprobación.
- [contracts/ui-contract.md](contracts/ui-contract.md): estados visibles y trazabilidad FR-001–FR-010.
- [quickstart.md](quickstart.md): comandos, escenarios y límites de verificación.

La revisión posterior conserva todos los gates en PASS; el diseño reproduce el comportamiento existente y delimita la creación en F004.

## Complexity Tracking

Sin violaciones que justificar ni complejidad adicional introducida.

## Registro de implementación existente

Checks basados en inspección del código actual. La trazabilidad detallada está en [contrato UI](contracts/ui-contract.md); los resultados de ejecución y sus límites, en [quickstart.md](quickstart.md).

- [x] FR-001: Validar mediante botón o Enter sin crear ni invalidar el listado (`phrase-form.component.tsx`, `use-phrase-form.hook.ts`, `validate-phrase.hook.ts`).
- [x] FR-002: Reglas locales, error asociado y foco al enviar una entrada inválida (`phrase-form.schema.ts`, `phrase-form.component.tsx`, React Hook Form).
- [x] FR-003: Texto recortado para comprobar y contador de hasta 280 puntos de código (`phrase-form.schema.ts`, `phrase-form.component.tsx`).
- [x] FR-004: Éxito sin confirmación, candidata oculta y Guardar habilitado (`phrase-validation-feedback.component.tsx`, `phrase-form.component.tsx`).
- [x] FR-005: Advertencias exacta y semántica, porcentaje redondeado solo para semántica y Guardar de todos modos (`phrase-validation-feedback.component.tsx`, `phrase-form.component.tsx`).
- [x] FR-006: Estado Validando, aria-busy, campo readOnly y bloqueo de operaciones simultáneas (`phrase-form.component.tsx`, `use-phrase-form.hook.ts`).
- [x] FR-007: Texto conservado ante fallos, detalle o mensaje genérico y reintento manual sin retry automático (`use-phrase-form.hook.ts`, `validate-phrase.hook.ts`, `get-error-message.ts`).
- [x] FR-008: Toda edición descarta resultado y mensajes anteriores (`phrase-form.component.tsx`, registro onChange).
- [x] FR-009: Una nueva comprobación limpia resultado y error y bloquea Guardar mientras espera (`use-phrase-form.hook.ts`, `phrase-form.component.tsx`).
- [x] FR-010: Referencia, vencimiento y confirmación conservados para F004; etiqueta según resultado (`phrases.mapper.ts`, `use-phrase-form.hook.ts`, `phrase-form.component.tsx`).
- [x] Phase 0 y Phase 1 registradas: research, modelo, contratos HTTP/UI y quickstart existentes revisados.
- [x] Hooks before_plan y after_plan comprobados: no existe `.specify/extensions.yml`; sin hooks que ejecutar.
- [ ] Verificación manual end-to-end contra API real. Pendiente; no impide registrar la implementación existente.
