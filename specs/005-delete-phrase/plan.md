# Implementation Plan: Eliminar frase con confirmación

**Branch**: `main` (rama Git actual; sin crear rama) | **Date**: 2026-10-23 | **Spec**: [spec.md](spec.md)

**Input**: `specs/005-delete-phrase/spec.md`

**Feature ID**: `005-delete-phrase`. El campo BRANCH de setup-plan es el identificador de contexto de Spec Kit; no acredita una rama Git con ese nombre.

## Summary

Añadir la acción de eliminar frase al listado compartido existente, con confirmación previa obligatoria, bloqueo de solicitudes duplicadas por frase, y manejo distinguible de fallo interno frente a frase ya inexistente. No se introduce selección múltiple, restauración ni paginación nueva; se reutiliza el DELETE `/v1/phrases/{id}` ya definido en el contrato OpenAPI.

Flujo: `PhraseListItem → useDeletePhrase → phraseService.remove → phraseData.remove → httpClient`. El hook administra localmente el paso de confirmación (idle → confirming → pending → éxito/error/no-encontrada) y, al terminar con éxito o con "ya no existe", invalida la consulta `['phrases']` para que `PhraseList` refresque el total y el listado visible.

## Technical Context

**Language/Version**: TypeScript ~6.0.3 y React ^19.3.1; rangos declarados en package.json.

**Primary Dependencies**: TanStack React Query ^5.104.5 (useMutation + invalidateQueries), Axios ^1.20.0, Tailwind CSS ^4.3.3. Sin dependencias nuevas; `Button` ya define `variant="delete"` sin consumidor.

**Storage**: Persistencia delegada a la API externa (soft delete documentado en OpenAPI); sin estado persistente en el cliente más allá de la caché de QueryClient.

**Testing**: Vitest ^5.0.5, jsdom, Testing Library y MSW existentes; archivos `*.spec.ts`/`*.spec.tsx` junto al código; `pnpm test`.

**Target Platform**: Navegador, misma página `/`; sin ruta ni pantalla nueva.

**Project Type**: SPA React + TypeScript + Vite en apps/frontend; extensión de la feature `phrases` existente.

**Performance Goals**: Sin metas medidas de latencia o concurrencia. Bloqueo local por frase mientras su solicitud de eliminación está en curso (FR-005), sin garantía de idempotencia entre reintentos manuales.

**Constraints**: DELETE `/v1/phrases/{id}` responde 204 sin cuerpo en éxito, 404 `PHRASE_NOT_FOUND` si la frase no existe o ya fue eliminada, 400 y 500 para el resto. `ApiErrorCode` no declara aún `PHRASE_NOT_FOUND`; se añade para distinguir ese caso de un error genérico sin inspeccionar el status HTTP en el componente. La eliminación es lógica e irreversible desde la UI; no se ofrece restaurar (FR-009). Sin modelo de permisos nuevo (FR-010).

**Scale/Scope**: Una acción por fila del listado existente (hasta 20 por página); tres historias de usuario. Sin cambios de paginación, de la consulta de listado ni del formulario de creación.

## Constitution Check

Gates evaluados antes de Phase 0 y después de Phase 1:

| Principio / restricción | Evidencia planificada | Antes | Después |
| --- | --- | --- | --- |
| I. Screaming Architecture | Hook, servicio, dato y DTO nuevos bajo `features/phrases`; nada compartido salvo el error de API ya compartido. | PASS | PASS |
| II. Clear Responsibilities | `PhraseListItem` solo presenta y delega confirmación/estado a `useDeletePhrase`; `phraseService`/`phraseData` aíslan el transporte. | PASS | PASS |
| III. Simplicity | Reutiliza `Button variant="delete"`, `FeedbackMessage` y el patrón hook-con-estado de `usePhraseForm`; sin diálogo modal ni librería nueva. | PASS | PASS |
| IV. Consistent TypeScript and React | Tipos explícitos para el nuevo método `remove`, componentes función y hooks con prefijo `use`. | PASS | PASS |
| V. Verified Behavior | `pnpm lint` y `pnpm build` tras implementar; escenarios manuales documentados en quickstart.md. | PASS (gate; pendiente de ejecución) | Pendiente tras implementar |
| Tecnología y workflow | React, TypeScript, Vite y pnpm; sin dependencia nueva ni output versionado. | PASS | PASS |

Sin violaciones que requieran justificación; no se completa Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-delete-phrase/
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

`tasks.md` corresponde a `$speckit-tasks` y no se genera aquí.

### Source Code (frontend root)

```text
src/
├── features/phrases/
│   ├── components/phrase-list-item/
│   │   ├── phrase-list-item.component.tsx   # modificado: acción eliminar + confirmación inline
│   │   └── phrase-list-item.types.ts
│   ├── hooks/
│   │   └── delete-phrase.hook.ts            # nuevo: estado de confirmación + useMutation
│   ├── services/phrases.service.ts          # modificado: añade remove(id)
│   ├── data/phrases.data.ts                 # modificado: añade remove(id) vía DELETE
│   ├── dto/phrase.dto.ts                    # sin cambios de forma; DELETE no tiene cuerpo
│   └── interfaces/phrase.interfaces.ts      # sin cambios de forma
├── shared/interfaces/problem-details.interface.ts  # modificado: añade PHRASE_NOT_FOUND
└── shared/utils/api-error.util.ts                   # modificado: helper para distinguir 404 lógico
```

**Structure Decision**: Extender la feature `phrases` existente sin nuevas carpetas de nivel superior ni página separada; el paso de confirmación vive dentro de `phrase-list-item` como estado inline, consistente con la maqueta de página única (ver Assumptions del spec).

## Phase 0 — Research

[research.md](research.md) resuelve las decisiones de diseño (ubicación de la confirmación, manejo del 404 lógico, invalidación de caché) con evidencia del código existente. No quedan `NEEDS CLARIFICATION` pendientes.

## Phase 1 — Design & Contracts

- [data-model.md](data-model.md): entidades, estados de la confirmación y reglas derivadas de los requisitos.
- [contracts/http-contract.md](contracts/http-contract.md): interfaz DELETE consumida, cuerpos y errores.
- [contracts/ui-contract.md](contracts/ui-contract.md): comportamiento observable por historia y trazabilidad de requisitos.
- [quickstart.md](quickstart.md): comandos y escenarios manuales de verificación.

## Complexity Tracking

Sin excepciones a la constitución ni complejidad adicional que justificar.
