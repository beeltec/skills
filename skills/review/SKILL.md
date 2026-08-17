---
name: review
description: Use this skill when a user wants to review a ticket branch, final epic integration, pull request, or work-in-progress change. Verify the branch contains the latest target commit, review an epic from its recorded delivery scope base after every descendant is done, delegate Standards and Spec to separate parallel subagents, and loop with implementation until no P0-P2 findings remain. Use after implementation and before documentation. Do not perform either review axis in the orchestrating agent, implement, merge, or promote knowledge.
---

# Review

Review one fixed scope without letting code quality hide specification errors.
Leave clean workflow items in `in-review`.

## Procedure

1. Read [references/two-axis.md](references/two-axis.md).
2. Run `show <KEY>` when reviewing a workflow item.
3. Confirm the item is `in-progress` or `in-review`.
4. Read `docs/work/handoffs/<KEY>.md` when it exists.
5. Confirm the current path and branch belong only to the named work item.
6. Resolve the configured or explicit alternate target branch to a full commit hash.
7. Confirm that commit is an ancestor of the review branch.
8. Pin `review.fixedPoint` and the target branch name to that exact target commit.
9. For an epic, require every descendant `done` and load its recorded `review.scopeBase`.
10. Confirm the epic scope base is an ancestor commit or the controlled legacy empty tree.
11. For a non-epic ticket, use the target fixed point as its scope base.
12. If the target or scope base is missing, return to `implement` for synchronization.
13. Confirm the complete review scope is not empty.
14. Read the linked confirmed brief, item risk profile, and quality-gate evidence.
15. For an epic, read every descendant specification and acceptance record.
16. Read `docs/knowledge/ubiquitous-language.md` as the project Ubiquitous Language.
17. Read `docs/knowledge/sources/index.md` and relevant source notes.
18. Use `$source` to refresh external rules from official documentation.
19. Read applicable repository standards and Git conventions.
20. Add canonical-term rules and the vocabulary file to the Standards packet.
21. Prepare separate Standards and Spec packets for the same fixed scope.
22. Spawn one Standards subagent and one Spec subagent in parallel.
23. Let each subagent inspect the complete change in its own context.
24. Wait for both reports. Do not perform either pass in the orchestrating agent.
25. Aggregate the reports without merging or reranking their findings.
26. Report both results separately, including counts for every severity.
27. If any P0, P1, or P2 exists, record `changes-requested`.
28. Hand all blocking findings to `implement` and keep both commits fixed.
29. After fixes, spawn two fresh parallel review subagents.
30. Repeat steps 21-29 until both axes contain no P0, P1, or P2 findings.
31. Record the passing review and move the item to `in-review`.

For a review without this workflow, return the two reports without recording a
ticket transition. If fixes are not authorized, report that the review loop is
still blocked. Never approve while a P0, P1, or P2 remains.

When `$implement` invokes this skill, its implementation request already
authorizes valid in-scope repairs. Return blocking findings directly to
implementation without asking the user for permission.

## Required agent separation

- Run the Standards pass only in the Standards subagent.
- Run the Spec pass only in the Spec subagent.
- Use two distinct subagents. Never ask one subagent to review both axes.
- Start both subagents in the same parallel delegation round.
- Keep both subagents read-only. They must not edit code or workflow state.
- Give both the same fixed point and complete change scope.
- Give only Standards material to the Standards subagent.
- Give only specification material to the Spec subagent.
- Do not pass one subagent's findings to the other.
- Use fresh subagents for every review-loop iteration.
- If a subagent fails, rerun that axis in a fresh subagent.
- If the harness cannot run subagents, stop. Do not review in the orchestrator.

For non-workflow reviews, skip the Spec subagent only after the user confirms
that no specification exists. State that the Spec axis was skipped.

## Record requested changes

```bash
node .project/bin/project-flow.mjs review APP-2 \
  --status changes-requested \
  --reviewer agent/codex \
  --base 0123456789abcdef0123456789abcdef01234567 \
  --standards "P0:0 P1:0 P2:0 P3:0." \
  --spec "P0:0 P1:0 P2:1 P3:0. AC-2 is incomplete at src/lib/store.ts:48."
```

For an epic, add `--scope-base <commit-before-first-child>`. Keep `--base` as
the current target commit used to create the epic review worktree.

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
- Do not perform Standards or Spec analysis in the orchestrating agent.
- Do not use one subagent for both review axes.
- Do not combine unrelated ticket branches as one change.
- Review an epic only in its final review worktree after every descendant is `done`.
- Do not reduce an epic review to its final review-branch-only diff.
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
