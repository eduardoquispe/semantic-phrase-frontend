# Feature Specification: F001 — Interfaz Principal y Listado de Frases

**Feature Branch**: `main` (rama existente; sin creación de rama para esta especificación)

**Created**: 2026-10-22

**Status**: Draft — aclaraciones HITL resueltas; pendiente de aprobación del documento

**Input**: Definir F001 del frontend respetando las fuentes aprobadas. Alcance aclarado por el usuario: solo UI, rutas, componentes de página y reutilizables, página y maquetación. Estado elegido: formulario inicial vacío y listado ilustrativo. Variación aprobada: paginador simple con Siguiente, Atrás desde la segunda página y Siguiente deshabilitado al terminar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconocer la pantalla principal (Priority: P1)

Como persona que abre la aplicación, quiero encontrar la presentación aprobada del producto, el área para una nueva frase y la lista compartida en una única pantalla coherente.

**Why this priority**: Define la superficie visual sobre la que se incorporarán los flujos posteriores.

**Independent Test**: Abrir directamente la ruta principal y verificar su composición sin disponibilidad de servicios externos.

**Acceptance Scenarios**:

1. **Given** una visita a la ruta principal, **When** se presenta la página, **Then** aparecen la cabecera «Frases», «Lista compartida · Español», el título «Cada idea, una frase.», la explicación aprobada y las tarjetas «Nueva frase» y «Frases guardadas».
2. **Given** la pantalla inicial, **When** se revisa el formulario, **Then** el campo «Frase en español» está vacío, muestra «Escribe una frase corta», ayuda de una línea y longitud, contador «0 / 280», y las acciones separadas «Validar» y «Guardar», esta última deshabilitada.
3. **Given** la pantalla inicial, **When** se revisa su contenido, **Then** no aparece una advertencia de coincidencia precargada, la galería «Estados para revisar» ni el pie que identifica el archivo de referencia como maqueta estática.
4. **Given** la aplicación presentada, **When** se recarga la ruta principal, **Then** se vuelve a presentar la misma página y su estado ilustrativo inicial, sin depender de datos remotos.

---

### User Story 2 - Leer el listado ilustrativo (Priority: P1)

Como persona que revisa la interfaz, quiero leer ejemplos de frases con fecha, hora y acción de eliminación para evaluar la composición del listado compartido.

**Why this priority**: El listado es la segunda sección principal de F001 y debe poder revisarse sin integración de negocio.

**Independent Test**: Revisar las tres filas de muestra y cotejarlas con el prototipo aprobado.

**Acceptance Scenarios**:

1. **Given** la página inicial, **When** se revisa «Frases guardadas», **Then** se muestran «3 frases» y las tres filas ilustrativas del prototipo en el mismo orden, cada una con texto, fecha, hora y acción «Eliminar».
2. **Given** cada fila, **When** se inspecciona la acción «Eliminar», **Then** su nombre accesible identifica también el texto de la frase correspondiente.
3. **Given** el listado, **When** se revisa el aviso inferior, **Then** se lee «Esta lista es compartida: cualquier persona puede ver y eliminar sus frases.».
4. **Given** los controles de la maqueta, **When** se activan «Validar» o «Eliminar», **Then** no se solicitan validaciones, guardados ni eliminaciones y las frases ilustrativas no se modifican.

---

### User Story 3 - Reconocer la navegación entre páginas (Priority: P2)

Como persona que revisa el listado, quiero reconocer las acciones disponibles para avanzar o retroceder, sin un paginador avanzado.

**Why this priority**: Incorpora la variación visual aprobada expresamente durante HITL.

**Independent Test**: Presentar el paginador con estados de primera página, página intermedia y última página, sin consultar servicios ni cambiar los datos ilustrativos.

**Acceptance Scenarios**:

1. **Given** la primera página de un conjunto con páginas posteriores, **When** se presenta el paginador, **Then** aparece «Siguiente →» habilitado y no aparece «Atrás».
2. **Given** una página intermedia, **When** se presenta el paginador, **Then** aparecen «← Atrás» y «Siguiente →» habilitados.
3. **Given** la última página de un conjunto con varias páginas, **When** se presenta el paginador, **Then** «← Atrás» está habilitado y «Siguiente →» permanece visible y deshabilitado.
4. **Given** la muestra inicial de tres frases, que cabe en una sola página, **When** se presenta el paginador, **Then** no aparece «Atrás» y «Siguiente →» aparece deshabilitado.

---

### User Story 4 - Revisar la pantalla en móvil y con teclado (Priority: P2)

Como persona que utiliza una pantalla pequeña o navega con teclado, quiero poder leer el contenido y reconocer los controles sin perder la composición aprobada.

**Why this priority**: La adaptación y la accesibilidad forman parte de la referencia aprobada.

**Independent Test**: Revisar la misma página en anchos móvil y escritorio y recorrer sus controles con teclado.

**Acceptance Scenarios**:

1. **Given** un ancho inferior al punto de dos columnas de la referencia, **When** se presenta la pantalla, **Then** las tarjetas se apilan, primero «Nueva frase» y después «Frases guardadas»; en escritorio se muestran lado a lado.
2. **Given** acciones del formulario en móvil, **When** se revisan, **Then** se apilan; a partir del punto de fila de la referencia, se presentan en una fila.
3. **Given** navegación con teclado, **When** se recorre la página, **Then** los controles habilitados muestran foco visible, los deshabilitados comunican su estado y cada control tiene un nombre comprensible.
4. **Given** textos de frase que ocupan varias líneas, **When** se presenta el listado, **Then** se pueden leer sin superposición con la fecha o la acción; si el listado supera su altura máxima, admite desplazamiento vertical propio accesible con teclado.

### Edge Cases

- Una sola página: no se presenta «Atrás» y «Siguiente →» queda deshabilitado, sin inventar frases adicionales para demostrar paginación.
- Primera y última página de un conjunto de varias páginas: las acciones cumplen los límites de User Story 3. No se requieren páginas numeradas, selector de tamaño ni salto a extremos.
- Frases largas o controles en anchos estrechos: permiten ajuste de texto y redistribución sin solapamientos ni pérdida de contenido.
- Activación de controles de negocio: no produce llamadas, persistencia, cambios en la muestra ni mensajes ficticios de validación o éxito.
- Los ejemplos estáticos no implican que la aplicación real se inicialice con datos de demostración persistidos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La aplicación DEBE presentar una única página principal accesible mediante una ruta de entrada. Se adopta `/` como ruta inicial; no se requieren pantallas adicionales ni una página de error de navegación en F001. Aceptación: US1.1 y US1.4.
- **FR-002**: La página DEBE conservar los textos y la jerarquía principal aprobados: cabecera, introducción, tarjeta de nueva frase y tarjeta de frases guardadas, con su aviso de lista compartida. Aceptación: US1.1 y US2.3.
- **FR-003**: La tarjeta «Nueva frase» DEBE presentar únicamente el estado visual inicial: etiqueta, campo vacío, placeholder, ayuda, contador inicial y acciones separadas; «Guardar» permanece deshabilitado. No se especifica validación de entrada, actualización funcional del contador ni transición a otros estados en F001. Aceptación: US1.2.
- **FR-004**: La página DEBE mostrar estas tres frases ilustrativas, con las fechas y horas visibles de la referencia: «Quiero cambiar la fecha de mi consulta médica» (21 oct 2026 · 10:42), «El equipo se reúne el viernes por la mañana» (20 oct 2026 · 16:15) y «La biblioteca abre los sábados» (19 oct 2026 · 09:08). El contador inicial DEBE indicar «3 frases». Aceptación: US2.1.
- **FR-005**: Cada fila DEBE presentar la frase, su fecha y hora y «Eliminar», con nombre accesible específico. No se presentan identificadores ni metadata técnica. Aceptación: US2.1 y US2.2.
- **FR-006**: El listado DEBE incorporar un paginador simple con «Siguiente →» y, desde la segunda página, «← Atrás». «Siguiente →» DEBE quedar deshabilitado en la última página. Los estados se definen para su presentación; el cambio de página, la obtención de datos y el enlace funcional de las acciones quedan fuera de F001. Aceptación: US3.1–US3.4.
- **FR-007**: La presentación DEBE conservar DM Sans y su respaldo sans-serif, el fondo claro, las superficies blancas, los verdes, bordes, radios, espaciado y jerarquía visual definidos en la sección 2 de ui-spec.md y concretados en el prototipo. El paginador DEBE seguir el estilo de los controles ordinarios existentes. Aceptación: cotejo visual de US1–US3 con esas referencias.
- **FR-008**: La composición DEBE respetar el ancho máximo de 1440 px, las dos columnas desde el punto de escritorio de la referencia, el apilado en móvil, la disposición adaptable de acciones y el desplazamiento propio de la lista. Aceptación: US4.1, US4.2 y US4.4.
- **FR-009**: La página DEBE estar en español, conservar encabezados y regiones semánticas, etiqueta visible del campo, foco visible, controles de al menos 44 px de altura y estados deshabilitados perceptibles. Aceptación: US1.2, US2.2 y US4.3.
- **FR-010**: F001 DEBE proporcionar la composición de página y sus componentes visuales reutilizables pertinentes, incluyendo los controles ordinarios, la presentación de filas y el paginador, sin crear pantallas ni capacidades de producto adicionales. La estructura interna se rige por las decisiones existentes. Aceptación: US1–US4 y revisión de alcance.
- **FR-011**: F001 DEBE poder revisarse sin servicios externos; las acciones no DEBEN ejecutar operaciones de negocio ni simular resultados exitosos. Aceptación: US1.4, US2.4 y US3.
- **FR-012**: La página DEBE excluir la galería didáctica de estados y el pie de la maqueta, así como la advertencia semántica precargada del ejemplo principal. Aceptación: US1.3.

### Key Entities *(include if feature involves data)*

- **Frase ilustrativa**: Contenido estático de presentación compuesto por texto, fecha y hora de muestra; no representa una frase obtenida o persistida por F001.
- **Estado visual de paginación**: Información de presentación que permite distinguir primera página, página intermedia y última página para determinar visibilidad y disponibilidad de sus controles; no obtiene datos ni calcula navegación remota.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La ruta principal presenta el 100 % de las regiones y textos enumerados en US1.1, el formulario inicial de US1.2 y las tres filas de US2.1 sin requerir un servicio de datos.
- **SC-002**: Las tres frases y sus fechas y horas coinciden con el prototipo y se presentan en el mismo orden, con cero registros añadidos, guardados o eliminados mediante la maqueta.
- **SC-003**: Los cuatro casos de paginador definidos en US3 cumplen íntegramente la visibilidad y habilitación esperadas, sin controles avanzados adicionales.
- **SC-004**: La revisión en móvil y escritorio satisface los cuatro escenarios de US4: tarjetas y controles legibles, sin superposición, con foco visible y nombres accesibles para el 100 % de los controles habilitados.
- **SC-005**: La revisión visual coteja tipografía, paleta, superficies, bordes, radios, espaciado y jerarquía con las referencias aprobadas; la única variación de producto aprobada en esta sesión es el paginador simple, además de seleccionar el estado inicial y retirar las secciones didácticas.

## Assumptions

### Alcance y dependencias

- F001 es una entrega visual y de rutas dentro de la capacidad existente de frases; no define una nueva arquitectura ni una nueva división de features de negocio.
- `/` es la ruta inicial convencional adoptada para la única página prevista; no se han solicitado enlaces profundos adicionales.
- Se utilizan muestras de presentación locales con los contenidos aprobados, no datos obtenidos de la API ni una carga inicial de base de datos.
- Registro, validación local y remota, contador dinámico, guardado, coincidencias, confirmación, eliminación, diálogos funcionales, carga de listado, reintentos, actualización posterior a mutaciones y navegación funcional entre páginas quedan fuera de F001.
- Los estados de vacío, carga y error del listado y los estados de validación siguen siendo referencias del producto para entregas posteriores; no se incorporan como escenarios funcionales de esta maqueta.
- El contrato existente se consulta para no contradecir el futuro listado; no se modifica ni se conecta en F001. No se fijan objetivos de rendimiento de solicitudes para una entrega sin integración.
- La validación de esta especificación es documental. Las comprobaciones de implementación exigidas por AGENTS.md y la constitución corresponden a una fase posterior.

### Fuentes de verdad y trazabilidad

| Fuente | Aplicación en F001 |
| --- | --- |
| [AGENTS.md](../../AGENTS.md) | Directorio de trabajo y convenciones del repositorio. |
| [Constitución 1.0.0](../../.specify/memory/constitution.md) | Principios, alcance enfocado y verificación futura. |
| [Product Brief 1.1.0](../../../../docs/00-discovery/product-brief.md) | FR-016, DEC-009, DEC-013 y DEC-015: presentación del listado, carácter compartido y distinción entre muestras y datos reales. |
| [UI/UX aprobada](../../../../docs/02-ui/ui-spec.md) | Secciones 2–6: diseño, composición, adaptación, listado, formulario inicial y accesibilidad. |
| [Arquitectura frontend](../../../../docs/03-architecture/03-frontend-architecture.md) | Decisiones aprobadas para la posterior implementación, sin redefinirlas aquí. |
| [Contrato OpenAPI](../../../../docs/03-architecture/openapi.yaml) | Contexto del listado futuro, orden y paginación; sin integración en esta entrega. |
| [Prototipo](../../../../prototypes/ui/index.html) | Referencia visual y contenidos exactos de las tres filas ilustrativas. |

### Decisiones HITL de esta sesión

- **HITL-001**: El usuario acota F001 a «Solo nivel de UI nada mas y rutas», incluyendo componentes de página y reutilizables, página y maquetación. Esto reemplaza cualquier interpretación previa de listado conectado o flujos completos.
- **HITL-002**: El usuario aprueba un paginador sencillo: Siguiente con flecha en la primera página, Atrás desde la segunda y Siguiente deshabilitado al terminar. Esta decisión modifica expresamente la exclusión visual de paginación de la maqueta original, sin autorizar integración en F001.
- **HITL-003**: El usuario elige «A — Formulario inicial y listado ilustrativo»; la galería queda como referencia externa. No se reproduce la advertencia semántica ilustrativa como estado inicial.

### Discrepancias documentales que no se resuelven mediante F001

- AGENTS.md exige nombres de archivo PascalCase y la constitución remite a esas convenciones; la arquitectura aprobada B03-D13 exige kebab-case con sufijos. La gobernanza exige resolver el conflicto explícitamente antes de crear archivos de implementación afectados. Esta especificación no selecciona una convención ni modifica las fuentes.
- La arquitectura menciona apps/web, mientras el repositorio y el usuario sitúan este frontend en apps/frontend. F001 se documenta en el proyecto actual; no autoriza moverlo.
- La regla de texto se concilió después en una única regla (hasta 280 puntos de código, al menos 3 letras, sin emojis) compartida por formulario, DTO y dominio; véase la especificación de validación.
- Product Brief/UI indican que validar no persiste el intento y presentan coincidencia textual de 100 %; OpenAPI persiste una validación temporal y devuelve puntaje textual nulo. Son asuntos de integración posteriores, no decisiones funcionales de F001.
- El producto contempla eliminar, pero OpenAPI no define esa operación. F001 solo presenta la acción visual y no inventa un contrato.
- El documento de arquitectura declara no haber verificado los archivos de producto/UI/prototipo. Para esta especificación sí se han consultado los archivos existentes; esa nota histórica no invalida su uso como fuentes visuales.
