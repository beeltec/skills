---
name: implement-with-subagents
description: Orchestrate a ready Epic or work-item set through isolated implementation subagents with serialized integration. Use only on explicit invocation with an EPIC-NNN, WORK-NNN set, or unambiguous scope.
---

# Implement with Subagents

Orchestrate approved `setup-project` backlog work: own authority discovery, selection, sequencing, verification, recovery, and Epic closure; delegate each item to exactly one fresh subagent running `$implement`. Never implement work-item scope in the orchestrator or keep a master task document.

Under an active autonomous run, `$to-product`'s autonomous contract supplies every owner approval this workflow and its subagents require, and its blocker rule governs: retry an item three times, then release its claim, return it to `ready` with the blocker recorded, and continue with the next actionable item instead of stopping. State the contract in every subagent brief.

**Serialized integration:** run at most three items concurrently, and only where no `blocks` link joins them in either direction and their declared subtask scopes are disjoint; give each an isolated git worktree. Admit one item to primary at a time. An item whose turn follows another's merge merges primary into its branch, re-verifies, and re-reviews the delta before its own acceptance gate.

Delegation depth:

```text
orchestrator (depth 0)
└─ item subagent running $implement (depth 1)
   ├─ Standards reviewer (depth 2)
   └─ Spec reviewer (depth 2)
```

Only these reviewer roles may run at depth 2; depth-2 agents must not spawn subagents. State this limit in every item brief.

## Inputs

Require one explicit authorized scope: an active `EPIC-NNN`/path (authorizing all approved children and Epic closure) or a non-empty set of `WORK-NNN` IDs/paths. An unambiguous scope already established by the conversation counts; otherwise list candidates and ask — never infer a set from similar titles, changed paths, or rank adjacency. A set never authorizes siblings, parents, outside dependencies, or Epic closure; an Epic supplies coordination context but never expands a child's approved outcome.

Optional `model` and `reasoning effort` settings pass unchanged to every fresh subagent spawn. If an interface cannot apply a setting, say so once and use its default — never claim it was applied. Recovery resumes the existing subagent; never spawn a replacement with different settings.

## Preflight

Before any spawn or backlog mutation:

1. Resolve the repository root; read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and coding standards.
2. Require the setup-project scaffold (wiki and backlog indexes and maintenance, ubiquitous language, four templates, `scripts/validate-project.mjs`); otherwise direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`; stop on any invalid baseline — never delegate against one.
4. Read completely: the scoped records (all children for an Epic), global rank, active and archive indexes, related and relationship-connected records, `wiki_refs` and nearest wiki indexes, the `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` indexes so each item's applicable guidance pages can be resolved by path, maintenance rules, research, and affected code and tests.
5. Inspect current and primary branches, remotes, staged/unstaged changes, and recent history; preserve unrelated and shared-workspace changes between delegations. Pin the primary-branch commit as the immutable epic fixed point for closure review.
6. Build the immutable authorized ID set with each member's status, rank position, inward blockers, claim details, parent, and archive location. Never add work or rerank during execution.

Reject: a proposed item, malformed Definition of Ready, missing rank entry for active unfinished work, expired or inconsistent claim, live claim owned by another executor, or an unresolved blocker outside the authorized set. Terminal records establish prior disposition but get no subagent. An inward blocker inside the set is a valid dependency chain while at least one member is actionable; if required work remains and nothing is actionable, report the complete deadlocked frontier and stop. Never cancel, reparent, alter relationships, change scope, or rerank autonomously — preserve such proposals for owner approval.

## Selection And Delegation

Loop over authorized incomplete work:

1. Rerun the validator before every selection and every admission to primary. Probe `git log -- docs/backlog` since the last read: reload global rank, claims, statuses, and indexes when it shows changes, plus every path the completed item's merge commit touched; the rest of the packet stays read under `$implement`'s Authority Packet Freshness rule. First resume an active item with this run's live claim and assigned subagent; otherwise select the first authorized item in global rank that is `ready`, unclaimed, and free of unresolved inward blockers.
2. Spawn one fresh subagent dedicated to that `WORK-NNN`; record the item-to-agent/session mapping. Never assign it another item.
3. Give it a self-contained prompt: invoke and follow `$implement` with the selected ID/path, scoped only to that item; repository root, record and parent Epic paths, authorized-scope description; blocker outcomes, relationship paths, wiki references, fixed constraints, and user instructions; the exact paths of every applicable guidance page under `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` for the technologies and standards that item's delta touches, named explicitly because a fresh subagent cannot inherit them from this context, with the instruction to read each one and treat its `Requirements` as binding, plus every touched subject that has no page so the subagent reports it; inspect repository and Git state before editing, preserve unrelated work, never broaden scope or change rank; pin any dependency or toolchain version not already resolved in the record's `## Research` only from a live registry call, never from memory, recording the source in `## Execution`; complete every direct `$implement` gate (claim, branch, review, reconciliation, primary-branch acceptance, completion, archival); report changed paths, commits and merge commits, checks, review results, acceptance evidence, wiki reconciliation, final status, claim state, archive destination, and concerns.
4. Pass supported model/effort settings. Select again immediately while a concurrency slot is free; otherwise wait for a subagent to return.

No umbrella branch: each subagent's `$implement` invocation uses exactly one fresh conventional branch; never reuse an earlier item's branch.

## Verification And Recovery

After every subagent response, verify from cheap evidence: `git show --stat` on the reported merge commit and `git log` for its commits, the record and parent Epic, rank, claims, indexes, and the subagent's cited per-gate evidence; run cheap targeted checks when useful and rerun the validator. Pull a full diff or file contents only where a gate's evidence is missing or contradicted. Do not continue until every direct `$implement` gate is evidenced:

- acceptance criteria complete without scope creep; focused checks and the full applicable suite passed;
- both backlog-aware code-review axes passed against the item's fixed point after the last implementation change;
- the exact owner-approved wiki transaction applied on primary after acceptance, or a recorded reason none was required, including every drafted decision published as an ADR with its allocated `ADR-NNN` and any ADR superseded in both directions, and `decisions` resolved off `pending` and `draft`;
- a merge commit and post-merge checks establish primary-branch acceptance before `done`;
- claim cleared, item removed from rank, status/indexes/archive per backlog maintenance; item branch cleaned up only after its cleanup gates passed.

If evidence is missing or a check fails, send a focused follow-up with concrete evidence to the same assigned subagent and wait — no replacement subagent, and no admission of that item to primary while it is unresolved. If it cannot continue, its claim conflicts, a required owner decision is unavailable, or safe recovery cannot be proved, stop and report the blocker. Never release or overwrite another executor's claim. After an item passes, finish its subagent, reload rank and claim data and the paths its merge commit touched, validate, and recalculate actionability.

## Epic Closure

Only an explicit Epic input authorizes closure. After every approved child is `done` or explicitly owner-cancelled, verify child dispositions, acceptance evidence, the Epic outcome and criteria, wiki reconciliation, reviews, validator, and full suite.

Then invoke `$code-review` on primary as an Epic-scope review with the `EPIC-NNN` and the pinned epic fixed point. Delegate every actionable finding inside approved Epic scope to one fresh remediation subagent on its own conventional branch — never remediate in the orchestrator; verify its evidence under `## Verification And Recovery`, admit its merge to primary, and re-review the delta from the same epic fixed point until both axes pass. A finding needing scope the Epic never carried stops closure for an owner-approved backlog transaction.

On primary, apply direct `$implement`'s final atomic Epic transaction: check evidenced criteria, set `done`, move the whole directory to `archive/epics/`, update indexes, validate, stage only those paths, and commit concisely. Never split the archive, infer cancellation, or close an Epic from a selected-set run.

## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report the authorized scope and selection order; one subagent/session and branch per item; changed paths, commits, and merge commits; checks and both review axes; acceptance and wiki reconciliation evidence; resulting statuses, claims, rank and archive locations; the Epic-scope review result and any remediation subagent; the Epic closure commit when applicable; unsupported passthrough settings; remaining blockers or concerns.

End the report with `Next step:` — one copy-pasteable command: blocked → the exact command that resumes this scope after the blocker; otherwise `$implement-with-subagents` or `$implement` with the next highest-ranked actionable scope, or `$discuss` naming the next open outcome when no ready work remains.
