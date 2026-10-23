# Feature Specification: Listado de frases guardadas

**Feature Branch**: `main` (rama existente; sin creación de rama)

**Created**: 2026-10-22

**Status**: Draft — documentación retrospectiva del flujo implementado

**Input**: User description: "genera spec del flujo de listar phraase que ya esta implementado"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar las frases compartidas (Priority: P1)

Como persona que abre la aplicación, quiero consultar las frases guardadas y sus fechas para conocer el contenido de la lista compartida.

**Why this priority**: Leer el contenido guardado es el objetivo principal del flujo.

**Independent Test**: Abrir la página principal con una colección conocida y comparar sus primeras 20 frases y el total con lo presentado.

**Acceptance Scenarios**:

1. **Given** una colección disponible, **When** la persona abre la página principal y finaliza la consulta, **Then** «Frases guardadas» muestra la primera página con hasta 20 frases.
2. **Given** una página con frases, **When** se presenta el resultado, **Then** cada fila muestra el texto entre comillas y su fecha de creación según el formato y la zona horaria del entorno de la persona, sin hora ni identificador visible.
3. **Given** una colección de 45 frases, **When** se muestra su primera página de 20 frases, **Then** el contador indica «45 frases», correspondiente a toda la colección.
4. **Given** una página recibida, **When** se muestran sus filas, **Then** se conserva su orden y se presenta el texto «Las más recientes aparecen primero.».
5. **Given** la sección de listado, **When** se consulta, **Then** aparece el aviso «Esta lista es compartida: cualquier persona puede ver y eliminar sus frases.», aunque las filas actuales solo permiten lectura.

---

### User Story 2 - Recorrer las páginas (Priority: P1)

Como persona que consulta más de 20 frases, quiero avanzar y retroceder para leer el resto de la colección.

**Why this priority**: La navegación permite acceder a los registros posteriores a la primera página.

**Independent Test**: Con 45 frases estables, recorrer las tres páginas y regresar, comprobando su contenido y los límites de las acciones.

**Acceptance Scenarios**:

1. **Given** la primera de tres páginas, **When** se presenta la navegación, **Then** «← Atrás» no aparece y «Siguiente →» está habilitado.
2. **Given** una página con otra posterior, **When** se activa «Siguiente →» y finaliza la consulta, **Then** se muestra la página inmediatamente siguiente, manteniendo 20 como tamaño de página.
3. **Given** una página intermedia, **When** se activa «← Atrás» y finaliza la consulta, **Then** se muestra la página inmediatamente anterior.
4. **Given** la última de varias páginas, **When** se presentan las acciones, **Then** «← Atrás» está habilitado y «Siguiente →» está visible y deshabilitado.
5. **Given** una colección que cabe en una sola página, **When** se presenta el resultado, **Then** no aparece «← Atrás» y «Siguiente →» está deshabilitado.

---

### User Story 3 - Consultar una colección vacía y leer contenido extenso (Priority: P2)

Como persona que consulta la lista, quiero reconocer un total de cero y poder leer frases extensas o muchas filas mediante teclado y desplazamiento.

**Why this priority**: Abarca los límites habituales de contenido del listado existente.

**Independent Test**: Consultar una colección vacía y otra con 20 frases extensas; revisar total, controles y lectura con teclado en móvil y escritorio.

**Acceptance Scenarios**:

1. **Given** una colección vacía cuya consulta finalizó correctamente, **When** se presenta el listado, **Then** aparece «0 frases», no hay filas ni mensaje específico de vacío, no aparece «← Atrás» y «Siguiente →» está deshabilitado.
2. **Given** filas que superan la altura visible del listado, **When** la persona enfoca la lista con teclado y se desplaza verticalmente, **Then** puede acceder a las filas restantes dentro de la propia lista.
3. **Given** frases largas y una pantalla estrecha, **When** se presenta el listado, **Then** el texto se ajusta al ancho disponible y las fechas permanecen legibles sin solapamientos.
4. **Given** navegación con teclado, **When** se enfoca la lista o una acción habilitada de paginación, **Then** el foco es visible y sus nombres permiten reconocer su propósito.

---

### User Story 4 - Consultar el listado después de guardar (Priority: P2)

Como persona que acaba de guardar una frase, quiero que se actualice la página que estoy consultando para reflejar la colección vigente.

**Why this priority**: Mantiene la coherencia entre el guardado existente y la lectura.

**Independent Test**: Guardar una frase mediante el flujo existente con el listado visible y verificar contenido y total después de su actualización.

**Acceptance Scenarios**:

1. **Given** la primera página visible, **When** un guardado termina correctamente y finaliza la actualización del listado, **Then** se muestra el total actualizado y el contenido vigente de esa página.
2. **Given** una página posterior visible, **When** un guardado termina correctamente y finaliza la actualización, **Then** se conserva la página seleccionada y se presenta su contenido vigente; no se fuerza el regreso a la primera página.
3. **Given** un guardado fallido, **When** termina el intento, **Then** ese fallo no provoca una actualización del listado ni incorpora una frase como si se hubiera guardado.

### Edge Cases

- Cero registros: se presenta una lista sin filas y «0 frases», con navegación equivalente a una única página, incluso si el número de páginas informado es cero.
- 20 registros: una única página con avance deshabilitado. 21 registros: dos páginas, la segunda con una sola fila. 45 registros: tres páginas de 20, 20 y 5 filas.
- Consulta inicial pendiente o fallida sin datos previos: actualmente no se muestra indicador de carga, mensaje de error ni acción de reintento. La lista queda sin filas, el contador no tiene cifra (solo «frases») y la navegación usa la primera página con avance deshabilitado. Esto es una limitación observada, no una confirmación de colección vacía.
- Cambio a una página sin datos disponibles mientras se obtiene el resultado: no se garantiza mantener las filas anteriores; sin datos de esa página, se aplica la presentación anterior hasta recibir el resultado.
- Fallo de actualización con datos previos disponibles: pueden permanecer los últimos datos conocidos sin aviso visual del fallo.
- Un único registro conserva el texto literal «1 frases»; actualmente no hay variación singular.
- La fecha depende del entorno local, por lo que no se exige un formato fijo día/mes/año ni una hora visible.
- El orden se conserva tal como llega. La indicación de recientes primero depende de que la fuente entregue las frases en ese orden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El listado DEBE consultarse automáticamente al entrar en la página principal, comenzando por la página 1 y con tamaño fijo de 20 frases. Aceptación: US1.1.
- **FR-002**: El listado DEBE mostrar las frases de la página consultada en el orden recibido, con el texto entre comillas y su fecha de creación local, sin hora ni identificador visible. Aceptación: US1.2 y US1.4.
- **FR-003**: El contador DEBE mostrar el total de frases de la colección informado por la consulta, seguido de «frases», independientemente del número de filas de la página. Aceptación: US1.3 y caso de un registro.
- **FR-004**: La sección DEBE conservar el título «Frases guardadas», la explicación de orden y el aviso de lista compartida actuales. Aceptación: US1.4–US1.5.
- **FR-005**: La navegación DEBE permitir consultar la página inmediatamente siguiente o anterior mediante «Siguiente →» y «← Atrás», conservando el tamaño de 20 frases. Aceptación: US2.2–US2.3.
- **FR-006**: «← Atrás» DEBE aparecer únicamente desde la segunda página; «Siguiente →» DEBE permanecer visible y deshabilitarse cuando la página actual alcance el total de páginas. Aceptación: US2.1 y US2.4–US2.5.
- **FR-007**: Una consulta exitosa sin frases DEBE presentar cero filas, «0 frases» y avance deshabilitado, sin mensaje específico de vacío. Aceptación: US3.1.
- **FR-008**: La lista DEBE permitir desplazamiento vertical propio, foco mediante teclado y lectura de frases largas con ajuste de texto. Sus controles habilitados DEBEN tener foco visible y nombres comprensibles. Aceptación: US3.2–US3.4.
- **FR-009**: Después de un guardado exitoso, el listado visible DEBE actualizarse conservando la página seleccionada. Un guardado fallido no DEBE provocar esa actualización. Aceptación: US4.1–US4.3.

### Key Entities *(include if feature involves data)*

- **Frase guardada**: Unidad de contenido de la colección compartida; posee un identificador, un texto y una fecha de creación. Solo texto y fecha se presentan en la fila.
- **Página de frases**: Conjunto de hasta 20 frases y datos sobre página actual, tamaño, total de frases y total de páginas. Determina el contenido visible y las acciones de navegación disponibles.
- **Colección compartida**: Conjunto de frases consultable desde la pantalla principal, cuyo total puede ser mayor que las filas visibles de una página.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para colecciones de 0, 1, 20, 21 y 45 frases, el 100 % de las filas consultadas coincide en texto y fecha local con la colección conocida, y el contador refleja su total.
- **SC-002**: Con 45 frases estables, una persona puede leer las 45 recorriendo tres páginas mediante dos avances y volver a la primera mediante dos retrocesos, sin omisiones ni duplicaciones atribuibles a la navegación.
- **SC-003**: El 100 % de los casos de primera, intermedia, última y única página cumple las reglas de visibilidad y disponibilidad de US2.
- **SC-004**: En una revisión a 320 y 1280 píxeles de ancho, las 20 filas de una página con frases extensas son legibles mediante desplazamiento y teclado, sin solapamientos entre texto y fecha.
- **SC-005**: En los tres escenarios de US4, el resultado conserva la página consultada y refleja correctamente si el guardado tuvo éxito o falló, sin mostrar frases ficticias.

## Assumptions

### Alcance y dependencias

- Esta especificación documenta retrospectivamente el flujo implementado al 2026-10-22. Su estado Draft corresponde a la revisión documental y no implica que el listado esté pendiente de implementación.
- Se describe el listado conectado actual. La especificación anterior de interfaz principal y listado ilustrativo permanece como documento histórico de su propio alcance.
- La colección compartida es accesible desde la página principal sin un paso de identificación dentro de este flujo.
- Se depende de una fuente de frases que entregue contenido, fechas válidas, totales y páginas consistentes, con las frases más recientes primero. No se añade ordenamiento local.
- Los escenarios de navegación completa suponen que la colección permanece estable durante el recorrido. No se promete una instantánea consistente frente a cambios simultáneos de otras personas.
- La actualización posterior al guardado es el único punto de integración de ese flujo aquí incluido. Validación, coincidencias, confirmación y reglas de creación quedan fuera del alcance.
- No se incluyen eliminación, edición, búsqueda, filtros, selector de tamaño, páginas numeradas ni salto directo a una página. El aviso sobre eliminación es texto existente y no representa una acción disponible en las filas actuales.
- Los estados de carga, error y vacío descritos en Edge Cases registran limitaciones actuales; no se incorporan nuevos mensajes ni controles de recuperación como requisitos de este trabajo.
- No se establece un objetivo de latencia sin mediciones disponibles. Los criterios de éxito verifican contenido, navegación y lectura mediante acciones observables.
- La revisión de calidad de esta especificación es documental; no acredita ejecución de pruebas de la aplicación ni validación de rendimiento.
