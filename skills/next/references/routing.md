# Workflow routing

Use this order. Stop at the first condition that applies to the focused work.

## Integrity and safety

| State | Next action |
| --- | --- |
| No `.project/workflow.json` | Use `$setup`. |
| Installed CLI, folders, or configuration are incomplete | Use `$setup` to refresh them. |
| No Git repository exists | Use `$setup`. |
| A source record or generated view is invalid | Report the exact validation blocker. Route to the skill that owns that record. |
| A release is harming users | Use `$ship` to recover before other work. |
| A release is deploying | Use `$ship` to supervise, verify, or recover it. |
| The workflow root differs from the Git root | Stop. Ask whether the workflow belongs at the Git root or in a standalone repository. |
| No initial commit exists and the next stage needs a worktree or release | Ask the user to create an intentional baseline commit. |
| The configured target-branch worktree is dirty | Stop. Report the changed paths and ask how to preserve them. |
| A material project term is missing, ambiguous, or conflicting | Use `$language` for explicit user agreement. |
| A material external fact is missing, stale, or conflicts with its live official page | Use `$source`. |

Do not route damaged ticket, brief, release, or outcome data to `setup`. Setup
owns installation and configuration, not arbitrary work-record repair.

Ticket worktrees require the workflow root to equal the Git root. Do not guess
the intended scope. Ask the user to move or reinitialize the workflow at the
Git root, or make the current project a standalone Git repository.

The target branch must stay clean for coordination, ticket worktree creation,
integration, release, and measurement. If its changes clearly belong to an
active ticket, recommend continuing that ticket in its own worktree. Otherwise,
ask the user whether to commit, move, or stash them. Never discard them.

Discussion and planning can continue before the first commit. Implementation
and release require a resolvable target commit. Do not include unrelated files
in a baseline commit or create it without user approval.

## Product intent and planning

| State | Next action |
| --- | --- |
| The user has an unconfirmed idea or material open choice | Use `$discuss`. |
| A brief is draft | Use `$discuss` to finish and confirm it. |
| A confirmed brief has no complete delivery plan | Use `$plan`. |
| A ticket is `backlog` or lacks required planning detail | Use `$plan`. |
| A failed or rolled-back release needs corrective product work | Use `$discuss`, then `$plan`. |

Do not treat a conversation summary as a confirmed brief. Require the
persisted record.

## Tickets

Follow open `blocked-by` links before routing the requested ticket. Recommend
the first actionable blocker. Never stack a dependent branch on unfinished
blocker work.

When the blocker belongs to the same epic, keep that epic as the recommendation.
When it is external, recommend the blocker or its own parent epic first.

When a brief has an epic with stories, keep the epic as the implementation
scope. Do not reduce the recommendation to one child. The epic coordinator
orders blockers, resumes active children, integrates passing children, and runs
the final whole-epic review.

| State | Next action |
| --- | --- |
| An epic has any unfinished descendant | Use `$implement` with the epic key. |
| A child belongs to an open epic | Use `$implement` with its parent epic key. |
| A legacy `done` epic with descendants lacks `review.scopeBase` | Use `$implement` with the epic key for controlled re-review. |
| Every epic descendant is `done`, but its integrated review has not passed | Use `$implement` with the epic key. |
| An epic is `in-review` with a passing integrated review | Use `$document` with the epic key. |
| A standalone non-epic ticket is `ready` with no open blocker | Use `$implement`. |
| A standalone ticket is `in-progress` with incomplete or failing evidence | Use `$implement`. |
| Review requested changes or reports any P0, P1, or P2 | Use `$implement`; it resumes the review loop automatically. |
| A standalone ticket is `in-progress` and all delivery evidence passes | Use `$implement` to run its required review loop. |
| A standalone ticket is `in-review` with a passing review and zero P0-P2 findings | Use `$document`. |
| A ticket is `done` | Inspect release state. Do not implement or document it again. |

When several tickets are available, use this preference order:

1. Finish an existing review-repair loop.
2. Finish other work already in progress.
3. Unblock the greatest number of ready tickets.
4. Use the highest declared ticket priority.
5. Use the oldest ready ticket.

Recommend a parallel implementation batch only inside the selected epic, or
for standalone tickets. Check that every item is dependency-independent and
unlikely to write the same non-generated files.

## Releases and outcomes

| State | Next action |
| --- | --- |
| Done leaf tickets have no open parent epic and are not in a release attempt | Use `$ship`. |
| A release is planned or deploying | Use `$ship`. |
| A green release lacks its required planned outcome | Use `$ship` to create the outcome record. |
| A planned outcome's observation window is complete and evidence is available | Use `$measure`. |
| Its window is incomplete or evidence is unavailable | Wait. State the exact resume condition, then use `$measure`. |
| An observed result says `improve` or `revert` | Route its follow-up tickets. Use `$discuss` first if the needed change is not defined. |
| All outcomes are observed with `proceed` or `stop`, and no work remains | Report that the workflow is complete. |

`done` proves merged repository state. `green` proves a verified release.
`met`, `missed`, or `inconclusive` records the observed product result.
Never release a child ticket while its parent epic still needs integrated
review or completion.

## Tie handling

Use the named record, current ticket worktree, or active release as the focus.
If independent actions remain tied, state the choices and ask the user to pick
one. Do not invent business priority.
