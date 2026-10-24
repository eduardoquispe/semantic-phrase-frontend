# Research: Validación de frases integrada

Investigación retrospectiva al 2026-10-23 mediante inspección local de implementación, configuración y tests, con revisión de un agente de investigación. Se documentan decisiones ya presentes; no se eligen tecnologías nuevas ni quedan aclaraciones de diseño pendientes.

## 1. Reglas locales antes de la comprobación

**Decision**: Mantener React Hook Form con resolver Zod, modo onChange y normalización mediante trim tras revisar caracteres. Longitud por puntos de código, hasta 280, con al menos 3 letras y sin emojis.

**Rationale**: `src/features/phrases/components/phrase-form/phrase-form.schema.ts` rechaza controles antes de recortar y emojis y letras insuficientes después; `phrase-form.component.tsx` usa la misma longitud recortada para el contador. No se depende de maxLength HTML ni se detecta idioma. La ayuda habla de palabra, pero la regla acepta una letra.

**Alternatives considered**: Validar exclusivamente con atributos HTML, recortar antes de inspeccionar controles o ampliar signos admitidos cambiaría el comportamiento documentado; no se adopta en este plan.

## 2. Separación por responsabilidades

**Decision**: Conservar componente, hook coordinador, mutación, servicio, mappers y acceso HTTP dentro de la capacidad phrases, con cliente compartido.

**Rationale**: `components/phrase-form/use-phrase-form.hook.ts`, `hooks/validate-phrase.hook.ts`, `services/phrases.service.ts`, `mappers/phrases.mapper.ts` y `data/phrases.data.ts` ya separan interacción, estado remoto, adaptación y transporte. No se justifica refactorizar para documentar F003.

**Alternatives considered**: HTTP directo desde el componente o infraestructura nueva transversal añadirían cambios fuera de alcance.

## 3. Una operación en curso y resultado ligado al texto

**Decision**: Mantener isBusy y referencia inFlight; limpiar resultados y errores de operación al editar o iniciar otra validación válida.

**Rationale**: `use-phrase-form.hook.ts` bloquea carreras antes del siguiente render mediante useRef; `phrase-form.component.tsx` bloquea edición y acciones, declara aria-busy y resetea mutaciones en onChange. Restaurar un texto anterior no restaura su validación. El resultado se guarda en la mutación, sin una caché persistente por texto.

**Alternatives considered**: Reutilizar resultados por igualdad de texto o confiar únicamente en botones deshabilitados cambiaría las garantías actuales. Validar y guardar automáticamente también contradice F003.

## 4. Contrato y propiedad de la decisión

**Decision**: Consumir POST /v1/phrase-validations con text y conservar validationId, expiresAt, requiresConfirmation y match. La API determina confirmación y similitud.

**Rationale**: DTO e interfaces tipan match como null, vector con score numérico o textual_exact con score null. El mapper reconstruye la respuesta sin validación runtime. `phrase-validation-feedback.component.tsx` prioriza requiresConfirmation: false oculta la candidata; true sin candidata conserva el aviso general. Solo la presentación semántica redondea score × 100.

**Alternatives considered**: Umbral local, porcentaje para coincidencia exacta, interpretación automática como duplicado o validación runtime nueva ampliarían la implementación existente.

## 5. Fallos y límites temporales

**Decision**: Conservar retry false y reintento manual; presentar detail Axios no vacío o mensaje genérico. Preservar expiresAt sin temporizador local.

**Rationale**: `validate-phrase.hook.ts` no reintenta ni invalida listado; `src/shared/utils/get-error-message.ts` ignora códigos y errores por campo. La UI conserva el texto original ante fallos. La recuperación de una comprobación vencida durante creación pertenece a F004.

**Alternatives considered**: Reintentos automáticos, recuperación por códigos, cuenta regresiva o bloqueo al vencer requerirían cambios de producto que el spec no solicita.

## 6. Entorno y verificación

**Decision**: Usar pnpm y la configuración existente de Vitest, jsdom, Testing Library y MSW; complementar con escenarios manuales contra API real o servidor controlado.

**Rationale**: package.json y vite.config.ts acreditan el runner actual aunque AGENTS.md describe el scaffold anterior. `phrase-form.spec.tsx` cubre interacción, recorte, errores, pendiente, advertencias y descarte; `use-phrase-form.hook.spec.tsx`, `validate-phrase.hook.spec.tsx`, `phrases.service.spec.ts` y `phrases.mapper.spec.ts` cubren límites entre capas. `phrases.data.spec.ts` prueba HTTP de creación, no la petición HTTP de validación: no se le atribuye esa cobertura. No se presume cobertura exhaustiva de todos los caracteres y límites del spec.

**Alternatives considered**: Incorporar otro runner, backend o suite nueva no es necesario para la entrega documental. Pasar pruebas con mocks no sustituye validación manual end-to-end.

**Operational finding**: `src/shared/api/http-client.ts` usa VITE_API_BASE_URL y los paths de phrases.data.ts incluyen /v1. El .env.example termina en /api/v1 y duplica ese segmento al combinarse. El quickstart exige comprobar la base del entorno; no se modifica configuración ni se declara un prefijo de servidor sin evidencia.

## Resultado de Phase 0

Las decisiones técnicas se resuelven a partir del repositorio. No quedan NEEDS CLARIFICATION. Disponibilidad de la API, datos de prueba y prefijo real son prerrequisitos de ejecución, no decisiones de diseño pendientes. No se afirman metas de rendimiento ni garantías del backend.
