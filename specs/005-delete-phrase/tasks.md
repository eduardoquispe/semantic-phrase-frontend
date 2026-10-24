---

description: "Task list template for feature implementation"
---

# Tasks: Eliminar frase con confirmación

**Input**: Design documents from `/specs/005-delete-phrase/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/http-contract.md, contracts/ui-contract.md, quickstart.md

**Tests**: Not explicitly requested in spec.md; this feature follows the existing repo convention of `*.spec.ts(x)` colocated tests, so test tasks are included per user story to match current coverage patterns (e.g. `phrase-list-item.spec.tsx`, `save-phrase.hook.spec.tsx`).

**Organization**: Tasks are grouped by user story (US1 = eliminar, US2 = cancelar, US3 = reconocer/recuperarse de fallo) per spec.md priorities (US1 P1, US2 P1, US3 P2).

## Path Conventions

Single SPA project rooted at `apps/frontend/src/`. All new/modified files live under `src/features/phrases/` and `src/shared/`.

---

## Phase 1: Setup

No new tooling, dependencies, or project scaffolding required — this feature extends the existing `features/phrases` module using already-installed dependencies (React Query, Axios, Tailwind) and existing patterns (`save-phrase.hook.ts`, `Button variant="delete"`).

- [X] T001 Confirm dev environment runs clean before changes: `pnpm install --frozen-lockfile && pnpm lint && pnpm build && pnpm test` from `apps/frontend`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contract/error plumbing that every user story's hook and component depend on.

**⚠️ CRITICAL**: Phase 3+ cannot start until T002–T005 are complete.

- [X] T002 Add `PHRASE_NOT_FOUND` to the `ApiErrorCode` enum in `src/shared/interfaces/problem-details.interface.ts`
- [X] T003 [P] Add `isPhraseNotFoundError(error: unknown): boolean` helper to `src/shared/utils/api-error.util.ts`, comparing `getProblemDetails(error)?.code === ApiErrorCode.PHRASE_NOT_FOUND` (same pattern as `getFieldErrorMessage`)
- [X] T004 [P] Add `remove: async (id: string): Promise<void>` to `phraseData` in `src/features/phrases/data/phrases.data.ts`, calling `httpClient.delete(\`/v1/phrases/${id}\`)` and discarding the response body
- [X] T005 Add `remove: async (id: string): Promise<void> => phraseData.remove(id)` to `phraseService` in `src/features/phrases/services/phrases.service.ts` (depends on T004)

**Checkpoint**: `remove(id)` is callable end-to-end from `phraseService`; `PHRASE_NOT_FOUND` is distinguishable from generic errors. User stories can now proceed.

---

## Phase 3: User Story 1 - Eliminar una frase de la lista compartida (Priority: P1) 🎯 MVP

**Goal**: Permitir eliminar una frase visible tras confirmación explícita, sin solicitudes duplicadas, actualizando listado y total.

**Independent Test**: Desde el listado, iniciar eliminación de una frase existente, confirmarla y comprobar que desaparece y el total se actualiza (quickstart.md: "Confirmar", "Clics repetidos").

### Tests for User Story 1

- [X] T006 [P] [US1] Write `src/features/phrases/hooks/delete-phrase.hook.spec.tsx`: covers `idle → confirming` on `startDelete()` without calling `remove`, `confirming → pending → (removed from cache)` on `confirm()` calling `phraseService.remove(id)` exactly once, and `queryClient.invalidateQueries(["phrases"])` firing on success — mock `phraseService.remove`, follow the MSW/mock setup in `src/features/phrases/hooks/save-phrase.hook.spec.tsx`
- [X] T007 [P] [US1] Extend `src/features/phrases/components/phrase-list-item/phrase-list-item.spec.tsx`: asserts an "Eliminar" button renders in `idle`, clicking it shows a confirmation with the phrase text and does NOT call any delete function, and clicking "Confirmar" calls `remove` once and disables the row's controls while pending

### Implementation for User Story 1

- [X] T008 [US1] Create `src/features/phrases/hooks/delete-phrase.hook.ts` exporting `useDeletePhrase(phraseId: string)`: local state `"idle" | "confirming" | "pending" | "error" | "not-found"` (default `"idle"`) plus `useMutation({ mutationFn: () => phraseService.remove(phraseId), retry: false })`; expose `status`, `startDelete()` (`idle → confirming`), `confirm()` (`confirming → pending`, triggers mutation), and `cancel()` (`confirming → idle`) — model after `src/features/phrases/hooks/save-phrase.hook.ts`
- [X] T009 [US1] In `useDeletePhrase` (`delete-phrase.hook.ts`), wire `onSuccess` to call `queryClient.invalidateQueries({ queryKey: ["phrases"] })` (depends on T008)
- [X] T010 [US1] Guard `confirm()` and `startDelete()` in `useDeletePhrase` so they no-op when `mutation.isPending` is true, preventing duplicate `remove` calls for the same phrase (FR-005) (depends on T008)
- [X] T011 [P] [US1] Add `onDeleted?: never` is not needed; instead extend `PhraseListItemProps` in `src/features/phrases/components/phrase-list-item/phrase-list-item.types.ts` only if new props are required by T012 (verify against final hook API; otherwise skip — `phrase.id` is already available via `phrase`)
- [X] T012 [US1] Update `src/features/phrases/components/phrase-list-item/phrase-list-item.component.tsx`: call `useDeletePhrase(phrase.id)`; render `Button variant="delete"` labeled "Eliminar" in `idle` that calls `startDelete()`; in `confirming`/`pending`, render inline confirmation text `¿Eliminar "{phrase.text}"?` with "Confirmar" and "Cancelar" buttons, disabling both (plus "Eliminar") while `status === "pending"` and showing "Eliminando…" progress text (depends on T008-T010)

**Checkpoint**: User Story 1 fully functional — eliminar + confirmar works end-to-end, duplicate clicks blocked, listado/total refresh on success.

---

## Phase 4: User Story 2 - Cancelar antes de eliminar (Priority: P1)

**Goal**: Permitir cancelar la confirmación sin enviar solicitud ni modificar el listado, y poder reactivar una confirmación nueva e independiente después.

**Independent Test**: Iniciar eliminación, cancelar, comprobar que la frase no cambia y no hubo solicitud; reactivar eliminar muestra una confirmación nueva (quickstart.md: "Cancelar").

### Tests for User Story 2

- [X] T013 [P] [US2] Extend `delete-phrase.hook.spec.tsx` (from T006): asserts `cancel()` from `confirming` returns to `idle` without invoking `phraseService.remove`, and that a subsequent `startDelete()` reaches `confirming` again independently
- [X] T014 [P] [US2] Extend `phrase-list-item.spec.tsx` (from T007): asserts clicking "Cancelar" hides the confirmation, the phrase row is unchanged, no delete call was made, and clicking "Eliminar" again shows a fresh confirmation

### Implementation for User Story 2

- [X] T015 [US2] Verify/finish `cancel()` in `useDeletePhrase` (`delete-phrase.hook.ts`) transitions `confirming → idle` with no mutation call and resets any mutation error state so a later `startDelete()` begins clean (depends on T008, likely already satisfied by T008's state machine — confirm via T013)
- [X] T016 [US2] Verify `PhraseListItem` (`phrase-list-item.component.tsx`) renders the "Cancelar" button during `confirming` wired to `cancel()`, and that returning to `idle` re-renders the plain "Eliminar" button (depends on T012, likely already satisfied — confirm via T014)

**Checkpoint**: Cancel flow verified independently; US1 and US2 both work together without interference.

---

## Phase 5: User Story 3 - Reconocer y recuperarse de un fallo al eliminar (Priority: P2)

**Goal**: Distinguir fallo interno (reintentable, frase intacta) de "frase ya no existe" (no reintentable, frase se retira del listado), con mensajes claros en ambos casos.

**Independent Test**: Confirmar eliminación simulando 500 (frase permanece, error mostrado, reintento disponible) y simulando 404 `PHRASE_NOT_FOUND` (mensaje distinto, frase se retira tras refetch) (quickstart.md: "Fallo interno", "Frase ya no existe").

### Tests for User Story 3

- [X] T017 [P] [US3] Extend `delete-phrase.hook.spec.tsx`: on mutation failure with `code !== "PHRASE_NOT_FOUND"`, status becomes `"error"`, no `invalidateQueries` call, and `startDelete()`/`confirm()` work again on retry; on failure with `code === "PHRASE_NOT_FOUND"`, status becomes `"not-found"` and `invalidateQueries(["phrases"])` IS called
- [X] T018 [P] [US3] Extend `phrase-list-item.spec.tsx`: simulating a generic error shows the error message (from `getErrorMessage`) with the phrase still rendered and "Eliminar" re-enabled; simulating `PHRASE_NOT_FOUND` shows a distinct message (e.g. "Esta frase ya no está disponible.") with no retry control offered

### Implementation for User Story 3

- [X] T019 [US3] In `useDeletePhrase` (`delete-phrase.hook.ts`) `onError` handler: use `isPhraseNotFoundError` (T003) to branch — on `PHRASE_NOT_FOUND` set status `"not-found"` and call `queryClient.invalidateQueries({ queryKey: ["phrases"] })`; otherwise set status `"error"` and do not invalidate (depends on T008, T003, T009)
- [X] T020 [US3] Expose the failure message from `useDeletePhrase` via `getErrorMessage(mutation.error)` (generic case) so the component doesn't import error utils directly for that string (depends on T019)
- [X] T021 [US3] Update `PhraseListItem` (`phrase-list-item.component.tsx`) to render, in `status === "error"`, the message from T020 via `FeedbackMessage variant="error"` plus re-enabled "Eliminar"/"Confirmar"; in `status === "not-found"`, render `FeedbackMessage variant="error"` with the distinct "ya no está disponible" copy and no interactive controls for that row (depends on T012, T019)

**Checkpoint**: All three user stories complete and independently verifiable per quickstart.md.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all stories; no new behavior.

- [X] T022 [P] Run `pnpm lint` and `pnpm build` from `apps/frontend` and fix any type/lint issues surfaced by the new `PHRASE_NOT_FOUND` enum member, `remove` methods, or `useDeletePhrase` hook
- [X] T023 Run `pnpm test` from `apps/frontend` and confirm all new/updated specs (T006, T007, T013, T014, T017, T018) pass alongside existing suite
- [ ] T024 Execute the manual walkthroughs in `specs/005-delete-phrase/quickstart.md` (confirmar, clics repetidos, cancelar, fallo interno, frase ya no existe, último elemento de la página, sin restaurar, sin modelo de permisos) and record results per "Evidencia y alcance"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (hook in every story calls `phraseService.remove`, which depends on T002–T005).
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Foundational; builds on the same hook/component as US1 (T008, T012) but adds no new production code beyond what US1 already requires — verification-heavy phase.
- **User Story 3 (Phase 5)**: Depends on Foundational (specifically T002, T003); extends the hook/component from US1 (T008, T012) with the error/not-found branches.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1**: Foundational only.
- **US2**: Foundational + reuses US1's `useDeletePhrase`/`PhraseListItem` (cancel path is part of the same state machine built in T008/T012); sequence after US1 to avoid rework, though logically independent per spec.
- **US3**: Foundational + reuses US1's hook/component (error/not-found branches extend the same files); sequence after US1 for the same reason.

### Within Each User Story

- Tests before implementation (write T006/T007, T013/T014, T017/T018 first; confirm they fail before the corresponding implementation tasks).
- Hook state machine before component wiring.
- Story complete and checkpoint-verified before moving to the next.

### Parallel Opportunities

- T003 and T004 (Phase 2) touch different files and can run in parallel after T002.
- T006 and T007 (US1 tests) touch different files and can run in parallel.
- T013 and T014 (US2 tests) touch different files and can run in parallel.
- T017 and T018 (US3 tests) touch different files and can run in parallel.
- T022 can run alongside T023 preparation, though both ultimately gate on the same codebase state.

---

## Parallel Example: User Story 1

```bash
# Launch both US1 test files together:
Task: "Write delete-phrase.hook.spec.tsx covering idle/confirming/pending/success transitions"
Task: "Extend phrase-list-item.spec.tsx with Eliminar/Confirmar interaction assertions"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002–T005) — CRITICAL, blocks all stories.
3. Complete Phase 3: User Story 1 (T006–T012).
4. **STOP and VALIDATE**: Run quickstart.md's "Confirmar" and "Clics repetidos" walkthroughs.
5. This alone satisfies SC-001, SC-003 for the happy path.

### Incremental Delivery

1. Setup + Foundational → remove(id) callable, PHRASE_NOT_FOUND distinguishable.
2. Add US1 (T006–T012) → eliminar + confirmar works → validate independently (MVP).
3. Add US2 (T013–T016) → cancelar verified → validate independently.
4. Add US3 (T017–T021) → error/not-found handling → validate independently.
5. Polish (T022–T024) → lint/build/test/manual evidence.

### Notes

- US2 and US3 do not add new files; they extend `delete-phrase.hook.ts` and `phrase-list-item.component.tsx` created in US1. Tasks are still listed per-story for traceability to FR-003/FR-007/FR-008, per plan.md's hook design (single state machine, not three separate hooks).
- No modal library, no optimistic cache updates, no new pagination logic — per research.md decisions.
- `PhraseListItemProps` (T011) is expected to need no new props since `phrase.id`/`phrase.text` are already passed in; the task exists to confirm this assumption during implementation rather than to predict a change.
