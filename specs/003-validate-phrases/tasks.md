# Tasks: Validación de frases integrada

**Input**: Documentos de `specs/003-validate-phrases/`: spec.md, plan.md, research.md, data-model.md y contracts/.

**Contexto**: Registro retrospectivo del flujo existente al 2026-10-24, generado por convergencia contra el código actual (no existía `tasks.md` para esta feature). Las casillas `[x]` indican implementación comprobada mediante inspección del código; no acreditan ejecución manual con backend real. No se modifica la aplicación ni se proponen funcionalidades nuevas.

**Organización**: Tareas agrupadas por historia. Rutas relativas a `apps/frontend`. `[P]` identifica trabajo en archivos distintos que podría realizarse en paralelo una vez satisfechas sus dependencias; no describe el orden histórico de implementación.

**Pruebas**: Se referencia la cobertura existente como evidencia, sin generar tareas de pruebas nuevas. Los escenarios manuales están descritos en `specs/003-validate-phrases/quickstart.md`.

## Phase 1: Setup — Infraestructura compartida

**Propósito**: Disponer de las dependencias usadas por el formulario de validación.

- [x] T001 Disponer de React Hook Form, Zod, zodResolver, TanStack Query y Axios en `package.json`, con versiones resueltas en `pnpm-lock.yaml`.
- [x] T002 [P] Configurar el cliente Axios con `VITE_API_BASE_URL` en `src/shared/api/http-client.ts`.
- [x] T003 [P] Proveer QueryClient y desactivar reintentos automáticos de mutaciones en `src/providers/query.provider.tsx`.

## Phase 2: Foundational — Contratos y acceso a datos de la comprobación

**Propósito**: Compartir los tipos y la capa de acceso requeridos por la validación.

- [x] T004 Definir solicitud y respuesta de comprobación, incluyendo `validationId`, `expiresAt`, `requiresConfirmation` y `match`, en `src/features/phrases/interfaces/phrase-validation.interfaces.ts` y `src/features/phrases/dto/phrase.dto.ts`; representar los tipos de coincidencia (`textual_exact` / `vector`) en `src/features/phrases/interfaces/phrase-match-type.enum.ts`.
- [x] T005 Implementar el POST de comprobación a `/v1/phrase-validations` en `src/features/phrases/data/phrases.data.ts`.
- [x] T006 Adaptar la respuesta de comprobación en `src/features/phrases/mappers/phrases.mapper.ts` y exponer `validate` mediante `src/features/phrases/services/phrases.service.ts`.

**Checkpoint**: Contratos y transporte de comprobación listos para el formulario.

## Phase 3: User Story 1 — Comprobar una frase antes de guardarla (Priority: P1) — MVP

**Objetivo**: Comprobar el texto mediante una acción explícita sin crear ni actualizar el listado.

**Prueba independiente**: Escribir «  Hola mundo  », pulsar «Validar» o Enter y comprobar que se envía «Hola mundo» con contador «10 / 280», sin crear frase ni tocar el listado; un resultado exitoso sin confirmación muestra «Frase validada» y habilita «Guardar» para una acción posterior.

- [x] T007 [P] [US1] Normalizar mediante trim la entrada aceptada por el resolver en `src/features/phrases/components/phrase-form/phrase-form.schema.ts`.
- [x] T008 [P] [US1] Exponer la comprobación remota como mutación sin reintentos automáticos (`retry: false`) en `src/features/phrases/hooks/validate-phrase.hook.ts`.
- [x] T009 [US1] Disparar `validate.mutateAsync` en el submit/Enter sin invocar guardado, en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.
- [x] T010 [US1] Presentar campo, contador recortado («10 / 280») y submit de validación en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.
- [x] T011 [US1] Mostrar «Frase validada» y el mensaje sin coincidencia tras una comprobación sin confirmación en `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.component.tsx`.
- [x] T012 [US1] Habilitar «Guardar» solo cuando exista un resultado de comprobación vigente en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.

**Evidencia existente**: `src/features/phrases/components/phrase-form/phrase-form.spec.tsx`, `src/features/phrases/hooks/validate-phrase.hook.spec.tsx`.

## Phase 4: User Story 2 — Corregir una entrada inválida (Priority: P1)

**Objetivo**: Impedir la comprobación externa de entradas inválidas e informar el error junto al campo.

**Prueba independiente**: Probar entrada vacía, sin letras, de 281 caracteres y con caracteres prohibidos; comprobar que ninguna solicita la comprobación externa y que 1 carácter o 280 válidos sí se admiten.

- [x] T013 [US2] Rechazar vacío, falta de letras, más de 280 puntos de código y caracteres no permitidos (incluyendo tabulaciones y saltos de línea antes de trim) en `src/features/phrases/components/phrase-form/phrase-form.schema.ts`.
- [x] T014 [US2] Asociar el error de campo mediante `htmlFor`, `aria-describedby`, `aria-invalid` y devolver el foco al campo al enviar una entrada inválida en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.
- [x] T015 [US2] Actualizar la validez del campo mientras se escribe y recuperar la ayuda inicial al quedar válido, mediante el modo de validación de React Hook Form en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.

**Evidencia existente**: `src/features/phrases/components/phrase-form/phrase-form.spec.tsx`.

## Phase 5: User Story 3 — Comprender una coincidencia (Priority: P1)

**Objetivo**: Distinguir coincidencia textual exacta de semántica y mostrar la frase existente sin guardar automáticamente.

**Prueba independiente**: Obtener un resultado que requiere confirmación con coincidencia exacta (sin porcentaje) y otro semántico de 0,914 (91 %); comprobar el aviso «todavía no se guardó» y la disponibilidad de «Guardar de todos modos» sin crear una frase.

- [x] T016 [US3] Distinguir coincidencia textual exacta («Coincidencia textual exacta», sin porcentaje) de semántica («Posible coincidencia semántica», porcentaje redondeado al entero más cercano) en `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.component.tsx`.
- [x] T017 [US3] Mostrar el aviso «Se requiere tu confirmación antes de guardar. La frase todavía no se guardó.» y admitir ausencia de candidata cuando `requiresConfirmation` es verdadero, en `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.component.tsx` y `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.constants.ts`.
- [x] T018 [US3] Ocultar candidata y porcentaje, y mostrar el resultado de US1 cuando `requiresConfirmation` es falso aunque exista coincidencia, en `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.component.tsx`.

**Evidencia existente**: `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.spec.tsx`.

## Phase 6: User Story 4 — Reintentar y descartar resultados anteriores (Priority: P2)

**Objetivo**: Conservar el texto ante fallos, impedir operaciones simultáneas y descartar resultados obsoletos.

**Prueba independiente**: Mantener una comprobación en curso e intentar editar, repetir clics o pulsar Enter sin iniciar otra operación; simular un fallo y comprobar que se conserva el texto y se permite reintento manual; editar una frase ya validada (incluso restaurando el texto original) y comprobar que «Guardar» vuelve a deshabilitarse.

- [x] T019 [P] [US4] Bloquear edición y ambas acciones, y mostrar «Validando…» mientras la mutación está pendiente, mediante `isBusy`/`inFlight` en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts` y `aria-busy`/estados deshabilitados en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.
- [x] T020 [P] [US4] Conservar el texto y mostrar el detalle del servidor o el mensaje genérico definido en Edge Cases ante un fallo de comprobación, en `src/features/phrases/components/phrase-form-feedback/phrase-form-feedback.component.tsx` y `src/shared/utils/get-error-message.ts`.
- [x] T021 [US4] Descartar el resultado o error anterior y mantener «Guardar» deshabilitado al editar el campo, incluso si se restaura el texto original, en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.
- [x] T022 [US4] Limpiar el resultado o error anterior al iniciar una nueva comprobación válida en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.
- [x] T023 [US4] Conservar `validationId`, vencimiento y necesidad de confirmación del resultado vigente para la acción posterior de guardado en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.

**Evidencia existente**: `src/features/phrases/components/phrase-form/phrase-form.spec.tsx`, `src/features/phrases/components/phrase-form-feedback/phrase-form-feedback.spec.tsx`, `src/features/phrases/hooks/validate-phrase.hook.spec.tsx`.

## Phase 7: Polish — Aspectos transversales existentes

**Propósito**: Registrar accesibilidad y documentación del comportamiento observado.

- [x] T024 Asociar etiqueta, ayuda y error al campo mediante `htmlFor`, `aria-describedby`, `aria-invalid` y `role="alert"`/`role="status"` según corresponda en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.
- [x] T025 [P] Documentar contratos consumidos y trazabilidad de requisitos en `specs/003-validate-phrases/contracts/http-contract.md` y `specs/003-validate-phrases/contracts/ui-contract.md`.
- [x] T026 [P] Documentar comandos, escenarios manuales y límites de la evidencia en `specs/003-validate-phrases/quickstart.md`.

## Dependencies & Execution Order

```text
Setup (T001–T003)
  → Foundational (T004–T006)
    → US1 (T007–T012, MVP)
      → US2 (T013–T015)
      → US3 (T016–T018)
        → US4 (T019–T023)
          → Polish (T024–T026, una vez completas todas las historias)
```

- Contratos antes de transporte; transporte antes de servicio; mutación antes de formulario y feedback.
- US2, US3 y US4 amplían el flujo de US1, aunque sus escenarios pueden verificarse por separado. Todas modifican archivos compartidos del formulario (`phrase-form.component.tsx`, `use-phrase-form.hook.ts`): requieren coordinación y ejecución secuencial de cambios en esos archivos.
- Las dependencias representan una reconstrucción lógica; todas las tareas de implementación ya están completadas.

## Parallel Opportunities & Examples

- **Setup**: T002 y T003 pueden resolverse en paralelo tras disponer de dependencias.
- **US1**: T007 (esquema) y T008 (mutación de comprobación) pueden realizarse en paralelo tras Foundational; T009–T010 los integran.
- **US2**: T013 (reglas del esquema) y T014 (asociación de error) pueden realizarse en paralelo.
- **US3**: No hay tareas independientes paralelizables; T016 → T017 → T018 comparten el mismo componente de feedback.
- **US4**: T019 (bloqueo de concurrencia) y T020 (mensaje de error) pueden realizarse en paralelo; T021–T023 coordinan cambios compartidos en `use-phrase-form.hook.ts`.
- **Polish**: T025 y T026 pueden documentarse en paralelo después de contrastar las historias.

## Implementation Strategy

1. **MVP**: Setup + Foundational + US1, con comprobación explícita y resultado sin confirmación visible.
2. **Incremento de validación de entrada**: US2, con reglas de campo y errores inline.
3. **Incremento de comprensión de coincidencias**: US3, distinguiendo coincidencia textual y semántica.
4. **Incremento de recuperación**: US4, con bloqueo de concurrencia, conservación de texto e invalidación de resultados obsoletos.
5. **Cierre**: Accesibilidad y documentación transversal. La verificación manual con backend real permanece descrita en quickstart y no se marca como ejecutada por estas casillas.

## Resumen de estado

26 tareas completadas por evidencia de implementación: Setup 3, Foundational 3, US1 6, US2 3, US3 3, US4 5 y Polish 3. Todas incluyen checkbox, ID secuencial y rutas concretas; las fases de historias incluyen su etiqueta `[USn]`. Generado por convergencia (`speckit-converge`) el 2026-10-24: esta feature no tenía `tasks.md` previo, pese a estar implementada y descrita en `spec.md`.
