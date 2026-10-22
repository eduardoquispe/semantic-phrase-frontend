---
name: semantic-phrase-screaming
description: Implement, refactor, or review the Semantic Phrase App React frontend using its approved feature-based Screaming Architecture. Use for frontend folder organization, components, pages, hooks, API boundaries, and dependency decisions in this project; not for backend architecture or unrelated projects.
---

# Semantic Phrase Screaming Architecture

Use business features to organize this React/TypeScript frontend. Keep the architecture lightweight: React hooks, API functions, internal models, and optional services. This is not a hexagonal architecture.

## Source and scope

Read `docs/03-architecture/03-frontend-architecture.md` from the repository root when applying this skill. Decisions B03-D01 through B03-D16 are the architectural baseline. Inspect the current implementation and approved API contract before changing code.

- Work in `apps/frontend/`, the actual frontend directory. The document's `apps/web/` is a planned path, not an instruction to move the app.
- The requested architecture uses kebab-case filenames with responsibility suffixes. The starter AGENTS.md describes PascalCase component filenames; flag this discrepancy and follow the architecture explicitly requested for this work. Do not silently edit AGENTS.md.
- Architecture choices describe the target, not already installed packages. Check `package.json` before using a library; do not install the entire target stack for an unrelated small change.
- Do not invent REST endpoints, payload fields, token rules, or error codes. Match the approved OpenAPI contract when available.

## Folder organization

The initial feature is `phrases`: listing, registration, validation, and confirmation belong together. Do not split them into separate features or mirror backend aggregates.

```text
src/
├── main.tsx
├── index.css
├── app/
│   ├── app.component.tsx
│   ├── app.router.tsx
│   └── providers/
│       └── query.provider.tsx
├── features/
│   └── phrases/
│       ├── pages/phrases/
│       │   ├── index.ts
│       │   └── phrases.page.tsx
│       ├── components/
│       │   ├── phrase-form/
│       │   │   ├── index.ts
│       │   │   ├── phrase-form.component.tsx
│       │   │   ├── phrase-form.types.ts
│       │   │   └── phrase-form.spec.tsx
│       │   ├── phrase-list/
│       │   └── similarity-confirmation/
│       ├── hooks/
│       │   ├── use-phrases/
│       │   │   ├── index.ts
│       │   │   └── use-phrases.hook.ts
│       │   └── use-phrase-submission/
│       ├── services/                       # Only when useful
│       │   └── phrase-submission/
│       │       ├── index.ts
│       │       ├── phrase-submission.service.ts
│       │       └── phrase-submission.types.ts
│       ├── models/
│       │   ├── phrase.model.ts
│       │   └── phrase-validation.model.ts
│       ├── schemas/phrase.schema.ts
│       ├── api/
│       │   ├── phrases.api.ts
│       │   ├── dtos/phrase.dto.ts
│       │   └── mappers/phrase.mapper.ts
│       └── __tests__/phrase-submission.integration.spec.tsx
└── shared/
    ├── api/http-client.ts
    └── components/ui/
        ├── button/
        ├── input/
        └── modal/
```

Create only needed files. Components, pages, hooks, and services have self-contained folders with explicit `index.ts` exports; colocate meaningful types, tests, helpers, and optional styles. Models, DTOs, mappers, and schemas do not need individual folders. There is no global `pages/` directory.

## Responsibilities and dependencies

Arrows mean “may import”; they do not require every intermediary.

```text
app → feature pages + shared
feature pages → feature components/hooks
feature components → props, internal models, feature hooks, shared UI
feature hooks → feature API OR optional services
optional services → feature API or injected functions
feature API → DTOs + mappers + internal models + shared HTTP client
shared → shared only
```

| Unit | Owns | Keep outside |
| --- | --- | --- |
| `app/` | Bootstrap, React Router, global providers | Phrase workflows and business HTTP calls |
| Feature page | Screen composition and wiring | HTTP and DTO conversion |
| Feature component | Rendering, interaction, accessibility | Axios and transport DTOs |
| Hook | React state, form/query composition, workflow handlers | HTTP transport implementation |
| Optional service | Useful React-independent coordination | React, UI state, trivial API delegation |
| Model | Internal feature data | Axios and external DTO dependencies |
| Schema | Local form syntax validation | Backend business/semantic validation |
| Feature API | Requests, responses, boundary mapping | Modals, navigation, React state |
| Shared API | Axios configuration and technical error normalization | Phrase-specific business decisions |
| Shared UI | Reusable visual controls | Imports from features or app |

A hook may call `phrases.api.ts` directly. Do not add `domain/`, `application/`, `infrastructure/`, ports, abstract repositories, or formal use cases as architectural requirements. Avoid circular imports.

### Dependency inversion, proportionally

The approved architecture requires controlled dependency direction; it does not require a dependency-injection framework or interfaces around every function. Internal models are independent of HTTP contracts. When a real service needs replaceable collaborators, pass small typed functions into it. Otherwise prefer direct API imports from hooks.

```ts
// Normal hook dependency: allowed, no service required.
import { listPhrases } from '../../api/phrases.api'

// UI imports an internal model, never an API DTO.
import type { Phrase } from '../../models/phrase.model'
```

For a concrete optional service with injected functions, read [examples](references/examples.md#optional-service-and-function-injection) only when implementing or reviewing that coordination.

## Naming and exports

Use two spaces, single quotes, omitted semicolons, function components, and ES modules.

| Responsibility | File example | Symbol example |
| --- | --- | --- |
| Component | `phrase-list.component.tsx` | `PhraseList` |
| Page | `phrases.page.tsx` | `PhrasesPage` |
| Hook | `use-phrases.hook.ts` | `usePhrases` |
| Service | `phrase-submission.service.ts` | `submitPhrase` |
| Local types | `phrase-form.types.ts` | `PhraseFormProps` |
| Model | `phrase.model.ts` | `Phrase` |
| DTO / mapper | `phrase.dto.ts` / `phrase.mapper.ts` | `PhraseDto` / `toPhrase` |
| Schema | `phrase.schema.ts` | `phraseSchema` |
| API | `phrases.api.ts` | `listPhrases` |
| Provider | `query.provider.tsx` | `QueryProvider` |
| Helper / constants | `phrase-form.util.ts` / `phrases.constants.ts` | `formatScore` / `PHRASES_QUERY_KEY` |
| Test / styles | `phrase-list.spec.tsx` / `phrase-form.scss` | — |

Use `.hook.tsx` when a hook contains JSX. Keep `main.tsx` as the runtime entrypoint. Use kebab-case directories, PascalCase types/components, camelCase functions/hooks, and UPPER_SNAKE_CASE global constants where appropriate.

```ts
// components/phrase-list/index.ts: explicit public surface
export { PhraseList } from './phrase-list.component'
export type { PhraseListProps } from './phrase-list.types'
```

Consumers import a unit's public entrypoint. Files inside that unit import siblings directly, not their own barrel. Avoid broad `export *` barrels. Keep a helper local until several consumers within the feature need it; move it to `shared/` only when genuinely cross-feature.

## State, HTTP, and styling

- Local transient UI: `useState`; use `useReducer` only for transitions that warrant it. Add context only for demonstrated shared state. No Redux or Zustand in the MVP.
- Forms: React Hook Form + Zod + `@hookform/resolvers`. Local validation never authorizes semantic acceptance.
- Remote data: TanStack Query for queries, mutations, pending/error states, and list invalidation after a successful save. Hooks expose internal models.
- HTTP: Axios in `shared/api/http-client.ts`; feature requests in `api/phrases.api.ts`. Map incoming/outgoing DTOs when transformation exists; do not create identity mappers merely to satisfy a layer.
- Routing: React Router in `app/app.router.tsx`, initially one phrases page.
- Styles: compiled Tailwind CSS and custom UI controls. Optional unit SCSS only for a concrete need, with Sass configured when used. No prototype CDN or full UI library/shadcn adoption.
- Controls: semantic HTML, labels, keyboard operation, focus handling, and accessible confirmation dialogs.

Read [page/component/hook and API examples](references/examples.md) when implementing those boundaries. Examples are schematic, not an approved backend contract.

## Phrase submission invariants

```text
local form validation → backend semantic validation
  no potential duplicate → request save with current token per contract
  potential duplicate → show matching phrase + score → wait for user
    cancel → no save request
    confirm → request save with current token + confirmation per contract
save succeeds → invalidate phrase list
```

- Similarity is a functional result, not an HTTP exception.
- Bind validation results and tokens to the submitted text. Editing the text invalidates them; stale async responses must not restore obsolete validation.
- Prevent duplicate submissions during validation/save. Do not configure mutation retries that can duplicate writes.
- Expired/rejected validation requires fresh validation; never fall through to saving after a technical failure.
- Preserve entered text on network/backend failures. Normalize technical failures in shared API and interpret functional outcomes within the feature.
- The backend owns semantic rules, token validity/consumption, and persistence. The client owns feedback and explicit confirmation.

## Verification

For code changes, run `pnpm lint` and `pnpm build` from `apps/frontend`, then verify affected interactions. The starter has no automated test setup: do not claim tests ran unless configured and executed.

When adding meaningful automated tests, use the approved Vitest + React Testing Library + MSW stack; no initial Playwright setup. Colocate unit tests and use feature `__tests__/` for integration flows. Prioritize validation, confirm/cancel, stale validation after edits, expiry, network failures, duplicate-submit prevention, and successful list invalidation. Do not create empty tests or test scaffolding just to complete the folder tree.
