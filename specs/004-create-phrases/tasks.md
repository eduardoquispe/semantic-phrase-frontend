# Tasks: Creación de frases integrada

**Input**: Documentos de `specs/003-create-phrases/`: spec.md, plan.md, research.md, data-model.md y contracts/.

**Contexto**: Registro retrospectivo del flujo existente al 2026-10-23, solicitado para la feature 03. Las casillas `[x]` indican implementación comprobada mediante inspección del código; no acreditan ejecución manual con backend real. No se modifica la aplicación ni se proponen funcionalidades nuevas.

**Organización**: Tareas agrupadas por historia. Rutas relativas a `apps/frontend`. `[P]` identifica trabajo en archivos distintos que podría realizarse en paralelo una vez satisfechas sus dependencias; no describe el orden histórico de implementación.

**Pruebas**: Se referencia la cobertura existente como evidencia, sin generar tareas de pruebas nuevas. Los escenarios manuales y los límites de cobertura están descritos en `specs/003-create-phrases/quickstart.md`.

## Phase 1: Setup — Infraestructura compartida

**Propósito**: Disponer de las dependencias y proveedores utilizados por el formulario.

- [x] T001 Disponer de React Hook Form, Zod, zodResolver, TanStack Query y Axios en `package.json`, con versiones resueltas en `pnpm-lock.yaml`.
- [x] T002 [P] Configurar el cliente Axios con `VITE_API_BASE_URL` en `src/shared/api/http-client.ts`.
- [x] T003 [P] Proveer QueryClient y desactivar reintentos automáticos de mutaciones en `src/providers/query.provider.tsx`.

## Phase 2: Foundational — Contratos y acceso a datos

**Propósito**: Compartir los tipos y las capas de acceso requeridos por las historias.

- [x] T004 Definir solicitudes y respuestas de comprobación y creación, incluyendo `validationId`, `expiresAt`, `requiresConfirmation`, `match` y `confirmed`, en `src/features/phrases/interfaces/phrase.interfaces.ts` y `src/features/phrases/data/phrases.dto.ts`; representar los tipos de coincidencia en `src/features/phrases/interfaces/phrase-match-type.enum.ts`.
- [x] T005 Implementar POST de comprobación a `/v1/phrase-validations` y POST de creación a `/v1/phrases` en `src/features/phrases/data/phrases.data.ts`.
- [x] T006 Adaptar comprobaciones y fechas de frases guardadas en `src/features/phrases/mappers/phrases.mapper.ts` y exponer `validate` y `save` mediante `src/features/phrases/services/phrases.service.ts`.

**Checkpoint**: Contratos y transporte existentes, listos para las mutaciones del formulario.

## Phase 3: User Story 1 — Validar y guardar una frase (Priority: P1) — MVP

**Objetivo**: Comprobar el texto y guardarlo mediante una acción explícita, actualizando el listado.

**Prueba independiente**: Escribir «  Hola mundo  », validar mediante botón o Enter y comprobar que solo se envía la comprobación con «Hola mundo» y contador `10 / 280`. Tras un resultado sin confirmación, guardar; observar aviso de éxito, campo vacío y actualización del total en la misma página del listado si la consulta responde correctamente.

- [x] T007 [P] [US1] Normalizar mediante trim la entrada aceptada por el resolver en `src/features/phrases/components/phrase-form/phrase-form.schema.ts`.
- [x] T008 [P] [US1] Exponer la comprobación remota como mutación sin reintentos automáticos en `src/features/phrases/hooks/validate-phrase.hook.ts`.
- [x] T009 [P] [US1] Exponer la creación e invalidar las consultas con prefijo `['phrases']` únicamente tras éxito, devolviendo la promesa de invalidación, en `src/features/phrases/hooks/save-phrase.hook.ts`.
- [x] T010 [US1] Separar `onSubmit` y `onSave`, exigir comprobación previa, enviar texto normalizado con `validationId` y limpiar campo y comprobación tras éxito en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.
- [x] T011 [US1] Presentar campo, contador recortado, submit de validación y botón de guardado independiente deshabilitado sin comprobación en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.
- [x] T012 [US1] Mostrar «Frase validada» tras una comprobación sin confirmación en `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.component.tsx` y «Frase guardada» tras creación en `src/features/phrases/components/phrase-form-feedback/phrase-form-feedback.component.tsx`.
- [x] T013 [US1] Integrar formulario y listado en `src/features/phrases/pages/phrases/phrases.page.tsx`, manteniendo la página seleccionada en estado local y mostrando contenido y total de la consulta actualizada en `src/features/phrases/components/phrase-list/phrase-list.component.tsx`.

**Evidencia existente**: `src/features/phrases/components/phrase-form/phrase-form.spec.tsx`, `src/features/phrases/hooks/save-phrase.hook.spec.tsx` y `src/features/phrases/hooks/validate-phrase.hook.spec.tsx`. La ejecución manual de página seleccionada se describe en quickstart.

## Phase 4: User Story 2 — Decidir ante una coincidencia (Priority: P1)

**Objetivo**: Mostrar la coincidencia y permitir confirmar expresamente el guardado cuando lo exige la API.

**Prueba independiente**: Obtener una coincidencia exacta y una semántica con confirmación. Comprobar candidata, ausencia de porcentaje en exacta y redondeo `0.914 → 91 %` en semántica. No debe haber creación hasta activar «Guardar de todos modos», que envía `confirmed: true`. Con candidata y sin confirmación, mostrar «Frase validada» sin candidata.

- [x] T014 [US2] Distinguir coincidencia textual y semántica, mostrar candidata y aviso de que todavía no se guardó, y redondear el porcentaje solo para coincidencia semántica en `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.component.tsx`.
- [x] T015 [US2] Gobernar el resultado visible por `requiresConfirmation`, ocultando la candidata cuando es falso y admitiendo coincidencia nula cuando es verdadero, en `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.component.tsx`.
- [x] T016 [US2] Cambiar la acción a «Guardar de todos modos» según `requiresConfirmation` en `src/features/phrases/components/phrase-form/phrase-form.component.tsx` y añadir `confirmed: true` solo en ese caso en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.

**Evidencia existente**: `src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.spec.tsx` y `src/features/phrases/components/phrase-form/phrase-form.spec.tsx`.

## Phase 5: User Story 3 — Corregir o recuperar un intento (Priority: P2)

**Objetivo**: Conservar el borrador ante errores, descartar comprobaciones anteriores e impedir operaciones simultáneas.

**Prueba independiente**: Editar una frase validada y restaurarla; guardar debe seguir deshabilitado. Rechazar entradas inválidas sin POST remoto. Simular por separado error de comprobación y creación: conservar texto, mostrar error y permitir una nueva validación; el fallo de creación descarta la comprobación y no invalida el listado. Con cada operación pendiente, intentar editar, repetir clics y pulsar Enter sin iniciar otra operación.

- [x] T017 [P] [US3] Rechazar vacío, falta de letras, más de 280 puntos de código y caracteres no permitidos, incluyendo tabulaciones y saltos de línea antes de trim, en `src/features/phrases/components/phrase-form/phrase-form.schema.ts`.
- [x] T018 [P] [US3] Extraer `detail` no vacío de errores Axios o usar el mensaje genérico en `src/shared/utils/get-error-message.ts`, con contrato de error en `src/shared/interfaces/problem-details.interface.ts`.
- [x] T019 [US3] Reiniciar ambas mutaciones al editar y descartar resultados previos al iniciar otra comprobación en `src/features/phrases/components/phrase-form/phrase-form.component.tsx` y `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.
- [x] T020 [US3] Conservar texto ante fallos y descartar siempre la comprobación al finalizar un intento de guardado para exigir validación nueva en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`.
- [x] T021 [US3] Impedir operaciones simultáneas mediante `isBusy` e `inFlight` en `src/features/phrases/components/phrase-form/use-phrase-form.hook.ts`; aplicar `readOnly`, botones deshabilitados, `aria-busy` y textos «Validando…» y «Guardando…» en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.
- [x] T022 [US3] Dar prioridad al error de operación sobre los demás resultados en `src/features/phrases/components/phrase-form-feedback/phrase-form-feedback.component.tsx`, conservando las mutaciones sin reintentos en `src/features/phrases/hooks/validate-phrase.hook.ts` y `src/features/phrases/hooks/save-phrase.hook.ts`.

**Evidencia existente**: `src/features/phrases/components/phrase-form/phrase-form.spec.tsx`, `src/features/phrases/components/phrase-form/use-phrase-form.hook.spec.tsx`, `src/features/phrases/components/phrase-form-feedback/phrase-form-feedback.spec.tsx` y `src/features/phrases/hooks/save-phrase.hook.spec.tsx`. No se afirma cobertura automatizada de todos los límites y caracteres del esquema.

## Phase 6: Polish — Aspectos transversales existentes

**Propósito**: Registrar accesibilidad y documentación del comportamiento observado.

- [x] T023 Asociar etiqueta, ayuda y error al campo mediante `htmlFor`, `aria-describedby`, `aria-invalid` y `role="alert"` en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`.
- [x] T024 [P] Documentar contratos consumidos y trazabilidad de requisitos en `specs/003-create-phrases/contracts/http-contract.md` y `specs/003-create-phrases/contracts/ui-contract.md`.
- [x] T025 [P] Documentar comandos, escenarios manuales y límites de la evidencia en `specs/003-create-phrases/quickstart.md`.

## Dependencies & Execution Order

```text
Setup (T001–T003)
  → Foundational (T004–T006)
    → US1 (T007–T013, MVP)
      → US2 (T014–T016)
      → US3 (T017–T022)
        → Polish (T023–T025, una vez completas ambas historias)
```

- Contratos antes de transporte; transporte antes de servicio; mutaciones antes de coordinación y controles.
- US2 y US3 amplían el flujo de US1, aunque sus escenarios pueden verificarse por separado. Ambas modifican los mismos archivos del formulario: requieren coordinación y ejecución secuencial de cambios en esos archivos.
- Las dependencias representan una reconstrucción lógica; todas las tareas de implementación ya están completadas.

## Parallel Opportunities & Examples

- **Setup**: T002 y T003 pueden resolverse en paralelo tras disponer de dependencias.
- **US1**: T007 (esquema), T008 (mutación de comprobación) y T009 (mutación de creación) pueden realizarse en paralelo tras Foundational; T010 los integra.
- **US2**: No hay tareas completas independientes para paralelizar; T014 y T015 comparten feedback, y T016 integra la decisión en el formulario. Ejemplo de secuencia: T014 → T015 → T016.
- **US3**: T017 (reglas del esquema) y T018 (mensaje de error) pueden realizarse en paralelo tras US1; T019–T022 coordinan cambios compartidos.
- **Polish**: T024 y T025 pueden documentarse en paralelo después de contrastar las historias.

## Implementation Strategy

1. **MVP**: Setup + Foundational + US1, con validación y guardado separados, éxito visible y actualización del listado.
2. **Incremento de confirmación**: US2, reutilizando el guardado y respetando la decisión de la API.
3. **Incremento de recuperación**: US3, con errores, invalidación de comprobación y bloqueo de operaciones simultáneas.
4. **Cierre**: Accesibilidad y documentación transversal. La verificación manual con backend real permanece descrita en quickstart y no se marca como ejecutada por estas casillas.

## Resumen de estado

25 tareas completadas por evidencia de implementación: Setup 3, Foundational 3, US1 7, US2 3, US3 6 y Polish 3. Todas incluyen checkbox, ID secuencial y rutas concretas; las fases de historias incluyen su etiqueta `[USn]`.
