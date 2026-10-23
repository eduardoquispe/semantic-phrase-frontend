# Tasks: Listado de frases guardadas

**Feature**: `002-list-phrases`  
**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md) y [contracts/](contracts/).  
**Estado**: Registro retrospectivo de la implementación existente, inspeccionada el 2026-10-23.

Este documento reconstruye un orden lógico de los pasos realizados; no acredita su cronología histórica. Las casillas `[x]` indican código existente, no pruebas ejecutadas en esta entrega. No hay tareas pendientes ni se solicita implementar funcionalidades adicionales.

**Formato**: `- [x] TXXX [P?] [US?] Paso realizado con ruta exacta`. `[US1]`–`[US4]` corresponden a las historias de la spec. `[P]` señala pasos en archivos distintos que podían desarrollarse en paralelo una vez disponibles sus dependencias. Todas las rutas parten de `apps/frontend`.

## Fase 1: Setup — infraestructura existente

**Propósito**: Disponer del transporte HTTP y del contexto de consultas utilizado por el listado.

- [x] T001 [P] Configurar el cliente Axios con `VITE_API_BASE_URL` en `src/shared/api/http-client.ts`.
- [x] T002 [P] Configurar `QueryClientProvider`, frescura de 60 segundos, un reintento de consulta y actualización por foco desactivada en `src/providers/query.provider.tsx`.

## Fase 2: Fundamentos — contratos de datos

**Propósito**: Representar las frases, consultas y respuestas paginadas antes de conectar su lectura.

- [x] T003 Definir `Phrase`, `PageMeta`, `PhraseListQuery` y `PhraseListResponse` con contenido y metadatos de paginación en `src/features/phrases/interfaces/phrase.interfaces.ts`.
- [x] T004 Definir `PhraseDTO`, `PhraseListQueryDTO` y `PhraseListResponseDTO` para el transporte de frases y fechas en `src/features/phrases/data/phrases.dto.ts`, reutilizando `PageMeta`.

## Fase 3: US1 — Consultar las frases compartidas (P1, MVP)

**Objetivo**: Mostrar automáticamente la primera página, sus fechas y el total de la colección.

**Criterio independiente de verificación**: Abrir `/` con una colección conocida de 45 frases; comparar las primeras 20 filas, su orden, texto entre comillas, fecha local y contador «45 frases». Comprobar título, explicación de orden y aviso de lista compartida.

- [x] T005 [P] [US1] Incorporar `phraseData.list` con `GET /v1/phrases`, parámetros `page`/`limit` y retorno del cuerpo de respuesta en `src/features/phrases/data/phrases.data.ts`.
- [x] T006 [P] [US1] Mapear consulta y respuesta, conservar orden y metadatos, y transformar `createdAt` con `toLocaleDateString()` en `src/features/phrases/mappers/phrases.mapper.ts`.
- [x] T007 [US1] Conectar consulta, acceso a datos y transformación de respuesta mediante `phraseService.list` en `src/features/phrases/services/phrases.service.ts`.
- [x] T008 [US1] Consultar el servicio con valores por defecto `page=1` y `limit=20`, y clave de caché `['phrases', { page, limit }]` en `src/features/phrases/hooks/phrases-list.hook.ts`.
- [x] T009 [US1] Presentar texto entre comillas y fecha de creación sin mostrar el identificador en `src/features/phrases/components/phrase-list-item/phrase-list-item.component.tsx`.
- [x] T010 [US1] Componer filas con su identificador como key, contador global `meta.total`, título, explicación de orden y aviso compartido; iniciar la consulta en página 1 con límite 20 en `src/features/phrases/components/phrase-list/phrase-list.component.tsx`.
- [x] T011 [US1] Integrar `PhraseList` en `src/features/phrases/pages/phrases/phrases.page.tsx` y exponer esa página en `/` mediante `src/app/app.router.tsx`.

## Fase 4: US2 — Recorrer las páginas (P1)

**Objetivo**: Avanzar y retroceder una página por acción, respetando los límites recibidos.

**Criterio independiente de verificación**: Con 45 registros estables, recorrer páginas de 20, 20 y 5 filas y regresar con dos retrocesos. «← Atrás» solo aparece desde la página 2; «Siguiente →» permanece visible y se deshabilita en la última o única página.

- [x] T012 [US2] Emitir cambios de una página desde «← Atrás» y «Siguiente →», ocultar retroceso en la primera y deshabilitar avance al alcanzar `totalPages` en `src/features/phrases/components/phrase-pagination/phrase-pagination.component.tsx`.
- [x] T013 [US2] Conectar `onPageChange` con el estado local y la consulta de límite 20, pasando `meta.page` y `meta.totalPages` con fallback a 1 al paginador en `src/features/phrases/components/phrase-list/phrase-list.component.tsx`.

## Fase 5: US3 — Consultar una colección vacía y leer contenido extenso (P2)

**Objetivo**: Representar el resultado vacío existente y permitir lectura mediante ajuste de texto, teclado y desplazamiento.

**Criterio independiente de verificación**: Tras una respuesta exitosa vacía, observar «0 frases», cero filas y avance deshabilitado, sin mensaje específico de vacío. Con 20 frases extensas, revisar a 320 y 1280 px el ajuste de texto, fechas legibles, foco y acceso a la última fila mediante teclado y scroll.

- [x] T014 [US3] Usar un arreglo vacío como fallback de filas y mostrar el total recibido sin agregar un mensaje de vacío en `src/features/phrases/components/phrase-list/phrase-list.component.tsx`.
- [x] T015 [US3] Habilitar foco con `tabIndex={0}`, nombre accesible, foco visible y desplazamiento vertical con altura máxima de 360 px en `src/features/phrases/components/phrase-list/phrase-list.component.tsx`.
- [x] T016 [US3] Ajustar palabras largas al ancho disponible y presentar la fecha debajo del texto en `src/features/phrases/components/phrase-list-item/phrase-list-item.component.tsx`.

## Fase 6: US4 — Consultar el listado después de guardar (P2)

**Objetivo**: Actualizar los datos tras un guardado exitoso conservando la página consultada.

**Criterio independiente de verificación**: Guardar desde las páginas 1 y 2 y comprobar actualización de contenido y total conservando la selección. Ante un guardado fallido, comprobar que esa mutación no invalida el listado ni inserta una frase ficticia.

- [x] T017 [US4] Invalidar el prefijo de consultas `['phrases']` únicamente en `onSuccess` del guardado, devolviendo la promesa de invalidación y sin insertar filas optimistas en `src/features/phrases/hooks/save-phrase.hook.ts`.
- [x] T018 [US4] Mantener la página seleccionada en el estado local del listado, sin reiniciarla tras guardar, en `src/features/phrases/components/phrase-list/phrase-list.component.tsx`.

## Fase 7: Cierre y aspectos transversales

Sin tareas adicionales. Los pasos anteriores describen únicamente código existente. Las pruebas ya disponibles se registran como evidencia en [research.md](research.md); los comandos y escenarios de verificación están en [quickstart.md](quickstart.md). No se agregan tareas para crear tests ni se acredita su ejecución en esta entrega.

Se conservan las limitaciones descritas en la spec: ausencia de indicadores de carga/error, contador sin cifra cuando faltan datos, literal «1 frases» y ausencia de eliminación, búsqueda o filtros. Tampoco se modifica la configuración de la API.

## Dependencias y orden lógico

```text
Setup (T001–T002)
  → Fundamentos (T003–T004)
    → US1 (T005–T011)
      → US2 (T012–T013)
      → US3 (T014–T016)
      → US4 (T017–T018)
```

US2, US3 y US4 amplían el listado de US1 y tienen criterios de verificación separados. Para comprobar que US4 conserva una página posterior se utiliza la navegación de US2; el guardado es una capacidad existente fuera de este alcance salvo su invalidación del listado.

### Paralelismo por historia

- **US1**: T005 (acceso HTTP) y T006 (mappers) podían realizarse en paralelo tras definir los tipos; T007 los integra, seguido por hook y presentación.
- **US2**: El paginador T012 precede a su conexión T013; no se marcan pasos paralelos dentro de la historia.
- **US3**: T014 y T015 comparten archivo y son secuenciales. T016 podía realizarse junto con ellos después de US1, pero no lleva `[P]` porque T013/T018 también modifican el listado y T009 modifica la fila en otras fases.
- **US4**: Invalidación T017 y conservación del estado T018 se describen en orden de integración; no se propone trabajo paralelo sobre el listado compartido con otras historias.

T001 y T002 también eran independientes entre sí. Estos ejemplos explican las dependencias del trabajo existente; no solicitan ejecutar agentes ni nuevas implementaciones.

## Estrategia retrospectiva: MVP e incrementos

1. Disponer del transporte, caché y tipos del listado (fases 1–2).
2. Conectar lectura y presentación en `/` (US1): alcance mínimo del MVP ya implementado.
3. Añadir navegación sobre la consulta paginada (US2).
4. Completar la lectura de vacío y contenido extenso con las reglas existentes (US3).
5. Integrar la actualización después del guardado conservando selección (US4).

**Resumen**: 18 pasos completados: 2 de setup, 2 de fundamentos, 7 de US1, 2 de US2, 3 de US3 y 2 de US4. Cero tareas pendientes de implementación.
