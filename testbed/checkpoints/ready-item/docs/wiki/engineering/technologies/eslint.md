---
type: Reference
title: ESLint
description: Version evidence and observed project conventions for ESLint with typescript-eslint; rules and sources not yet researched.
resource: ESLint
tags: [engineering, technology, eslint, typescript-eslint]
timestamp: 2026-07-27T09:22:55+02:00
status: draft
---

# ESLint

Seeded from repository evidence by `$setup-project`. Requirements, recommendations, and sources await `$guidance` research.

## Scope

Governs linting of all files in the repository except `node_modules` and `dist` (`eslint.config.mjs`). Compiler-level strictness is owned by the [TypeScript](/engineering/technologies/typescript.md) page.

## Versions

| Component | Installed (path) | Latest stable | Resolved via / on | Gap relevance |
|---|---|---|---|---|
| eslint | 9.39.5 (`package-lock.json`; constraint `^9.31.0` in `package.json`) | Not yet researched. | Not yet researched. | Not yet researched. |
| typescript-eslint | 8.65.0 (`package-lock.json`; constraint `^8.36.0` in `package.json`) | Not yet researched. | Not yet researched. | Not yet researched. |

## Requirements

Not yet researched.

## Recommendations

Not yet researched.

## Conventions

- Flat config in `eslint.config.mjs` using `tseslint.config(...)` with the typescript-eslint `recommended` preset; `node_modules` and `dist` are ignored.
- Invoked as `npm run lint` → `eslint .` (`package.json`).

## Deviations

Not assessed — no researched upstream guidance to compare against yet.

## Known gaps

Not assessed — no requirements adopted yet.

## Sources

Not yet researched.
