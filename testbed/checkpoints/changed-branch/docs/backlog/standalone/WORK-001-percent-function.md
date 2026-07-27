---
id: WORK-001
type: story
title: Export a percent utility from seed-metrics
status: ready
parent: none
outcome: Library consumers can call percent(value, total) from the package entry point to get value's share of total as a percentage rounded to one decimal place, with a RangeError on a total of 0.
wiki_refs: [docs/wiki/engineering/technologies/typescript.md, docs/wiki/engineering/technologies/vitest.md, docs/wiki/engineering/technologies/eslint.md, docs/wiki/operations/verification.md]
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

# WORK-001: Export a percent utility from seed-metrics

## Outcome / delta

Library consumers currently get `clamp`, `slugify`, and `unique` from the barrel `src/index.ts`. This story adds a fourth exported utility, `percent(value: number, total: number): number`, returning value's share of total as a percentage rounded to one decimal place (`percent(1, 3)` → `33.3`). A `total` of `0` throws a `RangeError`, matching the existing `clamp` convention of throwing `RangeError` on invalid numeric arguments. The README's function list mentions the new function.

## Acceptance criteria

- [ ] `src/index.ts` exports `percent`, typed `(value: number, total: number) => number`, and `npm run typecheck` and `npm run lint` pass.
- [ ] A unit test in `tests/index.test.ts` shows the result is rounded to one decimal place (e.g. `percent(1, 3)` is exactly `33.3`) and passes under `npm test`.
- [ ] A unit test in `tests/index.test.ts` shows `percent(v, 0)` throws `RangeError` and passes under `npm test`.
- [ ] The README function list names `percent` alongside `clamp`, `slugify`, and `unique`.

## Relationships

Standalone (`parent: none`), no relationships — confirmed by the project owner at intake.

## Wiki references

- `docs/wiki/engineering/technologies/typescript.md` — conventions the new source must follow (arrow-function const exports with explicit types, `.js` import extensions, strict compilation). Page status: `draft`.
- `docs/wiki/engineering/technologies/vitest.md` — test conventions (tests exercise the public API through the barrel). Page status: `draft`.
- `docs/wiki/engineering/technologies/eslint.md` — lint rules governing the new file. Page status: `draft`.
- `docs/wiki/operations/verification.md` — the verification commands cited under Execution.

## Research

`not-needed`. Direct repository inspection (2026-07-27): the delta is a pure in-process arithmetic function with no new dependency, no I/O, and no external input; it uses only installed tooling (typescript 5.9.3, vitest 3.2.7, eslint 9.x per `package-lock.json`). No version-specific or security-sensitive question is open. Rounding to one decimal is fully specified by the owner-confirmed outcome.

### Evidence decision record

`/to-backlog` step 2 requires asking the owner one question covering `$guidance` subjects and `$research` items. That question could not be posed: the owner's invocation (2026-07-27) directs "Proceed under your standing approval without asking me anything; if a required step cannot run, record why on the record rather than skipping silently." Recorded here per that instruction:

- Implicated technology subjects and page states under `docs/wiki/engineering/`: TypeScript (`draft`, version-seeded), Vitest (`draft`, version-seeded), ESLint (`draft`, incidental — lints the new file). No `$guidance` run: the owner named no subjects and directed no questions.
- Standards half: no standard subject applies — the delta has no security, privacy, accessibility, protocol, or regulatory surface (pure arithmetic, no external input or output boundary).
- `$research`: not run; resolved `not-needed` from the inspection evidence above. If a version-specific or security-sensitive question surfaces later, it must be raised to the owner for this record rather than relabelled.

## Decisions

`none`. Significance test (`docs/wiki/maintenance.md § Architecture decision records`) applied 2026-07-27: adding one pure utility export changes no system structure, affects no cross-cutting quality, adopts or drops no technology or dependency, and is cheap to reverse in a private 0.1.0 library. The owner-confirmed error contract (`RangeError` on `total === 0`) is a routine implementation choice that mirrors the existing `clamp` behavior; no qualifying architectural decision exists, so nothing is drafted for ADR publication.

## Execution

Approach: add `src/percent.ts` as an arrow-function const with explicit parameter and return types, throwing `RangeError` when `total === 0` and otherwise returning `Math.round((value / total) * 1000) / 10`; re-export it from `src/index.ts` with an explicit `.js` extension; add minimal tests for the rounding and the zero-total error to `tests/index.test.ts` through the barrel import; add `percent` to the README function list.

Verification commands (per `docs/wiki/operations/verification.md`):

```sh
npm run typecheck
npm run lint
npm test
```

Project-owner approval: the owner's `/to-backlog` invocation of 2026-07-27 is the recorded standing approval for this story's intake, rank position 1, refinement, and the `proposed -> ready` transition.

## Provenance

Confirmed conclusions from a discussion between the project owner (cbeelte@markveys.com) and the agent, submitted via the owner's `/to-backlog` invocation on 2026-07-27. That invocation is the owner's standing approval for intake, rank position 1, refinement, and the `proposed -> ready` transition of this item, and directs the agent to proceed without further questions, recording on this record any required step that cannot run.

## Subtasks

- [ ] Implement `src/percent.ts` and export it from `src/index.ts`; verify `npm run typecheck` and `npm run lint` pass.
- [ ] Add unit tests to `tests/index.test.ts` covering one-decimal rounding and the zero-total `RangeError`; verify `npm test` passes.
- [ ] Add `percent` to the README function list; verify the README names all four exported utilities.
