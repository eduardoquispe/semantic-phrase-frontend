# Research: Listado de frases guardadas

**Fecha**: 2026-10-23 | **Feature**: `002-list-phrases`

Investigación retrospectiva sobre código y pruebas locales. Las alternativas se descartan para este alcance, sin atribuir decisiones históricas al equipo.

## 1. Responsabilidades

**Decision**: Describir componentes → hook → servicio → data → Axios; DTO y mapper propios de phrases.

**Rationale**: Ya separa presentación, consulta, transformación y transporte. El router monta PhrasesPage en `/`.

**Alternatives considered**: Fetch en componente o repositorio adicional requerirían cambiar la implementación.

**Evidencia**: `src/features/phrases/`, `src/app/app.router.tsx`, `src/shared/api/http-client.ts`.

## 2. Paginación y caché

**Decision**: Estado inicial page=1, tamaño de UI 20 y clave `['phrases', { page, limit }]`.

**Rationale**: El hook admite otros tamaños pero la pantalla fija 20. El provider configura staleTime=60000, retry=1 y refetchOnWindowFocus=false. Navegación usa metadatos con fallback `meta?.page || 1` y `meta?.totalPages || 1`.

**Alternatives considered**: Scroll infinito, selección de tamaño, página en URL o placeholder de página anterior no existen en el flujo.

**Evidencia**: `src/features/phrases/hooks/phrases-list.hook.ts`, `src/features/phrases/components/phrase-list/phrase-list.component.tsx`, `src/providers/query.provider.tsx`.

## 3. API y configuración

**Decision**: Documentar GET /v1/phrases relativo a VITE_API_BASE_URL con page/limit y respuesta `{ data, meta }`.

**Rationale**: Axios configura base y data añade sufijo. .env.example incluye http://localhost:3000/api/v1; combinado duplica /v1. Para un servidor que exponga /api/v1/phrases, la base correspondiente es http://localhost:3000/api. El prefijo efectivo depende del backend disponible.

**Alternatives considered**: Corregir configuración/rutas queda fuera del alcance. No inventar códigos de error, autenticación ni restricciones del servidor.

**Evidencia**: `.env.example`, `src/shared/api/http-client.ts`, `src/features/phrases/data/phrases.data.ts` y `phrases.dto.ts`.

## 4. Fecha y orden

**Decision**: Conservar id, texto, orden y meta; convertir createdAt con `new Date(value).toLocaleDateString()`.

**Rationale**: Es el mapper existente. La cadena de presentación depende del locale y zona del navegador; recientes primero depende de la API.

**Alternatives considered**: Locale fijo, UTC, orden local o validación runtime cambiarían comportamiento. Los tipos TS no validan respuestas HTTP en ejecución.

**Evidencia**: `src/features/phrases/mappers/phrases.mapper.ts` y su prueba.

## 5. Guardado y actualización

**Decision**: Invalidar prefijo `['phrases']` al guardar correctamente, conservando página local.

**Rationale**: useSavePhrase devuelve la promesa de invalidación en onSuccess; no reinicia selección ni invalida por fallo. Las páginas inactivas quedan invalidadas sin garantizar descarga inmediata.

**Alternatives considered**: Inserción optimista, recargar documento y volver a página 1 no están implementados.

**Evidencia**: `src/features/phrases/hooks/save-phrase.hook.ts` y su prueba.

## 6. Estados y cobertura

**Decision**: Registrar ausencia de mensajes de carga/error/reintento, vacío con «0 frases», contador sin cifra sin datos y literal «1 frases».

**Rationale**: PhraseList solo consume data. Hay pruebas de listado, filas, paginación, hook, servicio, mapper y guardado. El test HTTP de data cubre creación, no GET de listado. Los mocks no prueban backend real, lectura a 320 px ni recorrido de 45 registros.

**Alternatives considered**: Agregar UX o tests nuevos ampliaría la documentación solicitada. Quickstart describe validación pendiente sin afirmar ejecución manual.

**Evidencia**: Componentes y archivos `*.spec.ts(x)` de `src/features/phrases/`, `package.json`.

## Resolución

Sin aclaraciones de diseño pendientes. Backend, datos controlados y URL efectiva deben comprobarse al ejecutar escenarios manuales.
