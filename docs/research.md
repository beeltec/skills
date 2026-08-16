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

## Context-aware implementation

A published model context window is not always the effective agent-session
limit. The API, product, and agent harness can expose different limits. The
workflow therefore trusts runtime metadata first. It uses an explicit user or
project value second. It never selects a context limit from the model name.

As of the research date, OpenAI lists a 1.05M API context window for GPT-5.6.
Anthropic lists a 1M context window for Claude Opus 5. A host can still provide
a smaller effective session, such as 256K. The implementation skill uses that
host value when it is reported.

The session-fit gate reserves context for correction, integration, tests, and
handoff. It delegates only when the complete implementation is unlikely to fit
the safe remainder. Each subagent packet is sized against that subagent's own
model and session, not the coordinator's capacity.

Subagents receive bounded outcomes and exclusive path ownership. Write packets
run sequentially unless both behavior and paths are independent. The
coordinator owns integration and final verification. This reduces context
pollution and shared-worktree conflicts without adding delegation to small
tasks.

Sources:

- [OpenAI model comparison](https://developers.openai.com/api/docs/models/compare)
- [OpenAI Codex subagents](https://developers.openai.com/codex/agent-configuration/subagents)
- [OpenAI multi-agent guidance](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- [Anthropic context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Anthropic Claude Opus 5 prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)
