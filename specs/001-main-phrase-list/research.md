# Phase 0 — Investigación F001

**Fecha**: 2026-10-22. Investigación basada en fuentes locales y revisión delegada de fronteras de componentes. No requiere nuevas tecnologías ni consultar servicios externos.

## 1. Alcance y stack

**Decision**: UI estática y ruta `/` con React Router y Tailwind ya declarados.

**Rationale**: HITL-001–003 y FR-011 excluyen operaciones de negocio. Vite solo configura React: instalar un paquete no significa haberlo integrado. Activar Tailwind en Vite y CSS es trabajo real de F001.

**Alternatives considered**: Query/Axios y RHF/Zod anticipan integración y validación excluidas; el CDN del prototipo contradice B03-D07. No añadir dependencias.

## 2. Feature frente a shared

**Decision**: Phrases posee página, formulario, listado, fila, paginador y muestras. Shared solo Button e Input genéricos. Cabecera e introducción se componen en la página.

**Rationale**: Textos y acciones de frases pertenecen a su capacidad de negocio. Las primitivas transversales están expresamente previstas por B03-D11 y por la petición del usuario. El paginador solo tiene uso demostrado en phrases; permanece ahí conforme a la constitución.

**Alternatives considered**: Extraer toda reutilización interna a shared confunde reutilización local con transversalidad. Un componente gigante mezcla responsabilidades. Card, Badge, Header, Layout, servicios y un motor de variantes extensible no aportan a F001.

## 3. Convenciones y ubicación

**Decision**: Kebab-case con sufijos y unidades autocontenidas con índices explícitos; apps/frontend y rama main.

**Rationale**: La skill expresamente solicitada prioriza B03-D13 frente a los archivos PascalCase de AGENTS. La spec registra main y el repositorio ubica aquí el frontend.

**Alternatives considered**: Cambiar AGENTS/constitución, mover a apps/web o crear una rama no es necesario para este workflow.

## 4. Muestras y formulario

**Decision**: Tres muestras readonly con texto, dateTime ISO con offset y etiqueta visible exacta. Campo nativo no controlado inicialmente vacío; contador fijo 0 / 280, Guardar disabled y botones type button.

**Rationale**: FR-003 no requiere contador dinámico ni validación. FR-004 fija las fechas; etiquetas estáticas evitan variaciones por zona horaria. La escritura nativa no produce resultados ni actualiza el contador de la maqueta. Recargar restablece la presentación.

**Alternatives considered**: Estado global, DTOs, mappers, UUIDs inventados y formateo de fechas dependiente del navegador añaden complejidad o cambian la referencia.

## 5. Paginación visual

**Decision**: Props page y totalPages, enteros desde 1; muestra inicial (1, 1), sin handlers ni navegación. Revisar también (1, 3), (2, 3) y (3, 3) mediante montaje temporal en desarrollo.

**Rationale**: US3 exige cuatro presentaciones, sin cambiar datos. Solo hacen falta las condiciones page > 1 y page >= totalPages.

**Alternatives considered**: Páginas funcionales, URL state, datos extra y controles avanzados exceden FR-006. totalPages cero pertenece al estado vacío e integración futura, fuera de F001.

## 6. Visual y verificación

**Decision**: Trasladar la referencia a Tailwind compilado; DM Sans de Google Fonts como el prototipo, respaldo sans-serif, paleta aprobada, breakpoints 640/1024 px y lista máxima 360 px explícitos. Lint/build y revisión manual; sin configurar runner automático para marcado estático.

**Rationale**: Las fuentes aprobadas fijan el diseño. Expresar 360 px evita depender del significado de una clase del prototipo entre versiones de Tailwind. La fuente es un recurso visual externo opcional para el renderizado con respaldo; no requiere backend.

**Alternatives considered**: Rediseñar, sustituir tipografía, añadir UI kit, Sass o infraestructura de pruebas no es necesario para esta entrega.

## Fuentes

- [Spec](spec.md), [constitución](../../.specify/memory/constitution.md), [AGENTS](../../AGENTS.md) y [skill de arquitectura](../../.agents/skills/screaming-architecture/SKILL.md).
- [Arquitectura B03](../../../../docs/03-architecture/03-frontend-architecture.md), [UI/UX](../../../../docs/02-ui/ui-spec.md), [prototipo](../../../../prototypes/ui/index.html) y [Product Brief](../../../../docs/00-discovery/product-brief.md).
- [OpenAPI](../../../../docs/03-architecture/openapi.yaml): consulta futura por page/limit, campos id/text/createdAt y orden descendente. No se conecta ni modifica; tampoco se inventa DELETE.
- [package.json](../../package.json), [Vite](../../vite.config.ts), [entrada](../../src/main.tsx) e [index.html](../../index.html).

Sin aclaraciones técnicas pendientes. Las discrepancias sobre reglas de validación, puntajes y eliminación pertenecen a futuras integraciones.
