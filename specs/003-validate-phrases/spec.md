# Feature Specification: Validación de frases integrada

**Feature Branch**: `main` (rama existente; sin creación de rama)

**Created**: 2026-10-23

**Status**: Implementada — registro retrospectivo del código existente; verificación manual contra API real pendiente

**Input**: User description: "el 03 que ahora será de la validación de phrases porque la creación iba después y ya está generado el spec"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comprobar una frase antes de guardarla (Priority: P1)

Como persona que utiliza la lista compartida, quiero comprobar mi frase y conocer el resultado antes de decidir si la incorporo a la colección.

**Why this priority**: Permite distinguir la comprobación previa de la creación y evita guardar por el solo hecho de validar.

**Independent Test**: Escribir «  Hola mundo  », pulsar «Validar» y obtener un resultado sin necesidad de confirmación; comprobar el contador, el texto comprobado y que la colección no cambia.

**Acceptance Scenarios**:

1. **Given** el formulario inicial, **When** se consulta «Nueva frase», **Then** el campo está vacío, el contador indica «0 / 280», «Validar» está disponible y «Guardar» deshabilitado, sin resultados precargados.
2. **Given** «  Hola mundo  » en el campo, **When** se activa «Validar» o se pulsa Enter, **Then** se comprueba «Hola mundo», el contador indica «10 / 280» y no se crea ninguna frase ni se actualiza el listado por esta acción.
3. **Given** una comprobación exitosa que no requiere confirmación, **When** llega el resultado, **Then** se muestra «Frase validada» con «No se encontró ninguna coincidencia.» y se habilita «Guardar» para una acción posterior independiente.
4. **Given** ese resultado, **When** se vuelve a pulsar «Validar» o Enter sin editar, **Then** se inicia otra comprobación, desaparece el resultado previo y guardar queda deshabilitado hasta recibir un nuevo resultado exitoso; no se guarda automáticamente.

---

### User Story 2 - Corregir una entrada inválida (Priority: P1)

Como persona que escribe una frase, quiero conocer qué regla incumple mi entrada para corregirla antes de solicitar su comprobación.

**Why this priority**: Evita comprobaciones de entradas inválidas y explica cómo continuar.

**Independent Test**: Probar entradas vacías, sin letras, fuera del límite y con caracteres prohibidos; corregirlas y comprobar que solo una entrada válida permite la comprobación externa.

**Acceptance Scenarios**:

1. **Given** una entrada vacía o de espacios normales, **When** se intenta validar, **Then** se muestra «Ingresa una frase.» junto al campo y no se solicita una comprobación externa.
2. **Given** una entrada de 281 caracteres permitidos con al menos una letra, **When** se intenta validar, **Then** se informa el máximo de 280 y no se solicita la comprobación; una letra y una entrada válida de 280 caracteres sí se admiten.
3. **Given** una entrada formada por números, espacios normales o símbolos permitidos sin letras, **When** se intenta validar, **Then** se informa que debe contener al menos una letra y no se solicita la comprobación.
4. **Given** una entrada con caracteres prohibidos, **When** se revisa su validez, **Then** se informa el problema y no se solicita la comprobación al enviarla; las reglas completas se definen en Edge Cases.
5. **Given** un error del campo, **When** se corrige la entrada, **Then** se actualiza su validez mientras se escribe y se recupera la ayuda al quedar válida; al enviar una entrada inválida el foco vuelve al campo y el error queda asociado a él.

---

### User Story 3 - Comprender una coincidencia (Priority: P1)

Como persona que obtiene una advertencia, quiero distinguir una coincidencia textual de una posible similitud de significado y revisar la frase existente antes de decidir guardar.

**Why this priority**: Hace comprensible la advertencia sin convertir la validación en una decisión automática de creación.

**Independent Test**: Obtener resultados que exijan confirmación con coincidencia textual exacta y semántica; revisar títulos, candidata, porcentaje y disponibilidad de la acción posterior sin activarla.

**Acceptance Scenarios**:

1. **Given** un resultado que requiere confirmación con coincidencia textual exacta, **When** se presenta, **Then** aparecen «Coincidencia textual exacta», «Frase existente» y su texto, sin porcentaje.
2. **Given** un resultado que requiere confirmación con coincidencia semántica de 0,914, **When** se presenta, **Then** aparecen «Posible coincidencia semántica», la frase existente, «Similitud semántica · 91 %» y «El puntaje indica similitud; tú decides si es un duplicado.».
3. **Given** cualquiera de esas advertencias, **When** la persona revisa el resultado, **Then** se lee «Se requiere tu confirmación antes de guardar. La frase todavía no se guardó.» y queda habilitado «Guardar de todos modos», sin crear una frase por mostrar la advertencia.
4. **Given** una comprobación que no requiere confirmación aunque incluya una candidata, **When** se presenta, **Then** se muestra el resultado de US1.3, se ocultan la candidata y su porcentaje y la acción posterior es «Guardar».

---

### User Story 4 - Reintentar y descartar resultados anteriores (Priority: P2)

Como persona que edita su frase o encuentra un fallo, quiero conservar lo escrito y saber cuándo debo validar nuevamente.

**Why this priority**: Impide utilizar un resultado anterior para un texto modificado y permite recuperar el flujo tras un fallo.

**Independent Test**: Mantener una comprobación en curso, simular un error y reintentar; después modificar una frase validada y comprobar que se descarta su resultado.

**Acceptance Scenarios**:

1. **Given** una comprobación en curso, **When** se intenta editar, repetir clics o pulsar Enter, **Then** el campo permanece de solo lectura, ambas acciones están deshabilitadas, se muestra «Validando…» y no se inicia otra operación.
2. **Given** un fallo de comprobación, **When** termina el intento, **Then** se conserva el texto original escrito, se muestra el error, guardar sigue deshabilitado y se permite un nuevo intento manual sin reintentos automáticos.
3. **Given** un fallo previo, **When** se inicia otra validación válida, **Then** desaparece el error anterior y el resultado del nuevo intento determina el estado posterior.
4. **Given** una validación exitosa, **When** se modifica el campo, aunque se restaure después el texto original o solo se cambien espacios exteriores, **Then** desaparece el resultado y guardar queda deshabilitado hasta validar nuevamente.
5. **Given** un error de operación anterior, **When** se modifica el campo, **Then** se elimina ese mensaje; los posibles errores de entrada se determinan por las reglas del campo.

### Edge Cases

- Se admiten de 1 a 280 caracteres tras recortar espacios exteriores, con al menos una letra. El contador usa esa longitud; los espacios interiores se conservan y cuentan. No se exige una palabra de varias letras, aunque la ayuda inicial diga «Al menos una palabra».
- Se admiten letras, números, espacios normales y los símbolos `. / $ % , ; -`. Se rechazan saltos de línea, tabulaciones, separadores de línea y párrafo, emojis y otros signos, incluidos exclamación e interrogación. La revisión de caracteres precede al recorte: un carácter prohibido en los extremos también se rechaza.
- Las reglas del campo no comprueban automáticamente el idioma: un texto en otro idioma que las cumpla puede validarse.
- La necesidad de confirmación la determina el resultado recibido. La pantalla no calcula umbrales ni decide por sí misma si una candidata es un duplicado.
- Una colección sin frases previas y una comprobación sin coincidencias que requieran confirmación comparten el mismo mensaje de éxito; no se presentan como estados distintos.
- Si se requiere confirmación sin candidata, el comportamiento actual muestra «Posible coincidencia semántica» y el aviso general, sin frase existente ni porcentaje. No se inventan datos faltantes.
- La comprobación tiene una fecha de vencimiento, pero la pantalla actual no muestra una cuenta regresiva ni deshabilita guardar por el paso del tiempo. La aceptación o rechazo de una creación y su recuperación corresponden a F004.
- Los errores de operación muestran el detalle recibido cuando es un texto no vacío; de lo contrario, muestran «Ocurrió un error. Inténtalo de nuevo.». No muestran códigos ni listas de errores por campo recibidas del servicio.
- No existe una acción independiente «Cancelar» en este formulario. Editar descarta el resultado; no activar guardar deja la frase sin crear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario DEBE permitir comprobar una entrada mediante «Validar» o Enter, sin crear una frase ni actualizar el listado por esa acción. Aceptación: US1.1–US1.2 y US3.3.
- **FR-002**: El campo DEBE aplicar las reglas de longitud, letras y caracteres de Edge Cases, impedir comprobaciones externas de entradas inválidas e informar el error junto al campo, asociado a él y con foco al enviar. Aceptación: US2.1–US2.5.
- **FR-003**: La comprobación y el contador DEBEN utilizar el texto sin espacios exteriores, conservando los interiores; el contador DEBE mostrar la longitud respecto de 280 mientras se escribe. Aceptación: US1.1–US1.2 y límites de US2.2.
- **FR-004**: Un resultado exitoso sin necesidad de confirmación DEBE mostrar «Frase validada», su descripción de US1.3 y habilitar «Guardar»; no DEBE mostrar candidatas ni porcentajes. Aceptación: US1.3 y US3.4.
- **FR-005**: Un resultado que requiere confirmación DEBE mostrar el aviso de no guardado y habilitar «Guardar de todos modos», distinguiendo coincidencia exacta y semántica según US3. La exacta no DEBE mostrar porcentaje; la semántica DEBE redondearlo al entero más cercano cuando exista candidata. Aceptación: US3.1–US3.3 y caso sin candidata.
- **FR-006**: Durante una validación, el formulario DEBE indicar «Validando…», comunicar que está ocupado, impedir edición y deshabilitar ambas acciones, evitando operaciones duplicadas. Aceptación: US4.1.
- **FR-007**: Un fallo de validación DEBE conservar el texto, mostrar el detalle o mensaje genérico definido en Edge Cases, mantener guardar deshabilitado y permitir un reintento manual sin reintento automático. Aceptación: US4.2–US4.3.
- **FR-008**: Toda edición DEBE descartar la comprobación anterior y sus mensajes y exigir una nueva validación antes de guardar, incluso si se restaura el texto. Aceptación: US4.4–US4.5.
- **FR-009**: Iniciar otra comprobación válida DEBE limpiar el resultado o error anterior y bloquear guardar hasta recibir un resultado exitoso nuevo. Aceptación: US1.4 y US4.3.
- **FR-010**: El resultado DEBE conservar la referencia de la comprobación, su vencimiento y la necesidad de confirmación para la acción posterior de creación. La disponibilidad y etiqueta de esa acción DEBEN corresponder al resultado actual. Aceptación: US1.3, US3.3–US3.4 y US4.4; revisión del resultado conservado y del caso de vencimiento.

### Key Entities *(include if feature involves data)*

- **Frase en composición**: Texto original escrito, texto recortado para comprobar, longitud y posibles errores de entrada.
- **Comprobación de frase**: Resultado asociado al texto enviado, con referencia, vencimiento, necesidad de confirmación y posible coincidencia; deja de ser aplicable al editar.
- **Coincidencia**: Frase existente identificada por su referencia y texto, de tipo textual exacto o semántico. Solo la semántica aporta un puntaje de similitud.
- **Estado de validación**: Situación inicial, en curso, exitosa, con advertencia o con error que determina el mensaje y la disponibilidad de acciones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En los recorridos sin confirmación, con coincidencia exacta y con coincidencia semántica, el 100 % de las validaciones deja la colección sin nuevas frases y presenta el mensaje y la acción posterior definidos en US1 y US3.
- **SC-002**: El 100 % de las entradas inválidas enumeradas en US2 y Edge Cases se rechaza antes de la comprobación externa; una letra y 280 caracteres válidos se admiten y «  Hola mundo  » se comprueba como «Hola mundo» con contador «10 / 280».
- **SC-003**: En todos los casos de edición de US4.4, guardar permanece deshabilitado hasta una nueva validación exitosa, sin reutilizar el resultado descartado.
- **SC-004**: En una comprobación mantenida en curso, doble clic y Enter repetido producen un único intento y cero modificaciones del texto. Tras un fallo se conserva el 100 % del texto escrito y se puede reintentar manualmente.
- **SC-005**: Los resultados exacto y semántico de US3 permiten identificar la frase existente y la necesidad de una decisión posterior sin confundir la advertencia con una confirmación de guardado; el caso semántico de 0,914 muestra 91 % y el exacto ningún porcentaje.

## Assumptions

- Se reserva explícitamente `003-validate-phrases` para F003 por instrucción del usuario. La creación continúa documentada en [F004](../004-create-phrases/spec.md), ya generada; no se renumera ni se reescribe en esta entrega.
- Se describe el comportamiento existente al 2026-10-23, coherente con el enfoque retrospectivo de F002 y F004. El estado Implementada registra la funcionalidad presente en código; no acredita verificación manual contra API real ni aprobación documental.
- El alcance termina en el resultado de validación y la disponibilidad de la acción posterior. Crear, confirmar el guardado, limpiar tras guardar y actualizar el listado pertenecen a F004; el listado general pertenece a [F002](../002-list-phrases/spec.md).
- Se depende del servicio existente de comprobación para determinar coincidencia, puntaje, necesidad de confirmación y vencimiento. Algoritmos de comparación, selección de candidata y umbrales internos quedan fuera de esta especificación del frontend.
- La colección es compartida y no se incorpora identificación, permisos nuevos, edición de frases guardadas, eliminación, validación masiva ni trabajo sin conexión.
- «Validar no guarda» significa que no crea una frase en la colección. No afirma que el servicio no conserve una comprobación temporal.
- Se toma el código actual del formulario, sus reglas, sus mensajes y el resultado de comprobación como evidencia del comportamiento, junto con el alcance de F004. Las diferencias históricas con producto/UI —porcentaje textual de 100 %, acción Cancelar y mayor repertorio de signos— se documentan mediante las reglas y límites de este spec, sin modificarlas ni resolverlas como cambios de producto.
- La constitución vigente exige cambios enfocados y verificación de cambios de aplicación. Esta entrega solo añade documentación; su checklist revisa calidad de requisitos y no acredita pruebas funcionales ni rendimiento. No se añaden objetivos de latencia sin mediciones.
