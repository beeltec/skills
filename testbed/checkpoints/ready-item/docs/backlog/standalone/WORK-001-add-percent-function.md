---
id: WORK-001
type: story
title: Add percent function
status: ready
parent: none
outcome: Library consumers can calculate a value's share of a total as a percentage rounded to one decimal place, with a RangeError for a zero total.
wiki_refs: [docs/wiki/start-here.md, docs/wiki/architecture/overview.md, docs/wiki/engineering/technologies/typescript.md, docs/wiki/engineering/technologies/vitest.md, docs/wiki/operations/verification.md]
research: not-needed
decisions: none
blocks: []
clones: []
duplicates: []
relates_to: []
causes: []
claim: none
claim_expires: none
cancelled_reason: none
---

# WORK-001: Add percent function

## Outcome / delta

Add the public `percent(value: number, total: number): number` library function. It returns the value's share of the total as a percentage rounded to one decimal place and throws `RangeError` when `total` is `0`.

## Acceptance criteria

- [ ] `src/index.ts` exports `percent(value: number, total: number): number`, which returns `(value / total) * 100` rounded to one decimal place.
- [ ] Calling `percent` with a total of `0` throws `RangeError`.
- [ ] Unit tests through the public barrel cover one-decimal rounding and the zero-total error.
- [ ] The README function list includes `percent`.

## Relationships

No relationships.

## Wiki references

- [`docs/wiki/start-here.md`](../../wiki/start-here.md) establishes the library boundary and public barrel.
- [`docs/wiki/architecture/overview.md`](../../wiki/architecture/overview.md) establishes the single-function module and export structure.
- [`docs/wiki/engineering/technologies/typescript.md`](../../wiki/engineering/technologies/typescript.md) records the source and ESM conventions.
- [`docs/wiki/engineering/technologies/vitest.md`](../../wiki/engineering/technologies/vitest.md) records public-barrel unit-test conventions.
- [`docs/wiki/operations/verification.md`](../../wiki/operations/verification.md) defines the project verification commands.

## Research

External research is not needed. Repository inspection resolves the implementation and verification approach without a version-specific or security-sensitive uncertainty:

| Subject | Repository evidence | Guidance state | Decision |
| --- | --- | --- | --- |
| TypeScript | 5.9.3 in `package-lock.json`; existing one-function modules and the public barrel define the required pattern. | `docs/wiki/engineering/technologies/typescript.md` is a version-matched draft. | No external research; follow the inspected project convention. |
| Vitest | 3.2.7 in `package-lock.json`; `tests/index.test.ts` exercises exports through `src/index.ts`. | `docs/wiki/engineering/technologies/vitest.md` is a version-matched draft. | No external research; extend the existing suite. |
| Node.js | No engine pin; `@types/node` is 24.13.3 in `package-lock.json`. The helper requires no Node API. | `docs/wiki/engineering/technologies/nodejs.md` is a matching draft for the repository state. | No external research; runtime-specific behavior is not implicated. |
| ESLint | ESLint 9.39.5 and typescript-eslint 8.65.0 in `package-lock.json`; no lint-rule change is required. | `docs/wiki/engineering/technologies/eslint.md` is version-matched and draft. | No external research; use the existing lint command. |

No standard subject applies: the pure local numeric helper does not handle authentication, sensitive data, user interface, wire protocols, payments, health data, or another regulated boundary. The owner instructed this `/to-backlog` run to proceed without an evidence-decision question, so no `$guidance` page or `$research` run was requested. The specified API contract and inspected repository patterns leave no unresolved question that would block readiness.

## Decisions

No ADR qualifies. The additive helper follows the accepted flat one-function-module structure, adds no dependency or technology, changes no cross-cutting quality, and is inexpensive to reverse; it is a routine implementation choice under the architecture significance test.

## Execution

Owner approval: the project owner's `/to-backlog` invocation on 2026-07-27 approves this scope, rank position 1, refinement, and transition to `ready`.

Implementation-first approach:

1. Add `src/percent.ts` as an explicitly typed arrow-function export, reject a zero total with `RangeError`, round the calculated percentage to one decimal place, and re-export it from `src/index.ts`.
2. Extend `tests/index.test.ts` through the public barrel with focused cases for one-decimal rounding and the zero-total error.
3. Add `percent` to the README function list.

Minimal verification:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `node scripts/validate-project.mjs`

## Subtasks

- [ ] Implement and export `percent` in `src/percent.ts` and `src/index.ts`; verify with `npm run typecheck`.
- [ ] Cover rounding and the zero-total `RangeError` through the public barrel in `tests/index.test.ts`; verify with `npm test`.
- [ ] List `percent` in the README function list; verify the complete change with `npm run lint`.

## Provenance

Confirmed by the project owner in the `/to-backlog` request on 2026-07-27, including standalone placement, no relationships, rank position 1, API behavior, error behavior, tests, and README coverage.
