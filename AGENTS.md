# Repository Guidelines

## Project Structure & Module Organization

This directory (`apps/frontend`) contains the React + TypeScript frontend, built with Vite. Run frontend commands here. The code follows Screaming Architecture (see `docs/03-architecture/03-frontend-architecture.md`):

- `src/main.tsx` mounts the application with React StrictMode.
- `src/app/` holds the root component (`app.component.tsx`) and router config (`app.router.tsx`); no business logic.
- `src/providers/` holds global providers (e.g. `query.provider.tsx` for TanStack Query).
- `src/features/phrases/` is the single feature module: `pages/` (screen composition), `components/` (presentation/interaction), `hooks/` (React state and flow), `services/` (non-trivial app logic), `data/` (HTTP calls), `dto/` + `mappers/` (API boundary translation), `interfaces/` (internal types), `utils/`.
- `src/shared/` is strictly cross-cutting: `api/http-client.ts` (shared Axios instance), `components/ui/` (Button, Input, Modal, ConfirmModal, FeedbackMessage), `icons/`, `interfaces/`, `utils/`.
- `src/test/test-setup.ts` configures Vitest/jsdom.
- `src/assets/` contains images and SVGs imported by components.
- `public/` contains assets served directly, such as `favicon.svg` and `icons.svg`.
- Root configuration files control Vite, TypeScript, and ESLint. Production output goes to `dist/`.

## Build, Test, and Development Commands

Use pnpm to match the committed `pnpm-lock.yaml`:

- `pnpm install`: install dependencies.
- `pnpm dev`: start Vite with hot module replacement.
- `pnpm build`: run TypeScript project checks and create a production bundle.
- `pnpm lint`: run ESLint across the project.
- `pnpm test`: run the Vitest suite.
- `pnpm preview`: serve the production build locally after building.

Commit lockfile changes when updating dependencies. Do not commit `node_modules/` or `dist/`.

## Coding Style & Naming Conventions

Two-space indentation, single-quoted JavaScript strings, and omitted semicolons.

Files and unit directories use **kebab-case with responsibility suffixes**: `.page.tsx`, `.component.tsx`, `.hook.ts`, `.service.ts`, `.dto.ts`, `.mapper.ts`, `.schema.ts`, `.types.ts`/`.interfaces.ts`, `.util.ts`, `.provider.tsx`, `.spec.ts`/`.spec.tsx` (e.g. `phrase-form.component.tsx`, `use-save-phrase.hook.ts`). `main.tsx` is the one exception. Each self-contained folder exposes its public API through `index.ts` with explicit exports.

TypeScript symbols keep standard casing: PascalCase for components/types/interfaces, camelCase for functions and variables, `use` prefix for hooks.

Use function components and hooks. Keep imports as ES modules. ESLint enforces JavaScript, TypeScript, React Hooks, and React Refresh rules through `eslint.config.js`; no Prettier configuration is present. Avoid unused locals and parameters, which TypeScript checks reject.

## Testing Guidelines

Vitest + React Testing Library + MSW. Tests are colocated with the unit they cover, named `<unit>.spec.ts`/`.spec.tsx`. Run `pnpm test` for the full suite. Before submitting changes, also run `pnpm lint` and `pnpm build`, then manually verify affected interactions with `pnpm dev`. Include reproduction and verification steps in the pull request.

## Commit & Pull Request Guidelines

Commits follow Conventional Commits style: `<type>: <short imperative description>` in lowercase (e.g. `feat: add delete phrase`, `chore: improve handle errors`, `docs: create delete function docs`). Common types: `feat`, `fix`, `chore`, `docs`.

Pull requests should describe the problem, resulting behavior, and validation performed. Link relevant issues and include screenshots for visible UI changes. Keep each change focused and explain any new dependencies or configuration requirements.
