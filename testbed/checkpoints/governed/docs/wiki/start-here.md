---
title: 'Project orientation'
type: Overview
description: Purpose, boundaries, and constraints of the seed-metrics TypeScript utility library.
tags: [overview]
timestamp: 2026-07-27T09:22:55+02:00
confidence: high
status: active
---

# Project orientation

`seed-metrics` is a small, private TypeScript utility library exposing three pure functions — `clamp`, `slugify`, and `unique` — from the barrel module `src/index.ts`. It has no runtime dependencies, no build output (type-check only, `noEmit`), and is not published to a registry (`"private": true` in `package.json`).

Boundaries and constraints:

- Pure ESM (`"type": "module"` in `package.json`) with `nodenext` module resolution; internal imports use explicit `.js` extensions.
- Strict TypeScript, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` (`tsconfig.json`).
- Verified by `tsc --noEmit`, ESLint with typescript-eslint, and Vitest — see the [verification runbook](/operations/verification.md).

See the [architecture overview](/architecture/overview.md) for the module map and [engineering technologies](/engineering/technologies/) for tool-specific guidance. Track desired changes in [`docs/backlog`](../backlog/index.md), not in this wiki.

## Connections

- [Architecture](/architecture/)
- [Engineering](/engineering/)
- [Product domains](/domains/)
- [Operations](/operations/)
