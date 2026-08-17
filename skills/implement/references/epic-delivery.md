# Epic delivery

Treat an epic request as authority to coordinate its complete local delivery.
Keep child implementation isolated. Keep final integration serial.

## Start or resume

1. Require one requested epic in `ready`, `in-progress`, or legacy `done` state.
2. Read the epic, brief, every descendant, dependency link, and active worktree.
3. Reject an open blocker outside the epic. Schedule internal blockers first.
4. Keep the configured target worktree clean.
5. Resolve the target commit before the first child starts.
6. Transition the epic to `in-progress`.
7. Record that commit as the pending epic scope base.
8. Create `docs/work/handoffs/<EPIC>.md` with the scope base and child set.
9. Commit this workflow state on the target branch with a Conventional Commit.

```bash
epic_scope_base="$(git rev-parse HEAD)"
node .project/bin/project-flow.mjs transition APP-1 in-progress
node .project/bin/project-flow.mjs review APP-1 \
  --status pending \
  --scope-base "$epic_scope_base"
git add docs/work
git commit -m "chore(app-1): start epic delivery"
```

On resume, reuse `review.scopeBase`. Require an ancestor commit or the controlled
legacy empty tree. Never replace it with a newer commit.

For a legacy `done` epic without `review.scopeBase`, do not reopen it
automatically. Ask the user to authorize another review round. After explicit
authority, use the controlled command, commit the reopened state, and continue.
Do not edit the item JSON.

```bash
node .project/bin/project-flow.mjs epic-review-open APP-1 \
  --rereview-authority human:user
git add docs/work
git commit -m "chore(app-1): reopen integrated epic review"
```

When a legacy descendant records `initial tree`, the command stores Git's empty
tree as the exact pre-first-commit scope. Review the full empty-tree diff and
every current file relevant to the epic specifications.

Keep the epic handoff concise. Record each child key and its target merge commit.
This separates epic-owned commits from unrelated target changes during a long
or parallel delivery.

For an older active epic without `review.scopeBase`, derive the earliest
provable base from descendant review records, handoffs, and Git ancestry.
Record it before continuing. The CLI rejects a base that omits a reviewed
descendant. Stop when repository evidence cannot prove the complete range.

## Deliver every descendant

1. Select every unfinished descendant, not only the next story.
2. Build dependency-ready waves from `blocked-by` links.
3. Run independent, non-overlapping tickets in parallel worktrees when safe.
4. Apply the normal ticket implementation and its single automatic review round.
5. Invoke `$document` for each passing child in the serial integration lane.
6. Merge a blocker before starting any dependent child.
7. Record each child merge commit in the epic handoff.
8. Commit the handoff update before creating another worktree or review.
9. Refresh the target state after every merge.
10. Continue until every direct child and descendant is `done`.

Do not hand one child back as the epic result. Preserve the epic as the user’s
implementation unit across interruptions.

## Run the final epic review

After every descendant is `done`, create one final epic review worktree from the
clean current target branch:

```bash
node .project/bin/project-flow.mjs worktree-add APP-1 --epic-review
cd .worktrees/app-1
```

Use this worktree only for integrated verification, epic review repairs,
knowledge drafting, and completion.

1. Verify the epic's acceptance criteria against the integrated behavior.
2. Run every epic check and collect every declared quality-gate proof.
3. Commit any required epic-level evidence or repair with Conventional Commits.
4. Invoke `$review` with the epic key, worktree, branch, target fixed point, and scope base.
5. Give both axes the epic handoff and its child merge commits.
6. Let both axes inspect `review.scopeBase...HEAD` as the complete change superset.
7. Fix every valid P0, P1, and P2 finding in the epic review worktree.
8. Rerun all epic checks after repairs and commit them.
9. Record remediation with `review-resolve` without starting another review.
10. Start another review round only after explicit user instruction.
11. Leave the reviewed and remediated epic in `in-review` and hand it to `$document`.

The descendant reviews inspect each isolated ticket. The epic review separately
inspects their integrated result. Never substitute child reports for this round.

## Boundaries

- Do not create the epic review worktree while any descendant is open.
- Do not implement child product code in the target worktree.
- Do not release any child while its parent epic remains open.
- Do not change the recorded epic scope base during remediation.
- Do not skip integrated checks because every child check passed.
- Do not stop after one child when the user requested the epic.
