---
title: 'Verification runbook'
type: How-to
description: Commands to type-check, lint, test, and validate the governed documentation of seed-metrics.
tags: [operations, verification, testing]
timestamp: 2026-07-27T09:22:55+02:00
confidence: high
status: active
---

# Verification runbook

Run from the project root. All commands are defined in `package.json`; there is no build or run step — the project is a type-check-only library.

```sh
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # eslint . (typescript-eslint recommended config)
npm test            # vitest run
npm run project:check   # node scripts/validate-project.mjs — wiki and backlog validation
```

Run `npm run project:check` (or `node scripts/validate-project.mjs` directly) after every change under `docs/wiki` or `docs/backlog`.
