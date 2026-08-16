---
name: implement
description: Use this skill when a user wants to implement, fix, or continue a ready item from `docs/work/`, including fixes requested by code review. Check whether the work fits the active model's remaining context. Delegate bounded implementation packets when needed. Integrate changes, run checks, record acceptance evidence, and return review fixes until no P0, P1, or P2 findings remain. Do not review, promote knowledge, or close the item.
---

# Implement

Deliver one ready work item from established context. Finish with verified code
and a complete handoff to the `review` skill.

## Procedure

1. Read [references/delivery-contract.md](references/delivery-contract.md).
2. Read [references/delegation.md](references/delegation.md).
3. Select the requested ready item or an `in-progress` item with requested changes.
4. Run `show <KEY>`.
5. Read `docs/knowledge/index.md` and relevant concepts.
6. Inspect the named source, tests, existing handoff, and current Git state.
7. Pin the review fixed point before changing code.
8. Apply the session-fit gate before changing product code.
9. Move a ready item to `in-progress`. Keep a repair item there.
10. For requested changes, address every valid P0, P1, and P2 finding.
11. If the work fits, implement the smallest complete change directly.
12. If it does not fit, create the handoff and use implementation subagents.
13. Integrate every packet and resolve shared-worktree conflicts.
14. Add or update focused tests.
15. Run `verify <KEY>` as the coordinator.
16. Record every acceptance result with concrete evidence.
17. Report the fixed point, changed files, checks, and acceptance evidence.
18. Hand the unchanged final implementation back to `review`.

## Review fixes

Treat every valid P0, P1, and P2 finding as required work. A P3 suggestion is
optional and must not expand the ticket without a clear benefit.

Keep the original review fixed point. If a finding is invalid or outside the
ticket, return concrete evidence to `review`; do not silently ignore it. After
fixing the blocking findings, rerun the whole item's checks and return to
`review`. Continue until `review` reports zero P0, P1, and P2 findings.

## Commands

```bash
node .project/bin/project-flow.mjs transition APP-2 in-progress
node .project/bin/project-flow.mjs verify APP-2
node .project/bin/project-flow.mjs accept APP-2 AC-1 \
  --status pass \
  --evidence "src/lib/store.test.ts proves persistence"
```

## Review handoff

Give `review` the work item key and resolved starting commit. Use `initial tree`
when the repository had no commit. State any overlap with pre-existing changes.

## Boundaries

- Do not stage or promote knowledge content.
- Do not close the item.
- Do not mark acceptance passed without evidence.
- Do not record the final review.
- Do not approve or dismiss your own review fixes.
- Do not delegate small work that fits safely in the current session.
- Do not let implementation subagents change workflow state or review the item.
- Stop with verified work in `in-progress`.
