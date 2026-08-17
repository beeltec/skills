# Ticket worktrees

## Fixed policy

Keep the main worktree on the configured target branch. The default target is
`main`. Do not implement ticket code there.

Create one linked worktree and branch for each non-epic ticket:

```text
.worktrees/<lowercase-ticket-key>/
feat/<lowercase-ticket-key>-<short-slug>
fix/<lowercase-ticket-key>-<short-slug>
chore/<lowercase-ticket-key>-<short-slug>
```

Use `feat` for stories, `fix` for bugs, and `chore` for tasks or subtasks.
Override the type only when another Conventional Branch purpose type is more
accurate. Never reuse a branch for another ticket.

After every epic descendant is `done`, create one epic review worktree:

```bash
node .project/bin/project-flow.mjs worktree-add APP-1 --epic-review
```

Use it only for integrated verification, final epic review repairs, knowledge,
and completion. Do not create it for child implementation.

Create the worktree from the clean, checked-out target branch:

```bash
node .project/bin/project-flow.mjs worktree-add APP-2
```

Git gives every worktree its own `HEAD` and index while sharing repository
references. Git also refuses to check out one branch in two worktrees by
default. Do not bypass that safeguard with `--force`.

## Dependency gate

Do not create a worktree while any `blocked-by` ticket remains open. Jira-style
dependencies mean the blocking item must end before the dependent item begins.

Do not stack the dependent branch on the blocker branch. Finish and merge the
blocker into the target branch first. Then create the dependent worktree from
the updated target.

Discussion, source research, and plan refinement may continue for blocked
tickets. Product implementation may not.

## Parallel selection

Parallelize tickets only when all these conditions hold:

- every ticket is ready and unblocked;
- no dependency path exists between the tickets;
- their expected non-generated write paths do not overlap materially;
- each agent receives one absolute worktree path and one ticket;
- the coordinator remains in the main worktree.

Worktrees isolate files. They do not remove semantic dependencies, database
migration order, shared API changes, or later merge conflicts.

The target-branch board shows integrated state. Use `worktree-list` to locate
active worktrees. Run `show <KEY>` inside each worktree for its branch-local
ticket state.

## Commit policy

Use Conventional Commits 1.0.0 for every ticket commit:

```text
<type>(<lowercase-ticket-key>): <description>
```

Examples:

```text
feat(app-2): persist tasks
test(app-2): cover failed writes
fix(app-2): reject empty titles
```

Keep each commit cohesive and passing when practical. Do not use vague subjects
such as `updates`, `wip`, or `fix stuff`.

## Synchronization before final review

Integration is serial even when implementation is parallel. Before the final
review, make the latest target commit an ancestor of the ticket branch.

Rebase only a local, unpublished ticket branch. If the branch is shared, merge
the target with a conventional message such as `chore(app-2): sync main`.
Rerun all checks after either operation. Run the one review round only after
the branch contains the final target state.

Parallel tickets can both change generated board or index files. After
integrating the target, resolve those generated-file conflicts by running
`sync` and staging its output. Do not hand-edit derived board contents.

The review must store the full current target commit hash. If the target
advances afterward, stop. Another review round needs explicit user authority.

## Official sources

- https://git-scm.com/docs/git-worktree.html
- https://git-scm.com/docs/gitworkflows
- https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow/
- https://support.atlassian.com/jira-software-cloud/docs/what-are-dependencies-in-advanced-roadmaps/
- https://www.conventionalcommits.org/en/v1.0.0/
- https://conventionalbranch.org/
