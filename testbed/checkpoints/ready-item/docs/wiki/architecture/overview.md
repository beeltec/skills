---
title: 'Architecture overview'
type: Explanation
description: Module map and structural conventions of the seed-metrics library.
tags: [architecture, modules]
timestamp: 2026-07-27T21:27:58+02:00
confidence: high
status: active
---

# Architecture overview

The library is a flat set of single-function ESM modules re-exported through one barrel:

- `src/clamp.ts` — `clamp(value, min, max)`: bounds a number to `[min, max]`; throws `RangeError` when `min > max`.
- `src/slugify.ts` — `slugify(input)`: lowercases, strips diacritics via `NFKD` normalization, and converts non-alphanumeric runs to single hyphens.
- `src/unique.ts` — `unique(values)`: returns insertion-ordered distinct elements using `Set`; accepts a `readonly` array.
- `src/index.ts` — barrel that re-exports the three functions; the library's only public entry point.
- `tests/index.test.ts` — Vitest suite exercising all three functions through the barrel.

Structural conventions:

- One exported function per module, named after its file.
- All exports are arrow-function constants with explicit parameter and return types.
- No runtime dependencies; only dev tooling is declared in `package.json`.
- There is no bundling or emit step: `tsc` runs with `noEmit` and consumers use the TypeScript sources directly (`tsconfig.json`).
