# Reorganizing the existing frontend

Use this guide when asked to tidy the system, migrate to the architecture, or fix dependencies. The result must preserve the requested behavior and leave each responsibility in its feature; renaming without fixing dependencies is not enough.

## Recognize the actual state

- Review `git status --short`, local instructions, `package.json`, `src/main.tsx`, routes, and providers. Preserve the user's prior changes.
- Read the approved architecture and the contract for the affected units. Separate target conventions from examples and from actually installed packages.
- Use `rg --files src` and import/symbol searches to locate consumers, tests, mocks, assets, and styles. Inspect files before deciding on an extraction.
- For a broad change, present a brief map `current file → destination → responsibility`, backed by the consumers found. No need to pause for approval on reversible moves within the authorized task.

## Deciding where each responsibility lives

| Code found | Destination / criterion |
| --- | --- |
| Startup, routes, global providers | `app/`; `main.tsx` keeps the mount |
| Screen with form, list, and confirmation | `features/phrases/pages/phrases/`; a page composes units |
| Axios in a component/hook | Transport to `features/phrases/api/`; state and handlers to the hook |
| External interface used by UI | DTO in `api/dtos/`; UI consumes the internal model from `models/` |
| Conversion mixed with rendering | Pure mapper in `api/mappers/`, when a transformation exists |
| `data` + service that only transforms and calls HTTP | Consolidate the boundary into `.api.ts`; keep the service only with useful coordination |
| Hook exclusive to a form | Place it with the form; promote it to `hooks/` if other units consume it |
| Types, helpers, or constants for a single component | Sibling files `.types.ts`, `.util.ts`, `.constants.ts` if they add clarity |
| Shared helper within a feature | `features/<feature>/utils/`; don't promote it to `shared/` just for having two consumers |
| Genuinely cross-cutting generic control | `shared/components/ui/<control>/`; pass text/data/actions via props |
| Phrases model placed in `shared/` | Return it to the feature; shared must not know about phrases business logic |
| Listing, registration, and validation as separate features | Bring them together under `phrases`; the MVP treats them as one functional capability |

Don't fragment a small unit into every file from the recipes. If the only problem is an import or a name, fix just that. If a component mixes transport and UI, separating those responsibilities does add value.

## Executing a coherent migration

Work by units and their consumers. Keep public symbols when renaming isn't necessary. Move non-React dependencies first (models, API, helpers) when it simplifies the change; then update hooks, components, and composition. Choose the order based on the real dependency graph.

Update imports, exports, routes, test mocks, style imports, and asset references along with each move. Respect the difference between assets imported from `src/` and public paths. Don't invent aliases to hide broken paths; reuse only the ones configured in TypeScript and Vite.

Avoid cycles: internals import sibling files, consumers import the unit's public entry. Resolving a cycle usually requires moving a type to a side-effect-free file or inverting the dependency, not adding another barrel.

Remove an old file only after checking its consumers and migrating its responsibilities; don't delete others' changes or keep duplicate implementations. Temporary compatibility needs concrete consumers and a clear scope. The migration doesn't authorize changing endpoints, business validations, styles, or dependencies unrelated to the goal.

## Checking equivalence

Review the diff and look for old paths/names that should have disappeared. Run lint, build, and the affected tests per the actual scripts. Verify the modified flow: listing, validation, editing after validation, confirm/cancel, and saving per scope. Distinguish pre-existing failures from introduced ones, without declaring success on a failed check.

When done, report the new organization, the extracted responsibilities, the checks run, and any concrete debt left out of scope. If the request was only a review, deliver findings and locations without executing this migration.
