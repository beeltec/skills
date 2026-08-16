# Research and design basis

Research was checked on 2026-08-16. Primary specifications take priority over
secondary guides.

## Open Knowledge Format

Google Cloud's current specification is OKF v0.2. A bundle is a directory of
Markdown concepts with YAML frontmatter. Only `type` is always required.
`index.md` and `log.md` are reserved files.

OKF v0.2 adds provenance, trust, and lifecycle fields. This workflow uses
`generated`, `verified`, `status`, and `sources` during promotion. It writes
frontmatter as JSON, which is valid YAML 1.2 and can be parsed without a
runtime dependency.

Sources:

- [Open Knowledge Format v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- [Google Cloud introduction](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
- [Google Cloud v0.2 trust update](https://cloud.google.com/blog/products/data-analytics/okf-v0-2-adds-trust-signals/)

## Jira-like work model

Jira's default hierarchy has three levels. Epic is level 1. Story, task, and
bug are level 0. Subtask is level -1.

This repository keeps that model. It uses a small workflow: `backlog`,
`ready`, `in-progress`, `in-review`, and `done`. The completion command sets
a resolution because Jira treats resolution as the open or closed signal.

The folder names describe their full lifetime. `docs/knowledge/` holds current
facts. `docs/work/` remains accurate after an item leaves the backlog.

Acceptance criteria describe item-specific success. The definition of done
describes the shared quality gate. This workflow checks both before closure.

Sources:

- [Jira work types and default hierarchy](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/)
- [Jira workflow transitions](https://support.atlassian.com/jira-cloud-administration/docs/create-workflow-transitions/)
- [Jira status, priority, and resolution](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/)
- [Atlassian user stories](https://www.atlassian.com/agile/project-management/user-stories)
- [Atlassian definition of done](https://www.atlassian.com/agile/project-management/definition-of-done)

## Agent Skill design

The suite follows `setup → discuss → plan → implement → review → document`.
Each skill has a narrow job and composes with the other skills. Instructions
stay short. Detailed contracts live in direct references. Repeated and fragile
operations use one tested script.

The `discuss` skill adapts the grilling skill's strongest mechanism: order
questions by decision dependencies, ask the currently unblocked choices, and
recompute after every answer. It adds a confirmed brief as the explicit handoff
to planning.

The `review` skill adapts the code-review skill's two-axis model. Standards and
Spec get independent passes, so one cannot hide failure in the other. The
ticket is the fixed specification source. The review also includes uncommitted
work because this workflow does not require agents to commit changes.

Descriptions state user intent because agents use them for activation. The
skills use checklists, explicit validation loops, and concrete commands.

Sources:

- [Agent Skills specification](https://agentskills.io/specification)
- [Skill creator best practices](https://agentskills.io/skill-creation/best-practices)
- [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills)
- [Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
- [Using scripts in skills](https://agentskills.io/skill-creation/using-scripts)
- [Matt Pocock's grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)
- [Matt Pocock's code-review skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)
