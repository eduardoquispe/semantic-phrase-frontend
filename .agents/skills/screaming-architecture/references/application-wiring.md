# Application composition and support files

Consult this reference when wiring a feature into the runtime or locating providers, tests, and fixtures. The blocks show a minimal phrases composition: keep existing providers and routes when applying it. Do not wire the didactic products feature by default.

## Entrypoint and app

`src/main.tsx` keeps StrictMode, the mount, and the global import:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/app.component'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
```

`src/app/app.component.tsx` composes global infrastructure:

```tsx
import { AppRouter } from './app.router'
import { QueryProvider } from './providers/query.provider'

export function App() {
  return <QueryProvider><AppRouter /></QueryProvider>
}
```

These files must not know about validation tokens, DTO fields, or save logic.

## Router

`src/app/app.router.tsx`:

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PhrasesPage } from '../features/phrases/pages/phrases'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhrasesPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

The route belongs to `app/` and the page to the feature. Don't add a second router if the app already has one. Keep the existing router mode when it meets the goal.

## Query Provider

`src/app/providers/query.provider.tsx`:

```tsx
import { useState, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  }))
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

The instance must stay stable across renders. Don't create a new client on every render, nor a separate client for a form. Preserve existing refetch options, read retries, and caching per requirements; don't configure write retries without agreed-upon safe semantics.

## Tests, fixtures, and helpers

| Need | Location |
| --- | --- |
| DTO conversion or syntactic validation | `.spec.ts` next to the mapper/schema |
| Component/hook behavior | `.spec.tsx` next to the unit |
| Validation → confirmation → save with mocked HTTP | `features/phrases/__tests__/<flow>.integration.spec.tsx` |
| Test environment setup | Existing Vitest setup, currently `src/test-setup.ts` |
| Wrappers and integration handlers for the feature | Helper next to its tests; not inside production components |
| Demo data used by UI | `.examples.ts` next to the consumer; must follow internal models |
| Test-only fixture | Next to the test or in the feature's test support |

Use Vitest, React Testing Library, and MSW when already configured. Test observable behavior and relevant invariants, not the folder tree. For a query/hook, isolate the `QueryClient` per test; intercept HTTP with MSW for integrations and avoid traffic to the real backend.

Don't duplicate whole hooks to fabricate a demo mode, nor export test fixtures to production. A test dependency is not part of the feature's public surface. The skill doesn't require creating empty tests or installing a runner just to move a file.
