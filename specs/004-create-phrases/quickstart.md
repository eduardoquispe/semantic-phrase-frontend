# Quickstart: Validar creación implementada

Ejecutar desde apps/frontend. Guía del comportamiento existente; no requiere nuevas capacidades.

## Prerrequisitos y comandos

- Node compatible, pnpm y dependencias del lockfile.
- API de prueba accesible y CORS compatible, con endpoints del [contrato HTTP](contracts/http-contract.md).
- Datos controlados para obtener resultados sin confirmación, textual_exact y vector. El servicio determina los resultados; no se supone umbral ni comando de seed.
- Colección con suficientes frases para navegar a página 2 y comprobar que se conserva.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
```

Vitest/jsdom están configurados en vite.config.ts, setup en src/test/test-setup.ts. Convención existente: `*.spec.ts`/`*.spec.tsx` junto al módulo; no se añade runner.

Para API que publique /api/v1/phrases y /api/v1/phrase-validations en puerto 3000:

```sh
VITE_API_BASE_URL=http://localhost:3000/api pnpm dev
```

Abrir URL de Vite y ruta `/`. Adaptar base al servidor real; reiniciar Vite si cambia. .env.example añade un /v1 respecto de los paths actuales; comprobar URL efectiva en Network según contrato.

## Recorridos manuales

| Caso | Pasos y resultado esperado | Referencia |
| --- | --- | --- |
| Inicial | Sin interacción: sin resultado; Validar disponible y Guardar deshabilitado. | US1.1 |
| Comprobar sin guardar | Escribir «  Hola mundo  », Enter: contador 10 / 280; POST de comprobación con Hola mundo, sin POST de creación. Si no exige confirmación, Frase validada y Guardar habilitado. | US1.2–3, FR-001–003 |
| Guardar | Pulsar Guardar: POST con texto normalizado y validationId, omitiendo confirmed. Tras éxito: Frase guardada, campo vacío y guardar deshabilitado. | US1.4–5, FR-004, FR-007 |
| Exacta | Respuesta textual_exact con confirmación: candidata, aviso y sin porcentaje. Guardar de todos modos envía confirmed true. | US2.1, US2.3–4 |
| Semántica | Respuesta vector con confirmación: candidata y porcentaje redondeado (0.914 → 91 %); guardar expresamente. | US2.2–4 |
| Candidata sin confirmación | match presente y requiresConfirmation false: Frase validada, sin candidata y acción Guardar. | US2.5 |
| Edición tras validar | Cambiar una letra y restaurarla: resultado descartado, guardar deshabilitado hasta nueva validación. | US3.1, FR-010 |
| Validar de nuevo | Con resultado previo, Validar limpia resultado, bloquea guardar mientras procesa y no crea frase. | US3.7 |
| Ocupado | Ralentizar por separado comprobación y creación; intentar editar, repetir clics y Enter. readOnly, botones bloqueados, aria-busy y progreso; una petición por acción aceptada. | US3.6, SC-004 |
| Página seleccionada | En página 2 guardar: GET activo conserva page 2 y limit 20; si responde bien, total vigente sin volver a 1. Nueva frase visible solo si le corresponde por orden. | US1.6, SC-005 |

## Entradas y recuperación

1. Probar vacío, espacios, «123», 281 letras, «Hola!», emoji, tabulación y salto de línea. Esperar error y ningún POST de comprobación. Si el input normaliza un carácter al pegar, comprobar la regla directamente en el esquema con un caso controlado; no interpretar su eliminación como aceptación por Zod. Una letra y 280 letras son válidas; símbolos permitidos con letras y espacios interiores se conservan, extremos se recortan. Véase [modelo](data-model.md).
2. Provocar fallo controlado solo del POST de comprobación: conserva texto, muestra error y bloquea guardar. Restaurar servicio y Validar: limpia error; nunca guarda automáticamente.
3. Tras validar, provocar fallo solo del POST de creación manteniendo GET disponible: conserva texto, descarta comprobación, no actualiza por ese fallo ni reintenta automáticamente. Restaurar, validar de nuevo y guardar expresamente.
4. Si API rechaza una comprobación vencida, inválida, usada, distinta del texto o sin confirmación, observar recuperación general. No esperar bloqueo local por reloj ni tratamiento especial por código.
5. Con respuestas controladas, probar detail no vacío y ausente/vacío: mostrar detalle o «Ocurrió un error. Inténtalo de nuevo.». No esperar errores del servicio asignados a campos.
6. Crear con éxito y fallar GET posterior: no interpretar fallo de consulta como fallo de persistencia; no hay confirmación adicional de actualización. Con fallo de red durante POST, la UI no determina si se creó ni evita duplicados entre nuevos intentos manuales.

## Evidencia y alcance

Registrar comandos y resultados; para escenarios manuales, peticiones, cuerpos, respuestas de prueba, mensajes, campo y página seleccionada. Revisar teclado, foco y ancho reducido si se ejecuta revisión manual.

Las pruebas existentes cubren formulario, hooks, transporte, servicio, mappers y feedback con dependencias simuladas. No hay cobertura explícita identificada de todos los límites 280/281 y caracteres; los escenarios anteriores no se declaran automatizados. El [contrato UI](contracts/ui-contract.md) relaciona módulos y requisitos. Esta guía no acredita ejecución manual ni integración real; no hay métricas de latencia medidas.

## Verificación de esta entrega — 2026-10-23

- `pnpm lint`: correcto.
- `pnpm build`: correcto; Vite informa un chunk minificado superior a 500 kB, sin cambios de bundle en este alcance documental.
- `pnpm test`: 17 archivos y 79 pruebas correctas.
- Escenarios manuales con navegador y backend: no ejecutados en esta entrega documental.
