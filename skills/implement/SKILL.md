---
name: implement
description: Use this skill when a user wants to implement, fix, or continue a ready item from `docs/work/`. Read established knowledge, change the code, run configured checks, record acceptance evidence, and prepare a fixed-point handoff for review. Stop with verified work in progress. Do not review, promote knowledge, or close the item.
---

# Implement

Deliver one ready work item from established context. Finish with verified code
and a complete handoff to the `review` skill.

## Procedure

1. Read [references/delivery-contract.md](references/delivery-contract.md).
2. Run `status` and select the requested ready item.
3. Run `show <KEY>`.
4. Read `docs/knowledge/index.md` and relevant concepts.
5. Inspect the named source, tests, and current Git state.
6. Pin the review fixed point before changing code.
7. Move the item to `in-progress`.
8. Implement the smallest change that satisfies the item.
9. Add or update focused tests.
10. Run `verify <KEY>`.
11. Record every acceptance result with concrete evidence.
12. Report the fixed point, changed files, checks, and acceptance evidence.
13. Hand the unchanged final implementation to `review`.

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
- Stop with verified work in `in-progress`.
