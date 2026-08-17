# Ticket Git workflow

Keep ticket implementation isolated and integration predictable.

## Branches and worktrees

- Keep the configured integration worktree clean and on its target branch.
- Use `main` as the target branch unless project configuration names another branch.
- Do not implement ticket code in the integration worktree.
- Use one branch and `.worktrees/<lowercase-ticket-key>/` worktree for each non-epic ticket.
- Use `feat/<key>-<slug>` for stories and `fix/<key>-<slug>` for bugs.
- Use `chore/<key>-<slug>` for tasks and subtasks when no better supported type exists.
- Never reuse one ticket branch or worktree for another ticket.
- Treat an epic implementation request as coordination of its complete child set.
- Create one epic review worktree only after every descendant ticket is done.
- Use that epic worktree only for integrated review, repairs, knowledge, and completion.

## Dependencies and parallel work

- Do not implement a ticket while any `blocked-by` ticket remains open.
- Do not base a dependent ticket on its unfinished blocker branch.
- Merge the blocker into the target branch before starting dependent implementation.
- Parallelize only ready tickets without a dependency path between them.
- Do not parallelize tickets with likely overlap in non-generated write paths.
- Assign each agent one ticket and one absolute worktree path.
- Keep final integration serial even when implementation is parallel.
- Merge passing epic descendants serially before starting the final epic review.

## Commits and integration

- Use Conventional Branch 1.1.0 names for ticket branches.
- Use Conventional Commits 1.0.0 for ticket and merge commits.
- Use the lowercase ticket key as the commit scope for ticket-owned changes.
- Keep commits cohesive and passing when practical.
- Keep unrelated changes out of the ticket branch.
- Make the latest target commit an ancestor before final review.
- Rerun checks and review after synchronizing with an advanced target branch.
- Review an epic from its recorded pre-child scope base through its final review branch.
- Merge green ticket branches into the configured target branch with `--no-ff`.
- Remove only clean worktrees and fully merged local branches.
- Use `git branch -d`; never force-delete a ticket branch.
- Never bypass Git worktree safeguards with `--force`.
- Require explicit user authority for pushes, pull requests, remote deletion, publication, or deployment.
