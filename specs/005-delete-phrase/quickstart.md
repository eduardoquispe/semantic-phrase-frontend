# Quickstart: Validar eliminación con confirmación

Ejecutar desde `apps/frontend`. Guía para verificar la funcionalidad una vez implementada según este plan; no describe comportamiento ya existente.

## Prerrequisitos y comandos

- Node compatible, pnpm y dependencias del lockfile.
- API de prueba accesible, con DELETE `/v1/phrases/{id}` disponible según el [contrato HTTP](contracts/http-contract.md), y CORS compatible.
- Al menos una frase existente para eliminar, y suficientes frases para dejar una página con un único elemento (probar el edge case de página vacía).
- Forma de provocar, por separado, un 404 `PHRASE_NOT_FOUND` (reintentar DELETE sobre una frase ya eliminada) y un fallo interno (500), sin asumir un comando de seed concreto.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
```

Vitest/jsdom están configurados en `vite.config.ts`, setup en `src/test/test-setup.ts`; convención existente `*.spec.ts`/`*.spec.tsx` junto al módulo.

Para una API que publique `/api/v1/phrases/{id}` en el puerto 3000:

```sh
VITE_API_BASE_URL=http://localhost:3000/api pnpm dev
```

Abrir la URL de Vite y la ruta `/`.

## Recorridos manuales

| Caso | Pasos y resultado esperado | Referencia |
| --- | --- | --- |
| Iniciar eliminación | Pulsar "Eliminar" en una frase visible: sin solicitud DELETE; aparece confirmación con el texto de esa frase. | US1.1, FR-001–002 |
| Confirmar | Pulsar "Confirmar": una única solicitud DELETE con el id correcto; controles deshabilitados mientras está pendiente; al resolver con éxito, la frase desaparece y el total baja en 1 sin recargar. | US1.2, FR-004, FR-006 |
| Clics repetidos | Durante "pending", pulsar repetidamente Confirmar/Eliminar de esa misma frase: no se observa una segunda solicitud DELETE en Network. | US1.3, FR-005 |
| Cancelar | Iniciar eliminación y pulsar "Cancelar": sin solicitud; la frase sigue visible e igual; reactivar "Eliminar" muestra una confirmación nueva e independiente. | US2.1–2, FR-003 |
| Fallo interno | Confirmar eliminación simulando 500: la frase permanece visible, se muestra un mensaje de error y "Eliminar"/"Confirmar" vuelven a estar disponibles; reintentar debe completar la eliminación si el servicio se restablece. | US3.1, FR-007 |
| Frase ya no existe | Confirmar eliminación simulando 404 `PHRASE_NOT_FOUND` (por ejemplo, eliminar la misma frase dos veces): se informa de forma distinguible de un error genérico y la frase deja de aparecer en el listado tras refrescar. | US3.2, FR-008 |
| Último elemento de la página | Eliminar el único elemento visible en la página actual (por ejemplo, página 2 con un elemento): tras el éxito, la página queda vacía y la pantalla usa el comportamiento existente (botón "Atrás" visible si corresponde, sin paginación nueva). | Edge case, SC-003 |
| Sin acción de restaurar | En ningún estado (éxito, error, ya no existe) se ofrece una acción para deshacer o restaurar la frase eliminada. | FR-009 |
| Sin modelo de permisos | Repetir los recorridos anteriores sin ningún inicio de sesión: las acciones de eliminar y confirmar están disponibles igual que para ver el listado. | FR-010 |

## Entradas y recuperación

1. Verificar que ningún DELETE se envía antes de confirmar explícitamente (inspeccionar Network durante el paso de confirmación).
2. Provocar un fallo de red (no HTTP) durante un DELETE confirmado: la frase permanece visible, no hay reintento automático y la UI no afirma si el servidor completó la eliminación.
3. Con respuestas controladas, comprobar que `detail` no vacío se muestra tal cual y que `detail` ausente/vacío cae al mensaje genérico de `getErrorMessage`.
4. Confirmar que un 404 `PHRASE_NOT_FOUND` nunca se presenta con el mismo texto que un 500, y que un 500 nunca hace desaparecer la frase del listado.

## Evidencia y alcance

Registrar comandos y resultados; para cada escenario manual, la solicitud DELETE observada (id, código de respuesta), el mensaje mostrado y el estado del listado antes/después. Revisar teclado y foco de la confirmación inline si se ejecuta revisión manual.

Esta guía no acredita ejecución manual ni integración real hasta que se registre evidencia bajo "Verificación de esta entrega"; al momento de este plan, la funcionalidad no está implementada.
