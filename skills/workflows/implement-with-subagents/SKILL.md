---
name: implement-with-subagents
description: Execute explicit ready Epics or work-item sets with one fresh implementation subagent per work item, serialized admission, and manager-owned acceptance. Never implements work items in the manager context.
---

# Implement with Subagents

Orchestrate approved backlog work while owning authority discovery, scheduling, integration, verification, recovery, and acceptance. Every work item runs in a fresh implementation subagent. Dependencies and conflict domains control concurrency and admission order, never implementation ownership.

Under `$to-product`, its autonomous contract supplies owner approvals and blocker policy. Pass that contract and any run-transcript path through every brief.

Invoke `$parallel-execution` for frontiers with at least two independent discovery or execution units. This skill remains the central manager and owns phase-specific authority and acceptance; it dispatches a lone actionable work item directly to one bounded subagent.

## Inputs

Require one explicit authorized scope: an active `EPIC-NNN`/path (authorizing all approved children and Epic closure) or a non-empty set of `WORK-NNN` IDs/paths. An unambiguous scope already established by the conversation counts; otherwise list candidates and ask — never infer a set from similar titles, changed paths, or rank adjacency. A set never authorizes siblings, parents, outside dependencies, or Epic closure; an Epic supplies coordination context but never expands a child's approved outcome.

Optional `model` and `reasoning effort` settings select the bounded-implementation tier. Keep `$parallel-execution`'s cheaper discovery and stronger judgement routing unless the user explicitly requires one uniform setting. If an interface cannot apply a setting, say so once and use its default — never claim it was applied.

## Preflight

Before spawning or mutating backlog:

1. Resolve repository instructions and require the current setup-project scaffold, including Epic acceptance-unit and batched-evidence maintenance rules. Direct legacy projects to `$setup-project` before delegation.
2. Run `node scripts/validate-project.mjs`; stop on an invalid baseline.
3. Read the complete authorized records, rank, relationships, claims, indexes, wiki references and nearest indexes, maintenance, research, and applicable guidance indexes/pages once. After fixing their paths and roles, use `$parallel-execution` for independent read-only inspection of affected code, tests, and guidance gaps; synthesize one authority packet.
4. Inspect branches, remotes, changes, and recent history. Preserve unrelated work. Pin the primary commit as the immutable Epic fixed point.
5. Reject proposed/malformed work, missing ranks/readiness, inconsistent or foreign claims, and outside-scope blockers. Never add, rerank, cancel, reparent, or alter scope.

For an Epic, compare the record's provisional execution graph with live code before any implementation spawn. Record each ready frontier and the evidence that makes it parallel or serial:

- **Parallel frontier:** at least two actionable children are dependency-free and conflict-disjoint behind fixed interfaces.
- **Serial frontier:** dependencies, shared interfaces, or conflict domains require one-at-a-time execution.

Mere availability of several children does not justify concurrent writers. A serial frontier still requires a fresh implementation subagent for each child.

## Execution topology

### Epic

1. Create and check out one Epic integration branch in the manager's worktree, then apply `$implement`'s single start/claim transaction for the Epic and all required children.
2. Give every actionable child to a fresh bounded subagent on a distinct worker branch/worktree based on the latest admitted integration commit. Each worker runs `$implement` in internal provisional-child mode: code, focused checks, and smoke test only. It returns commits and evidence without review, backlog/wiki/status/rank/primary changes. Never assign a second work item to that subagent.
3. Dispatch a parallel frontier through `$parallel-execution`. Dispatch one worker directly for a serial frontier. Never start a child depending on an unadmitted commit; shared conflict domains serialize workers rather than moving implementation into this manager.
4. Admit returned commits serially to the Epic integration branch. Revalidate the execution graph and affected checks after each admission. When an admitted child meets the narrow high-risk rule, invoke targeted `$code-review` in this manager context; it may overlap unrelated implementation but must pass before dependents start.
5. Refill the ready queue after every admission. A retry continues the same work item's worker; no worker receives another item.
6. After all children are provisional, follow `$implement` Epic closure: one composed review, remediation, one representative suite and justified matrix, one reconciliation, one merge, accepted-state publication, and one atomic final transaction.

If the harness cannot start a required implementation subagent or has no worker capacity, stop with the exact capability/capacity blocker and recovery state. Never implement the item in this manager context, wait indefinitely, or silently invoke top-level `$implement` as a fallback.

No child branch merges to primary or becomes terminal. Do not commit per-child evidence or maintain a second task document.

### Standalone WORK set

For each authorized standalone item, create and check out its integration branch in the manager's worktree and apply `$implement`'s start/claim transaction serially. Give every item to a fresh subagent on a distinct worker branch/worktree based on that start commit. Use `$parallel-execution` for at least two scope-disjoint items; otherwise dispatch serially. Each worker runs `$implement` in internal provisional-standalone mode and returns commits/evidence without review, primary integration, wiki, rank, status, or archive mutation. Never implement an item locally or reuse its worker for another item.

Admit each return serially, then resume `$implement WORK-NNN` in this manager context only for its review, representative suite, merge, reconciliation, and final transaction. Reuse verification across code-identical merges and non-executable documentation changes. The same unavailable-worker blocker and no-fallback rule applies.
## Verification And Recovery

Verify cited commits, merge ancestry, claims, rank, statuses, indexes, archives, review mode, focused checks, suite freshness, matrix rationale, reconciliation, and acceptance. Trust fresh consistent evidence; rerun only when evidence is missing, stale, contradictory, or code-affecting integration inputs differ.

For an Epic require one integration branch and acceptance merge; all children provisional until atomic completion; targeted reviews only for narrow high risk; one comprehensive Epic review; one representative suite; justified risk-triggered matrix expansion or complete release matrix; one wiki/ADR transaction; and exactly one normal start plus final backlog transaction.

On failure, follow `$parallel-execution`: retry the same item with focused evidence through its existing worker, pause only dependents, and continue unaffected units. Under an autonomous run, retry the affected outcome three times, then release all owned claims and return unfinished records to `ready` in one recovery transaction. Only a shared-contract, baseline-validator, or integration failure stops the affected concurrency group. Never replace a live agent, give its next work item to a prior item's worker, accept partial Epic state, or alter another executor's claim.
## Epic Closure

Only explicit Epic input authorizes closure. Follow `$implement` and [its Epic reference](../implement/references/epic-mode.md); do not add an orchestrator-specific review, suite, merge, reconciliation, or completion gate. The closure report and repository evidence must show the single shared acceptance transaction set.
## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report topology and its reason; execution graph and admission order; executor/child agents and branches; models/effort applied or unsupported; code commits and focused evidence; targeted reviews or skips; the one composed review; acceptance merge; reconciliation/ADRs; start and final transactions; final claims/rank/status/archive state; wall-clock and token use when exposed; and blockers. Include exact `Representative suite:` and `Retries, conflicts, rework:` lines even when skipped or none.

End with `Next step:` — blocked → exact resume command; otherwise `$implement-with-subagents` or `$implement` with the next highest-ranked scope, or `$discuss` naming the next open outcome.
