---
name: review
description: Use this skill when a user wants to review a work item, branch, pull request, or work-in-progress change. Pin one fixed comparison point, run independent Standards and Spec passes, classify every finding from P0 to P3, and loop with implementation until no P0, P1, or P2 findings remain. Record the result for an item in `docs/work/`. Use after implementation and before documentation. Do not implement fixes or promote knowledge.
---

# Review

Review one fixed change without letting code quality hide specification errors.
Leave clean workflow items in `in-review`.

## Procedure

1. Read [references/two-axis.md](references/two-axis.md).
2. Run `show <KEY>` when reviewing a workflow item.
3. Confirm the item is `in-progress` or `in-review`.
4. Read `docs/work/handoffs/<KEY>.md` when it exists.
5. Use the implementation handoff or user input to pin the fixed point.
6. Validate the fixed point and confirm the review scope is not empty.
7. Read applicable repository standards.
8. Run the Standards pass against the complete change.
9. Run a fresh Spec pass against the originating work item or specification.
10. Assign P0, P1, P2, or P3 to every finding.
11. Report both results separately, including counts for every severity.
12. If any P0, P1, or P2 exists, record `changes-requested`.
13. Hand all blocking findings to `implement` and keep the original fixed point.
14. After fixes, rerun both complete passes against the updated change.
15. Repeat steps 8-14 until both passes contain no P0, P1, or P2 findings.
16. Record the passing review and move the item to `in-review`.

For a review without this workflow, return the two reports without recording a
ticket transition. If fixes are not authorized, report that the review loop is
still blocked. Never approve while a P0, P1, or P2 remains.

## Record requested changes

```bash
node .project/bin/project-flow.mjs review APP-2 \
  --status changes-requested \
  --reviewer agent/codex \
  --base abc123 \
  --standards "P0:0 P1:0 P2:0 P3:0." \
  --spec "P0:0 P1:0 P2:1 P3:0. AC-2 is incomplete at src/lib/store.ts:48."
```

## Record approval

```bash
node .project/bin/project-flow.mjs review APP-2 \
  --status pass \
  --reviewer agent/codex \
  --base abc123 \
  --standards "Pass. P0:0 P1:0 P2:0 P3:0." \
  --spec "Pass. P0:0 P1:0 P2:0 P3:0."
node .project/bin/project-flow.mjs transition APP-2 in-review
```

## Boundaries

- Do not change product code during the review.
- Do not mark acceptance criteria passed.
- Do not approve only because automated checks pass.
- Do not treat a promise to fix later as a resolved finding.
- Do not create or promote established knowledge.
- Keep the item out of `in-review` while any P0, P1, or P2 remains.
- Stop only when blocked by missing authority or after the loop passes.
