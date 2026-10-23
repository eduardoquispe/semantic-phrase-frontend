# UI Contract: Listado de frases

Entrada: ruta `/`, PhraseList dentro de PhrasesPage; sin ruta separada.

| Requisitos / historia | Comportamiento observable |
| --- | --- |
| FR-001 / US1 | Inicio en página 1 y límite 20; una caché vigente puede satisfacer consulta. |
| FR-002 / US1 | Orden recibido, texto entre comillas tipográficas, fecha local sin hora, id oculto. |
| FR-003 / US1 | Badge con meta.total seguido de «frases», incluso «1 frases». |
| FR-004 / US1 | «Frases guardadas», «Las más recientes aparecen primero.» y «Esta lista es compartida: cualquier persona puede ver y eliminar sus frases.». Aviso no añade acción de eliminar. |
| FR-005–FR-006 / US2 | Nav «Paginación de frases»; «← Atrás» solo desde página 2; «Siguiente →» siempre visible, deshabilitado si página >= totalPages; cambio de una página. |
| FR-007 / US3 | Éxito vacío: «0 frases», sin filas ni mensaje adicional; avance deshabilitado. |
| FR-008 / US3 | ul con tabIndex=0 y nombre «Frases guardadas, lista desplazable»; máximo 360 px, scroll vertical, foco visible y ajuste de palabras largas. |
| FR-009 / US4 | Guardado exitoso actualiza sin cambiar selección; fallo no provoca esa invalidación. |

## Límites actuales

- Sin datos durante carga/error: sin spinner, error, reintento ni aviso de vacío; contador sin cifra y navegación fallback 1/1.
- Cambio de página sin placeholder anterior; puede mostrar caché de nueva página. No se garantiza HTTP en cada clic.
- Botones usan meta.page con datos disponibles. Selección local no se reinicia tras guardar.
- Error de actualización puede mantener datos previos sin aviso.
- Sin corrección de página fuera de rango ante cambios concurrentes.
- Sin eliminación, edición, búsqueda, filtros, salto directo ni selector de tamaño.

Lectura a 320/1280 px, foco y desplazamiento requieren revisión manual de [quickstart.md](../quickstart.md); inspeccionar CSS no acredita SC-004.
