# Quickstart: Validar listado implementado

Ejecutar desde apps/frontend. Guía retrospectiva sin nueva implementación.

## Prerrequisitos

- Node compatible con herramientas instaladas, pnpm y dependencias del lockfile.
- API accesible desde navegador y CORS compatible con Vite.
- Base que combinada con /v1/phrases alcance endpoint real; revisar [contrato HTTP](contracts/http-contract.md). .env.example contiene un /v1 adicional.
- Colecciones controladas de 0, 1, 20, 21 y 45 frases, orden conocido y fechas válidas. Prepararlas con herramientas del backend o guardado existente. No hay comando de seed ni eliminación en esta UI; usar entorno de prueba.

## Comandos

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
```

Runner existente: Vitest con jsdom y src/test/test-setup.ts, configurado en vite.config.ts. Convención: *.spec.ts / *.spec.tsx junto al módulo. No se introduce runner.

Para un servidor que publique http://localhost:3000/api/v1/phrases:

```sh
VITE_API_BASE_URL=http://localhost:3000/api pnpm dev
```

Sustituir base si el backend usa otro prefijo. Abrir URL indicada por Vite, entrar en `/` y comprobar GET y parámetros en Network. Reiniciar Vite al cambiar entorno.

## Escenarios manuales

| Caso | Pasos / resultado esperado | Criterio |
| --- | --- | --- |
| 0 frases | Caché limpia y éxito vacío: «0 frases», cero filas, sin Atrás, Siguiente deshabilitado. | SC-001, SC-003 |
| 1 frase | Texto entre comillas y fecha local correcta; literal «1 frases». | SC-001 |
| 20 frases | Contar 20 filas con scroll; total 20 y avance deshabilitado. | SC-001, SC-003 |
| 21 frases | Primera página 20 filas; avanzar y ver una; Atrás habilitado y avance deshabilitado. | SC-001, SC-003 |
| 45 frases estables | Recorrer 20/20/5 filas, siempre total 45; volver con dos retrocesos. Comparar ids en Network para detectar omisiones/duplicados. | SC-001–SC-003 |
| Texto extenso | A 320 y 1280 px usar Tab, enfocar lista/controles y desplazar hasta última fila; foco visible, texto ajustado y fechas sin solapamiento. | SC-004 |
| Guardado en página 1 | Guardar con flujo existente; consulta activa actualizada, total vigente y selección 1. | SC-005 / US4.1 |
| Guardado en página 2 | Con al menos 45 registros, navegar a 2 y guardar; consulta actualizada conserva page=2 aunque cambien filas. | SC-005 / US4.2 |
| Guardado fallido | Provocar fallo controlado en petición de creación manteniendo lectura disponible; sin invalidación por esa mutación ni inserción ficticia. | SC-005 / US4.3 |

## Límites observables

1. Con caché limpia bloquear GET o ralentizar red en DevTools. Sin datos esperar lista vacía, contador sin cifra, navegación 1/1 y ningún indicador de carga/error. Puede haber un reintento de consulta. Esto no confirma una colección vacía.
2. Restaurar red, recargar y obtener datos. Bloquear después GET y provocar actualización sin desmontar listado: pueden permanecer últimos datos sin aviso.
3. Distinguir caché de peticiones HTTP durante navegación: frescura 60 segundos; foco de ventana no actualiza.
4. Comparar fecha con new Date(createdAt).toLocaleDateString() en el mismo navegador. No exigir locale español ni día idéntico entre zonas horarias.

## Evidencia y alcance

Registrar comandos, resultados, URL efectiva sin secretos y datos usados. Capturar revisión visual si se ejecuta. Pruebas aisladas no acreditan integración con backend real, recorrido completo de 45 registros ni accesibilidad visual. Sin medición de latencia asociada.

Referencias: [modelo](data-model.md), [contrato UI](contracts/ui-contract.md). Generar esta guía no acredita ejecución manual de sus escenarios.

## Verificación de esta entrega — 2026-10-23

- `pnpm lint`: correcto.
- `pnpm build`: correcto; Vite informa un chunk minificado superior a 500 kB. Sin cambios de bundle en este alcance documental.
- `pnpm test`: 17 archivos y 79 pruebas correctas.
- Enlaces Markdown locales de la funcionalidad: correctos.
- Escenarios manuales con navegador y backend: no ejecutados en esta entrega documental.
