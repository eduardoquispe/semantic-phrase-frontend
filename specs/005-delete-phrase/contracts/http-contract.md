# HTTP Contract: Eliminar frase con confirmación

Contrato a consumir por `phraseData.remove`; no especificación del servidor. JSON mediante Axios; base desde `VITE_API_BASE_URL`, sin autenticación ni interceptores propios (ver `http-client.ts`).

## Endpoint

| Operación | Método | Path del cliente |
| --- | --- | --- |
| Eliminar | DELETE | `/v1/phrases/{id}` |
| Actualizar listado activo | GET | `/v1/phrases?page={page}&limit=20` (sin cambios; ya existente) |

`id` es el UUID de `Phrase.id`. Sin query params ni cuerpo de request.

## Éxito

`204 No Content`: sin cuerpo. `phraseData.remove` no intenta leer `response.data`; la promesa resuelve `void`.

## Errores

`ProblemDetails` (ya tipado) con `code` relevante para este endpoint:

| Status | `code` | Caso |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | `id` no es un UUID válido u otros parámetros de ruta/consulta desconocidos. |
| 404 | `PHRASE_NOT_FOUND` | La frase no existe o ya fue eliminada (incluye el caso de doble eliminación concurrente). |
| 500 | `INTERNAL_ERROR` / `DATABASE_ERROR` | Fallo interno o de base de datos. |

```json
{
  "title": "Not Found",
  "status": 404,
  "detail": "La frase no existe.",
  "code": "PHRASE_NOT_FOUND"
}
```

`PHRASE_NOT_FOUND` se añade a `ApiErrorCode` (`shared/interfaces/problem-details.interface.ts`) para que el hook distinga este caso de `INTERNAL_ERROR`/`DATABASE_ERROR` sin inspeccionar el status HTTP directamente.

## Reintentos, concurrencia e invalidación

La mutación de eliminar declara `retry: false`, igual que `useSavePhrase`. Tanto el éxito (204) como el fallo `PHRASE_NOT_FOUND` disparan `queryClient.invalidateQueries({ queryKey: ["phrases"] })`; un fallo con cualquier otro código no invalida, dejando la frase visible para reintentar.

No se envía cabecera de idempotencia. Un fallo de red durante el DELETE no permite determinar si el servidor llegó a eliminar la frase (mismo límite ya documentado para la creación); la UI no reintenta automáticamente (edge case de `spec.md`). Véase el [contrato HTTP de creación](../../004-create-phrases/contracts/http-contract.md) para el resto de endpoints de `phraseData`.
