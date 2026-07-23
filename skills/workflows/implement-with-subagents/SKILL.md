---
name: implement-with-subagents
description: Orchestrate an explicit ready Epic or selected backlog work-item set through sequential, isolated implementation subagents. Use only when the user explicitly invokes $implement-with-subagents with an EPIC-NNN, WORK-NNN IDs, backlog record paths, or an unambiguous set established by the conversation.
---

# Implement with Subagents

Orchestrate approved work in a `setup-project` backlog: own authority discovery, selection, sequencing, verification, recovery, and Epic closure; delegate each executable item to exactly one fresh subagent, with never more than one implementation subagent running or paused. Do not implement work-item scope in the orchestrator. Never create, inspect, migrate, or depend on `docs/tasks` or a master task document.

## Inputs

Require one explicit authorized scope: an active `EPIC-NNN` or its path (authorizing all approved children and final Epic closure), or an explicit non-empty set of `WORK-NNN` IDs or paths. An unambiguous scope already established by the conversation counts; otherwise list candidates and ask — never infer a set from similar titles, changed paths, or rank adjacency. A work-item set does not authorize siblings, parents, outside dependencies, or Epic closure. An Epic supplies coordination context but never expands a child's approved outcome.

Accept optional `model` and `reasoning effort` settings for work-item subagents; pass each unchanged through every fresh spawn interface that supports it. If an interface cannot select a setting, say so once and use its default — never claim a setting was applied. Recovery resumes the existing subagent; never spawn a replacement with different settings.

## Preflight

Complete before spawning a subagent or changing backlog state:

1. Resolve the repository root. Read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, contributing guidance, and coding standards.
2. Require `.setup-project.json`, wiki maintenance and root index, ubiquitous language, backlog maintenance and root index, all four backlog templates, and `scripts/validate-project.mjs`; otherwise stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`. Stop on any malformed links, records, relationships, rank, archives, statuses, or claims — never delegate against an invalid baseline.
4. Resolve the authorized scope: for an Epic, read its complete record and every child; for a set, every selected item. Read the complete global rank, active and archive indexes, related parent Epics, all relationship-connected records, and everything needed to calculate inward blockers.
5. Read backlog maintenance, applicable type templates, all selected and Epic `wiki_refs`, nearest wiki indexes, wiki maintenance and log, relevant engineering and architecture guidance, proposal research and local evidence, and the affected repository code and tests.
6. Inspect the current and primary branches, remotes, staged/unstaged changes, and recent history. Preserve unrelated and shared-workspace changes between delegations.
7. Build the immutable authorized ID set, recording each member's status, rank position, inward blockers, claim owner/session/branch/expiry, parent, and archive location. Do not add work or rerank during execution.

Reject: a proposed item, malformed Definition of Ready, missing rank entry for active unfinished work, expired or inconsistent claim, live claim owned by another executor, or an unresolved blocker outside the authorized set. Terminal records may establish prior disposition but get no subagent. If required work remains and no member is actionable (statuses, claims, relationships, or a dependency cycle), report the complete deadlocked frontier and stop.

An inward blocker inside the authorized set is a valid dependency chain — not a failure — when at least one authorized item is actionable. Never broaden scope to an outside blocker. Preserve cancellation and out-of-scope proposals for owner approval; never cancel, reparent, alter relationships, change scope, or rerank autonomously.

## Selection And Delegation

Loop over authorized incomplete work:

1. Reload the records and run `node scripts/validate-project.mjs` before every selection. First resume an active item with this run's live claim and assigned subagent; otherwise scan `## Global executable-work rank` top to bottom and select the first authorized item that is `ready`, unclaimed, and free of unresolved inward blockers. Rank chooses among actionable items; links determine actionability.
2. Spawn exactly one fresh subagent dedicated to the selected `WORK-NNN`, recording the item-to-agent/session mapping. Never keep another implementation subagent running or paused, and never assign this subagent another item.
3. Give it a self-contained prompt containing: an explicit instruction to invoke and follow `/implement` with the selected ID or path, scoped only to that item; the repository root, work-item path, parent Epic path, and authorized-scope description; all relevant blocker outcomes, relationship paths, wiki references, fixed constraints, and user instructions; instructions to inspect repository and Git state before editing, preserve unrelated work, and never broaden scope or change rank; to complete the direct implementation claim, branch, review, reconciliation, primary-branch acceptance, status, claim cleanup, and archival gates; and to report changed paths, commits and merge commits, checks, review results, acceptance evidence, wiki reconciliation, final status, claim state, archive destination, and concerns.
4. Pass supported model/effort settings on the fresh spawn. Wait for the subagent to return before any later selection or delegation.

The orchestrator creates no umbrella branch. Each subagent's `$implement WORK-NNN` invocation uses exactly one fresh conventional branch under the direct implementation contract; never ask a later item to reuse an earlier branch.

## Verification And Recovery

After every subagent response, independently inspect Git status and history, the complete diff and commits, changed paths, the selected record and parent Epic, global rank, claims, active and archive indexes, linked wiki state, and applicable test output. Run cheap targeted checks when useful and rerun `node scripts/validate-project.mjs`.

Do not continue until all direct `$implement` gates for the item are evidenced:

- implementation and acceptance criteria complete without scope creep;
- focused checks and the full applicable suite passed;
- both backlog-aware code-review axes passed against the item's fixed point after the last implementation change;
- any exact owner-approved wiki transaction applied on the primary branch after acceptance, or the execution record explains why none was required;
- a merge commit and post-merge checks establish primary-branch acceptance before `done`;
- claim cleared, item absent from global rank, and status, indexes, and archive location follow backlog maintenance;
- the item branch cleaned up only when the direct workflow's cleanup gates passed.

If evidence is missing, a check fails, or the item is incomplete, send a focused follow-up with concrete evidence to the same assigned subagent and wait. No replacement subagent and no later item may start while that item is active. If the subagent cannot continue, its claim conflicts, a required owner decision is unavailable, or safe recovery cannot be proved, stop and report the blocker. Never hide a failure by releasing or overwriting another executor's claim.

After an item passes, finish its subagent, reload all authority and rank data, validate the project, and recalculate actionability — never rely on the initial order after a completion changes anything.

## Epic Closure

Only an explicit Epic input authorizes closure. After all approved children are `done` or explicitly owner-cancelled, verify child dispositions, primary-branch acceptance evidence, the Epic outcome and success criteria, exact wiki reconciliation approval or no-update evidence, passing reviews, the validator, and the full applicable suite.

On the primary branch, apply the same final atomic Epic completion transaction as direct `$implement`: check only evidenced criteria, set the Epic `done`, move its complete directory to `docs/backlog/archive/epics/`, and update active and archive indexes. Validate, inspect the narrow diff, stage only the transaction's backlog paths, and create a concise Conventional Commit. Never split the archive, infer cancellation, close an Epic after a mere selected-set run, or mark it done while a child or gate is unresolved.

## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report the authorized scope and selection order; one subagent/session and branch per item; changed paths; commits and merge commits; checks and both review axes; acceptance and wiki reconciliation evidence; resulting statuses, claims, rank and archive locations; the Epic closure commit when applicable; unsupported passthrough settings; and remaining blockers or concerns.
