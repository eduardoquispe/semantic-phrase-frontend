# HTTP Contract: Creación de frases integrada

Contrato consumido por phraseData y tipos locales; no especificación del servidor. JSON mediante Axios; base desde VITE_API_BASE_URL. No hay autenticación, timeout ni interceptores propios configurados en http-client.ts.

## Endpoints y base

| Operación | Método | Path del cliente |
| --- | --- | --- |
| Comprobar | POST | /v1/phrase-validations |
| Guardar | POST | /v1/phrases |
| Actualizar listado activo | GET | /v1/phrases?page={page}&limit=20 |

La base debe combinarse con estos paths para alcanzar la API real. Base http://localhost:3000/api produce /api/v1/phrases. .env.example termina en /api/v1 y produce /api/v1/v1/phrases; se documenta sin modificar entorno.

## Comprobación previa

Request (ValidatePhraseRequestDTO):

```json
{ "text": "Hola mundo" }
```

Response (ValidatePhraseResponseDTO):

```json
{
  "data": {
    "validationId": "validation-id",
    "expiresAt": "2026-10-23T18:00:00Z",
    "requiresConfirmation": false,
    "match": null
  }
}
```

match también admite:

```json
{
  "type": "textual_exact",
  "phrase": { "id": "phrase-id", "text": "Hola mundo" },
  "similarityScore": null
}
```

```json
{
  "type": "vector",
  "phrase": { "id": "phrase-id", "text": "Saludos al mundo" },
  "similarityScore": 0.914
}
```

Identificadores ilustrativos. El cliente conserva expiresAt sin comprobar vigencia y utiliza requiresConfirmation independientemente de match. No define umbrales ni detecta idioma. Normalización y validación de entrada ocurren en el formulario, no en el transporte.

## Creación

Request sin confirmación (CreatePhraseRequestDTO):

```json
{ "text": "Hola mundo", "validationId": "validation-id" }
```

Si requiere confirmación, la acción explícita envía:

```json
{ "text": "Hola mundo", "validationId": "validation-id", "confirmed": true }
```

Response (CreatePhraseResponseDTO):

```json
{
  "data": {
    "id": "phrase-id",
    "text": "Hola mundo",
    "createdAt": "2026-10-23T17:00:00Z"
  }
}
```

El servicio adapta createdAt con new Date(createdAt).toLocaleDateString(). No se deduce código HTTP de éxito concreto: Axios entrega el body de una respuesta aceptada. No se envía clave de idempotencia.

## Errores y actualización

ProblemDetails tipa title, status, detail, code y errors opcional con field/messages. Códigos declarados: VALIDATION_ERROR, INVALID_VALIDATION_ID, PHRASE_MISMATCH, VALIDATION_EXPIRED, VALIDATION_ALREADY_USED, CONFIRMATION_REQUIRED, RATE_LIMIT_EXCEEDED, INTERNAL_ERROR, AI_UNAVAILABLE y DATABASE_UNAVAILABLE. No se infieren correspondencias entre códigos y estados HTTP.

UI presenta detail de error Axios si es string no vacío; en otro caso «Ocurrió un error. Inténtalo de nuevo.». No discrimina recuperación por código ni presenta errors por campo.

Ambas mutaciones declaran retry false. Crear con éxito devuelve la promesa de invalidateQueries con prefijo `['phrases']`: invalida páginas en caché y actualiza consultas activas. Crear fallido no activa esa invalidación. La consulta tiene política propia (retry 1); no es un reintento de creación. Véase [contrato del listado](../../002-list-phrases/contracts/http-contract.md).

No hay validación de respuestas en runtime ni garantía de persistencia, idempotencia o disponibilidad del backend. Un fallo de red al guardar no permite determinar si el servidor llegó a crear la frase.
