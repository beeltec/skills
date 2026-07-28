---
name: implement-with-subagents
description: Execute explicit ready Epics or work-item sets with fresh implementation subagents, one writer at a time on the sole acceptance branch, and manager-owned acceptance.
---

# Implement with Subagents

Orchestrate approved backlog work while owning authority, order, verification, recovery, and acceptance. Give each work item a fresh subagent, but allow only one mutating agent at a time on the sole acceptance branch.

Under `$to-product`, its autonomous contract supplies owner approvals and blocker policy. Pass that contract and any run-transcript path through every brief.

Use `$parallel-execution` only for qualifying read-only questions or side-effect-free checks. Never run implementation workers concurrently.

## Inputs

Require one explicit authorized scope: an active `EPIC-NNN`/path (authorizing all approved children and Epic closure) or a non-empty set of `WORK-NNN` IDs/paths. An unambiguous scope already established by the conversation counts; otherwise list candidates and ask — never infer a set from similar titles, changed paths, or rank adjacency. A set never authorizes siblings, parents, outside dependencies, or Epic closure; an Epic supplies coordination context but never expands a child's approved outcome.

Optional `model` and `reasoning effort` settings select the implementation tier. Keep `$parallel-execution`'s read-only routing unless the user requires one uniform setting. If an interface cannot apply a setting, report that once and use its default.

## Preflight

Before spawning or mutating backlog:

1. Resolve repository instructions and require the current setup-project scaffold, including Epic acceptance-unit and batched-evidence maintenance rules. Direct legacy projects to `$setup-project` before delegation.
2. Run `node scripts/validate-project.mjs`; stop on an invalid baseline.
3. Read the complete authorized records, rank, relationships, claims, indexes, wiki references and nearest indexes, maintenance, research, applicable guidance, affected code, and tests once; synthesize one authority packet. Dispatch read-only support only for a concrete unresolved question that cannot be answered cheaply here, never generic code, test, guidance, or risk inventories.
4. Inspect branches, remotes, changes, and recent history. Enforce `$create-conventional-branch`'s invariant. Preserve unrelated work. Pin the primary commit as the immutable Epic fixed point.
5. Reject proposed/malformed work, missing ranks/readiness, inconsistent or foreign claims, and outside-scope blockers. Outside `$to-product`, never add, rerank, cancel, reparent, or alter scope; under it, repair PRD-required workflow state through `$backlog`, revalidate, then continue.

For an Epic, compare its provisional order, dependencies, shared interfaces, and conflict domains with live code. Revalidate after every child.

## Execution topology

### Epic

1. Invoke `$create-conventional-branch` once, then apply `$implement`'s single start/claim transaction for the Epic and required children.
2. Give the next actionable child to one fresh subagent with an internal provisional-child packet naming the current branch and HEAD. The manager makes no concurrent mutation. The worker implements, commits directly, runs focused checks and smoke proof, then returns evidence without review or governance changes.
3. Verify its commit and evidence, revalidate actionability, then dispatch the next child. Never reuse a worker for another item or start a dependent child early.
4. After all children are provisional, follow `$implement` Epic closure: one review, direct remediation inspection, one representative suite and justified matrix, one reconciliation, one merge, accepted-state publication, and one atomic final transaction.

No child gets a branch, primary merge, or terminal state. Do not commit per-child evidence or maintain another task document.

### Standalone WORK set

Process items serially. For each, open its sole acceptance branch and start transaction, then give one fresh subagent an internal provisional-standalone packet naming the current branch and HEAD. The manager makes no concurrent mutation. Verify the returned commit/evidence, then resume `$implement WORK-NNN` here for review, suite, merge, reconciliation, final transaction, and branch removal. Never reuse a worker.

When no worker is available, stop outside `$to-product`. Under it, log the unavailable worker and immediately run top-level `$implement` here; never report capacity as a blocker.
## Verification And Recovery

Verify cited commits, merge ancestry, claims, rank, statuses, indexes, archives, review mode, focused checks, suite freshness, matrix rationale, reconciliation, and acceptance. Trust fresh consistent evidence; rerun only when evidence is missing, stale, contradictory, or code-affecting integration inputs differ.

For an Epic require one acceptance branch and merge; all children provisional until atomic completion; exactly one comprehensive review; no child/remediation reviews; one representative suite; justified matrix expansion or complete release matrix; one wiki/ADR transaction; and exactly one normal start plus final backlog transaction.

Retry an invalid or incomplete result through the same worker with focused evidence. Under `$to-product`, workflow failures are repaired here or run locally; only a technical failure receives three attempts. Then follow `$create-conventional-branch`'s parking protocol, release claims, return unfinished records to `ready`, and continue independent outcomes. Never accept partial Epic state or alter another executor's claim.
## Epic Closure

Only explicit Epic input authorizes closure. Follow `$implement` and [its Epic reference](../implement/references/epic-mode.md); do not add an orchestrator-specific review, suite, merge, reconciliation, or completion gate. The closure report and repository evidence must show the single shared acceptance transaction set.
## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report child order; agents and fallback; models/effort applied or unsupported; acceptance branch; commits and focused evidence; review; acceptance merge; reconciliation/ADRs; transactions; final claims/rank/status/archive state; exposed wall-clock/token use; and blockers. Include exact `Representative suite:` and `Retries, conflicts, rework:` lines even when skipped or none.

End with `Next step:` — blocked → exact resume command; otherwise `$implement-with-subagents` or `$implement` with the next highest-ranked scope, or `$discuss` naming the next open outcome.
