# HTTP Contract: Consumidor de listado

Contrato observado en frontend; no sustituye una especificación del servidor.

## Petición

`GET {VITE_API_BASE_URL}/v1/phrases?page=1&limit=20`

Sin cuerpo. Axios recibe params page/limit; el hook completa omitidos con 1/20. Pantalla conserva límite 20. El cliente compartido no configura headers de autenticación.

Si el servidor publica /api/v1/phrases, configurar base http://localhost:3000/api. .env.example incluye /api/v1, que combinado con el sufijo produce /api/v1/v1/phrases. Verificar el despliegue; este trabajo no modifica la configuración.

## Respuesta exitosa consumida

Ejemplo: última página de una colección de 21 registros.

```json
{
  "data": [
    { "id": "phrase-21", "text": "Una idea compartida", "createdAt": "2026-10-22T19:00:00Z" }
  ],
  "meta": { "page": 2, "limit": 20, "total": 21, "totalPages": 2 }
}
```

Se espera un HTTP exitoso aceptado por Axios con este sobre; no se infiere un código exacto del servidor. Para vacío: `{ "data": [], "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }`.

Orden de data preservado; recientes primero depende de API. Campos y transformación: [data-model.md](../data-model.md).

## Errores y caché

Data y service propagan rechazo al hook. Sin contrato de cuerpo de error, normalización o validación runtime. UI no presenta errores ni ofrece reintentar. Provider: retry=1, staleTime=60000 y refetchOnWindowFocus=false.

Clave: `['phrases', { page, limit }]`. Guardado correcto invalida prefijo `['phrases']`; actualiza consulta activa conservando selección. No implica descargar todas las páginas inactivas. Guardado fallido no dispara invalidación. Creación y validación quedan fuera de este contrato.
