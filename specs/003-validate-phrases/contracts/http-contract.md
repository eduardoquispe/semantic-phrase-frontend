# HTTP Contract: Validación de frases

Contrato consumido por el frontend existente, no una definición del servidor. Fuentes: `src/features/phrases/data/phrases.data.ts`, `data/phrases.dto.ts`, `interfaces/phrase.interfaces.ts`, `mappers/phrases.mapper.ts` y `src/shared/api/http-client.ts`.

## Petición

`POST /v1/phrase-validations`, JSON:

```json
{ "text": "Hola mundo" }
```

El formulario entrega texto válido y recortado; la capa HTTP no normaliza ni valida de nuevo. `phraseData.validate` devuelve el body Axios y el servicio adapta los campos mediante el mapper. La comprobación no llama a `POST /v1/phrases`, no invalida queries del listado y no envía `confirmed` ni `validationId` en esta petición.

## Respuesta

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

Los identificadores son ilustrativos. El cliente conserva validationId, expiresAt y requiresConfirmation sin transformar. No se deduce un código HTTP de éxito concreto: Axios entrega el body de una respuesta aceptada.

Valores alternativos de `match`:

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

`requiresConfirmation` es independiente de la candidata: false oculta cualquier match; true con match null presenta la advertencia general sin inventar candidata ni puntaje. No hay validación de respuestas en runtime; la aplicación presupone la forma tipada. El mapper trata todo match distinto de vector como textual_exact; esto describe el código y no amplía los valores admitidos por el contrato.

## Errores

La mutación declara `retry: false`. Un rechazo libera el formulario y conserva el texto; reintentar exige una nueva acción manual.

`ProblemDetails` declara title, status, detail, code y errors opcional con field/messages. La UI usa únicamente detail de un error Axios si es un string no vacío. En cualquier otro caso presenta «Ocurrió un error. Inténtalo de nuevo.». No muestra code ni errors por campo, ni asigna recuperación por códigos o estados HTTP. No se infiere qué códigos concretos devuelve este endpoint a partir del enum compartido.

## Configuración y límites

Axios usa `VITE_API_BASE_URL`, sin timeout, autenticación o interceptores propios en el cliente compartido. Se requiere un servidor accesible y CORS compatible con el origen de Vite.

La base debe combinarse con `/v1/phrase-validations`. Por ejemplo, `http://localhost:3000/api` produce `/api/v1/phrase-validations`. El `.env.example` actual termina en `/api/v1`, que combinado con el path del cliente produce `/api/v1/v1/phrase-validations`; comprobar el prefijo real antes de ejecutar. Este plan no modifica el entorno.

Se conserva expiresAt sin programar expiración local. El guardado posterior consume validationId y la decisión de confirmación según [F004](../../004-create-phrases/contracts/http-contract.md); la API decide si esa comprobación todavía es aceptable.
