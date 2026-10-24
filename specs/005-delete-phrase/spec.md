# Feature Specification: Eliminar frase con confirmación

**Feature Branch**: `005-delete-phrase`

**Created**: 2026-10-23

**Status**: Draft

**Input**: User description: "necesito agregar la funcion eliminar revisa el contrato de ../../docs/03-xx/openapi.yaml y la UI en ../../prototype/ui , se tiene que agregar la confirmación antes de eliminar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eliminar una frase de la lista compartida (Priority: P1)

Como persona que utiliza la lista compartida, quiero eliminar una frase que ya no quiero mantener para que deje de aparecer para cualquier persona que consulte la lista.

**Why this priority**: Es el recorrido principal de la funcionalidad; sin él no existe forma de eliminar frases.

**Independent Test**: Desde el listado, iniciar la eliminación de una frase existente, confirmarla y comprobar que la frase desaparece del listado y se actualiza el total mostrado.

**Acceptance Scenarios**:

1. **Given** una frase visible en el listado, **When** la persona activa su acción de eliminar, **Then** se presenta un paso de confirmación que identifica claramente la frase a eliminar, sin enviar todavía ninguna solicitud.
2. **Given** el paso de confirmación visible, **When** la persona confirma expresamente, **Then** se envía la solicitud de eliminación y, al tener éxito, la frase desaparece del listado y el total visible se actualiza.
3. **Given** una eliminación en curso, **When** la persona repite clics sobre confirmar o sobre la acción de eliminar de esa misma frase, **Then** no se inician solicitudes adicionales para esa frase.

---

### User Story 2 - Cancelar antes de eliminar (Priority: P1)

Como persona que inició una eliminación por error, quiero poder cancelar antes de que se elimine la frase para evitar una pérdida de información no intencionada.

**Why this priority**: La cancelación es lo que hace segura la eliminación irreversible; sin ella la confirmación no protege a la persona.

**Independent Test**: Iniciar la eliminación de una frase, cancelar el paso de confirmación y comprobar que la frase permanece sin cambios en el listado y que no se envió ninguna solicitud.

**Acceptance Scenarios**:

1. **Given** el paso de confirmación visible para una frase, **When** la persona cancela o lo cierra sin confirmar, **Then** no se envía ninguna solicitud, la frase permanece visible y el listado no cambia.
2. **Given** una confirmación cancelada, **When** la persona vuelve a activar la acción de eliminar sobre la misma u otra frase, **Then** se presenta un nuevo paso de confirmación de forma independiente.

---

### User Story 3 - Reconocer y recuperarse de un fallo al eliminar (Priority: P2)

Como persona que confirmó una eliminación que no se pudo completar, quiero conocer el fallo y poder reintentarlo para no perder certeza sobre el estado de la frase.

**Why this priority**: Evita que una frase desaparezca de forma inconsistente o que la persona crea que se eliminó sin que así sea.

**Independent Test**: Confirmar la eliminación de una frase y simular por separado un fallo por frase inexistente y un fallo interno; comprobar el mensaje mostrado y la disponibilidad de un nuevo intento.

**Acceptance Scenarios**:

1. **Given** una confirmación enviada que falla por un error interno, **When** finaliza el intento, **Then** la frase permanece visible en el listado, se muestra un error y la acción de eliminar sobre esa frase vuelve a estar disponible para reintentar.
2. **Given** una confirmación enviada para una frase que ya no existe (eliminada previamente por otra persona), **When** finaliza el intento, **Then** se informa que la frase ya no está disponible y el listado visible deja de mostrarla, sin presentarlo como un error inesperado.

### Edge Cases

- Eliminar el último elemento visible de la página actual del listado: tras el éxito, la página deja de tener contenido y la pantalla recurre al comportamiento existente de listado (por ejemplo, retroceder de página o mostrar el estado de lista vacía) sin introducir una paginación nueva.
- Eliminar una frase que ya fue eliminada por otra persona entre que se cargó el listado y se confirmó la eliminación: se trata como caso de "ya no existe", no como error genérico.
- Pérdida de comunicación durante la eliminación: la frase permanece visible, no se reintenta automáticamente y no se garantiza si la eliminación llegó a completarse en el servidor.
- La eliminación es lógica y no reversible desde la aplicación; no se ofrece ninguna acción de restaurar.
- Las validaciones previas que mencionan una frase ya eliminada no se ven afectadas por esta funcionalidad ni se muestran de forma distinta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El listado DEBE ofrecer, para cada frase visible, una acción explícita para iniciar su eliminación.
- **FR-002**: Activar la acción de eliminar NO DEBE enviar ninguna solicitud de eliminación de inmediato; DEBE primero mostrar un paso de confirmación que identifique la frase afectada (por ejemplo, su texto).
- **FR-003**: El paso de confirmación DEBE ofrecer una opción explícita para cancelar que no elimine la frase ni modifique el listado.
- **FR-004**: Solo al confirmar expresamente el paso de confirmación, el sistema DEBE enviar la solicitud de eliminación de esa frase.
- **FR-005**: Mientras una solicitud de eliminación esté en curso para una frase, el sistema DEBE impedir iniciar otra solicitud de eliminación para esa misma frase (repetir clics o confirmaciones no debe duplicar la solicitud).
- **FR-006**: Cuando la eliminación se confirme en el servidor, la frase DEBE dejar de mostrarse en el listado visible y el total mostrado DEBE reflejar la nueva cantidad.
- **FR-007**: Cuando la eliminación falle por un motivo distinto a "la frase ya no existe", el sistema DEBE mostrar un mensaje de error, conservar la frase visible sin cambios y permitir un nuevo intento de eliminación sobre ella.
- **FR-008**: Cuando la eliminación falle porque la frase ya no existe (por ejemplo, eliminada previamente por otra persona), el sistema DEBE informarlo de forma distinguible de un error genérico y dejar de mostrar esa frase en el listado visible.
- **FR-009**: El sistema NO DEBE ofrecer ninguna acción para restaurar una frase ya eliminada.
- **FR-010**: La acción de eliminar y su confirmación DEBEN estar disponibles para cualquier persona que use la lista compartida, sin introducir un modelo de permisos nuevo.

### Key Entities *(include if feature involves data)*

- **Frase**: Elemento existente del listado (identificador, texto, fecha de creación) sobre el que se ejecuta la eliminación; deja de pertenecer al listado visible tras eliminarse.
- **Solicitud de eliminación en curso**: Estado temporal asociado a una frase concreta mientras se espera la respuesta del servidor; determina si la acción de eliminar y la confirmación están disponibles para esa frase.
- **Confirmación de eliminación**: Decisión explícita de la persona sobre una frase identificada, previa al envío de la solicitud; puede resolverse confirmando o cancelando.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las eliminaciones completadas con éxito fueron precedidas por una confirmación explícita de la persona; ninguna solicitud de eliminación se envía sin ese paso.
- **SC-002**: El 100 % de las confirmaciones canceladas no producen ninguna solicitud al servidor ni cambio visible en el listado.
- **SC-003**: Tras una eliminación exitosa, la frase deja de aparecer en el listado visible y el total se actualiza en una sola actualización de pantalla, sin requerir que la persona recargue manualmente.
- **SC-004**: El 100 % de los fallos de eliminación (error interno o frase inexistente) dejan a la persona en un estado claro desde el que puede continuar, sin mensajes ambiguos ni frases que desaparezcan sin explicación.

## Assumptions

- La eliminación opera sobre una frase a la vez; no se incluye selección ni eliminación múltiple, dado que el contrato expone eliminación por identificador individual.
- La confirmación es un paso ligero dentro de la misma pantalla (por ejemplo, un diálogo o un estado inline), consistente con la maqueta de página única existente; no se especifica una página separada.
- La lista sigue siendo compartida y sin autenticación: cualquier persona que la use puede eliminar cualquier frase, igual que ya puede verla, según el texto ya presente en la maqueta de la UI.
- El comportamiento general de carga, paginación y estado vacío del listado ya existe (especificación de listado); esta funcionalidad solo añade la acción de eliminar y su confirmación, reutilizando esos estados cuando el listado queda vacío o una página se queda sin contenido.
- No se agregan objetivos de latencia o concurrencia sin mediciones; los criterios de éxito describen comportamiento observable, no mediciones ya ejecutadas.
