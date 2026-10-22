# Guía de validación F001

Ejecutar después de implementar el plan. Esta fase solo genera documentos; no declara que exista ya la UI descrita.

## Preparación

Requisitos: Node compatible con la versión de Vite declarada, pnpm y dependencias instaladas. No iniciar backend, base de datos ni modelo IA. Google Fonts permite cotejar DM Sans; comprobar también la legibilidad con la fuente de respaldo si no está disponible.

Desde apps/frontend:

```sh
pnpm install
pnpm lint
pnpm build
pnpm dev
```

Abrir la URL de Vite en `/`. No hay script pnpm test ni runner configurado para F001. Checks previstos: lint/build y revisión manual.

## US1 — Ruta y formulario inicial

1. Acceder directamente y recargar `/`; comprobar las regiones y textos del [contrato UI](contracts/ui-contract.md).
2. Verificar campo vacío, placeholder, label y ayuda asociada, contador 0 / 280, Validar habilitado y Guardar disabled.
3. Comprobar ausencia de advertencia, indicador de coincidencia, galería y pie de maqueta.
4. Escribir texto, activar Validar y pulsar Enter en el campo: sin envío, recarga, resultados ni habilitación de Guardar. El contador es fijo en F001.
5. Recargar restablece el campo vacío y las muestras iniciales.

## US2 — Listado y acciones sin efectos

1. Cotejar las tres filas, orden y fechas con [data-model.md](data-model.md) y el [prototipo](../../../../prototypes/ui/index.html); total 3 frases.
2. Revisar árbol de accesibilidad: cada Eliminar incluye la frase; fechas con time y dateTime.
3. Activar las tres acciones Eliminar: filas y total permanecen, sin diálogo ni éxito ficticio.
4. Comprobar aviso de lista compartida.
5. En Network de DevTools, observar carga y activaciones: cero solicitudes a endpoints de negocio; fuentes y recursos de Vite pueden cargarse.

## US3 — Cuatro estados del paginador

La muestra inicial usa (1, 1). Para revisar los demás casos, montar temporalmente PhrasePagination con los valores de la tabla en el mismo entorno local; no cambiar las muestras, crear galerías, rutas, controles de depuración ni dependencias. Restaurar (1, 1) antes de entregar y repetir lint/build si se modificó código.

| page | totalPages | Resultado |
| --- | --- | --- |
| 1 | 1 | Sin Atrás; Siguiente visible y disabled |
| 1 | 3 | Sin Atrás; Siguiente habilitado |
| 2 | 3 | Atrás y Siguiente habilitados |
| 3 | 3 | Atrás habilitado; Siguiente disabled |

Activar controles habilitados no cambia filas, props ni URL. Sin controles avanzados.

## US4 — Responsive y teclado

1. Revisar a 375, 640, 1023, 1024 y 1440 px y ventana mayor: máximo 1440 px; dos columnas desde 1024; acciones en fila desde 640; sin scroll horizontal.
2. Tab/Shift+Tab: foco visible en campo, acciones habilitadas y lista. Guardar y Siguiente disabled no reciben foco. Nombres y etiquetas comprensibles.
3. En DevTools, reducir temporalmente la altura máxima de la lista para forzar overflow; enfocarla y desplazar con teclado. Restaurar el estilo sin añadir frases.
4. Sustituir temporalmente en DevTools un texto por una frase larga y una cadena sin espacios: comprobar ajuste sin solapamientos. Recargar restaura las muestras.
5. Cotejar tipografía, paleta, superficies, bordes, radios, espacios y jerarquía con la referencia. Capturar móvil y escritorio para el PR.

## Cierre de implementación

- Lint y build pasan sobre el estado definitivo.
- Documentar navegador, anchos y resultados US1–US4, incluidos los cuatro montajes del paginador.
- Revisar imports: shared no depende de features/app; componentes sin HTTP o DTOs; muestras en phrases.
- Adjuntar capturas, reproducción y validación al PR; excluir dist y node_modules.
