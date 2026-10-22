# Phase 1 — Datos de presentación F001

Sin entidades persistidas, DTOs ni estado remoto. Estos tipos describen exclusivamente muestras visuales.

## PhraseListItemData

Tipo en phrase-list-item.types.ts, exportado por el índice de la unidad y consumido por filas, listado y ejemplos.

| Campo | Tipo | Regla |
| --- | --- | --- |
| text | string readonly | Texto exacto; identifica también la acción Eliminar |
| dateTime | string readonly | ISO 8601 con offset para time |
| dateLabel | string readonly | Etiqueta de fecha/hora exacta, sin conversión de zona horaria |

Muestras readonly en phrase-list.examples.ts, en este orden:

| text | dateTime | dateLabel |
| --- | --- | --- |
| Quiero cambiar la fecha de mi consulta médica | 2026-10-21T10:42:00-05:00 | 21 oct 2026 · 10:42 |
| El equipo se reúne el viernes por la mañana | 2026-10-20T16:15:00-05:00 | 20 oct 2026 · 16:15 |
| La biblioteca abre los sábados | 2026-10-19T09:08:00-05:00 | 19 oct 2026 · 09:08 |

PhraseList recibe una colección readonly; el total se deriva de su longitud. La página importa las muestras desde la superficie pública del listado. Para estas tres muestras únicas, text puede servir como key; no inventar IDs de backend. La identidad real se resolverá al integrar el contrato.

## PhrasePaginationProps

| Campo | Tipo | Regla F001 |
| --- | --- | --- |
| page | number | Entero >= 1 |
| totalPages | number | Entero >= 1; page <= totalPages |

| page | totalPages | Atrás | Siguiente |
| --- | --- | --- | --- |
| 1 | 1 | Ausente | Deshabilitado |
| 1 | 3 | Ausente | Habilitado |
| 2 | 3 | Habilitado | Habilitado |
| 3 | 3 | Habilitado | Deshabilitado |

Inicial: (1, 1). Los otros casos son entradas para revisión aislada. No hay callbacks, transiciones de página, slicing ni consultas. No añadir validadores para props controladas localmente; el caso vacío queda fuera de F001.

## Estado del formulario y relaciones

Campo nativo editable inicialmente vacío, sin estado React. Contador fijo 0 / 280 y Guardar permanentemente deshabilitado. No hay validación, token, similitud, mensajes de éxito/error ni transiciones de negocio. Recargar restablece la muestra inicial; no hay almacenamiento.

La página compone formulario y listado; el listado recibe tres elementos y presenta filas y paginador. Shared Button/Input solo conocen atributos HTML, no estos tipos ni reglas de texto de frases.
