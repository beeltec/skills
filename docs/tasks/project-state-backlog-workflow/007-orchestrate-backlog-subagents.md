# 007 — Orchestrate backlog execution with subagents

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Adapt `implement-with-subagents` to orchestrate an Epic or
selected set of backlog work items through the backlog-aware implementation
workflow, one fresh subagent and one fully verified work item at a time.

**Blocked by:** [006 — Execute work items and Epics through completion](006-execute-backlog-work.md).

**Status:** completed

## Subtasks

- [x] Replace the hard dependency on `$to-tasks` and `docs/tasks/<feature>/000-overview.md` with explicit Epic or work-item-set inputs.
- [x] Require explicit user invocation and preserve optional model and reasoning-effort passthrough behavior.
- [x] Read backlog maintenance, global rank, every selected work item, related Epics, dependencies, claims, wiki references, and repository instructions before delegation.
- [x] Validate the selected set with the project validator and stop on malformed links, missing records, conflicting claims, unresolved blockers, or a deadlocked actionable frontier.
- [x] Select the highest-ranked ready unblocked incomplete item from the authorized set.
- [x] Spawn exactly one fresh subagent for that work item and require it to invoke the backlog-aware `/implement` scoped only to that item.
- [x] Give each subagent self-contained paths, blocker outcomes, Epic context, applicable constraints, and explicit instructions not to broaden scope or rerank work.
- [x] Inspect each subagent's changes, commits, checks, review evidence, wiki reconciliation, backlog status, claim cleanup, and archive behavior before continuing.
- [x] Resume the same subagent with focused evidence when an item is incomplete; do not create a replacement or start later work while it remains active.
- [x] Re-evaluate actionability and rank after each completed item rather than relying on a stale initial sequence.
- [x] Close an authorized Epic only when its child disposition, success measures, wiki reconciliation, validation, and archive gates pass.
- [x] Update UI metadata and public invocation examples to point at Epic or work-item IDs or paths.
- [x] Add orchestration scenarios covering parallel-ready ranking, dependency chains, failure recovery, claims, cancellation decisions, and final Epic closure.

## Acceptance criteria

- [x] The orchestrator can execute either an Epic or an explicitly selected work-item set without any `docs/tasks` master document.
- [x] Exactly one fresh subagent owns each work item and no two implementation subagents run concurrently.
- [x] Selection follows global rank among currently actionable authorized work while respecting blocking links.
- [x] A failed or incomplete item prevents later delegation until the same subagent resolves it or the orchestrator reports the blocker.
- [x] Final statuses, claims, wiki state, validation, and archives are consistent with direct `/implement` execution.
