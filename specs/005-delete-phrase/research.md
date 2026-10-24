# Research: Eliminar frase con confirmación

Decisiones de diseño al 2026-10-23 para una funcionalidad aún no implementada, basadas en el contrato OpenAPI y en los patrones ya presentes en `features/phrases`.

## Ubicación de la acción y de la confirmación

- **Decision**: Añadir el botón de eliminar dentro de `PhraseListItem` (variant `delete` ya definida en `Button` y sin consumidor) y resolver la confirmación como estado inline del mismo ítem, no como diálogo modal ni pantalla separada.
- **Rationale**: El spec (Assumptions) describe la confirmación como "paso ligero dentro de la misma pantalla... diálogo o estado inline", consistente con la maqueta de página única. El proyecto no tiene componente de diálogo/modal; introducir uno sería una abstracción nueva sin justificación (principio de Simplicidad). El precedente más cercano es `PhraseForm`, que ya resuelve una confirmación de dos pasos (`Validar` → `Guardar de todos modos`) sin modal.
- **Alternatives considered**: Modal global reutilizable (requiere nuevo componente compartido y gestión de foco/overlay, desproporcionado para una confirmación de una frase); confirmación a nivel de página con un solo slot (complica identificar "qué frase" si hay más de una acción en curso).
- **Evidence**: `shared/components/ui/button/button.component.tsx` (variant `delete` sin uso), `components/phrase-form/phrase-form.component.tsx`, Assumptions de `spec.md`.

## Forma del estado de confirmación y bloqueo por frase

- **Decision**: Un hook `useDeletePhrase(phraseId)` por ítem, con una máquina de estados local (`idle | confirming | pending | error | not-found`) más un `useMutation` sin `retry`. `idle→confirming` al pulsar eliminar; `confirming→pending` al confirmar; éxito limpia el ítem vía invalidación; error genérico vuelve a `error` conservando el ítem; 404 pasa a `not-found` e invalida igualmente.
- **Rationale**: El estado es por frase (FR-005: bloquear reintentos solo para esa frase, no globalmente), así que vive en el ítem, no en `PhraseList`. Reutiliza el patrón de `useSavePhrase`/`usePhraseForm`: hook con `retry: false` y `onSuccess` que invalida `['phrases']`. Cancelar desde `confirming` vuelve a `idle` sin red (FR-003), y repetir clics durante `pending` no debe disparar otra mutación: `mutation.isPending` deshabilita los controles de esa fila mientras dura la solicitud.
- **Alternatives considered**: Estado centralizado en `PhraseList` (un solo "id en confirmación"/"id pendiente" compartido) añade acoplamiento entre ítems sin beneficio, ya que cada fila es independiente; una librería de máquina de estados es una dependencia nueva injustificada.
- **Evidence**: `hooks/save-phrase.hook.ts`, `components/phrase-form/use-phrase-form.hook.ts`.

## Distinguir "ya no existe" de un error genérico

- **Decision**: Añadir `PHRASE_NOT_FOUND` a `ApiErrorCode` (ya cubre otros códigos del mismo `ProblemDetails`) y un helper en `shared/utils/api-error.util.ts` que compare `getProblemDetails(error)?.code === ApiErrorCode.PHRASE_NOT_FOUND`, sin inspeccionar el status HTTP directamente en el componente.
- **Rationale**: El contrato OpenAPI define 404 `PHRASE_NOT_FOUND` como caso específico (frase inexistente o ya eliminada), distinto de 500 `INTERNAL_ERROR`/`DATABASE_ERROR` (FR-007 vs FR-008). El código ya usa `code` para distinguir casos (`getFieldErrorMessage` filtra por `VALIDATION_ERROR`), así que seguir ese mismo mecanismo mantiene la lógica de distinción fuera del componente.
- **Alternatives considered**: Comparar `error.response?.status === 404` en el hook es frágil si el backend reutiliza 404 para otro motivo futuro, y duplica conocimiento del contrato fuera de `ProblemDetails`.
- **Evidence**: `shared/interfaces/problem-details.interface.ts`, `shared/utils/api-error.util.ts`, OpenAPI `deletePhrase` (`404 PhraseNotFound`, código `PHRASE_NOT_FOUND`).

## Actualización del listado tras eliminar

- **Decision**: Tanto éxito como "ya no existe" invalidan `['phrases']` (mismo prefijo que `useSavePhrase`), dejando que `usePhrasesList` refresque la página actual con `page`/`limit` vigentes. No se inserta ni se filtra la frase manualmente en la caché.
- **Rationale**: Es el mecanismo ya usado para mantener el total y el listado sincronizados tras una mutación (ver `save-phrase.hook.ts`). Evita lógica de actualización optimista nueva y mantiene una sola fuente de verdad (la respuesta del GET).
- **Alternatives considered**: Actualización optimista con `queryClient.setQueryData` para quitar la frase antes de la respuesta del servidor se descarta: el spec no pide latencia percibida menor y añadiría necesidad de revertir en caso de fallo del DELETE.
- **Evidence**: `hooks/save-phrase.hook.ts`, `hooks/phrases-list.hook.ts`.

## Página que queda sin contenido tras eliminar (Edge case)

- **Decision**: No añadir lógica de retroceso automático de página. Tras invalidar, si la página actual queda vacía, `PhraseList` ya renderiza una `<ul>` vacía y el botón "Atrás" (visible cuando `page > 1`) permite retroceder manualmente; "Siguiente" ya se deshabilita cuando `page >= totalPages`.
- **Rationale**: El edge case del spec pide explícitamente "sin introducir una paginación nueva" y reutilizar "el comportamiento existente de listado". `PhraseList`/`PhrasePagination` ya exponen ambos controles sin cambios.
- **Alternatives considered**: Detectar automáticamente `data.length === 0 && page > 1` y decrementar `page` sería nueva lógica de paginación, fuera del alcance declarado.
- **Evidence**: `components/phrase-list/phrase-list.component.tsx`, `components/phrase-pagination/phrase-pagination.component.tsx`, Edge Cases de `spec.md`.

## Transporte del DELETE

- **Decision**: `phraseData.remove(id)` llama `httpClient.delete(\`/v1/phrases/${id}\`)` y no procesa el cuerpo (204 sin contenido); `phraseService.remove(id)` reenvía la llamada sin mapeo, igual que el resto del servicio delega en `phraseData`.
- **Rationale**: Sigue la composición existente `hook → service → data → httpClient` sin añadir una capa nueva para una operación sin DTO de respuesta.
- **Alternatives considered**: Llamar `httpClient` directamente desde el hook rompe la separación ya establecida entre hooks de React Query y transporte.
- **Evidence**: `data/phrases.data.ts`, `services/phrases.service.ts`.

No quedan aclaraciones de diseño pendientes. No se infiere comportamiento de concurrencia del servidor (dos personas eliminando la misma frase a la vez) más allá de lo que ya describe el contrato OpenAPI (404 `PHRASE_NOT_FOUND` en el segundo intento).
