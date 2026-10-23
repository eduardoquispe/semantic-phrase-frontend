# Feature Specification: Creación de frases integrada

**Feature Branch**: `main` (rama existente; sin creación de rama)

**Created**: 2026-10-23

**Status**: Draft — documentación retrospectiva del flujo implementado

**Input**: User description: "sobre la integración de crear phrases que ya esta implementado, solo basate en ello"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validar y guardar una frase (Priority: P1)

Como persona que utiliza la lista compartida, quiero validar una frase y guardarla mediante una acción explícita para incorporarla a la colección.

**Why this priority**: Es el recorrido principal que permite crear contenido sin confundir la comprobación previa con el guardado.

**Independent Test**: Escribir «  Hola mundo  », validar sin necesidad de confirmación y guardar; comprobar el texto registrado, el aviso de éxito, la limpieza del formulario y la actualización de la lista visible.

**Acceptance Scenarios**:

1. **Given** el formulario «Nueva frase» recién abierto, **When** la persona consulta sus acciones, **Then** «Validar» está disponible y «Guardar» está deshabilitado, sin mensajes de resultado.
2. **Given** «  Hola mundo  » en el campo, **When** se activa «Validar» o se pulsa Enter, **Then** se comprueba «Hola mundo», se muestra «10 / 280» como contador y no se guarda ninguna frase.
3. **Given** una comprobación exitosa que no exige confirmación, **When** se presenta su resultado, **Then** se muestra «Frase validada» y se habilita «Guardar».
4. **Given** ese resultado y el texto sin modificar, **When** la persona activa «Guardar» y la creación se confirma, **Then** se registra el texto sin espacios iniciales ni finales, asociado a su comprobación previa, y se muestra «Frase guardada».
5. **Given** un guardado exitoso, **When** termina el flujo, **Then** el campo queda vacío, el contador vuelve a cero y guardar queda deshabilitado hasta una nueva validación.
6. **Given** una página del listado visible, **When** el guardado tiene éxito y termina la actualización de la lista, **Then** se actualizan su contenido y total sin cambiar la página seleccionada. La frase nueva aparece en esa página solo si le corresponde según el orden de la colección.

---

### User Story 2 - Decidir ante una coincidencia (Priority: P1)

Como persona que recibe una advertencia de coincidencia, quiero revisar la frase existente y decidir expresamente si guardo la nueva de todos modos.

**Why this priority**: La decisión de conservar frases parecidas o iguales ya forma parte del flujo de creación.

**Independent Test**: Obtener por separado una coincidencia exacta y una semántica que exijan confirmación; revisar la advertencia y guardar mediante «Guardar de todos modos».

**Acceptance Scenarios**:

1. **Given** una comprobación que exige confirmación con coincidencia exacta, **When** se muestra su resultado, **Then** aparecen «Coincidencia textual exacta», la frase existente y el aviso de que aún no se guardó, sin porcentaje de similitud.
2. **Given** una comprobación que exige confirmación con coincidencia semántica de 0,914, **When** se muestra su resultado, **Then** aparecen «Posible coincidencia semántica», la frase existente y «Similitud semántica · 91 %».
3. **Given** cualquiera de esas advertencias, **When** la persona no realiza otra acción, **Then** la frase permanece sin guardar y está disponible «Guardar de todos modos».
4. **Given** una comprobación que exige confirmación, **When** se activa «Guardar de todos modos», **Then** la creación incluye la confirmación explícita y, si se acepta, finaliza con el mismo resultado exitoso de US1.
5. **Given** una comprobación que no exige confirmación aunque incluya una frase candidata, **When** se muestra su resultado, **Then** se presenta «Frase validada», no se muestra la candidata y la acción es «Guardar».

---

### User Story 3 - Corregir o recuperar un intento (Priority: P2)

Como persona que modifica el texto o encuentra un error, quiero conservar mi frase y reconocer cuándo debo validarla de nuevo antes de guardar.

**Why this priority**: Evita guardar con una comprobación anterior y permite continuar después de un fallo sin reescribir el contenido.

**Independent Test**: Modificar una frase validada y simular por separado un fallo de validación y uno de guardado; comprobar disponibilidad de acciones, conservación del texto y recuperación manual.

**Acceptance Scenarios**:

1. **Given** una frase validada, **When** se modifica el campo, incluso si después se restaura el texto original, **Then** desaparece el resultado anterior y guardar queda deshabilitado hasta validar nuevamente.
2. **Given** una frase vacía, de más de 280 caracteres, sin letras o con caracteres no permitidos, **When** se intenta validar, **Then** se muestra el error correspondiente en el campo y no se realiza la comprobación externa.
3. **Given** un error al validar, **When** finaliza el intento, **Then** se conserva el texto, se muestra el error y guardar sigue deshabilitado; «Validar» permite un nuevo intento.
4. **Given** un error al guardar, **When** finaliza el intento, **Then** se conserva el texto escrito, se muestra el error, se descarta la validación previa y ese fallo no provoca una actualización del listado ni un reintento automático de guardado.
5. **Given** un intento fallido de guardado, **When** la persona vuelve a validar correctamente, **Then** se elimina el error anterior y guardar se habilita según el nuevo resultado, sin guardar automáticamente.
6. **Given** una validación o un guardado en curso, **When** se intenta editar, repetir clics o pulsar Enter, **Then** el campo permanece de solo lectura, ambas acciones están deshabilitadas y no se inicia otra operación; la acción en curso muestra «Validando…» o «Guardando…».
7. **Given** un resultado o error anterior, **When** la persona modifica el campo o inicia una nueva validación, **Then** se elimina el mensaje anterior. Una nueva validación también deshabilita guardar mientras se procesa.

### Edge Cases

- Texto vacío o compuesto solo por espacios: se rechaza. Los espacios iniciales y finales se excluyen del texto validado, del guardado y del contador; los espacios interiores se conservan.
- Límites: se admiten de 1 a 280 caracteres tras quitar espacios de los extremos, siempre que exista al menos una letra. Una frase de 281 caracteres se rechaza; una única letra es válida.
- Caracteres: se admiten letras, números, espacios normales y los símbolos `. / $ % , ; -`. Se rechazan tabulaciones, saltos de línea y otros caracteres, incluidos signos de exclamación y emojis.
- El formulario se presenta como «Frase en español», pero no comprueba automáticamente el idioma; una frase en otro idioma que cumpla las reglas del campo puede validarse.
- Enter inicia la validación, incluso si hay un resultado previo; no confirma el guardado.
- La necesidad de confirmación depende del resultado de la comprobación, no de un umbral calculado por la pantalla ni de la mera presencia de una candidata.
- La comprobación incluye una fecha de vencimiento, pero actualmente no se muestra una cuenta regresiva ni se deshabilita guardar por el paso del tiempo. Si el guardado se rechaza por vencimiento, comprobación inválida o utilizada, texto diferente o falta de confirmación, se aplica la recuperación general de US3.4–US3.5.
- Si se pierde la comunicación al guardar, se conserva el texto y no se reintenta automáticamente. La pantalla no puede asegurar si la creación llegó a completarse y no garantiza evitar duplicados entre intentos manuales posteriores.
- Los errores muestran el mensaje de detalle proporcionado por el servicio cuando es un texto no vacío; en los demás casos aparece «Ocurrió un error. Inténtalo de nuevo.». No se presentan códigos ni listas de errores por campo del servicio.
- El éxito del guardado provoca la actualización del listado visible, pero no garantiza que esa consulta posterior tenga éxito. No se añade una confirmación de actualización del listado ni un tratamiento nuevo de sus errores.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario DEBE separar validación y creación: validar o pulsar Enter no DEBE guardar; guardar DEBE requerir una validación previa disponible para el texto sin modificar. Aceptación: US1.1–US1.4 y US3.1.
- **FR-002**: El campo DEBE aplicar las reglas de longitud, contenido y caracteres descritas en Edge Cases, informar el error y bloquear la comprobación externa de entradas inválidas. Aceptación: US3.2 y casos de límites y caracteres.
- **FR-003**: La validación y el guardado DEBEN usar el texto sin espacios iniciales ni finales, y el contador DEBE mostrar esa longitud respecto de 280. Aceptación: US1.2 y US1.4.
- **FR-004**: La creación DEBE quedar asociada a la comprobación previa del texto. Cuando esta exija confirmación, la acción DEBE ser «Guardar de todos modos» y registrar la decisión explícita; en caso contrario DEBE ser «Guardar», sin añadir esa confirmación. Aceptación: US1.4 y US2.3–US2.5.
- **FR-005**: El resultado previo al guardado DEBE distinguir validación sin confirmación, coincidencia exacta y coincidencia semántica; estas últimas DEBEN mostrar la candidata cuando esté disponible, y solo la semántica DEBE mostrar un porcentaje redondeado al entero más cercano. Aceptación: US1.3 y US2.1–US2.2, US2.5.
- **FR-006**: Durante la validación o el guardado, el formulario DEBE impedir edición y operaciones simultáneas, indicar que está ocupado y mostrar el texto de progreso correspondiente. Aceptación: US3.6.
- **FR-007**: Al confirmar una creación, el formulario DEBE mostrar «Frase guardada», limpiar el campo y descartar la comprobación previa; el listado visible DEBE actualizarse conservando la página seleccionada. Aceptación: US1.5–US1.6.
- **FR-008**: Un fallo de guardado DEBE conservar el texto escrito, mostrar un error, descartar la comprobación previa y exigir una nueva validación antes de otro intento manual. No DEBE reintentar guardar automáticamente ni provocar la actualización del listado por ese fallo. Aceptación: US3.4–US3.5.
- **FR-009**: Un fallo de validación DEBE conservar el texto, mostrar el error y permitir validar de nuevo sin habilitar guardar. Aceptación: US3.3.
- **FR-010**: Editar el campo DEBE eliminar los resultados de operaciones anteriores y exigir una nueva validación, aunque se restaure el texto original; iniciar otra validación DEBE limpiar los resultados anteriores. Aceptación: US3.1 y US3.7.
- **FR-011**: Los errores de operación DEBEN mostrar el detalle recibido cuando sea un texto no vacío o el mensaje genérico definido en Edge Cases. Aceptación: US3.3–US3.4 y caso de mensajes de error.

### Key Entities *(include if feature involves data)*

- **Frase en composición**: Texto escrito por la persona, su longitud y los errores de entrada; puede conservar espacios exteriores hasta enviarse.
- **Comprobación previa**: Resultado asociado al texto, con identificador, vencimiento, necesidad de confirmación y una posible coincidencia. Permite solicitar la creación y se descarta al editar o finalizar un intento de guardado.
- **Coincidencia**: Frase existente con identificador y texto; puede ser exacta o semántica. La semántica incorpora una puntuación de similitud.
- **Decisión de guardado**: Acción explícita sobre el texto comprobado que incluye la confirmación cuando se requiere.
- **Frase guardada**: Contenido cuya creación se ha confirmado, con identificador, texto y fecha de creación, perteneciente a la colección compartida.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En los tres recorridos de creación —sin confirmación, coincidencia exacta y coincidencia semántica—, se registra una sola frase por acción de guardado aceptada y ninguna por validar; el 100 % conserva el texto comprobado sin espacios exteriores.
- **SC-002**: El 100 % de los casos de entrada vacía, solo espacios, sin letras, 281 caracteres y caracteres prohibidos se rechaza antes de la comprobación externa; los casos de una letra y de 280 caracteres permitidos se admiten.
- **SC-003**: En el 100 % de los escenarios de modificación y fallo de guardado, guardar permanece deshabilitado hasta obtener una nueva validación. En todos los fallos de operación se conserva el texto escrito.
- **SC-004**: En ambos estados de operación en curso, clics repetidos y Enter no generan operaciones adicionales ni permiten alterar el texto.
- **SC-005**: En los recorridos exitosos de US1 y US2, la persona recibe una confirmación inequívoca de guardado y un formulario vacío; si la consulta posterior tiene éxito, ve el total actualizado en la misma página del listado.

## Assumptions

- La especificación describe únicamente el comportamiento existente al 2026-10-23. Draft indica revisión documental pendiente; no significa que la funcionalidad esté por implementar.
- El alcance es la creación desde el formulario actual, su comprobación previa como dependencia y la actualización posterior del listado. No incluye cambios en la aplicación ni nuevas capacidades.
- La fuente de comprobación determina coincidencias, necesidad de confirmación y vigencia; la fuente de creación acepta o rechaza el guardado. No se especifican algoritmos, umbrales ni reglas internas no observables desde este flujo.
- Se depende de que los servicios existentes de comprobación, creación y consulta estén disponibles y entreguen resultados coherentes.
- La colección es compartida y el recorrido actual no incluye identificación de la persona. No se incorporan permisos nuevos, edición, eliminación, creación masiva ni trabajo sin conexión.
- El comportamiento general del listado se documenta en la especificación de listado existente; aquí solo se incluye su actualización tras crear una frase.
- No se agregan objetivos de latencia, concurrencia o satisfacción sin mediciones. Los criterios permiten verificar el comportamiento observable; no afirman que ya se hayan ejecutado esas verificaciones.
