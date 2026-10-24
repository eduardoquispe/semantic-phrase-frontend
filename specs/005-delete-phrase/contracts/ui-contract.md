# UI Contract: Eliminar frase con confirmación

Contrato observable a implementar en `PhraseListItem` dentro de `/`; sin pantalla ni ruta nueva.

## Controles y mensajes

| Elemento / condición | Comportamiento a implementar |
| --- | --- |
| Ítem en `idle` | Muestra texto y fecha (sin cambios) más un botón "Eliminar" (`Button variant="delete"`). |
| Eliminar pulsado (`idle → confirming`) | No se envía ninguna solicitud; aparece una confirmación inline que repite el texto de la frase ("¿Eliminar “{texto}”?") con acciones "Confirmar" y "Cancelar". |
| Cancelar (`confirming → idle`) | Oculta la confirmación; no hay solicitud; la frase y el listado no cambian. |
| Confirmar (`confirming → pending`) | Envía el DELETE; deshabilita Confirmar/Cancelar/Eliminar de esa fila; indica progreso (por ejemplo, "Eliminando…"). |
| Repetir clics durante `pending` | Sin efecto adicional: los controles están deshabilitados y no se inicia una segunda solicitud para esa frase. |
| Éxito (`pending` → desmontado) | La fila desaparece del listado y el contador de `PhraseList` ("N frases") se actualiza en la siguiente actualización de `usePhrasesList`, sin recarga manual. |
| Error genérico (`pending → error`) | La frase permanece visible sin cambios; se muestra `detail` del error o el mensaje genérico de `getErrorMessage`; "Eliminar"/"Confirmar" vuelven a estar disponibles para reintentar. |
| Frase ya no existe (`pending → not-found`) | Mensaje distinguible de un error genérico (por ejemplo, "Esta frase ya no está disponible."); no se ofrece reintentar; la fila desaparece al refrescar el listado. |
| Página sin contenido tras eliminar | Sin lógica nueva: `PhraseList` ya renderiza una lista vacía y `PhrasePagination` ya expone "Atrás" (page > 1) y deshabilita "Siguiente" (page ≥ totalPages). |

Ninguna de estas transiciones depende de identidad ni rol: todas las personas que ven el listado compartido tienen las mismas acciones (FR-010). No se añade acción de restaurar en ningún estado.

## Trazabilidad

| Requisitos | Módulos a modificar/crear | Verificación |
| --- | --- | --- |
| FR-001, FR-002, FR-003 | `PhraseListItem`, `useDeletePhrase` (transición `idle↔confirming`) | US1.1, US2.1–2; confirmación visible sin solicitud previa, cancelar sin efecto. |
| FR-004 | `useDeletePhrase` (transición `confirming→pending`, `remove`) | US1.2; una sola solicitud al confirmar. |
| FR-005 | `useDeletePhrase` (`mutation.isPending` deshabilita controles) | US1.3; clics repetidos no duplican solicitudes. |
| FR-006 | `useDeletePhrase` (invalidación en éxito), `PhraseList`/`usePhrasesList` (sin cambios) | US1.2; frase ausente y total actualizado en una sola actualización. |
| FR-007 | `useDeletePhrase` (estado `error`), `getErrorMessage` | US3.1; frase intacta, error mostrado, reintento disponible. |
| FR-008 | `ApiErrorCode.PHRASE_NOT_FOUND`, helper en `api-error.util.ts`, `useDeletePhrase` (estado `not-found`) | US3.2; mensaje distinguible y frase removida del listado visible. |
| FR-009 | Ausencia deliberada de acción "restaurar" en todos los estados | Revisión de código; sin caso de prueba positivo. |
| FR-010 | `PhraseListItem` sin verificación de identidad/rol | Revisión manual: cualquier sesión ve las mismas acciones. |

Procedimientos y alcance de evidencia: [quickstart.md](../quickstart.md). Contrato de listado base sin cambios: [contrato UI del listado](../../002-list-phrases/contracts/ui-contract.md).
