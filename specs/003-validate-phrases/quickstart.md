# Quickstart: Validación de frases integrada

Guía de verificación del comportamiento existente, sin implementar funcionalidades. Ejecutar comandos desde `apps/frontend`.

## Prerrequisitos

Node y pnpm compatibles con el proyecto, dependencias instaladas mediante `pnpm install` si faltan. Los tests existentes usan Vitest, jsdom, Testing Library y MSW, configurados en `vite.config.ts` y `src/test/test-setup.ts`; convención `*.spec.ts` / `*.spec.tsx` junto al código.

Para revisión manual end-to-end se necesita una API con comprobación, datos conocidos para coincidencia exacta/semántica y CORS compatible. Verificar `VITE_API_BASE_URL`: los paths ya empiezan en `/v1`; el ejemplo actual duplica ese segmento si se usa tal cual. Véase [contrato HTTP](contracts/http-contract.md). Reiniciar Vite si cambia el entorno.

## Comandos

```sh
pnpm lint
pnpm build
pnpm test -- src/features/phrases/components/phrase-form/phrase-form.spec.tsx src/features/phrases/components/phrase-form/use-phrase-form.hook.spec.tsx src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.spec.tsx src/features/phrases/hooks/validate-phrase.hook.spec.tsx src/features/phrases/data/phrases.data.spec.ts src/features/phrases/services/phrases.service.spec.ts src/features/phrases/mappers/phrases.mapper.spec.ts
pnpm dev
```

Abrir la URL local emitida por Vite. Las pruebas usan servicios simulados/MSW y no acreditan disponibilidad del backend real. `pnpm test` ejecuta la suite completa si se necesita una comprobación más amplia.

## Escenarios manuales

Usar Network para distinguir peticiones de comprobación, creación y listado. Ignorar la carga inicial y posibles refetch por foco del navegador; atribuir únicamente las peticiones disparadas por la acción. No pulsar Guardar durante estos escenarios.

| Escenario | Pasos | Resultado esperado |
| --- | --- | --- |
| Inicio / US1 | Abrir formulario. | Texto vacío, 0 / 280, Validar activo, Guardar deshabilitado. |
| Recorte / US1 | Escribir «  Hola mundo  »; pulsar Validar; repetir con Enter. | Contador 10 / 280; body text «Hola mundo»; una comprobación por envío, ninguna creación ni invalidación del listado por validar. |
| Reglas / US2 | Probar vacío, espacios, números sin letras, 281 letras; luego una letra y 280 letras. | Entradas inválidas muestran error y no hacen petición; límites válidos permiten comprobar. |
| Caracteres / US2 | Probar Hola!, Hola?, emoji, tabulación/salto de línea y separadores mediante pegado cuando el navegador los conserve. | Caracteres prohibidos rechazados si llegan al esquema; no confundir el saneamiento nativo del input con validación del esquema. Usar tests para controles que el input elimina. |
| Sin confirmación / US1, US3 | Obtener requiresConfirmation false, también con candidata. | Éxito; Guardar activo; candidata y porcentaje ocultos. |
| Exacta / US3 | Validar un texto conocido que devuelva textual_exact y confirmación. | Título exacto, frase existente y aviso de no guardado; sin porcentaje. |
| Semántica / US3 | Validar texto con vector y confirmación. | Título semántico, candidata, porcentaje redondeado y explicación; Guardar de todos modos. |
| Caso defensivo / US3 | Con respuesta controlada, devolver true con match null. | Advertencia general sin candidata ni porcentaje; no inventa datos. |
| Operación en curso / US4 | Mantener petición pendiente mediante servidor controlado; hacer doble clic y Enter e intentar editar. | Validando…, aria-busy, readOnly, botones bloqueados; un intento. El throttling por sí solo no garantiza retrasar una API local. |
| Fallo y reintento / US4 | Provocar rechazo del endpoint; reintentar con respuesta pendiente y luego exitosa. | Texto original conservado; detalle o genérico; sin retry automático. Nuevo intento borra error y deja Guardar bloqueado hasta éxito. |
| Editar / US4 | Después del éxito, cambiar texto, restaurarlo y cambiar solo espacios exteriores. | Cada edición descarta resultado; Guardar bloqueado hasta validar otra vez. |
| Revalidar / US1 | Tras éxito, activar Validar sin editar. | Resultado desaparece mientras espera; no guarda automáticamente. |
| Vencimiento / FR-010 | Con respuesta controlada, usar expiresAt pasado. | No hay cuenta regresiva ni bloqueo local por fecha; rechazo al crear pertenece a F004. |

Para estados deterministas (score 0,914, candidata con false, true sin candidata, vencimiento o detail vacío), usar las pruebas existentes o un servidor de prueba que devuelva las respuestas del contrato. No alterar producción para obtenerlos.

## Evidencia y límites

Registrar por separado resultados de lint, build, pruebas automatizadas y escenarios manuales: comandos, conteos, fecha y entorno. No dar por verificado un escenario manual por haber leído código o pasado mocks. Esta guía no acredita rendimiento, algoritmos del backend ni creación; véanse [modelo](data-model.md), [contrato UI](contracts/ui-contract.md) y [F004](../004-create-phrases/spec.md).

## Verificación ejecutada — 2026-10-23

- `pnpm lint`: PASS.
- `pnpm build`: PASS; aviso de Vite por un chunk minificado mayor de 500 kB, sin impedir el build.
- Comando de pruebas indicado arriba: PASS, 17 archivos y 79 pruebas. La invocación con `--` ejecutó la suite completa en esta configuración; no se presenta como ejecución limitada a los siete paths indicados.
- Escenarios manuales contra API real: pendientes; esta entrega documental no incluye validación end-to-end en navegador.
- Revisión documental: enlaces Markdown locales y referencias cruzadas de los artefactos generados comprobados.

### Registro retrospectivo de implementación — 2026-10-23

- FR-001–FR-010 registrados como implementados mediante revisión del código, con checks en [plan.md](plan.md#registro-de-implementación-existente).
- Reejecución focalizada con `pnpm exec vitest run src/features/phrases/components/phrase-form/phrase-form.spec.tsx src/features/phrases/components/phrase-form/use-phrase-form.hook.spec.tsx src/features/phrases/components/phrase-validation-feedback/phrase-validation-feedback.spec.tsx src/features/phrases/hooks/validate-phrase.hook.spec.tsx src/features/phrases/services/phrases.service.spec.ts src/features/phrases/mappers/phrases.mapper.spec.ts`: PASS, 6 archivos y 50 pruebas. Incluye algunas pruebas de creación por compartir archivos; no implica cobertura exhaustiva de F003.
- Solo se actualizó documentación. No se repitieron lint ni build en este registro; los resultados anteriores se conservan arriba. La verificación manual contra API real continúa pendiente.
