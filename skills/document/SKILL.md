---
name: document
description: Use this skill after implementation and passing code review to establish repository knowledge and finish a ticket or final epic review branch. Verify the review used the latest target commit, require the full recorded scope for an epic, refresh official sources, promote valid OKF drafts, complete the green item, merge it into `main` by default, and safely remove its clean worktree and local branch. Hand releasable work to ship without claiming it is deployed.
---

# Document

Capture only facts that the reviewed implementation now proves. Complete the
work item through the knowledge promotion gate.

## Procedure

1. Read [references/completion-gate.md](references/completion-gate.md).
2. Run `show <KEY>`.
3. Enter the serial integration lane. Do not document two work items concurrently.
4. Confirm the current path and branch belong to this work item worktree.
5. Resolve the recorded review target branch to its full current commit hash.
6. Confirm that commit is an ancestor and equals `review.fixedPoint`.
7. For an epic, confirm every descendant is `done` and `review.scopeBase` is valid.
8. Return to `implement` and `review` when the target has advanced.
9. Confirm the item is `in-review` with zero P0, P1, and P2 findings.
10. Review acceptance evidence and the latest check results.
11. Read `docs/knowledge/ubiquitous-language.md` as the project Ubiquitous Language.
12. Read `docs/knowledge/sources/index.md` and relevant source notes.
13. Use `$source` to refresh official docs cited by the completed work.
14. Read the implemented code and relevant established concepts.
15. Use active canonical terms in each knowledge draft.
16. Resolve missing or changed meanings through `$language` before completion.
17. Create small drafts for durable facts and verify them against code.
18. Run `complete <KEY>` and fix any rejected gate.
19. Commit the completion changes with `docs(<key>): establish knowledge`.
20. Return to that clean target-branch worktree.
21. Run `worktree-finish <KEY>` with the same target to merge and clean up.
22. Run `validate` and report the merge commit, promoted paths, and resolution.
23. State clearly that item `done` means merged and documented, not released.
24. Hand releasable leaf ticket groups to `ship` after their parent epic is done.

## Create a draft

```bash
node .project/bin/project-flow.mjs knowledge-template APP-2 \
  --target architecture/task-storage.md \
  --action create \
  --type Architecture \
  --title "Task storage" \
  --description "Tasks persist in a local SQLite database."
```

The command returns a path under `docs/work/drafts/<KEY>/`. Edit that file
before completion.

Use `update` when the knowledge target exists. Preserve every still-valid fact and
unknown OKF field.

## Complete and promote

```bash
node .project/bin/project-flow.mjs complete APP-2
git add docs
git commit -m "docs(app-2): establish task storage knowledge"
cd /path/to/target-worktree
node .project/bin/project-flow.mjs worktree-finish APP-2
node .project/bin/project-flow.mjs validate
```

Completion moves valid drafts into `docs/knowledge/`, records their digests,
sets a resolution, and refreshes the knowledge indexes and work board.

## Knowledge rules

- Document current architecture, behavior, interfaces, data, and operations.
- Describe repository behavior as deployed only when green release knowledge proves it.
- Omit temporary implementation detail with no future value.
- Keep rejected approaches in work history.
- Leave user wishes and future behavior in `docs/work/`.
- Use official docs for external behavior and code or tests for project behavior.
- Never claim human review without an actual human reviewer.
- Do not run `complete` before the ticket enters its serial integration turn.
- Never merge when the final review fixed point differs from the current target.
- Never complete an epic from child review evidence alone.
- Do not ship epic children before the parent epic reaches `done`.
- Never force-remove a worktree or force-delete a ticket branch.
- Do not push or delete remote branches unless the user requests it.
- Do not create a release record or run a deployment from this skill.
- Do not stage `ubiquitous-language.md` through a ticket knowledge draft.
