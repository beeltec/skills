---
type: Reference
title: Vitest
description: Version evidence and observed project conventions for Vitest; rules and sources not yet researched.
resource: Vitest
tags: [engineering, technology, vitest, testing]
timestamp: 2026-07-27T21:27:58+02:00
status: draft
---

# Vitest

Seeded from repository evidence by `$setup-project`. Requirements, recommendations, and sources await `$guidance` research.

## Scope

Governs the test suite under `tests/`. Compiler settings for test files are owned by the [TypeScript](/engineering/technologies/typescript.md) page.

## Versions

| Component | Installed (path) | Latest stable | Resolved via / on | Gap relevance |
|---|---|---|---|---|
| vitest | 3.2.7 (`package-lock.json`; constraint `^3.2.4` in `package.json`) | Not yet researched. | Not yet researched. | Not yet researched. |

## Requirements

Not yet researched.

## Recommendations

Not yet researched.

## Conventions

- No Vitest config file; defaults are used and tests run via `npm test` → `vitest run` (`package.json`).
- Tests import `expect` and `test` from `vitest` and exercise the public API through the barrel `src/index.ts` (`tests/index.test.ts`).

## Deviations

Not assessed — no researched upstream guidance to compare against yet.

## Known gaps

Not assessed — no requirements adopted yet.

## Sources

Not yet researched.
