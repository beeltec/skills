---
type: Reference
title: TypeScript
description: Version evidence and observed project conventions for TypeScript; rules and sources not yet researched.
resource: TypeScript
tags: [engineering, technology, typescript]
timestamp: 2026-07-27T09:22:55+02:00
status: draft
---

# TypeScript

Seeded from repository evidence by `$setup-project`. Requirements, recommendations, and sources await `$guidance` research.

## Scope

Governs all TypeScript sources under `src/` and `tests/` (the `include` set in `tsconfig.json`). Lint rules are owned by the [ESLint](/engineering/technologies/eslint.md) page; test conventions by the [Vitest](/engineering/technologies/vitest.md) page.

## Versions

| Component | Installed (path) | Latest stable | Resolved via / on | Gap relevance |
|---|---|---|---|---|
| typescript | 5.9.3 (`package-lock.json`; constraint `^5.8.3` in `package.json`) | Not yet researched. | Not yet researched. | Not yet researched. |

## Requirements

Not yet researched.

## Recommendations

Not yet researched.

## Conventions

- Strict compilation with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled; `noEmit`, `target: es2022`, `module`/`moduleResolution: nodenext` (`tsconfig.json`).
- Exports are arrow-function constants with explicit parameter and return types (`src/clamp.ts`, `src/slugify.ts`, `src/unique.ts`).
- Read-only inputs are typed `readonly T[]` (`src/unique.ts`).
- Internal ESM imports carry explicit `.js` extensions (`src/index.ts`, `tests/index.test.ts`).

## Deviations

Not assessed — no researched upstream guidance to compare against yet.

## Known gaps

Not assessed — no requirements adopted yet.

## Sources

Not yet researched.
