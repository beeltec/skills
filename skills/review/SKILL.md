---
name: review
description: Use this skill when a user wants to review a ticket branch, ticket worktree, pull request, or work-in-progress change. Verify the branch contains the latest target commit, refresh official sources, run independent Standards and Spec passes, classify findings from P0 to P3, and loop with implementation until no P0-P2 findings remain. Use after implementation and before documentation. Do not implement, merge, or promote knowledge.
---

# Review

Review one fixed change without letting code quality hide specification errors.
Leave clean workflow items in `in-review`.

## Procedure

1. Read [references/two-axis.md](references/two-axis.md).
2. Run `show <KEY>` when reviewing a workflow item.
3. Confirm the item is `in-progress` or `in-review`.
4. Read `docs/work/handoffs/<KEY>.md` when it exists.
5. Confirm the current path and branch belong only to the named ticket.
6. Resolve the current configured target branch to a full commit hash.
7. Confirm that commit is an ancestor of the ticket branch.
8. Pin the fixed point to that exact target commit.
9. If the target is missing, return to `implement` for synchronization.
10. Validate the fixed point and confirm the review scope is not empty.
11. Read the linked confirmed brief, item risk profile, and quality-gate evidence.
12. Read `docs/knowledge/ubiquitous-language.md` as the project Ubiquitous Language.
13. Read `docs/knowledge/sources/index.md` and relevant source notes.
14. Use `$source` to refresh external rules from official documentation.
15. Read applicable repository standards and Git conventions.
16. Check canonical term use in behavior, code, tests, and documentation.
17. Run the Standards pass against the complete change and every declared gate.
18. Run a fresh Spec pass against the originating work item or specification.
19. Assign P0, P1, P2, or P3 to every finding.
20. Report both results separately, including counts for every severity.
21. If any P0, P1, or P2 exists, record `changes-requested`.
22. Hand all blocking findings to `implement` and keep the fixed point.
23. After fixes, rerun both complete passes against the updated change.
24. Repeat steps 17-23 until both passes contain no P0, P1, or P2 findings.
25. Record the passing review and move the item to `in-review`.

For a review without this workflow, return the two reports without recording a
ticket transition. If fixes are not authorized, report that the review loop is
still blocked. Never approve while a P0, P1, or P2 remains.

## Record requested changes

```bash
node .project/bin/project-flow.mjs review APP-2 \
  --status changes-requested \
  --reviewer agent/codex \
  --base 0123456789abcdef0123456789abcdef01234567 \
  --standards "P0:0 P1:0 P2:0 P3:0." \
  --spec "P0:0 P1:0 P2:1 P3:0. AC-2 is incomplete at src/lib/store.ts:48."
```

## Record approval

```bash
node .project/bin/project-flow.mjs review APP-2 \
  --status pass \
  --reviewer agent/codex \
  --base 0123456789abcdef0123456789abcdef01234567 \
  --standards "Pass. P0:0 P1:0 P2:0 P3:0." \
  --spec "Pass. P0:0 P1:0 P2:0 P3:0."
node .project/bin/project-flow.mjs transition APP-2 in-review
```

## Boundaries

- Do not change product code during the review.
- Do not review two ticket branches as one change.
- Do not approve a branch that lacks the latest target commit.
- Do not merge or remove the ticket branch or worktree.
- Do not mark acceptance criteria passed.
- Do not approve only because automated checks pass.
- Do not approve when a declared quality gate lacks applicable passing evidence.
- Do not report an external API or vendor-rule finding from model memory alone.
- Do not force project terms onto exact external API identifiers.
- Send a disputed meaning to `$language`; do not decide it during review.
- Do not treat a promise to fix later as a resolved finding.
- Do not create or promote established knowledge.
- Keep the item out of `in-review` while any P0, P1, or P2 remains.
- Stop only when blocked by missing authority or after the loop passes.
