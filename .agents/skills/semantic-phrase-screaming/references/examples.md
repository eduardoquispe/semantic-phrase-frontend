# Basic implementation examples

These examples illustrate boundaries, not complete screens. Endpoint names, wire fields, and token formats must come from the approved API contract. Relative paths assume the folder tree in SKILL.md; no path alias is assumed.

## Page, component, and hook

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

## API boundary and internal models

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

## Optional service and function injection

Use a service only when there is real React-independent coordination. The following internal types are illustrative; they do not dictate transport fields.

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

  if (validation.match) {
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
