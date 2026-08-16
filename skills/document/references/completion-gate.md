# Completion gate

## Why closure is a command

Jira separates workflow status from resolution. This workflow also treats
closure as a controlled transition. Editing JSON cannot promote knowledge or
produce a trustworthy audit record.

Source: https://support.atlassian.com/jira-cloud-administration/docs/configure-resolutions-in-a-jira-workflow/

## Review checklist

- Confirm work runs in the ticket's Conventional Branch worktree.
- Confirm the latest target commit is an ancestor of the ticket branch.
- Confirm `review.fixedPoint` equals that full target commit.
- Compare each acceptance criterion with its evidence.
- Check the last check run time against the relevant source changes.
- Confirm relevant official source notes were refreshed in this work session.
- Confirm promoted knowledge uses active canonical project terms.
- Confirm Standards and Spec both report zero P0, P1, and P2 findings.
- Inspect every child and blocker.
- Compare each staged concept with the implemented code and tests.
- Confirm update candidates retain still-valid prior knowledge.
- Confirm sources use valid actor names and useful provenance.

## Failure handling

If acceptance or checks fail, transition the item to `in-progress`.

If any P0, P1, or P2 remains, use `implement` to fix it. Run both review passes
again against the same fixed point. Repeat until the blocking counts reach zero.

P3 suggestions do not block completion.

If a knowledge candidate is incomplete, edit the draft and keep the item in
review.

If an official page conflicts with a source note, refresh the note and return
affected code or decisions to the appropriate workflow stage.

If a project term is missing or disputed, use `language` for explicit user
agreement. Never stage the workflow-managed ubiquitous language file as a
ticket knowledge candidate.

If a child or blocker remains open, complete that work first.

If a target existence check fails, correct `create` versus `update`. Never
overwrite an unrelated concept.

## Git finalization

Only one ticket may enter this section at a time. Keep other green tickets in
`in-review`. Do not complete them before their integration turn.

After `complete`, commit the ticket state and promoted knowledge with a
Conventional Commit. Keep the ticket worktree clean.

From the clean target-branch worktree, run:

```bash
node .project/bin/project-flow.mjs worktree-finish <KEY>
```

The command requires a green, valid ticket worktree. It also requires every
ticket commit to follow Conventional Commits. The target branch must equal the
reviewed fixed point. It creates a `--no-ff` conventional merge commit.

Only after a successful merge does it remove the worktree and run
`git branch -d`. It never uses force. Integration is serial, even when several
ticket implementations ran in parallel.

If finalization fails, keep the branch and worktree. Resolve the reported
condition, repeat checks and review when needed, then run finalization again.

## Trust result

Promotion adds machine confirmation through `process:project-flow`. It does not
add `human:<id>`. Add human review only after a real person confirms the
concept.

Completion establishes the target branch state. It does not establish a
deployment, publication, package version, or product outcome. Use `ship` for a
release and `measure` for the confirmed brief's post-release success metric.
