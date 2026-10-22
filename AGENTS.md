# Repository Guidelines

## Project Structure & Module Organization

This directory (`apps/frontend`) contains the React + TypeScript frontend, built with Vite. Run frontend commands here.

- `src/main.tsx` mounts the application with React StrictMode.
- `src/App.tsx` contains the current starter screen; `src/App.css` holds its styles.
- `src/index.css` defines global styles.
- `src/assets/` contains images and SVGs imported by components.
- `public/` contains assets served directly, such as `favicon.svg` and `icons.svg`.
- Root configuration files control Vite, TypeScript, and ESLint. Production output goes to `dist/`.

Keep new components and related styles under `src/`. No test directory currently exists.

## Build, Test, and Development Commands

Use pnpm to match the committed `pnpm-lock.yaml`:

- `pnpm install`: install dependencies.
- `pnpm dev`: start Vite with hot module replacement.
- `pnpm build`: run TypeScript project checks and create a production bundle.
- `pnpm lint`: run ESLint across the project.
- `pnpm preview`: serve the production build locally after building.

Commit lockfile changes when updating dependencies. Do not commit `node_modules/` or `dist/`.

## Coding Style & Naming Conventions

Follow existing TypeScript and TSX conventions: two-space indentation, single-quoted JavaScript strings, and omitted semicolons. Use PascalCase for React components and component filenames (for example, `PhraseCard.tsx`), camelCase for functions and variables, and `use` prefixes for hooks.

Use function components and hooks. Keep imports as ES modules. ESLint enforces JavaScript, TypeScript, React Hooks, and React Refresh rules through `eslint.config.js`; no Prettier configuration is present. Avoid unused locals and parameters, which TypeScript checks reject.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is configured. Before submitting changes, run `pnpm lint` and `pnpm build`, then manually verify affected interactions with `pnpm dev`. Include reproduction and verification steps in the pull request. When introducing automated tests, document the runner, naming convention, and command alongside the setup.

## Commit & Pull Request Guidelines

History currently contains brief setup messages such as `Initial commit`; no formal commit convention is established. Write concise, action-oriented subjects describing the change.

Pull requests should describe the problem, resulting behavior, and validation performed. Link relevant issues and include screenshots for visible UI changes. Keep each change focused and explain any new dependencies or configuration requirements.
