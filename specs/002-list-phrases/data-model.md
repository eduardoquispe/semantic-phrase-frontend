# Data Model: Listado de frases guardadas

**Feature**: `002-list-phrases`. Fuente: interfaces, DTO y mapper de `src/features/phrases/`.

## Frase transportada: PhraseDTO

| Campo | Tipo declarado | Uso |
| --- | --- | --- |
| id | string | Identidad y key React; no visible. |
| text | string | Texto presentado entre comillas. |
| createdAt | string | Fecha interpretable por Date; se espera un instante válido para obtener fecha local. |

No hay validación runtime de formato de id, longitud de texto o timestamp. No se atribuyen restricciones al servidor. Las fechas inválidas no tienen recuperación específica.

## Frase presentada: Phrase

Mismos campos y tipos, pero createdAt contiene `new Date(dto.createdAt).toLocaleDateString()`: cadena local sin hora, no el timestamp original. id y text se copian; no hay ordenamiento local.

## Consulta: PhraseListQuery / PhraseListQueryDTO

| Campo | Tipo | Regla observada |
| --- | --- | --- |
| page | number opcional | Hook usa 1 si falta; pantalla inicia en 1. |
| limit | number opcional | Hook usa 20 si falta; pantalla fija 20. |

UI cambia una página por acción. No hay validación runtime de enteros positivos o tamaño máximo en este consumidor.

## Metadatos: PageMeta

| Campo | Tipo | Significado esperado |
| --- | --- | --- |
| page | number | Página de la respuesta. |
| limit | number | Tamaño de página informado. |
| total | number | Total de colección, no filas visibles. |
| totalPages | number | Número de páginas informado. |

Se conservan sin recalcular. Se esperan valores consistentes y hasta 20 filas por consulta de pantalla. Vacío: data=[], total=0 y totalPages=0. El fallback visual usa 1 para totalPages=0 sin mutar el objeto.

## Página y colección

`PhraseListResponseDTO = { data: PhraseDTO[], meta: PageMeta }`.

`PhraseListResponse = { data: Phrase[], meta: PageMeta }`.

Una página contiene frases de una colección compartida. No hay entidad persistida de colección en frontend ni instantánea de todas las páginas; se conserva el orden de data.

## Transiciones

| Evento | Estado | Presentación |
| --- | --- | --- |
| Montaje | Selección local 1; consulta límite 20. | Sin caché: lista sin filas y contador sin cifra. |
| Éxito | Caché recibe data/meta para la clave. | Filas, total y botones según meta. |
| Avanzar/retroceder | Cambia selección y clave. | Datos disponibles de nueva página; sin placeholder anterior configurado. |
| Error sin datos | Hook expone error; provider permite un reintento. | Sin aviso; lista sin filas y navegación fallback 1/1. |
| Error al actualizar con datos | Pueden conservarse datos previos de la clave. | Último resultado sin aviso. |
| Guardado exitoso | Invalidación de frases; selección se conserva. | Consulta activa actualizada. |
| Guardado fallido | Sin invalidación causada por esa mutación. | Sin inserción optimista. |

Selección local y meta son distintos: durante consulta sin datos los botones usan página 1 aunque se haya solicitado otra. No hay transición de edición/eliminación ni corrección explícita de página fuera de rango por cambios concurrentes.
