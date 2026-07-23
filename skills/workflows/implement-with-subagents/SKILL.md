---
name: implement-with-subagents
description: Orchestrate an explicit ready Epic or selected backlog work-item set through sequential, isolated implementation subagents. Use only when the user explicitly invokes $implement-with-subagents with an EPIC-NNN, WORK-NNN IDs, backlog record paths, or an unambiguous set established by the conversation.
---

# Implement with Subagents

Act as the execution orchestrator for approved work in a `setup-project` backlog. Keep ownership of authority discovery, selection, sequencing, verification, recovery, and Epic closure. Delegate each executable work item to exactly one fresh subagent, with no concurrent or paused implementation subagents.

Never create, inspect, migrate, or depend on `docs/tasks` or a master task document. Do not implement work-item scope in the orchestrator.

## Inputs

Require one of these explicit authorized scopes:

- one active `EPIC-NNN` or its backlog record path, authorizing all of its approved children and final Epic closure; or
- an explicit non-empty set of `WORK-NNN` IDs or backlog record paths.

An unambiguous Epic or work-item set already established by the conversation is acceptable. Otherwise list the candidates and ask the user to select; never infer a set from similar titles, changed paths, or rank adjacency. A work-item set does not authorize siblings, parents, dependencies outside the set, or Epic closure. An Epic supplies coordination context but never expands a child's approved outcome.

Accept optional `model` and `reasoning effort` settings for work-item subagents. Pass each supplied setting unchanged through every fresh spawn interface that supports it. If an interface cannot select one or both settings, state which setting is unsupported once and use that interface's default; never claim a requested setting was applied. Recovery resumes the existing subagent and does not spawn a replacement with different settings.

## Preflight

Complete preflight before spawning a subagent or changing backlog state:

1. Resolve the repository root. Read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, contributing guidance, and coding standards.
2. Require `.setup-project.json`, wiki maintenance and root index, ubiquitous language, backlog maintenance and root index, all four backlog templates, and `scripts/validate-project.mjs`. Stop and direct the user to `$setup-project` when the scaffold is incomplete.
3. Run `node scripts/validate-project.mjs`. Stop on malformed links, records, relationships, rank, archives, statuses, or claims; do not delegate against an invalid baseline.
4. Resolve the authorized scope. For an Epic, read its complete record and every child. For a set, read every selected work item. Read the complete global rank, active and archive indexes, related parent Epics, all records connected by relationships, and every record needed to calculate inward blockers.
5. Read backlog maintenance, applicable type templates, all selected and Epic `wiki_refs`, nearest wiki indexes, wiki maintenance and log, relevant engineering and architecture guidance, proposal research and local evidence, and repository code and tests affected by the authorized work.
6. Inspect the current and primary branches, remotes, staged and unstaged changes, and recent history. Preserve unrelated and shared-workspace changes between delegations.
7. Build the immutable authorized ID set and record each member's status, global rank position, inward blockers, claim owner/session/branch/expiry, parent, and archive location. Do not add work or rerank it during execution.

Reject a proposed item, malformed Definition of Ready, missing rank entry for active unfinished work, expired or inconsistent claim, live claim owned by another executor, or unresolved blocker outside the authorized set. Terminal records may establish prior disposition but receive no subagent. If required authorized work remains and no member is actionable because of statuses, claims, relationships, or a dependency cycle, report the complete deadlocked frontier and stop instead of guessing.

An inward blocker inside the authorized set is a valid dependency chain, not an initial failure, when at least one authorized item is currently actionable. Never broaden scope to an outside blocker. Preserve cancellation and out-of-scope proposals for project-owner approval; do not cancel, reparent, alter relationships, change scope, or rerank work autonomously.

## Selection And Delegation

Repeat this loop for authorized incomplete work:

1. Reload the records and run `node scripts/validate-project.mjs` before every selection. First resume an active item with this run's live claim and assigned subagent. Otherwise scan `## Global executable-work rank` from top to bottom and select the first authorized item whose status is `ready`, whose claim fields are empty, and which has no unresolved inward blocker. Rank chooses among currently actionable authorized items; links determine actionability.
2. Spawn exactly one fresh subagent dedicated to the selected `WORK-NNN`. Record the item-to-agent/session mapping for this run. Do not keep another implementation subagent running or paused, and never assign this subagent another work item.
3. Give it a self-contained prompt containing:
   - an explicit instruction to invoke and follow `$implement` with the selected work-item ID or path, scoped only to that item;
   - the repository root, complete work-item path, parent Epic path and authorized-scope description;
   - all relevant blocker outcomes, relationship paths, wiki references, fixed constraints, and user instructions;
   - an instruction to inspect current repository and Git state before editing, preserve unrelated work, and never broaden scope or change rank;
   - an instruction to complete the direct implementation claim, branch, review, reconciliation, primary-branch acceptance, status, claim cleanup, and archival gates; and
   - an instruction to report changed paths, commits and merge commits, checks, review results, acceptance evidence, wiki reconciliation, final status, claim state, archive destination, and concerns.
4. Pass supported optional model and reasoning settings on the fresh spawn. Wait for that subagent to return before doing any later selection or delegation.

The orchestrator does not create an umbrella branch. Each work-item subagent runs a separate `$implement WORK-NNN` invocation and therefore uses exactly one fresh conventional branch for that invocation under the direct implementation contract. Never ask a later item to reuse an earlier item's branch.

## Verification And Recovery

After every subagent response, independently inspect Git status and history, the complete diff and commits, changed paths, the selected record and parent Epic, global rank, claims, active and archive indexes, linked wiki state, and the applicable test output. Run cheap targeted checks when useful and rerun `node scripts/validate-project.mjs`.

Do not continue until all direct `$implement` gates for that item are evidenced:

- implementation and acceptance criteria are complete without scope creep;
- focused checks and the full applicable suite passed;
- both backlog-aware code-review axes passed against the item's fixed point after the last implementation or wiki change;
- durable knowledge was reconciled with exact owner approval, or the execution record explains why no wiki update was required;
- a merge commit and post-merge checks establish primary-branch acceptance before `done`;
- the claim is cleared, the item is absent from global rank, and status, indexes, and archive location follow backlog maintenance; and
- the item branch was cleaned up only when the direct workflow's cleanup gates passed.

If evidence is missing, a check fails, or the item remains incomplete, send a focused follow-up with concrete evidence to the same assigned subagent and wait again. No replacement subagent and no later item may start while that item remains active. If the same subagent cannot continue, its claim conflicts, a required owner decision is unavailable, or safe recovery cannot be proved, stop and report the blocker. Do not hide a failure by releasing or overwriting another executor's claim.

After an item passes, finish its subagent, reload all authority and rank data, validate the project, and recalculate actionability. Never rely on the initial order after a completion changes blockers, claims, status, rank, or archives.

## Epic Closure

Only an explicit Epic input authorizes Epic closure. After all of its approved children are `done` or explicitly owner-cancelled, verify child dispositions, primary-branch acceptance evidence, the Epic outcome and success criteria, exact wiki reconciliation approval or no-update evidence, passing code reviews, the consolidated validator, and the full applicable suite.

On the primary branch, apply the same final atomic Epic completion transaction required by direct `$implement`: check only evidenced Epic criteria, set the Epic to `done`, move its complete directory to `docs/backlog/archive/epics/`, and update active and archive indexes. Validate, inspect the narrow diff, stage only the transaction's backlog paths, and create a concise Conventional Commit. Never split the archive, infer cancellation, close an Epic after a mere selected-set run, or mark it done while a child or gate remains unresolved.

## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report the authorized scope and selection order; one subagent/session and branch per work item; changed paths; commits and merge commits; checks and both review axes; acceptance and wiki reconciliation evidence; resulting statuses, claims, rank and archive locations; Epic closure commit when applicable; unsupported passthrough settings; and remaining blockers or concerns.
