# Data Model: Creación de frases integrada

Tipos y estados existentes del frontend; no define tablas del backend.

## Entidades y relaciones

| Entidad / tipo | Campos | Uso |
| --- | --- | --- |
| Frase en composición / PhraseFormValues | text: string | React Hook Form conserva entrada; resolver entrega texto recortado a las acciones. |
| ValidatePhraseRequest | text: string | Texto para comprobación remota. |
| ValidatePhraseResponse.data | validationId: string; expiresAt: string ISO 8601; requiresConfirmation: boolean; match: unión o null | Resultado retenido por mutación; vincula creación con comprobación. No contiene copia del texto comprobado. |
| MatchedPhrase | id: string (UUID según comentario del tipo); text: string | Frase existente de la coincidencia; sin fecha. |
| Match textual | type: textual_exact; phrase: MatchedPhrase; similarityScore: null | Coincidencia exacta, sin porcentaje. |
| Match semántico | type: vector; phrase: MatchedPhrase; similarityScore: number | UI redondea score × 100, sin validar rango ni calcular umbral. |
| CreatePhraseRequest | text: string; validationId: string; confirmed?: boolean | Formulario omite confirmed salvo que se requiera confirmación; entonces envía true. |
| CreatePhraseResponse | data: Phrase | Resultado de creación. |
| PhraseDTO / Phrase | id: string; text: string; createdAt: string | DTO conserva fecha remota; mapper convierte createdAt a fecha local para Phrase. |
| ProblemDetails | title: string; status: number; detail: string; code: ApiErrorCode; errors?: FieldError[] | UI usa detail desde error Axios. FieldError contiene field: string y messages: string[]. |

Los tipos son contratos estáticos; no validan respuestas en runtime. Fuente: src/features/phrases/interfaces, data/phrases.dto.ts y mappers/phrases.mapper.ts; errores en src/shared/interfaces/problem-details.interface.ts.

## Reglas de entrada (FR-002, FR-003)

1. Entrada original string, sin CR, LF, tabulación, U+2028 ni U+2029.
2. Solo letras Unicode (\p{L}), números Unicode (\p{N}), espacio normal y `. / $ % , ; -`.
3. Tras trim, entre 1 y 280 puntos de código (`Array.from(text).length`) y al menos una letra. Una única letra es válida; no hay detección de idioma ni requisito técnico de varias palabras.
4. Espacios interiores conservados. Ambas acciones pasan por el esquema local antes de invocar el servicio.

## Estados observables

Los nombres describen combinaciones de formulario y mutaciones; no existe un nuevo enum.

| Estado / evento | Resultado |
| --- | --- |
| Inicial | Campo vacío; sin mensajes; guardar deshabilitado. |
| Entrada inválida → validar | Error de campo; sin petición de comprobación. |
| Entrada válida → validar / Enter | Limpia resultados previos, inicia comprobación y bloquea acciones. |
| Validación exitosa | Retiene resultado; permite guardar según requiresConfirmation. |
| Validación fallida | Conserva texto y muestra error; guardar deshabilitado. |
| Edición tras resultado | Resetea ambas mutaciones; descarta comprobación, éxito o error; exige validar otra vez. |
| Guardar con comprobación disponible | Envía texto, validationId y confirmación si corresponde; ocupado. |
| Guardado exitoso | Invalida consultas phrases; tras resolver la mutación limpia campo y comprobación; muestra Frase guardada. |
| Guardado fallido | Conserva texto y muestra error; descarta comprobación; no invalida listado por esa mutación; exige nueva validación. |
| Nueva validación | Limpia resultados previos antes de la petición. |

`isBusy = isSubmitting || validate.isPending || save.isPending`; inFlight impide operaciones simultáneas. expiresAt no provoca transición local. El estado del borrador no se persiste al recargar.

El listado mantiene page y usa `['phrases', { page, limit }]`; guardar invalida por prefijo `['phrases']`. Véase [modelo del listado](../002-list-phrases/data-model.md).
