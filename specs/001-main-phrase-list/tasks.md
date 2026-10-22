# Tasks: F001 — Interfaz Principal y Listado de Frases

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contrato UI](contracts/ui-contract.md) y [quickstart.md](quickstart.md).

**Alcance**: Generación de tareas para UI estática y ruta `/`. Sin conexión API, persistencia, validación, contador dinámico, navegación funcional, hooks propios ni servicios. No introducir dependencias, capas o componentes adicionales al plan. La spec conserva su estado Draft; este documento no cambia su aprobación.

**Organización**: Tareas por historia, ordenadas por dependencias. Todas las rutas son relativas a `apps/frontend`. Archivos kebab-case con sufijos e índices explícitos según la decisión de naming del plan. Shared UI contiene solo Button/Input; las demás piezas pertenecen a phrases.

**Verificación**: No se solicitan pruebas automáticas ni TDD; no configurar runner, MSW ni archivos de pruebas. Se exige lint/build y revisión manual de los criterios de cada historia y del quickstart.

## Formato

`- [ ] TNNN [P opcional] [USn para historias] Descripción y rutas exactas`.

`[P]` indica tareas que pueden ejecutarse en paralelo una vez satisfechos sus prerrequisitos, sobre archivos distintos. No exige trabajar con agentes o varios desarrolladores.

## Phase 1: Setup

**Objetivo**: Activar los estilos con el stack existente; no reinicializar el proyecto.

- [X] T001 Activar `@tailwindcss/vite` junto al plugin React en `vite.config.ts` e importar Tailwind en `src/index.css`, sustituyendo los estilos globales del starter; usar dependencias ya declaradas, sin CDN ni SCSS.
- [X] T002 Configurar DM Sans 400–700 de Google Fonts y respaldo sans-serif, paleta base aprobada y fondo en `index.html` y `src/index.css`; establecer `lang="es"` y título `Frases`, conservando el montaje de Vite. Depende de T001 por editar el mismo CSS.

## Phase 2: Foundational

**Objetivo**: Proporcionar únicamente las dos primitivas compartidas necesarias. Depende de Phase 1 y bloquea las historias.

- [X] T003 [P] Crear Button con atributos nativos React, children, type button por defecto, disabled, atributos aria, foco visible y variantes visuales usadas para acción ordinaria, guardado y eliminación en `src/shared/components/ui/button/button.component.tsx`; exportarlo explícitamente desde `src/shared/components/ui/button/index.ts`. Altura mínima 44 px, sin etiquetas de negocio ni API polimórfica.
- [X] T004 [P] Crear Input como input nativo estilizado que propaga atributos HTML, id, aria-describedby, placeholder y className en `src/shared/components/ui/input/input.component.tsx`; exportarlo desde `src/shared/components/ui/input/index.ts`. Foco visible, sin estado propio, label, contador ni reglas de frases.

**Checkpoint**: Controles compartidos disponibles, sin imports desde features o app.

## Phase 3: US1 — Reconocer la pantalla principal (P1)

**Objetivo**: Presentar `/` con cabecera, introducción, formulario inicial y estructura de ambas tarjetas.

**Criterio independiente**: Abrir y recargar `/` sin backend; comprobar textos y regiones de US1, campo vacío, contador fijo 0 / 280 y Guardar disabled. Validar y Enter no envían formulario ni producen resultados. No aparecen advertencia precargada, indicador de coincidencia, galería ni pie de maqueta. Las filas pertenecen al incremento US2.

- [X] T005 [P] [US1] Crear la tarjeta PhraseForm en `src/features/phrases/components/phrase-form/phrase-form.component.tsx` y su exportación en `src/features/phrases/components/phrase-form/index.ts`; usar Button/Input, textos exactos del contrato, label y ayuda vinculada, input no controlado inicialmente vacío con autocomplete off, contador fijo y botones type button, Guardar permanentemente disabled y Validar sin efectos. No usar un form con envío implícito.
- [X] T006 [P] [US1] Crear la estructura presentacional de PhraseList en `src/features/phrases/components/phrase-list/phrase-list.component.tsx` y exportarla desde `src/features/phrases/components/phrase-list/index.ts`, con título, explicación y aviso compartido exactos del contrato; la colección y las filas se incorporan en US2, sin mostrar mensajes de lista vacía, carga o error durante este incremento.
- [X] T007 [US1] Crear PhrasesPage en `src/features/phrases/pages/phrases/phrases.page.tsx` y `src/features/phrases/pages/phrases/index.ts`, componiendo cabecera, introducción, main y ambas tarjetas mediante sus índices públicos, con jerarquía semántica, colores, bordes y radios del prototipo; excluir secciones didácticas y coincidencia inicial. Depende de T005 y T006.
- [X] T008 [US1] Registrar únicamente `/` mediante React Router en `src/app/app.router.tsx`, componer el root en `src/app/app.component.tsx` y actualizar `src/main.tsx` manteniendo StrictMode; retirar `src/App.tsx` y `src/App.css` al quedar sin uso y comprobar entrada directa y recarga. Depende de T007; sin rutas adicionales ni providers remotos.

**Checkpoint**: US1 revisable como composición de pantalla; completar US2 para mostrar el contenido ilustrativo completo.

## Phase 4: US2 — Leer el listado ilustrativo (P1)

**Objetivo**: Mostrar las tres filas aprobadas y sus acciones visuales.

**Criterio independiente**: Cotejar las tres frases, orden y fechas con data-model y prototipo; total 3 frases, time correcto, Eliminar con nombre específico y aviso compartido. Activar acciones mantiene filas y contador, sin diálogo, mensajes de éxito ni solicitudes de negocio.

- [X] T009 [US2] Definir el tipo readonly PhraseListItemData con text, dateTime y dateLabel y las props mínimas de fila en `src/features/phrases/components/phrase-list-item/phrase-list-item.types.ts`; exportar los tipos desde `src/features/phrases/components/phrase-list-item/index.ts`. Sin entidades persistidas, DTOs o IDs inventados.
- [X] T010 [P] [US2] Crear la colección readonly de tres muestras en `src/features/phrases/components/phrase-list/phrase-list.examples.ts`, copiando textos, orden, ISO con offset y etiquetas de fecha exactas de `specs/001-main-phrase-list/data-model.md`; importar el tipo por la superficie pública de phrase-list-item. Depende de T009.
- [X] T011 [P] [US2] Crear PhraseListItem en `src/features/phrases/components/phrase-list-item/phrase-list-item.component.tsx` y añadir su exportación a `src/features/phrases/components/phrase-list-item/index.ts`; presentar li, frase entre comillas tipográficas, time/dateTime y Button Eliminar con aria-label `Eliminar: {text}`, sin handler de negocio. Depende de T009 y puede ejecutarse junto con T010.
- [X] T012 [US2] Completar la colección readonly por props en `src/features/phrases/components/phrase-list/phrase-list.types.ts` y `src/features/phrases/components/phrase-list/phrase-list.component.tsx`; derivar el total, renderizar ul y filas con text como key de estas muestras únicas, exportar muestras y tipos explícitos desde `src/features/phrases/components/phrase-list/index.ts` y pasarlas desde `src/features/phrases/pages/phrases/phrases.page.tsx`. Depende de T010 y T011; conservar las etiquetas de fecha sin transformarlas según zona horaria.

**Checkpoint**: Pantalla y listado ilustrativo completos, todavía sin paginador.

## Phase 5: US3 — Reconocer la navegación entre páginas (P2)

**Objetivo**: Incorporar los cuatro estados visuales de paginación con lógica mínima.

**Criterio independiente**: Revisar (page, totalPages) = (1,1), (1,3), (2,3), (3,3): Atrás ausente en primera página y habilitado desde segunda; Siguiente visible y disabled al terminar. Activaciones no cambian filas, URL ni props.

- [X] T013 [US3] Crear PhrasePagination y sus props page/totalPages en `src/features/phrases/components/phrase-pagination/phrase-pagination.component.tsx` y `src/features/phrases/components/phrase-pagination/phrase-pagination.types.ts`, exportados en `src/features/phrases/components/phrase-pagination/index.ts`; usar nav con nombre `Paginación de frases` y Button. Implementar solo `page > 1` para mostrar `← Atrás` y `page >= totalPages` para disabled de `Siguiente →`; sin callbacks, estado, normalizadores ni controles avanzados. Requiere Phase 2; puede prepararse antes de terminar US2.
- [X] T014 [US3] Integrar PhrasePagination al final del listado en `src/features/phrases/components/phrase-list/phrase-list.component.tsx` con page 1 y totalPages 1; revisar temporalmente los otros tres pares siguiendo `specs/001-main-phrase-list/quickstart.md` y restaurar (1,1), sin añadir galerías, rutas o datos extra. Depende de T012 y T013.

**Checkpoint**: Paginador visual integrado; muestra inicial sin Atrás y con Siguiente deshabilitado.

## Phase 6: US4 — Revisar la pantalla en móvil y con teclado (P2)

**Objetivo**: Completar adaptación, lectura de frases largas y acceso por teclado sobre la pantalla integrada. La semántica y foco básicos se incorporan desde cada componente, no se posponen a esta fase.

**Criterio independiente**: Revisar 375/640/1023/1024/1440 px y una ventana mayor; máximo 1440 px, columnas desde 1024, acciones en fila desde 640, sin solapamientos. Tab/Shift+Tab muestran foco; lista admite scroll con teclado y botones disabled comunican su estado.

- [X] T015 [P] [US4] Completar el contenedor de máximo 1440 px, padding 16/32/48 px y grid de tarjetas apiladas o columnas 1.02fr/0.98fr desde 1024 px en `src/features/phrases/pages/phrases/phrases.page.tsx`; ajustar acciones apiladas en móvil y en fila desde 640 px en `src/features/phrases/components/phrase-form/phrase-form.component.tsx`, respetando la disposición del prototipo. Depende de T014 para revisar la pantalla integrada.
- [X] T016 [P] [US4] Completar lista de máximo 360 px con overflow vertical, tabIndex 0, nombre accesible y foco visible en `src/features/phrases/components/phrase-list/phrase-list.component.tsx`; asegurar ajuste de frases y cadenas largas sin superposición con fecha/acción en `src/features/phrases/components/phrase-list-item/phrase-list-item.component.tsx`. Depende de T014 y puede ejecutarse junto con T015.
- [X] T017 [US4] Revisar y corregir teclado, alturas mínimas 44 px, foco y estados disabled en `src/shared/components/ui/button/button.component.tsx` y `src/shared/components/ui/input/input.component.tsx`, así como labels/ayuda en `src/features/phrases/components/phrase-form/phrase-form.component.tsx` y nombres de navegación en `src/features/phrases/components/phrase-pagination/phrase-pagination.component.tsx`; aplicar solo ajustes concretos detectados, después de T015 y T016.

**Checkpoint**: US1–US4 completas en presentación, sin añadir comportamiento de negocio.

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T018 Revisar exports e imports de `src/app/app.router.tsx`, `src/features/phrases/pages/phrases/index.ts`, `src/features/phrases/components/phrase-list/index.ts`, `src/features/phrases/components/phrase-list-item/index.ts`, `src/features/phrases/components/phrase-pagination/index.ts`, `src/features/phrases/components/phrase-form/index.ts` y `src/shared/components/ui/button/index.ts` / `src/shared/components/ui/input/index.ts`; corregir solo imports indebidos, ciclos, restos del starter o exports innecesarios, sin crear barrels generales, capas ni unidades vacías.
- [X] T019 Ejecutar `pnpm lint` y `pnpm build` desde apps/frontend usando los scripts de `package.json`; resolver fallos vinculados a la entrega y anotar comandos y resultados reales en `specs/001-main-phrase-list/validation.md`. No añadir scripts de pruebas ni dependencias.
- [ ] T020 Ejecutar los escenarios manuales completos de `specs/001-main-phrase-list/quickstart.md` con `pnpm dev`, cotejar diseño con `../../prototypes/ui/index.html` y `../../docs/02-ui/ui-spec.md`, registrar navegador, anchos, cuatro estados del paginador, teclado y ausencia de solicitudes de negocio en `specs/001-main-phrase-list/validation.md`, y guardar capturas en `specs/001-main-phrase-list/screenshots/mobile.png` y `specs/001-main-phrase-list/screenshots/desktop.png`; restaurar toda edición temporal y repetir lint/build solo si el código definitivo cambió.

## Dependencies & Execution Order

Orden recomendado: Setup → Foundational → US1 → US2 → US3 → US4 → verificación final.

```text
T001 → T002 → (T003 || T004)
                    ↓
              (T005 || T006) → T007 → T008       US1
                                        ↓
                          T009 → (T010 || T011) → T012   US2
Foundation → T013 ────────────────────────────────┤
                                                 ↓
                                               T014     US3
                                                 ↓
                                         (T015 || T016) → T017   US4
                                                            ↓
                                                   T018 → T019 → T020
```

- Todas las historias requieren Phase 2. US1 necesita el contenedor inicial del listado de T006, pero no las filas de US2 para su revisión de composición.
- US2 se desarrolla tras US1 por ampliar PhraseList y conectar muestras en la misma página. La fila y las muestras pueden revisarse por separado tras T009; la aceptación de US2 se realiza en la ruta integrada tras T012.
- US3 puede preparar su componente tras Phase 2; su integración necesita US2. T013 y T014 son secuenciales entre sí.
- US4 revisa la pantalla integrada; T015/T016 trabajan archivos distintos. T017 espera ambas por compartir archivos con T015.
- Verificación final espera las cuatro historias. No ejecutar tareas concurrentes que editen el mismo índice o componente.

## Parallel Examples by User Story

| Historia | Ejemplo concreto | Prerrequisitos |
| --- | --- | --- |
| US1 | T005 formulario y T006 estructura del listado | Phase 2 completa; luego unir en T007 |
| US2 | T010 muestras y T011 fila | T009 completo; luego integrar en T012 |
| US3 | T013 paginador puede prepararse mientras se trabaja US1/US2 | Phase 2 completa; no paralelizar T013 con T014 |
| US4 | T015 layout/formulario y T016 scroll/filas | T014 completo; después T017 |

## Implementation Strategy

1. Completar Setup y las dos primitivas compartidas sin carpetas o configuración adicional.
2. Entregar US1 como primer incremento revisable de ruta y composición. No anunciar F001 completa porque aún faltan las filas; el MVP visual útil combina US1 y US2, ambas P1.
3. Completar US2 con los tres ejemplos; revisar contenido y acciones sin efectos.
4. Añadir US3 con sus dos condiciones y verificar los cuatro estados sin ampliar el producto.
5. Completar US4 y ejecutar verificación final. El alcance completo solicitado incluye las cuatro historias.

## Trazabilidad y límites

| Requisitos | Tareas principales |
| --- | --- |
| FR-001 ruta | T007–T008 |
| FR-002 jerarquía y textos | T005–T007, T012 |
| FR-003 formulario inicial | T005 |
| FR-004 muestras y total | T009–T012 |
| FR-005 filas y nombres | T011–T012 |
| FR-006 paginación | T013–T014 |
| FR-007 dirección visual | T001–T007, T011–T017, T020 |
| FR-008 adaptación y scroll | T015–T016 |
| FR-009 accesibilidad e idioma | T002–T005, T007, T011, T013, T016–T017 |
| FR-010 separación de componentes | T003–T018 |
| FR-011 sin negocio ni API | T005, T011–T014, T020 |
| FR-012 excluir estados didácticos | T007, T020 |

No implementar handlers vacíos, éxito simulado, reglas semánticas, contador dinámico, diálogos, estado remoto, schemas, clientes HTTP, DTOs, mappers ni servicios. Los controles visuales pueden usar simplemente comportamiento nativo sin callbacks. Las capturas y validation.md son evidencia de implementación futura, no entregables que este comando afirme haber verificado.

## Estado de ejecución — 2026-10-22

T001–T019 implementadas y revisadas localmente. Los cuatro pares del paginador se montaron mediante renderizado estático de React, sin cambiar la integración definitiva (1,1). T020 queda a cargo del usuario por instrucción explícita: comprobación en navegador y capturas. Véase [validation.md](validation.md) para resultados reales y límites de la verificación.
