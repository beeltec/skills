---
name: implement
description: Use this skill when a user wants to implement, fix, or continue a ready item from `docs/work/`. Check whether the work fits the active model's remaining context. Delegate bounded implementation packets to subagents when it likely will not fit. Integrate changes, run checks, record acceptance evidence, and prepare a fixed-point review handoff. Do not review, promote knowledge, or close the item.
---

# Implement

Deliver one ready work item from established context. Finish with verified code
and a complete handoff to the `review` skill.

## Procedure

1. Read [references/delivery-contract.md](references/delivery-contract.md).
2. Read [references/delegation.md](references/delegation.md).
3. Run `status` and select the requested ready item.
4. Run `show <KEY>`.
5. Read `docs/knowledge/index.md` and relevant concepts.
6. Inspect the named source, tests, existing handoff, and current Git state.
7. Pin the review fixed point before changing code.
8. Apply the session-fit gate before changing product code.
9. Move the item to `in-progress`.
10. If the work fits, implement the smallest complete change directly.
11. If it does not fit, create the handoff and use implementation subagents.
12. Integrate every packet and resolve shared-worktree conflicts.
13. Add or update focused tests.
14. Run `verify <KEY>` as the coordinator.
15. Record every acceptance result with concrete evidence.
16. Report the fixed point, changed files, checks, and acceptance evidence.
17. Hand the unchanged final implementation to `review`.

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
- Do not delegate small work that fits safely in the current session.
- Do not let implementation subagents change workflow state or review the item.
- Stop with verified work in `in-progress`.
