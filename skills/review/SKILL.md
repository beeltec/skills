---
name: review
description: Use this skill when a user wants to review a work item, branch, pull request, or work-in-progress change. Pin one fixed comparison point, run independent Standards and Spec passes, report their findings separately, and record the result for an item in `docs/work/`. Use after implementation and before documentation. Do not implement fixes or promote knowledge.
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
10. Report both results separately, including zero findings.
11. Record `changes-requested` when either axis has a material finding.
12. Hand requested changes back to `implement`.
13. If both axes pass, record the review and move the item to `in-review`.

For a review without this workflow, return the two reports without recording a
ticket transition.

## Record requested changes

```bash
node .project/bin/project-flow.mjs review APP-2 \
  --status changes-requested \
  --reviewer agent/codex \
  --base abc123 \
  --standards "Pass. 0 material findings." \
  --spec "AC-2 is incomplete at src/lib/store.ts:48."
```

## Record approval

```bash
node .project/bin/project-flow.mjs review APP-2 \
  --status pass \
  --reviewer agent/codex \
  --base abc123 \
  --standards "Pass. 0 material findings." \
  --spec "Pass. 0 material findings."
node .project/bin/project-flow.mjs transition APP-2 in-review
```

## Boundaries

- Do not change product code during the review.
- Do not mark acceptance criteria passed.
- Do not approve only because automated checks pass.
- Do not create or promote established knowledge.
- Stop after reporting findings or moving clean work to `in-review`.
