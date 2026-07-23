# 000 — Project-state backlog workflow

## Summary

Replace the current wiki-as-spec and local task-plan workflow with a project
system that separates accepted primary-branch knowledge in `docs/wiki` from
desired changes in a tracked, Jira-inspired `docs/backlog`. Consolidate setup
and validation, add governed backlog management, and adapt planning, research,
review, implementation, subagent orchestration, and public documentation to the
new contract.

## Tasks

| Task | Status | Blocked by |
| --- | --- | --- |
| [001 — Initialize fresh projects with wiki and backlog governance](001-initialize-project-governance.md) | completed | None |
| [002 — Upgrade existing project setups safely](002-upgrade-existing-projects.md) | completed | [001](001-initialize-project-governance.md) |
| [003 — Manage the complete backlog lifecycle](003-manage-backlog-lifecycle.md) | completed | [001](001-initialize-project-governance.md) |
| [004 — Route discussion and research by knowledge state](004-route-planning-knowledge.md) | completed | [001](001-initialize-project-governance.md), [003](003-manage-backlog-lifecycle.md) |
| [005 — Review changes against wiki and backlog authority](005-review-wiki-backlog-authority.md) | ready-for-agent | [001](001-initialize-project-governance.md), [003](003-manage-backlog-lifecycle.md) |
| [006 — Execute work items and Epics through completion](006-execute-backlog-work.md) | ready-for-agent | [002](002-upgrade-existing-projects.md), [003](003-manage-backlog-lifecycle.md), [005](005-review-wiki-backlog-authority.md) |
| [007 — Orchestrate backlog execution with subagents](007-orchestrate-backlog-subagents.md) | ready-for-agent | [006](006-execute-backlog-work.md) |
| [008 — Publish and verify the redesigned workflow](008-publish-redesigned-workflow.md) | ready-for-agent | [002](002-upgrade-existing-projects.md), [003](003-manage-backlog-lifecycle.md), [004](004-route-planning-knowledge.md), [005](005-review-wiki-backlog-authority.md), [006](006-execute-backlog-work.md), [007](007-orchestrate-backlog-subagents.md) |

## Initial actionable frontier

- [001 — Initialize fresh projects with wiki and backlog governance](001-initialize-project-governance.md)
