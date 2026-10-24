# Data Model: Eliminar frase con confirmación

Tipos y estados a introducir en el frontend; no define tablas del backend (soft delete ya documentado en OpenAPI).

## Entidades y relaciones

| Entidad / tipo | Campos | Uso |
| --- | --- | --- |
| Phrase (existente) | id: string; text: string; createdAt: string | Entidad sobre la que se ejecuta la eliminación; no cambia de forma. |
| DeletePhraseStatus (nuevo, interno al hook) | `"idle" \| "confirming" \| "pending" \| "error" \| "not-found"` | Estado de confirmación y envío por frase; no se persiste ni se comparte entre filas. |
| `remove(id: string): Promise<void>` (nuevo en `phraseData`/`phraseService`) | id: string | DELETE sin cuerpo de request ni de response exitosa (204). |
| ProblemDetails (existente, ampliado) | ...; `code` incluye ahora `PHRASE_NOT_FOUND` | Permite distinguir el 404 lógico de `INTERNAL_ERROR`/`DATABASE_ERROR`. |

Fuente: `src/features/phrases/interfaces/phrase.interfaces.ts`, nuevo `hooks/delete-phrase.hook.ts`, `data/phrases.data.ts`, `services/phrases.service.ts`; error en `src/shared/interfaces/problem-details.interface.ts`.

## Reglas derivadas de los requisitos

1. (FR-001, FR-002) Activar "Eliminar" en un ítem transiciona `idle → confirming`; no se invoca `remove` en esta transición.
2. (FR-003) Desde `confirming`, "Cancelar" transiciona a `idle` sin llamar a `remove` ni modificar el listado.
3. (FR-004) Desde `confirming`, "Confirmar" transiciona a `pending` e invoca `remove(phrase.id)` exactamente una vez para esa transición.
4. (FR-005) Mientras el estado sea `pending`, los controles de eliminar/confirmar/cancelar de esa fila están deshabilitados; no existe una segunda invocación de `remove` para el mismo `id` hasta que la mutación resuelva.
5. (FR-006) Éxito de `remove` invalida `['phrases']`; el listado y el total reflejan la ausencia de la frase en la siguiente actualización de `usePhrasesList`, sin transición local adicional del ítem (se desmonta al salir de los datos).
6. (FR-007) Fallo de `remove` con `code` distinto de `PHRASE_NOT_FOUND` transiciona a `error`; la frase permanece en el listado (sin invalidar), se muestra `detail` (o el mensaje genérico de `getErrorMessage`) y "Eliminar"/"Confirmar" vuelven a estar disponibles para reintentar desde `confirming` o `idle`.
7. (FR-008) Fallo de `remove` con `code === PHRASE_NOT_FOUND` transiciona a `not-found`, muestra un mensaje distinguible ("esta frase ya no está disponible") y también invalida `['phrases']`, de modo que el ítem deja de aparecer en el listado visible tras el refetch.
8. (FR-009) No existe transición hacia un estado "restaurada"; `not-found` y el éxito son terminales para ese ítem en esta sesión de UI.
9. (FR-010) El hook y los controles no consultan identidad ni rol; cualquier persona que vea el ítem puede ejecutar las transiciones 1–3.

## Estados observables (por ítem de `PhraseListItem`)

| Estado | Render | Acciones disponibles |
| --- | --- | --- |
| `idle` | Texto y fecha de la frase; botón "Eliminar". | Eliminar → `confirming`. |
| `confirming` | Igual, más confirmación inline que identifica el texto de la frase. | Confirmar → `pending`; Cancelar → `idle`. |
| `pending` | Confirmación con controles deshabilitados; indicación de progreso. | Ninguna (bloqueado). |
| `error` | Mensaje de error (`detail` o genérico); frase intacta. | Eliminar/Confirmar de nuevo → reintenta desde `confirming`/`pending`. |
| `not-found` | Mensaje distinguible de "ya no existe"; transitorio hasta que el refetch retire el ítem. | Ninguna (el ítem se desmonta al refrescar el listado). |

No hay estado persistido entre recargas de página; al recargar, cualquier frase visible siempre inicia en `idle`.
