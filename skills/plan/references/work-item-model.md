# Work item model

## Hierarchy

Use Jira's default three levels:

```text
Epic
└── Story | Bug | Task
    └── Subtask
```

Standard items may also exist without an epic. A subtask always needs a
standard parent.

Source: https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/

## Statuses

Use this path:

```text
backlog → ready → in-progress → in-review → done
```

Move backward when scope or verification fails. Only the completion command may
enter `done`.

Jira workflows use directed transitions. Jira also uses the resolution field to
decide whether an item is open or closed.

Sources:

- https://support.atlassian.com/jira-cloud-administration/docs/create-workflow-transitions/
- https://support.atlassian.com/jira-cloud-administration/docs/configure-resolutions-in-a-jira-workflow/

## Dependencies and parallel work

Use `blocked-by` only when the target ticket must finish first. Use
`relates-to` for useful navigation without an ordering constraint.

The blocked-by graph must remain acyclic. A blocked ticket may be discussed,
refined, and marked ready. Do not create its implementation worktree until
every blocker is done and merged into the target branch.

For parallel delivery, group only tickets without a dependency path between
them. Also compare likely write paths. Separate worktrees prevent working-copy
collisions, but they do not prevent logical conflicts or difficult merges.

Sources:

- https://support.atlassian.com/jira-software-cloud/docs/what-are-dependencies-in-advanced-roadmaps/
- https://git-scm.com/docs/gitworkflows

## Definition of ready

Before `ready`, require:

- a clear summary and description;
- a confirmed planning brief for every epic and story;
- local source-note paths for material external constraints;
- at least one acceptance criterion for an epic, story, or bug;
- a valid parent relationship;
- known blockers linked;
- an explicit risk level and applicable risk factors;
- every risk-required quality gate declared;
- suitable verification commands for code changes.

Use active terms from `docs/knowledge/ubiquitous-language.md`. A material term
with no agreed meaning keeps the item out of `ready` until `language` resolves it.

Risk factors activate these minimum gates:

| Risk factor | Required quality gate |
| --- | --- |
| `sensitive-data` | `security`, `privacy` |
| `authentication`, `public-network`, `financial`, `destructive` | `security` |
| `dependency` | `dependency` |
| `migration` | `migration` |
| `user-interface` | `accessibility` |
| `availability` | `reliability` |
| `performance` | `performance` |

Add only applicable factors. A gate may use automated or inspected evidence.
Passing a command alone does not prove a manual gate.

## Definition of done

Before `done`, require:

- every acceptance criterion passes with evidence;
- every configured check passes in its latest run;
- every applicable quality gate has passing evidence;
- both final review axes report zero P0, P1, and P2 findings;
- every blocker and child is done;
- required drafted knowledge is valid OKF;
- relevant external claims still match refreshed official source notes;
- the item is in `in-review`.

Acceptance criteria confirm one item's behavior. The definition of done applies
the shared quality standard.

The brief's product success metric is evaluated after a green release. It is
not part of ticket completion.

## Release boundary

Keep releases separate from work-item status. A ticket is `done` after reviewed
integration and knowledge promotion. A release becomes `green` only after its
artifact reaches the named target and post-release checks pass.

Use one release to group completed tickets that move together. Do not add a
`released` status to each ticket.

Source: https://support.atlassian.com/jira-software-cloud/docs/enable-releases-and-versions/

Source: https://www.atlassian.com/agile/project-management/definition-of-done

## Review evidence

Store the Git fixed point with every completed review. Store Standards and Spec
results in separate fields. Either axis can block the item.
