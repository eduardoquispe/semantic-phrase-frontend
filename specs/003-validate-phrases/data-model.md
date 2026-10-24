# Data Model: Validación de frases integrada

Modelo retrospectivo del frontend. Fuentes: `src/features/phrases/interfaces/phrase.interfaces.ts`, `data/phrases.dto.ts`, `components/phrase-form/phrase-form.schema.ts` y `components/phrase-form/use-phrase-form.hook.ts`.

## Frase en composición

| Campo conceptual | Tipo | Regla / origen |
| --- | --- | --- |
| Texto original | string | Valor del campo; se conserva al validar o fallar. |
| Texto enviado | string | Salida del esquema, con trim; espacios interiores intactos. |
| Longitud | number derivado | `Array.from(text.trim()).length`, puntos de código. |
| Error de entrada | string o ausente | React Hook Form y Zod, modo onChange. |

El esquema revisa primero los caracteres de control Unicode (`Cc`: saltos de línea, tabulaciones, etc.). Luego recorta y exige hasta 280 puntos de código, ningún emoji (`\p{Extended_Pictographic}`, indicadores regionales, ZWJ y selector de variación) y al menos 3 letras (`\p{L}`). No hay lista blanca de caracteres: la puntuación (`¿ ? ! : ( ) , . ;`…) es válida. No normaliza Unicode, mayúsculas ni idioma. Es la misma regla que aplican el DTO y `PhraseText` en el backend.

## Comprobación

`ValidatePhraseRequest` contiene únicamente `text: string`. El recorte lo hace el formulario: servicio, mapper y transporte no repiten la validación local.

`ValidatePhraseResponse` envuelve los siguientes campos en `data`:

| Campo | Tipo | Uso |
| --- | --- | --- |
| validationId | string | Referencia opaca conservada para F004. |
| expiresAt | string ISO 8601 según tipos | Se conserva sin parsear ni comprobar vigencia localmente. |
| requiresConfirmation | boolean | Controla advertencia y etiqueta de guardado. |
| match | Coincidencia o null | Candidata opcional; solo se presenta si se requiere confirmación. |

El resultado vive en la mutación, sin almacenamiento local persistente. La asociación al texto enviado se mantiene mediante el flujo del formulario: bloquear edición durante la petición y resetear el resultado en todo onChange. No existe campo adicional de texto validado dentro de la respuesta.

## Coincidencia

Unión discriminada por `type`:

| Tipo | phrase | similarityScore |
| --- | --- | --- |
| textual_exact | `{ id: string, text: string }` | null |
| vector | `{ id: string, text: string }` | number |

`phrase.id` identifica una frase existente; el tipo lo comenta como UUID, sin validación runtime. La coincidencia no es una frase nueva ni aporta createdAt. La UI calcula únicamente `Math.round(similarityScore * 100)` para presentar el porcentaje semántico; no aplica umbrales, límites ni determina duplicados. Los tipos no imponen un intervalo numérico en runtime.

## Estados y transiciones

Estados conceptuales derivados de React Hook Form y de la mutación, sin enum nuevo:

| Estado | Datos / acciones | Transición |
| --- | --- | --- |
| Inicial o editando | Sin resultado; Validar disponible; Guardar deshabilitado. | Envío inválido → error de entrada; válido → en curso. |
| Error de entrada | Error asociado al campo; ninguna petición. | Edición actualiza error; envío válido → en curso. |
| En curso | Resultado/error anterior reseteado; campo readOnly; acciones bloqueadas. | Respuesta → éxito o advertencia; rechazo → error remoto. |
| Éxito | Resultado con requiresConfirmation false; Guardar habilitado. | Edición → sin resultado; Validar/Enter → en curso; guardar → F004. |
| Advertencia | Resultado con requiresConfirmation true; Guardar de todos modos habilitado. | Mismas salidas que éxito. |
| Error remoto | Sin resultado utilizable; texto conservado; error visible. | Edición limpia error; reintento válido → en curso. |

`isBusy = isSubmitting || validate.isPending || save.isPending`; `inFlight` protege contra operaciones simultáneas antes del siguiente render. Todo cambio del campo resetea validación y guardado, incluso espacios exteriores o restauración del texto. El paso del tiempo no produce transición local por expiresAt. Crear y gestionar su resultado pertenecen a [F004](../004-create-phrases/data-model.md).
