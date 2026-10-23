# UI Contract: Validación integrada

Contrato visible del formulario «Nueva frase» en `/`. Fuentes: `src/features/phrases/components/phrase-form/`, `phrase-form-feedback/` y `phrase-validation-feedback/`.

## Estados visibles

| Estado | Mensaje | Campo y acciones |
| --- | --- | --- |
| Inicial | Ayuda «Una línea · De 1 a 280 caracteres · Al menos una palabra»; contador 0 / 280. | Vacío; Validar disponible; Guardar deshabilitado. |
| Entrada inválida | Error junto al campo en lugar de ayuda. | No llama a API; foco al campo al enviar. |
| En curso | «Validando…»; sin resultado/error anterior. | readOnly; ambas acciones deshabilitadas. |
| Sin confirmación | «Frase validada» / «No se encontró ninguna coincidencia.» | Guardar habilitado; candidata oculta aunque exista. |
| Exacta con confirmación | «Coincidencia textual exacta», «Frase existente» y texto. | Guardar de todos modos habilitado; sin porcentaje. |
| Semántica con confirmación | «Posible coincidencia semántica», candidata y «Similitud semántica · 91 %» para 0,914. | Guardar de todos modos habilitado. |
| Confirmación sin candidata | «Posible coincidencia semántica» y aviso general. | Sin candidata ni porcentaje; Guardar de todos modos habilitado. |
| Error remoto | detail o «Ocurrió un error. Inténtalo de nuevo.». | Texto conservado; Guardar deshabilitado; Validar permite reintentar. |

Toda advertencia incluye «Se requiere tu confirmación antes de guardar. La frase todavía no se guardó.». El caso semántico con candidata añade «El puntaje indica similitud; tú decides si es un duplicado.».

## Entrada e interacción

- Validar y Enter envían solo a comprobación. Después de un éxito, repetirlos inicia otra comprobación sin guardar.
- Cualquier edición limpia resultados y errores de operación y exige validar otra vez, incluso restaurando el texto original o cambiando únicamente espacios exteriores.
- El contador usa puntos de código tras trim; «  Hola mundo  » muestra 10 / 280. Las reglas y límites están en [data-model.md](../data-model.md).
- El campo no usa maxLength para impedir escribir 281 caracteres: el esquema informa el límite al validar.
- No existe Cancelar independiente ni indicador local de vencimiento. Validar no modifica la colección; activar guardar corresponde a F004.

## Accesibilidad existente

Label «Frase en español» vinculado al input; `aria-invalid` refleja error y `aria-describedby="phrase-help"` lo asocia. El mensaje local usa role alert cuando hay error. El formulario declara aria-busy; el estado Validando se anuncia mediante aria-live polite. El campo permanece readOnly durante operaciones y los botones usan disabled.

## Trazabilidad

| Requisito | Evidencia / escenario |
| --- | --- |
| FR-001 | Envío mediante botón/Enter, sin creación ni invalidación del listado. |
| FR-002 | Esquema local, error asociado y foco; casos inválidos de US2. |
| FR-003 | Trim para petición y contador; espacios internos conservados. |
| FR-004 | Resultado sin confirmación, con candidata oculta. |
| FR-005 | Exacta/semántica, porcentaje redondeado y caso sin candidata. |
| FR-006 | Bloqueo en curso, aria-busy e inFlight. |
| FR-007 | Texto conservado y reintento manual después de fallo. |
| FR-008 | onChange resetea resultado y mensajes. |
| FR-009 | Nuevo envío válido resetea resultado/error y bloquea guardar. |
| FR-010 | Se conserva respuesta completa para F004; etiqueta según confirmación. |

Los escenarios ejecutables y las comprobaciones pendientes se detallan en [quickstart.md](../quickstart.md).
