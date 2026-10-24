# Research: Creación de frases integrada

Investigación retrospectiva al 2026-10-23 basada en implementación y pruebas locales; sin propuestas nuevas.

## Entrada y normalización

- **Decision**: Conservar React Hook Form con zodResolver y phraseFormSchema. Comprobar caracteres de control de la entrada original antes de trim; después, longitud por Array.from, ausencia de emojis y al menos 3 letras Unicode.
- **Rationale**: El esquema entrega valores normalizados a validar y guardar. Contador y esquema cuentan puntos de código. Servicio y mappers conservan el texto recibido sin normalizarlo nuevamente. Tabs y saltos se rechazan incluso en extremos.
- **Alternatives considered**: Validación solo en servidor, detección del idioma o nuevos límites no corresponden al código actual.
- **Evidence**: components/phrase-form/phrase-form.schema.ts, use-phrase-form.hook.ts y phrase-form.component.tsx bajo src/features/phrases.

## Separación de comprobación y creación

- **Decision**: Submit y Enter validan; guardar es otra acción y requiere validate.data. Enviar validationId y añadir confirmed true solo si requiresConfirmation es verdadero.
- **Rationale**: usePhraseForm descarta la comprobación al editar o terminar cualquier intento de guardado. expiresAt se conserva sin temporizador ni bloqueo local por tiempo.
- **Alternatives considered**: Guardar con Enter, deducir confirmación del puntaje o renovar automáticamente comprobaciones ampliaría el flujo.
- **Evidence**: components/phrase-form/use-phrase-form.hook.ts y phrase-form.component.tsx.

## Transporte y contratos

- **Decision**: Mantener hooks → phraseService → phraseData → httpClient, con DTO y mappers. POST /v1/phrase-validations para comprobar y POST /v1/phrases para crear.
- **Rationale**: Axios usa VITE_API_BASE_URL; el servicio adapta createdAt con toLocaleDateString(). Los tipos de respuesta son estáticos, sin esquema de validación en runtime.
- **Alternatives considered**: Fetch desde componentes, nuevos adaptadores o reglas internas del backend no forman parte de lo implementado.
- **Evidence**: data/phrases.data.ts, data/phrases.dto.ts, services/phrases.service.ts, mappers/phrases.mapper.ts y src/shared/api/http-client.ts.

## Estados, concurrencia y errores

- **Decision**: Usar isBusy (isSubmitting y mutaciones pendientes) e inFlight como exclusión inmediata. Ambas mutaciones declaran retry false.
- **Rationale**: Input readOnly y botones deshabilitados mientras se procesa. Los fallos conservan texto; guardar fallido descarta comprobación y exige validar de nuevo. getErrorMessage muestra detail de error Axios si es string no vacío o el fallback genérico.
- **Alternatives considered**: Reintentos automáticos, idempotencia garantizada o recuperación especial por código/campo no están implementados.
- **Evidence**: hook del formulario, hooks/save-phrase.hook.ts, hooks/validate-phrase.hook.ts y src/shared/utils/get-error-message.ts.

## Coincidencias y listado

- **Decision**: requiresConfirmation gobierna aviso y acción. Solo vector muestra Math.round(score × 100); textual_exact no muestra porcentaje. Sin confirmación, una candidata no se presenta.
- **Rationale**: PhraseValidationFeedback no calcula umbrales. Con confirmación y match null usa el título semántico sin candidata. Guardar exitoso devuelve la promesa de invalidateQueries con prefijo ['phrases']; invalida caché y actualiza consultas activas antes de resolver la mutación. El listado conserva page en estado local, sin inserción optimista.
- **Alternatives considered**: Clasificación local, diálogo adicional, volver a página 1 o insertar manualmente el registro no corresponden al flujo existente.
- **Evidence**: components/phrase-validation-feedback, hooks/save-phrase.hook.ts y components/phrase-list/phrase-list.component.tsx.

## Verificación y contexto resuelto

- **Decision**: Usar pnpm lint, pnpm build y pnpm test existentes; documentar por separado escenarios manuales pendientes.
- **Rationale**: package.json y vite.config.ts ya configuran Vitest/jsdom, Testing Library y MSW. Hay pruebas de formulario, hooks, transporte, servicios, mappers y feedback. No se encontró cobertura explícita de todos los límites 280/281 y caracteres; no se afirma cobertura completa del esquema.
- **Alternatives considered**: Incorporar otro runner o afirmar integración real a partir de mocks queda fuera del alcance.

No quedan aclaraciones de diseño pendientes. No se infieren códigos HTTP de éxito, umbrales ni persistencia interna del backend. .env.example contiene http://localhost:3000/api/v1 y, combinado con paths del cliente, produce /api/v1/v1/...; contrato y quickstart documentan la composición necesaria sin cambiar configuración. AGENTS.md conserva una descripción anterior sin runner; la documentación usa la configuración actual.
