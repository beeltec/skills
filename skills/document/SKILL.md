---
name: document
description: Use this skill after implementation and passing code review to establish project knowledge and finish a ticket branch. Verify the review used the latest target commit, refresh official sources, promote valid OKF drafts, complete the green item, commit its documentation, merge it into `main` by default, and safely remove its clean worktree and local branch.
---

# Document

Capture only facts that the reviewed implementation now proves. Complete the
work item through the knowledge promotion gate.

## Procedure

1. Read [references/completion-gate.md](references/completion-gate.md).
2. Run `show <KEY>`.
3. Enter the serial integration lane. Do not document two tickets concurrently.
4. Confirm the current path and branch belong to this ticket worktree.
5. Resolve the configured target branch to its full current commit hash.
6. Confirm that commit is an ancestor and equals `review.fixedPoint`.
7. Return to `implement` and `review` when the target has advanced.
8. Confirm the item is `in-review` with zero P0, P1, and P2 findings.
9. Review acceptance evidence and the latest check results.
10. Read `docs/knowledge/sources/index.md` and relevant source notes.
11. Use `$source` to refresh official docs cited by the completed work.
12. Read the implemented code and relevant established concepts.
13. Create small drafts for durable facts and verify them against code.
14. Run `complete <KEY>` and fix any rejected gate.
15. Commit the completion changes with `docs(<key>): establish knowledge`.
16. Return to the clean target-branch worktree.
17. Run `worktree-finish <KEY>` to merge, remove the worktree, and delete the branch.
18. Run `validate` and report the merge commit, promoted paths, and resolution.

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
sets a resolution, and refreshes the knowledge indexes, log, and work board.

## Knowledge rules

- Document current architecture, behavior, interfaces, data, and operations.
- Omit temporary implementation detail with no future value.
- Keep rejected approaches in work history.
- Leave user wishes and future behavior in `docs/work/`.
- Use official docs for external behavior and code or tests for project behavior.
- Never claim human review without an actual human reviewer.
- Do not run `complete` before the ticket enters its serial integration turn.
- Never merge when the final review fixed point differs from the current target.
- Never force-remove a worktree or force-delete a ticket branch.
- Do not push or delete remote branches unless the user requests it.
