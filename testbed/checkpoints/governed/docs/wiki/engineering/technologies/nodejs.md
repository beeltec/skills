---
type: Reference
title: Node.js
description: Version evidence and observed project conventions for the Node.js runtime; rules and sources not yet researched.
resource: Node.js
tags: [engineering, technology, nodejs]
timestamp: 2026-07-27T21:27:58+02:00
status: draft
---

# Node.js

Seeded from repository evidence by `$setup-project`. Requirements, recommendations, and sources await `$guidance` research.

## Scope

Governs the Node.js runtime assumptions of the library and its tooling. Module-format and compiler settings are owned by the [TypeScript](/engineering/technologies/typescript.md) page.

## Versions

| Component | Installed (path) | Latest stable | Resolved via / on | Gap relevance |
|---|---|---|---|---|
| Node.js | No engine pin in the repository (no `engines` field in `package.json`, no `.nvmrc`); type declarations target the 24.x line via `@types/node` 24.13.3 (`package-lock.json`; constraint `^24.0.14` in `package.json`) | Not yet researched. | Not yet researched. | Not yet researched. |

## Requirements

Not yet researched.

## Recommendations

Not yet researched.

## Conventions

- Pure ESM package: `"type": "module"` (`package.json`).
- Node-style ESM resolution with explicit `.js` extensions on relative imports (`tsconfig.json` `moduleResolution: nodenext`; `src/index.ts`).
- No runtime dependencies; Node APIs are typed via `@types/node` for tooling only (`package.json`).

## Deviations

Not assessed — no researched upstream guidance to compare against yet.

## Known gaps

Not assessed — no requirements adopted yet.

## Sources

Not yet researched.
