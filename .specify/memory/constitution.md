<!--
Sync Impact Report
- Version: unversioned scaffold → 1.0.0 (initial adoption).
- Principles: five placeholder principles replaced with I–V below.
- Added sections: Technology Constraints; Development Workflow.
- Removed sections: none.
- Follow-up TODOs: none.
-->
# Semantic Phrase App Frontend Constitution

## Core Principles

### I. Screaming Architecture

Source code MUST be organized by business capability under `src/features/` so the
structure communicates what the application does. Each feature MUST own its related
components, hooks, styles, and logic. Shared code MUST serve multiple features.

### II. Clear Responsibilities

Components MUST focus on presentation and interaction. Business rules and external
service access MUST remain separate from rendering to enable independent changes.

### III. Simplicity

Changes MUST address an identified requirement. New dependencies and abstractions
MUST have a documented purpose; speculative infrastructure MUST NOT be introduced.

### IV. Consistent TypeScript and React

Code MUST use typed interfaces, function components, hooks, and ES modules, following
the naming and formatting conventions in `AGENTS.md`.

### V. Verified Behavior

Application changes MUST pass `pnpm lint` and `pnpm build`. Affected interactions
MUST be checked manually, with reproduction and verification steps documented.

## Technology Constraints

The frontend MUST use React, TypeScript, Vite, and pnpm. Dependency changes MUST
include the lockfile. Generated output and `node_modules/` MUST NOT be committed.

## Development Workflow

Changes MUST remain focused and include their purpose, resulting behavior, and
validation in the pull request. Visible UI changes MUST include screenshots.
Any introduced test runner MUST document its command and naming convention.

## Governance

Every review MUST verify compliance with this constitution. Amendments MUST document
their rationale, receive maintainer approval, and update the version and amendment date.
Versions MUST follow semantic versioning: major for incompatible principle changes,
minor for added guidance, and patch for clarifications. `AGENTS.md` provides repository
working conventions; conflicts MUST be resolved explicitly during review.

**Version**: 1.0.0 | **Ratified**: 2026-10-22 | **Last Amended**: 2026-10-22
