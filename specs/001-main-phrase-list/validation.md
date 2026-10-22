# Validación de implementación F001

Fecha: 2026-10-22. Implementación T001–T019 terminada. La verificación en navegador y las capturas de T020 quedan a cargo del usuario por su instrucción explícita durante la implementación. No se declara completada esa comprobación.

## Resultado y alcance

La ruta `/` compone la cabecera, introducción, formulario inicial y listado ilustrativo con tres frases. React Router se configura en app; la página, las muestras, las filas y el paginador pertenecen a phrases. Shared contiene únicamente Button/Input. Tailwind se compila con Vite; no se añadieron dependencias ni infraestructura de pruebas.

Se respetó la convención kebab-case con sufijos resuelta en plan.md. Se conservaron como fuentes visuales mantenidas `../../../../docs/02-ui/ui-spec.md` y `../../../../prototypes/ui/index.html`, en lugar de duplicar su autoridad en otro documento de diseño. La paleta se implementa una sola vez en el bloque @theme de src/index.css y se consume mediante utilidades Tailwind.

## Comprobaciones ejecutadas

| Comprobación | Resultado real |
| --- | --- |
| `pnpm lint` | PASS; ESLint sin errores |
| `pnpm build` | PASS; TypeScript y Vite 8.3.5; 39 módulos transformados |
| Montajes temporales con React DOM Server de PhrasePagination | PASS para (1,1), (1,3), (2,3), (3,3): visibilidad de Atrás, disabled de Siguiente, type button y nombre de navegación correctos |
| Renderizado estático de PhrasesPage | PASS: tres li, tres time, un h1, dos h2, ayuda asociada, lista enfocable y nombres Eliminar específicos; sin form ni galería o indicador de coincidencia |
| Revisión de fuentes | Textos, orden y fechas cotejados con contrato y data-model; entradas públicas explícitas, shared sin imports de features/app, sin handlers de negocio ni HTTP o almacenamiento |
| Detector Impeccable `detect --json src` | `[]`: sin hallazgos |
| Auditor premium en modo strict | Cuatro hallazgos `affordance.actionless-button`; ver excepción de alcance abajo |

Los montajes se ejecutaron en un comando temporal de Node con TypeScript y react-dom/server ya instalados. No se agregaron archivos de pruebas ni scripts. La integración permanece en page=1 y totalPages=1.

Un intento auxiliar de inspección mediante jsdom falló al cargar undici por falta de createZstdDecompress en Node 22.12.0. Se descartó esa vía y el renderizado estático anterior pasó sin jsdom. Esto no afecta lint/build ni introduce una dependencia nueva.

## Excepción del auditor de UI

El resultado bruto se conserva en [premium-audit.json](premium-audit.json). El auditor detecta ausencia de acciones en Validar, Eliminar, Atrás y en la primitiva Button que propaga los eventos nativos por props. FR-011 y las tareas T005/T011/T013 exigen expresamente controles de presentación sin callbacks ni efectos. Por esa razón se conserva el comportamiento autorizado y no se añaden handlers ficticios para silenciar el auditor. El resultado strict no se presenta como aprobado.

## T020 — revisión en navegador pendiente del usuario

El intento de `pnpm dev --host 127.0.0.1` dentro del sandbox falló con EPERM al conectar con el puerto local de Console Ninja. El usuario indicó que realizará la revisión; no se inició un navegador ni se tomaron capturas.

Seguir [quickstart.md](quickstart.md), iniciando `pnpm dev` desde apps/frontend:

- Abrir y recargar `/`; verificar campo vacío, contador fijo, Guardar disabled y textos aprobados.
- Escribir, pulsar Enter y activar Validar/Eliminar; comprobar que las muestras y la URL permanecen, sin resultados ficticios ni solicitudes de negocio.
- Revisar 375, 640, 1023, 1024, 1440 px y un ancho mayor; máximo 1440 px, columnas desde 1024 y acciones en fila desde 640.
- Recorrer Tab/Shift+Tab; comprobar foco, controles disabled y desplazamiento por teclado de la lista. Forzar overflow y texto largo temporalmente con DevTools, como indica quickstart.
- Comprobar los cuatro estados del paginador en navegador, restaurando (1,1).
- Cotejar la referencia visual con DM Sans y el respaldo sans-serif. Registrar navegador y resultados.
- Guardar `screenshots/mobile.png` y `screenshots/desktop.png` en este directorio y completar T020 solo después de la revisión.

## Hooks

`.specify/extensions.yml` no existe. No hay hooks before_implement ni after_implement que despachar.
