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

Every finding receives a P0-P3 severity. P0, P1, and P2 block approval. P3 is
non-blocking. After blocking findings are fixed, both axes inspect the complete
change again from the original fixed point. The loop ends only when both axes
report zero P0, P1, and P2 findings.

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

This workflow assumes Codex with ChatGPT subscription access. OpenAI documents
ChatGPT sign-in and API-key authentication as separate Codex access modes. The
public API catalog lists a 1.05M GPT-5.6 context window, but that API value does
not define the subscription session.

OpenAI's public Codex model page does not publish the subscription context
window. Local verification used Codex CLI 0.147.0 while signed in through
ChatGPT. Its service-provided model catalog reported 272,000 raw tokens and a
95 percent effective limit for every GPT-5.6 variant. That produces 258,400
effective tokens.

The workflow rounds this down to a conservative 256,000-token fallback. A
runtime-reported subscription limit still takes priority because Codex can
change its limits. The 1.05M limit is used only when a project explicitly runs
through API-key access.

Anthropic lists a 1M context window for Claude Opus 5. That value applies only
when its actual host or runtime provides it. It does not change the default
Codex subscription profile.

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

- [OpenAI Codex models and access modes](https://learn.chatgpt.com/docs/models)
- [OpenAI API model comparison](https://developers.openai.com/api/docs/models/compare)
- [OpenAI Codex subagents](https://developers.openai.com/codex/agent-configuration/subagents)
- [OpenAI multi-agent guidance](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- [Anthropic context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Anthropic Claude Opus 5 prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)
