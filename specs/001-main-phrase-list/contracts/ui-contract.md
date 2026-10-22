# Contrato de interfaz F001

Contrato de UI y fronteras de componentes; no introduce API HTTP.

## Ruta y regiones

`/` presenta PhrasesPage mediante React Router en app/app.router.tsx. Entrada directa y recarga muestran el mismo estado inicial. No añadir rutas de estados ni pantalla 404.

Documento lang es, título Frases, cabecera y un main con h1 y dos secciones con h2. Cabecera: «Frases» y «Lista compartida · Español». Introducción: «Cada idea, una frase.» y «Comprueba si tu frase se parece a otra antes de guardarla. Si encontramos una posible coincidencia, tú decides.».

## Feature phrases

| Unidad | Entrada | Presentación |
| --- | --- | --- |
| PhraseForm | Sin props de negocio | Nueva frase, campo inicial, ayuda, contador y acciones |
| PhraseList | Colección readonly de PhraseListItemData | Total, filas, aviso y paginador inicial |
| PhraseListItem | Un PhraseListItemData | Texto, time y Eliminar específico |
| PhrasePagination | page, totalPages | Límites visuales; sin callbacks ni navegación |

Formulario:

- Título «Nueva frase» y explicación «La validación revisa frases guardadas; no guarda la nueva frase.».
- Label «Frase en español» asociado al input de una línea, vacío, autocomplete off y placeholder «Escribe una frase corta».
- Ayuda «Una línea · De 1 a 280 caracteres · Al menos una palabra», asociada mediante aria-describedby; contador inicial «0 / 280».
- Validar habilitado sin resultados; Guardar con disabled nativo permanente. Botones type button para evitar submit implícito. Sin validación local, contador dinámico ni reglas nuevas de entrada.

Listado:

- Título «Frases guardadas», explicación «Las más recientes aparecen primero.» y contador «3 frases».
- Textos y fechas exactos de [data-model.md](../data-model.md), frases entre comillas tipográficas.
- ul/li, tabIndex 0, nombre «Frases guardadas, lista desplazable», máximo 360 px y overflow vertical propio.
- time con dateTime; cada botón muestra «Eliminar» y nombre accesible «Eliminar: {text}». Sin efectos ni diálogos.
- Aviso «Esta lista es compartida: cualquier persona puede ver y eliminar sus frases.».

Paginador al final del listado, nav con nombre «Paginación de frases». «← Atrás» aparece si page > 1; «Siguiente →» siempre visible y disabled si page >= totalPages. Inicial (1, 1); cuatro casos en data-model. Sin números, tamaños de página ni saltos.

## Shared UI

Ubicación exacta src/shared/components/ui; no crear un segundo árbol shared/ui.

| Primitiva | API mínima | Límites |
| --- | --- | --- |
| Button | Atributos nativos HTML, children y variantes visuales usadas para acción ordinaria, guardado y eliminación | Propagar type, disabled, eventos y aria; sin etiquetas o reglas de frases |
| Input | Atributos nativos HTML y className | Propagar id, aria-describedby y placeholder; sin label, ayuda, contador o esquema |

Button se consume en formulario, filas y paginador. Input es la primitiva transversal prevista por la arquitectura. Usar tipos nativos de React, sin API polimórfica ni motor genérico de formularios. Filas, formulario, listado y paginador permanecen en phrases.

## Presentación y accesibilidad

- DM Sans 400–700 y respaldo sans-serif; Tailwind compilado, sin CDN.
- Fondo #F7F8F5, superficies blancas, texto #17302D, secundarios de ui-spec, verde #1F6656, borde #DCE5DF, separador #E8EEE9 y eliminación #A43E38.
- Máximo 1440 px, padding 16/32/48 px en móvil/sm/lg; tarjetas, espacios y radios del prototipo.
- Desde 1024 px, columnas 1.02fr / 0.98fr; por debajo, formulario seguido del listado. Acciones apiladas en móvil y en fila desde 640 px con disposición de la referencia.
- Controles >= 44 px de alto; foco visible y disabled perceptible. Texto largo ajustable sin solapamiento; lista desplazable accesible con teclado.
- Sin advertencia precargada, indicador «Ejemplo de coincidencia», galería «Estados para revisar» ni pie de maqueta.

## Operaciones y futuro

Cero solicitudes de negocio y cero almacenamiento. Validar, Eliminar y botones habilitados del paginador no producen efectos ni resultados ficticios. Recursos visuales y de Vite pueden solicitarse normalmente.

El [OpenAPI aprobado](../../../../../docs/03-architecture/openapi.yaml) permanece intacto. Modelos remotos, colección vacía, callbacks y endpoints de eliminación se resolverán en entregas posteriores.
