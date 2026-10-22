# File recipes: worked example and real feature patterns

Didactic walkthrough: create a product and show the last confirmed result. It teaches how to build each file; it does not add a real feature to the phrases MVP. The endpoints, fields, limits, and HTTP 409 below are illustrative — replace them with the approved OpenAPI contract when implementing real behavior. Relative imports assume the folder tree in SKILL.md, with no path alias configured.

## Contents

- [Overview and file map](#overview-and-file-map)
- [01 — Shared Axios client](#01-shared-axios-client)
- [02 — API endpoint constants](#02-api-endpoint-constants)
- [03 — Internal model](#03-internal-model)
- [04 — DTO: external contract](#04-dto-external-contract)
- [05 — Mapper: pure transformation](#05-mapper-pure-transformation)
- [06 — API: request and model boundary](#06-api-request-and-model-boundary)
- [07 — Optional service](#07-optional-service)
- [08 — Shared technical error](#08-shared-technical-error)
- [09 — Local types: props and values](#09-local-types-props-and-values)
- [10 — Constants and default values](#10-constants-and-default-values)
- [11 — Schema: local Zod validation](#11-schema-local-zod-validation)
- [12 — Form and mutation hook](#12-form-and-mutation-hook)
- [13 — Component: fields and presentation](#13-component-fields-and-presentation)
- [14 — Page hook and state scope](#14-page-hook-and-state-scope)
- [15 — Feature page](#15-feature-page)
- [16 — Optional unit styles](#16-optional-unit-styles)
- [17 — Index: public surface](#17-index-public-surface)
- [18 — Error flow walkthrough](#18-error-flow-walkthrough)
- [Real `phrases` examples](#real-phrases-examples)
- [Placement decisions](#placement-decisions)

## Overview and file map

```text
page → componente → hook de formulario → API → mapper de entrada → HTTP
                                            ← mapper de salida ← respuesta
                         ↓ éxito
                    callback → hook de página → resultado
```

Zod valida antes de la mutación. TanStack Query administra la petición. El hook interpreta el error técnico normalizado por el cliente compartido. Un service solo se introduce si hay coordinación independiente de React que lo justifique; no hay una capa `data + service` obligatoria.

### Contrato ilustrativo

Con `baseURL: '/api'`, `POST /v1/products` recibe:

```json
{ "product_name": "Aceite vegetal", "unit_price": 12.5 }
```

Devuelve HTTP 201:

```json
{ "data": { "product_id": "prd-001", "product_name": "Aceite vegetal", "unit_price": 12.5 } }
```

HTTP 409 significa nombre duplicado solo en este ejemplo. El modelo interno es `{ id, name, price }`. El ejemplo no requiere sesión ni autenticación. Una respuesta perdida a un POST no permite afirmar que el servidor no guardó.

### Mapa de archivos

Los números corresponden a las [recetas del SKILL.md](../SKILL.md#file-recipes). Los imports relativos de cada bloque asumen este árbol, sin alias configurados:

```text
src/
├── shared/api/
│   ├── http-client.ts                    # 01
│   └── http-error.ts                     # 08
└── features/product-example/
    ├── models/product.model.ts           # 03
    ├── api/
    │   ├── products.constants.ts         # 02
    │   ├── products.api.ts               # 06
    │   ├── dtos/product.dto.ts           # 04
    │   └── mappers/product.mapper.ts     # 05
    ├── hooks/use-product-example/
    │   ├── index.ts
    │   └── use-product-example.hook.ts   # 14
    ├── pages/product-example/
    │   ├── index.ts
    │   └── product-example.page.tsx      # 15
    └── components/product-form/
        ├── index.ts                     # 17
        ├── product-form.component.tsx   # 13
        ├── product-form.types.ts        # 09
        ├── product-form.constants.ts    # 10
        ├── product-form.schema.ts       # 11
        └── use-product-form.hook.ts     # 12
```

El hook privado del formulario permanece junto a su único consumidor. Si varias unidades lo consumen, puede promoverse a `hooks/use-product-form/` con su `index.ts`. El schema es local; uno compartido por el feature pertenece a `schemas/`. Los estilos de [16](#16-optional-unit-styles) y el service de [07](#07-optional-service) son alternativas opcionales, no archivos necesarios para ejecutar este recorrido. Las pruebas acompañan a las unidades; las integraciones van en `__tests__/` del feature.

No crear `core/`, `screens/`, `.interface.ts`, `.hooks.ts` ni `.data.ts` como nuevas convenciones. Un `interface` de TypeScript puede vivir en un `.model.ts` o `.types.ts`; el sufijo describe la responsabilidad, no la sintaxis usada.

## 01 — Shared Axios client

Archivo: `src/shared/api/http-client.ts`. Reutiliza el cliente existente; el bloque muestra una configuración mínima para el ejemplo completo.

```ts
import axios from 'axios'
import { toHttpError } from './http-error'

export const httpClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

httpClient.interceptors.response.use(
  response => response,
  (error: unknown) => Promise.reject(toHttpError(error)),
)
```

La URL relativa presupone API en el mismo origen o proxy para `/api`. En la aplicación real conserva su configuración de entorno, headers, interceptores y cancelación. No agregues un segundo cliente para un feature ni inventes autenticación.

El cliente normaliza fallos técnicos con [08](#08-shared-technical-error); no abre modales, muestra notificaciones, navega ni interpreta duplicados. Los DTOs y rutas pertenecen a `features/<feature>/api/`. Axios rechaza respuestas fuera de 2xx por defecto.

## 02 — API endpoint constants

Archivo del ejemplo: `src/features/product-example/api/products.constants.ts`.

```ts
export const PRODUCTS_ENDPOINT = '/v1/products'
```

Con `baseURL: '/api'`, la ruta final es `/api/v1/products`. Usa el endpoint del contrato real al implementar una funcionalidad. Una ruta de uso único puede permanecer en `.api.ts`; extraerla tiene sentido si mejora la lectura o se reutiliza. No centralices endpoints de todos los features en `shared/`.

Las claves de TanStack Query pertenecen al feature y deben incluir filtros/paginación cuando existan. Comparte una clave entre queries e invalidaciones cuando corresponda; no crees constantes globales para textos de uso único.

## 03 — Internal model

Archivo: `src/features/product-example/models/product.model.ts`.

```ts
export interface Product {
  id: string
  name: string
  price: number
}

export type CreateProductInput = {
  name: string
  price: number
}
```

El archivo se llama `.model.ts` aunque use `interface`. No se requiere el prefijo `I`. La API expone `CreateProductInput → Promise<Product>`; UI y hooks conocen estos modelos, no los DTOs externos.

Aquí van conceptos internos del feature. Las props y valores locales van en `.types.ts` de su unidad. No hagas que el modelo importe DTOs, Axios o React. Una unión discriminada suele bastar para estados; crea enums solo cuando el caso concreto los necesite.

## 04 — DTO: external contract

Archivo: `src/features/product-example/api/dtos/product.dto.ts`.

```ts
export type CreateProductDto = {
  product_name: string
  unit_price: number
}

export type ProductDto = {
  product_id: string
  product_name: string
  unit_price: number
}

export type CreateProductResponseDto = {
  data: ProductDto
}
```

Los nombres y envoltorios reflejan el [contrato de ejemplo](#contrato-ilustrativo); los reales salen de OpenAPI. No agregues un envoltorio `data` si la API no lo devuelve. Las respuestas y parámetros de transporte no se exportan a componentes.

Los genéricos de Axios no validan JSON en ejecución. Cuando sea necesario comprobar el contrato, recibe `unknown` y valida en la frontera API/mapper, sin convertir respuestas inválidas en modelos aparentemente válidos. Reutiliza los validadores existentes.

## 05 — Mapper: pure transformation

Archivo: `src/features/product-example/api/mappers/product.mapper.ts`.

```ts
import type { CreateProductInput, Product } from '../../models/product.model'
import type { CreateProductDto, ProductDto } from '../dtos/product.dto'

export function toCreateProductDto(input: CreateProductInput): CreateProductDto {
  return { product_name: input.name, unit_price: input.price }
}

export function toProduct(dto: ProductDto): Product {
  return { id: dto.product_id, name: dto.product_name, price: dto.unit_price }
}
```

La transformación pertenece a la frontera API. No hace peticiones ni controla React, mensajes o navegación. La normalización de texto debe seguir el contrato; no agregues `trim`, cambios de mayúsculas o conversiones numéricas que alteren el significado sin autorización funcional.

No crees mappers identidad por obligación. Prueba conversiones relevantes, campos opcionales y valores inválidos cuando el mapper también valide entradas externas.

## 06 — API: request and model boundary

Archivo: `src/features/product-example/api/products.api.ts`. El nombre de esta receta conserva `data`, pero el archivo que se crea es `.api.ts`.

```ts
import { httpClient } from '../../../shared/api/http-client'
import type { CreateProductInput, Product } from '../models/product.model'
import { PRODUCTS_ENDPOINT } from './products.constants'
import type { CreateProductResponseDto } from './dtos/product.dto'
import { toCreateProductDto, toProduct } from './mappers/product.mapper'

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await httpClient.post<CreateProductResponseDto>(
    PRODUCTS_ENDPOINT,
    toCreateProductDto(input),
  )
  return toProduct(response.data.data)
}
```

El primer `.data` es de Axios; el segundo es del JSON ilustrativo. La función conoce verbo, endpoint y contrato externo; devuelve un modelo interno. No contiene estados visuales, callbacks de UI ni invalidación de queries.

El cliente compartido normaliza errores técnicos. Déjalos propagarse: devolver `null`, `[]` o un modelo falso ocultaría el fallo. Reutiliza soporte de `AbortSignal` para lecturas cancelables cuando corresponda. No agregues una capa `.data.ts` ni un service que solo delegue esta operación.

## 07 — Optional service

No se necesita service en el ejemplo de un solo POST de productos. Crear `createProductService = createProduct` solo agrega una capa.

Cuando el flujo tiene coordinación real, usa una carpeta autocontenida:

```text
features/phrases/services/phrase-submission/
├── index.ts
├── phrase-submission.service.ts
└── phrase-submission.types.ts   # si el contrato lo requiere
```

Lee [el ejemplo de coordinación e inyección de funciones](#optional-service-and-function-injection) para un caso con validación previa y guardado condicional. Sus tipos son ilustrativos y deben adaptarse al contrato y flujo aprobados; no autorizan guardado automático donde se exige una acción explícita.

El service recibe modelos internos y funciones tipadas si necesita colaboradores sustituibles. No importa React, TanStack Query, DTOs de transporte o componentes. El hook conserva estado, confirmación, descarte de validaciones obsoletas e invalidación de caché. No introducir puertos, repositorios abstractos o un contenedor de inyección por obligación.

Exporta explícitamente la operación pública desde `index.ts` y prueba la coordinación con dobles de funciones cuando amerite una prueba.

## 08 — Shared technical error

Archivo de ejemplo: `src/shared/api/http-error.ts`. La aplicación ya tiene `HttpError`; conserva su contrato y amplíalo solo si el cambio lo necesita. Este bloque es una alternativa mínima coherente con el cliente de [01](#01-shared-axios-client), no un reemplazo del existente.

```ts
import axios from 'axios'

export class HttpError extends Error {
  constructor(
    readonly category: 'network' | 'timeout' | 'http' | 'unknown',
    readonly status?: number,
  ) {
    super('No se pudo completar la solicitud.')
    this.name = 'HttpError'
  }
}

export function toHttpError(error: unknown): unknown {
  if (axios.isCancel(error)) return error
  if (error instanceof HttpError) return error
  if (!axios.isAxiosError(error)) return new HttpError('unknown')
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new HttpError('timeout')
  }
  if (!error.response) return new HttpError('network')
  return new HttpError('http', error.response.status)
}
```

La UI interpreta un error normalizado, sin importar Axios. Conserva la cancelación para que el consumidor pueda ignorarla; una cancelación no es un fallo que deba anunciarse. Los códigos funcionales seguros pueden preservarse según el contrato real, sin mostrar mensajes técnicos ni cuerpos arbitrarios al usuario.

Un HTTP 401 no demuestra por sí solo que exista una sesión vencida. Usa el flujo de autenticación existente solo si lo hay. Un timeout de escritura puede ocurrir después de persistir: no configures reintentos automáticos que dupliquen operaciones.

## 09 — Local types: props and values

Archivo: `src/features/product-example/components/product-form/product-form.types.ts`.

```ts
import type { z } from 'zod'
import type { Product } from '../../models/product.model'
import type { productFormSchema } from './product-form.schema'

export type ProductFormValues = z.infer<typeof productFormSchema>

export type ProductFormProps = {
  id: string
  onCreated: (product: Product) => void
}
```

El schema define la forma de los campos; inferirla evita duplicarla. No importes estos tipos desde el schema si eso cierra un ciclo. Si el schema transforma tipos de entrada, distingue `z.input` de `z.output` y ajusta los genéricos del formulario.

Los valores de formulario y el input de aplicación pueden coincidir estructuralmente sin compartir responsabilidad. El callback ilustrativo es síncrono. Si el consumidor necesita una operación asíncrona, declara y espera ese contrato explícitamente. Los tipos compartidos por varias unidades del feature pueden vivir en `models/`; no promuevas props locales a modelos globales.

## 10 — Constants and default values

Archivo: `src/features/product-example/components/product-form/product-form.constants.ts`.

```ts
import type { ProductFormValues } from './product-form.types'

export const PRODUCT_FORM_DEFAULT_VALUES: ProductFormValues = {
  name: '',
  price: 0,
}
```

El hook reutiliza estos valores al iniciar y limpiar el formulario. El cero obliga a indicar un precio válido. Un límite que solo usa el schema puede quedar junto al schema; si se comparte con la UI, extráelo sin crear un ciclo schema → constants → types → schema.

Extrae valores por reutilización, significado o legibilidad. No necesitas una constante para cada etiqueta. Las rutas van en `api/`, las claves de caché en el feature y los tokens visuales en el sistema de estilos existente.

## 11 — Schema: local Zod validation

Archivo: `src/features/product-example/components/product-form/product-form.schema.ts`.

```ts
import { z } from 'zod'

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa el nombre.').max(100, 'Usa hasta 100 caracteres.'),
  price: z.number({ error: 'Ingresa un precio válido.' }).positive('El precio debe ser mayor que cero.'),
})
```

Ejemplo para la versión de Zod instalada en este proyecto. `valueAsNumber` del input aporta un número; vacío produce `NaN`, que el schema rechaza. El `.trim()` solo corresponde al contrato didáctico de productos: no copiarlo al texto de frases sin revisar sus reglas.

Usa `zodResolver` en el hook. Las reglas de sintaxis del cliente no confirman disponibilidad, similitud ni autorización para persistir. Un schema de varios consumidores va en `features/<feature>/schemas/`; uno exclusivo del formulario puede permanecer aquí. No instalar Yup para reproducir ejemplos anteriores.

## 12 — Form and mutation hook

Archivo: `src/features/product-example/components/product-form/use-product-form.hook.ts`.

```ts
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HttpError } from '../../../../shared/api/http-error'
import { createProduct } from '../../api/products.api'
import { PRODUCT_FORM_DEFAULT_VALUES } from './product-form.constants'
import { productFormSchema } from './product-form.schema'
import type { ProductFormProps, ProductFormValues } from './product-form.types'

function getCreationError(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 409) return 'Ya existe un producto con ese nombre.'
    if (error.category === 'network' || error.category === 'timeout') {
      return 'No se pudo confirmar el guardado. Comprueba el resultado antes de repetirlo.'
    }
  }
  return 'No se pudo guardar el producto.'
}

export function useProductForm({ onCreated }: ProductFormProps) {
  const mutation = useMutation({ mutationFn: createProduct, retry: false })
  const form = useForm<ProductFormValues>({
    defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
    resolver: zodResolver(productFormSchema),
    mode: 'onSubmit',
  })

  const onSubmit = form.handleSubmit(async values => {
    mutation.reset()
    let product: Awaited<ReturnType<typeof createProduct>>
    try {
      product = await mutation.mutateAsync(values)
    } catch {
      return
    }
    form.reset(PRODUCT_FORM_DEFAULT_VALUES)
    onCreated(product)
  })

  return {
    form,
    onSubmit,
    pending: form.formState.isSubmitting,
    requestError: mutation.isError ? getCreationError(mutation.error) : null,
  }
}
```

La promesa de `mutateAsync` mantiene `isSubmitting` hasta terminar. No dupliques el mismo estado con otro `useState`. El `catch` evita anunciar éxito y conserva los campos; TanStack Query conserva el error. `onCreated` queda fuera del `try` para no describir errores de presentación como fallos de HTTP.

Este hook privado no requiere carpeta propia ni barrel. No importa DTOs ni Axios. Si también hay una lista remota, invalida su clave después del éxito confirmado mediante el `QueryClient`, sin copiar esa lista a estado local. El ejemplo muestra el último producto creado y no tiene lista remota.

En frases, reutiliza el hook de envío existente: separar validar, guardar y confirmar, invalidar resultados al editar y descartar respuestas obsoletas requiere su propio flujo. No reemplazarlo por este POST simple.

## 13 — Component: fields and presentation

Archivo: `src/features/product-example/components/product-form/product-form.component.tsx`.

```tsx
import { useProductForm } from './use-product-form.hook'
import type { ProductFormProps } from './product-form.types'

export function ProductForm(props: ProductFormProps) {
  const { id } = props
  const { form, onSubmit, pending, requestError } = useProductForm(props)
  const { register, formState: { errors } } = form

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={pending}>
      <fieldset disabled={pending}>
        <legend>Datos del producto</legend>
        <label htmlFor={`${id}-name`}>Nombre</label>
        <input
          id={`${id}-name`}
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
        />
        {errors.name && <p id={`${id}-name-error`} role="alert">{errors.name.message}</p>}
        <label htmlFor={`${id}-price`}>Precio (S/)</label>
        <input
          id={`${id}-price`}
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          aria-invalid={Boolean(errors.price)}
          aria-describedby={errors.price ? `${id}-price-error` : undefined}
        />
        {errors.price && <p id={`${id}-price-error`} role="alert">{errors.price.message}</p>}
        <button type="submit">{pending ? 'Guardando…' : 'Guardar'}</button>
      </fieldset>
      {requestError && <p role="alert">{requestError}</p>}
    </form>
  )
}
```

El componente renderiza modelos y estado de su hook, no implementa transporte. HTML nativo hace legible el ejemplo; al integrarlo reutiliza controles y tokens existentes conservando labels, mensajes y teclado. Cada instancia recibe un `id` distinto. No necesitas `FormProvider` para campos registrados directamente.

Usa el sufijo singular `.component.tsx` y exportación nombrada. Un componente puramente visual puede recibir todos sus datos y handlers por props; no extraigas un hook vacío por obligación. Los hijos normales no necesitan subcomponentes estáticos ni un contexto nuevo.

## 14 — Page hook and state scope

Archivo: `src/features/product-example/hooks/use-product-example/use-product-example.hook.ts`.

```ts
import { useState } from 'react'
import type { Product } from '../../models/product.model'

export function useProductExample() {
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null)
  return { createdProduct, handleProductCreated: setCreatedProduct }
}
```

`hooks/use-product-example/index.ts`:

```ts
export { useProductExample } from './use-product-example.hook'
```

Conserva el último resultado confirmado durante la vida de la página; se pierde al desmontarla. Es estado transitorio de presentación, no una caché de lista remota. En una página tan pequeña también puede quedarse en la página; la extracción muestra el límite de responsabilidades.

Para consultas remotas usa TanStack Query y la API del feature, como en [el ejemplo de listado](#page-component-and-hook). Expón estados pending/error/empty y modelos internos; pasa filtros y paginación a la clave, y `AbortSignal` a la API cuando tenga soporte. No copies datos de Query a `useState` para mantener una segunda fuente de verdad.

## 15 — Feature page

Archivo: `src/features/product-example/pages/product-example/product-example.page.tsx`.

```tsx
import { ProductForm } from '../../components/product-form'
import { useProductExample } from '../../hooks/use-product-example'

export function ProductExamplePage() {
  const { createdProduct, handleProductCreated } = useProductExample()

  return (
    <main>
      <h1>Crear producto</h1>
      <ProductForm id="create-product" onCreated={handleProductCreated} />
      <div role="status" aria-atomic="true">
        {createdProduct && (
          <p>
            Producto creado: {createdProduct.name} (ID: {createdProduct.id}).
            Precio: S/ {createdProduct.price.toFixed(2)}.
          </p>
        )}
      </div>
    </main>
  )
}
```

`pages/product-example/index.ts`:

```ts
export { ProductExamplePage } from './product-example.page'
```

La página compone unidades y conecta callbacks. No importa Axios, DTOs ni mappers. Un fallo posterior no borra el último éxito confirmado. Las páginas pertenecen al feature; no crear `src/screens/` ni un `src/pages/` global.

Montar esta página requeriría composición/ruta y provider de Query, descritos en [application-wiring](application-wiring.md). No registrar el ejemplo en el router real salvo que el usuario lo solicite.

## 16 — Optional unit styles

La aplicación usa Tailwind compilado y tokens existentes. No instalar Sass ni crear un `.scss` por cada componente. Si hay una necesidad concreta y Sass está configurado, coloca el estilo junto a la unidad e impórtalo desde su componente.

Archivo opcional: `src/features/product-example/components/product-form/product-form.scss`.

```scss
.product-form {
  display: grid;
  gap: 1rem;

  &__fields {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
  }
}
```

Añade las clases correspondientes al JSX solo si eliges este estilo. El bloque coincide con la raíz y evita selectores globales que afecten otras unidades. Colores, espaciado y estados deben seguir los tokens del proyecto. Los mensajes necesitan texto y semántica, no solo color.

## 17 — Index: public surface

Archivo: `src/features/product-example/components/product-form/index.ts`.

```ts
export { ProductForm } from './product-form.component'
export type { ProductFormProps } from './product-form.types'
```

La página importa desde `../../components/product-form`. Dentro de la unidad, importa hermanos directamente: el hook no importa desde su propio `index.ts`.

Usa el mismo patrón para páginas, hooks públicos y services. Exporta solo lo que necesitan sus consumidores; el schema, valores de campos y hook privado del formulario no son públicos por defecto. Evita `export *` y barrels gigantes de todo el feature. Modelos, DTOs, mappers y schemas planos no necesitan una carpeta/barrel individual.

Al mover una unidad, actualiza importadores y exports en el mismo cambio, incluyendo tests, rutas y mocks. Un barrel no resuelve ciclos de dependencias: corrige su dirección.

## 18 — Error flow walkthrough

El formulario muestra validación local y error de petición sin notificaciones duplicadas.

| Caso ilustrativo | Responsable | Resultado |
| --- | --- | --- |
| Nombre vacío / demasiado largo | Zod + React Hook Form | Mensaje junto al campo; no hay POST |
| Precio vacío, cero o negativo | Zod + React Hook Form | Mensaje junto al campo; no hay POST |
| Nombre duplicado, HTTP 409 | Hook interpreta `HttpError.status` | Mensaje funcional del ejemplo; conserva valores |
| Sin respuesta / timeout | Cliente normaliza; hook presenta | Guardado sin confirmar; comprobar antes de repetirlo |
| Otro fallo HTTP | Cliente + hook | Mensaje controlado; conserva valores |
| Éxito confirmado | Hook + callback de página | Limpia campos y muestra el producto recibido |

### Recorrido de un duplicado

1. Zod valida nombre y precio; el hook espera `mutateAsync`.
2. La API hace el POST. Axios rechaza HTTP 409 y el cliente normaliza el error.
3. La API propaga el fallo; no retorna un modelo vacío.
4. Query conserva el error y el `catch` termina el envío sin resetear campos ni llamar a `onCreated`.
5. Termina `isSubmitting`, se habilita el formulario y aparece el mensaje de duplicado.
6. Un nuevo envío válido limpia el error anterior. Un éxito confirmado limpia campos y actualiza el último resultado de la página.

No distribuyas `catch` repetidos por cada capa. El cliente normaliza aspectos técnicos; el hook conoce el significado funcional y la presentación. Un service puede propagar sin capturar.

No hay reintentos automáticos de POST en este ejemplo. Para repetir una escritura cuyo resultado es incierto, el contrato debe ofrecer reconciliación o idempotencia si el producto lo requiere. No inventar mecanismos del servidor. La similitud de frases sigue siendo un resultado funcional; no copiar la regla ilustrativa de productos HTTP 409 al flujo de frases.

## Real `phrases` examples

These examples illustrate boundaries using the actual `phrases` feature, not complete screens. Endpoint names, wire fields, and token formats must come from the approved API contract. The real phrase list is paginated: preserve its internal page model and query parameters rather than replacing them with the array sketch below.

### Page, component, and hook

```tsx
// pages/phrases/phrases.page.tsx
import { PhraseList } from '../../components/phrase-list'
import { usePhrases } from '../../hooks/use-phrases'

export function PhrasesPage() {
  const { data = [], isPending, isError } = usePhrases()

  if (isPending) return <p role="status">Loading phrases…</p>
  if (isError) return <p role="alert">Could not load phrases.</p>

  return (
    <main>
      <h1>Phrases</h1>
      <PhraseList phrases={data} />
    </main>
  )
}
```

```ts
// components/phrase-list/phrase-list.types.ts
import type { Phrase } from '../../models/phrase.model'

export type PhraseListProps = {
  phrases: Phrase[]
}
```

```tsx
// components/phrase-list/phrase-list.component.tsx
import type { PhraseListProps } from './phrase-list.types'

export function PhraseList({ phrases }: PhraseListProps) {
  if (phrases.length === 0) return <p>No phrases yet.</p>

  return (
    <ul>
      {phrases.map(phrase => <li key={phrase.id}>{phrase.text}</li>)}
    </ul>
  )
}
```

```ts
// hooks/use-phrases/use-phrases.hook.ts
import { useQuery } from '@tanstack/react-query'
import { listPhrases } from '../../api/phrases.api'

export function usePhrases() {
  return useQuery({
    queryKey: ['phrases'],
    queryFn: listPhrases,
  })
}
```

The page composes the screen; the hook owns remote state; the component renders internal data. Extract the query key to feature constants when mutations need to reuse it.

### API boundary and internal models

The following DTO fields are illustrative. Replace them with the approved contract instead of treating them as an API specification.

```ts
// models/phrase.model.ts: UI-facing shape
export type Phrase = {
  id: string
  text: string
}
```

```ts
// api/dtos/phrase.dto.ts: illustrative transport shape
export type PhraseDto = {
  phrase_id: string
  content: string
}
```

```ts
// api/mappers/phrase.mapper.ts
import type { PhraseDto } from '../dtos/phrase.dto'
import type { Phrase } from '../../models/phrase.model'

export function toPhrase(dto: PhraseDto): Phrase {
  return { id: dto.phrase_id, text: dto.content }
}
```

```ts
// Inside api/phrases.api.ts; `url` comes from the approved contract.
// Imports are shown, but URL selection is deliberately left unspecified.
import { httpClient } from '../../../shared/api/http-client'
import type { Phrase } from '../models/phrase.model'
import type { PhraseDto } from './dtos/phrase.dto'
import { toPhrase } from './mappers/phrase.mapper'

async function fetchPhraseList(url: string): Promise<Phrase[]> {
  const { data } = await httpClient.get<PhraseDto[]>(url)
  return data.map(toPhrase)
}
```

Export the actual `listPhrases(): Promise<Phrase[]>` operation once its endpoint/response envelope is known. Components must never import `PhraseDto`. If wire and internal shapes coincide, retain the model boundary without adding a meaningless mapper. Axios generics alone do not validate runtime payloads.

### Optional service and function injection

Use a service only when there is real React-independent coordination. The following internal types are illustrative; they do not dictate transport fields. This sketch combines validation and saving only for a workflow whose initiating action already authorizes saving. The current phrases UI separates Validate and Save: preserve that behavior rather than invoking this sketch from its Validate action.

```ts
// services/phrase-submission/phrase-submission.types.ts
import type { Phrase } from '../../models/phrase.model'
import type { PhraseValidation } from '../../models/phrase-validation.model'

export type SubmissionDependencies = {
  validate: (text: string) => Promise<PhraseValidation>
  save: (input: {
    text: string
    token: string
    confirmed: boolean
  }) => Promise<Phrase>
}
```

```ts
// models/phrase-validation.model.ts
export type PhraseValidation = {
  token: string
  requiresConfirmation: boolean
  match: { text: string; score: number } | null
}
```

```ts
// services/phrase-submission/phrase-submission.service.ts
import type { SubmissionDependencies } from './phrase-submission.types'

export async function prepareSubmission(
  text: string,
  dependencies: SubmissionDependencies,
) {
  const validation = await dependencies.validate(text)

  if (validation.requiresConfirmation) {
    return { status: 'confirmation-required' as const, text, validation }
  }

  const phrase = await dependencies.save({
    text,
    token: validation.token,
    confirmed: false,
  })

  return { status: 'saved' as const, phrase }
}
```

The hook supplies the API functions. A service test can supply simple doubles without React or Axios. A validation rejection propagates and does not call `save`.

The backend-provided `requiresConfirmation` flag controls confirmation. A match can exist below the threshold without requiring confirmation; never infer this flag from match presence or recompute the threshold in the client.

This service never opens a modal or decides for the user. The hook renders confirmation, handles cancel/confirm, discards tokens after edits, and invalidates the list after saving. Only the explicit confirm handler may request saving a potential duplicate. Match save semantics and token requirements to the actual contract.

This example is appropriate only if the coordination belongs outside React. For a simple query or mutation, use the API function directly:

```ts
// Good: direct hook → API for straightforward data access.
useQuery({ queryKey: ['phrases'], queryFn: listPhrases })

// Avoid adding a service whose only behavior is forwarding the call.
// const getPhrases = () => listPhrases()
```

## Placement decisions

```text
A generic Button                → shared/components/ui/button/
A phrase confirmation dialog    → features/phrases/components/similarity-confirmation/
A phrase form's one-off helper  → components/phrase-form/phrase-form.util.ts
A helper used by several units  → features/phrases/utils/
Axios base URL and timeouts     → shared/api/http-client.ts
Backend response field mapping → features/phrases/api/mappers/
Local required-text check       → features/phrases/schemas/phrase.schema.ts
Semantic similarity decision   → backend; consume its result in the submission hook
```
