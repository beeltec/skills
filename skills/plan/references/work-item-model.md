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

## Definition of ready

Before `ready`, require:

- a clear summary and description;
- local source-note paths for material external constraints;
- at least one acceptance criterion for an epic, story, or bug;
- a valid parent relationship;
- known blockers linked;
- suitable verification commands for code changes.

## Definition of done

Before `done`, require:

- every acceptance criterion passes with evidence;
- every configured check passes in its latest run;
- both final review axes report zero P0, P1, and P2 findings;
- every blocker and child is done;
- required drafted knowledge is valid OKF;
- relevant external claims still match refreshed official source notes;
- the item is in `in-review`.

Acceptance criteria confirm one item's behavior. The definition of done applies
the shared quality standard.

Source: https://www.atlassian.com/agile/project-management/definition-of-done

## Review evidence

Store the Git fixed point with every completed review. Store Standards and Spec
results in separate fields. Either axis can block the item.
