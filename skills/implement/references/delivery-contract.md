# Delivery contract

## Read order

Read these files from the designated ticket worktree:

1. `docs/work/board.md`
2. `docs/work/items/<KEY>.json`
3. The confirmed brief named by the item
4. `docs/work/handoffs/<KEY>.md`, when it exists
5. `docs/knowledge/index.md`
6. `docs/knowledge/ubiquitous-language.md`
7. `docs/knowledge/sources/index.md` and relevant official source notes
8. Relevant project concepts
9. Relevant code and tests

This order separates intended work from established facts.

Read relevant notes under `docs/knowledge/sources/`. Re-open their official
URLs through `source` before choosing an external API or relying on a vendor
constraint. Treat model memory only as a search lead.

A handoff contains temporary implementation state. Verify it against the item,
the fixed point, and the current worktree before continuing.

For an epic, read every descendant and preserve `review.scopeBase` from before the
first child started. Use the separate epic delivery reference for coordination.

Use canonical project terms when the same concepts appear in behavior, code,
tests, and documentation. Do not rename exact external API identifiers. Stop
for `language` when implementation reveals a disputed meaning.

Confirm that the branch contains the ticket key and follows Conventional
Branch 1.1.0. Stop if the agent is in the main worktree or another ticket's
worktree.

## Git evidence

Keep the target branch commit as the fixed point. Inspect `git status` before
editing and before every commit. Stage only ticket-owned files.

Use Conventional Commits 1.0.0. Use the lowercase ticket key as the scope when
the change belongs to one ticket. Keep unrelated changes out of the branch.

## Check execution

`verify <KEY>` runs each declared command from the project root. A successful
run stores only its exit code and timestamp. A failed run also stores bounded
diagnostic output. Review commands first because work item files are executable
project input.

If a command fails, fix the product or refine the work item. Never change the
recorded status by hand.

## Acceptance evidence

Use the shortest evidence that proves the criterion. Good evidence includes a
test case, an inspected response, or a specific file and behavior.

Avoid statements such as "implemented" or "looks good." They do not prove an
outcome.

## Quality-gate evidence

Treat each declared gate as a separate proof obligation. Use automated output
when it directly proves the gate. Otherwise, record the inspected behavior,
artifact, or human assessment. Do not use a generic test pass as security,
privacy, accessibility, migration, reliability, or performance evidence.

## Automatic review

Report the resolved target commit, item key, worktree path, branch, source-note
paths, commits, changed files, checks, and acceptance evidence. Ticket
worktrees require an existing commit. Invoke `review` immediately without
asking the user.

When the latest review requests changes, preserve that fixed point. Address
all valid P0, P1, and P2 findings. Return disputed findings with concrete
evidence. Rerun the complete configured check set before the next review pass.
Continue the loop until both review axes have no P0, P1, or P2 findings.

For the final epic loop, also preserve `review.scopeBase`. Review the complete
integrated range on every iteration, not only changes on the epic branch.
