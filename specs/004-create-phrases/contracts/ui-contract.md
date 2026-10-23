# UI Contract: Creación de frases integrada

Contrato observable de componentes actuales en `/`; sin nuevos controles ni pantallas.

## Controles y mensajes

| Elemento / condición | Comportamiento existente |
| --- | --- |
| Nueva frase | Explica que validar revisa frases guardadas y no guarda la nueva. |
| Frase en español | Input de una línea, autocomplete off; sin detección de idioma. |
| Ayuda / error | aria-describedby enlaza ayuda; aria-invalid según error; ayuda con role alert cuando hay error de campo. |
| Contador | Array.from(text.trim()).length / 280; sin truncamiento automático. |
| Validar / Enter | Submit ejecuta esquema local y comprobación remota, nunca creación. |
| Guardar | Deshabilitado sin resultado de validación o durante operación; acción independiente del submit. |
| requiresConfirmation false | Frase validada; descripción No se encontró ninguna coincidencia.; sin candidata aunque exista. Acción Guardar. |
| Confirmación y textual_exact | Coincidencia textual exacta y candidata; sin porcentaje; aviso de que todavía no se guardó. Acción Guardar de todos modos. |
| Confirmación y vector | Posible coincidencia semántica, candidata y Similitud semántica · N %, redondeando score × 100; mismo aviso y acción. |
| Confirmación y match null | Título semántico, sin candidata ni porcentaje; mantiene acción de confirmación. |
| Ocupado | form aria-busy, input readOnly, ambas acciones deshabilitadas; Validando… o Guardando… según mutación. |
| Guardado exitoso | Frase guardada, campo vacío, contador 0 y comprobación descartada; listado invalidado conservando página seleccionada. |
| Error de operación | Prioridad sobre éxito o validación; detail o mensaje genérico; texto conservado. |

Editar limpia resultados y errores, incluso si se vuelve al texto original. Iniciar validación limpia resultados previos. Un intento de guardado siempre descarta la comprobación al terminar. No hay cuenta regresiva ni bloqueo por expiresAt.

No se confirma por separado que el listado haya actualizado ni se añade aviso si falla la consulta posterior. Véase [contrato UI del listado](../../002-list-phrases/contracts/ui-contract.md).

## Trazabilidad

| Requisitos | Módulos existentes | Verificación |
| --- | --- | --- |
| FR-001, FR-004 | PhraseForm, usePhraseForm, hooks de mutación | US1.1–4, US2.3–5; separar POSTs y revisar validationId/confirmed. |
| FR-002, FR-003 | phraseFormSchema, contador | US1.2, US3.2; límites, caracteres y trim. |
| FR-005 | PhraseValidationFeedback | US1.3, US2.1–2, US2.5; tres resultados y porcentaje. |
| FR-006 | isBusy, inFlight y controles | US3.6; petición pendiente, clics y Enter. |
| FR-007 | useSavePhrase, usePhraseForm, PhraseList | US1.5–6; limpieza, éxito y página conservada. |
| FR-008, FR-009 | Mutaciones y try/catch/finally de usePhraseForm | US3.3–5; fallos independientes y nueva validación. |
| FR-010 | onChange del campo, onSubmit del hook | US3.1, US3.7; edición y reinicio de comprobación. |
| FR-011 | PhraseFormFeedback, getErrorMessage | US3.3–4; detalle y fallback. |

Procedimientos y alcance de evidencia: [quickstart.md](../quickstart.md).
