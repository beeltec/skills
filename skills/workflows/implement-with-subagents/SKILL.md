---
name: implement-with-subagents
description: Orchestrate an explicit ready Epic or selected backlog work-item set through sequential, isolated implementation subagents. Use only when the user explicitly invokes $implement-with-subagents with an EPIC-NNN, WORK-NNN IDs, backlog record paths, or an unambiguous set established by the conversation.
---

# Implement with Subagents

Orchestrate approved `setup-project` backlog work: own authority discovery, selection, sequencing, verification, recovery, and Epic closure; delegate each item to exactly one fresh subagent running `$implement`. Never implement work-item scope in the orchestrator, run or pause more than one implementation subagent at a time, or create, inspect, or depend on `docs/tasks` or a master task document.

## Inputs

Require one explicit authorized scope: an active `EPIC-NNN`/path (authorizing all approved children and Epic closure) or a non-empty set of `WORK-NNN` IDs/paths. An unambiguous scope already established by the conversation counts; otherwise list candidates and ask — never infer a set from similar titles, changed paths, or rank adjacency. A set never authorizes siblings, parents, outside dependencies, or Epic closure; an Epic supplies coordination context but never expands a child's approved outcome.

Optional `model` and `reasoning effort` settings pass unchanged to every fresh subagent spawn. If an interface cannot apply a setting, say so once and use its default — never claim it was applied. Recovery resumes the existing subagent; never spawn a replacement with different settings.

## Preflight

Before any spawn or backlog mutation:

1. Resolve the repository root; read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and coding standards.
2. Require the setup-project scaffold (wiki and backlog indexes and maintenance, ubiquitous language, four templates, `scripts/validate-project.mjs`); otherwise direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`; stop on any invalid baseline — never delegate against one.
4. Read completely: the scoped records (all children for an Epic), global rank, active and archive indexes, related and relationship-connected records, `wiki_refs` and nearest wiki indexes, the `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` indexes so each item's applicable guidance pages can be resolved by path, maintenance rules, research, and affected code and tests.
5. Inspect current and primary branches, remotes, staged/unstaged changes, and recent history; preserve unrelated and shared-workspace changes between delegations.
6. Build the immutable authorized ID set with each member's status, rank position, inward blockers, claim details, parent, and archive location. Never add work or rerank during execution.

Reject: a proposed item, malformed Definition of Ready, missing rank entry for active unfinished work, expired or inconsistent claim, live claim owned by another executor, or an unresolved blocker outside the authorized set. Terminal records establish prior disposition but get no subagent. An inward blocker inside the set is a valid dependency chain while at least one member is actionable; if required work remains and nothing is actionable, report the complete deadlocked frontier and stop. Never cancel, reparent, alter relationships, change scope, or rerank autonomously — preserve such proposals for owner approval.

## Selection And Delegation

Loop over authorized incomplete work:

1. Reload records and rerun the validator before every selection. First resume an active item with this run's live claim and assigned subagent; otherwise select the first authorized item in global rank that is `ready`, unclaimed, and free of unresolved inward blockers.
2. Spawn one fresh subagent dedicated to that `WORK-NNN`; record the item-to-agent/session mapping. Never assign it another item.
3. Give it a self-contained prompt: invoke and follow `$implement` with the selected ID/path, scoped only to that item; repository root, record and parent Epic paths, authorized-scope description; blocker outcomes, relationship paths, wiki references, fixed constraints, and user instructions; the exact paths of every applicable guidance page under `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` for the technologies and standards that item's delta touches, named explicitly because a fresh subagent cannot inherit them from this context, with the instruction to read each one and treat its `Requirements` as binding, plus every touched subject that has no page so the subagent reports it; inspect repository and Git state before editing, preserve unrelated work, never broaden scope or change rank; complete every direct `$implement` gate (claim, branch, review, reconciliation, primary-branch acceptance, completion, archival); report changed paths, commits and merge commits, checks, review results, acceptance evidence, wiki reconciliation, final status, claim state, archive destination, and concerns.
4. Pass supported model/effort settings; wait for the subagent to return before any later selection.

No umbrella branch: each subagent's `$implement` invocation uses exactly one fresh conventional branch; never reuse an earlier item's branch.

## Verification And Recovery

After every subagent response, independently inspect Git state and history, the complete diff and commits, the record and parent Epic, rank, claims, indexes, linked wiki state, and applicable test output; run cheap targeted checks when useful and rerun the validator. Do not continue until every direct `$implement` gate is evidenced:

- acceptance criteria complete without scope creep; focused checks and the full applicable suite passed;
- both backlog-aware code-review axes passed against the item's fixed point after the last implementation change;
- the exact owner-approved wiki transaction applied on primary after acceptance, or a recorded reason none was required, including every drafted decision published as an ADR with its allocated `ADR-NNN` and any ADR superseded in both directions, and `decisions` resolved off `pending`;
- a merge commit and post-merge checks establish primary-branch acceptance before `done`;
- claim cleared, item removed from rank, status/indexes/archive per backlog maintenance; item branch cleaned up only after its cleanup gates passed.

If evidence is missing or a check fails, send a focused follow-up with concrete evidence to the same assigned subagent and wait — no replacement subagent, no later item while that item is active. If it cannot continue, its claim conflicts, a required owner decision is unavailable, or safe recovery cannot be proved, stop and report the blocker. Never release or overwrite another executor's claim. After an item passes, finish its subagent, reload all authority and rank data, validate, and recalculate actionability.

## Epic Closure

Only an explicit Epic input authorizes closure. After every approved child is `done` or explicitly owner-cancelled, verify child dispositions, acceptance evidence, the Epic outcome and criteria, wiki reconciliation, reviews, validator, and full suite. On primary, apply direct `$implement`'s final atomic Epic transaction: check evidenced criteria, set `done`, move the whole directory to `archive/epics/`, update indexes, validate, stage only those paths, and commit concisely. Never split the archive, infer cancellation, or close an Epic from a selected-set run.

## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report the authorized scope and selection order; one subagent/session and branch per item; changed paths, commits, and merge commits; checks and both review axes; acceptance and wiki reconciliation evidence; resulting statuses, claims, rank and archive locations; the Epic closure commit when applicable; unsupported passthrough settings; remaining blockers or concerns.

End the report with `Next step:` — one copy-pasteable command: blocked → the exact command that resumes this scope after the blocker; otherwise `/implement-with-subagents` or `/implement` with the next highest-ranked actionable scope, or `/discuss` naming the next open outcome when no ready work remains. Recommend only — never invoke it. It is the report's last line; if several must run, end with a numbered list in run order.
