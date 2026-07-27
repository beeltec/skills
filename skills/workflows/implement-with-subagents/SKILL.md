---
name: implement-with-subagents
description: Orchestrate ready Epics adaptively through one integration branch, or standalone work-item sets through isolated executors. Use only on explicit EPIC-NNN, WORK-NNN set, or unambiguous scope.
---

# Implement with Subagents

Orchestrate approved backlog work while owning authority discovery, execution topology, integration, verification, recovery, and acceptance. For an Epic, optimize for one executor and one integration branch; fan out only genuinely independent, scope-disjoint children. For standalone WORK sets, delegate each item through its normal single-item `$implement` acceptance.

Under `$to-product`, its autonomous contract supplies owner approvals and blocker policy. Pass that contract and any run-transcript path through every brief.

Delegation depth:

```text
orchestrator (depth 0)
├─ Epic executor or provisional child executor (depth 1)
└─ review agent(s) (depth 1; never spawn)
```

Implementation agents never spawn implementation agents. Review agents never spawn agents.

## Inputs

Require one explicit authorized scope: an active `EPIC-NNN`/path (authorizing all approved children and Epic closure) or a non-empty set of `WORK-NNN` IDs/paths. An unambiguous scope already established by the conversation counts; otherwise list candidates and ask — never infer a set from similar titles, changed paths, or rank adjacency. A set never authorizes siblings, parents, outside dependencies, or Epic closure; an Epic supplies coordination context but never expands a child's approved outcome.

Optional `model` and `reasoning effort` settings pass unchanged to every fresh subagent spawn. If an interface cannot apply a setting, say so once and use its default — never claim it was applied. Recovery resumes the existing subagent; never spawn a replacement with different settings.

## Preflight

Before spawning or mutating backlog:

1. Resolve repository instructions and require the current setup-project scaffold, including Epic acceptance-unit and batched-evidence maintenance rules. Direct legacy projects to `$setup-project` before delegation.
2. Run `node scripts/validate-project.mjs`; stop on an invalid baseline.
3. Read the complete authorized records, rank, relationships, claims, indexes, wiki references and nearest indexes, maintenance, research, applicable guidance indexes/pages, affected code, and tests once. Pass this authority packet by path and role.
4. Inspect branches, remotes, changes, and recent history. Preserve unrelated work. Pin the primary commit as the immutable Epic fixed point.
5. Reject proposed/malformed work, missing ranks/readiness, inconsistent or foreign claims, and outside-scope blockers. Never add, rerank, cancel, reparent, or alter scope.

For an Epic, classify topology before any spawn:

- **Single executor (default):** dependencies dominate, children share core files/interfaces, or parallel work would duplicate discovery or create likely conflicts.
- **Parallel waves:** at least two currently actionable children are dependency-free, scope-disjoint, and can be integrated without inventing a shared contract.

Record the choice and evidence. Mere availability of multiple children is not enough to fan out.
## Execution topology

### Single-executor Epic

Spawn one fresh agent with the complete packet to run `$implement EPIC-NNN`. Require one Epic branch, focused child checks, narrow targeted child reviews only, one composed review, one representative suite with risk-triggered matrix expansion, one reconciliation, one primary merge, and two normal backlog transactions. Wait only after dispatch; verify its evidence on return.

### Parallel-wave Epic

1. Create one Epic integration branch and apply `$implement`'s single start/claim transaction for the Epic and all required children.
2. Select up to three actionable, scope-disjoint children. Spawn one fresh agent per child in isolated worktrees from the same integration-branch commit. Each runs `$implement` in internal provisional-child mode: code, focused checks, smoke test, and narrow targeted review only. It returns commits and evidence without backlog/wiki/status/rank/primary changes.
3. Admit returned commits serially to the Epic integration branch. Send conflicts or failed affected checks back to the same agent; never silently rewrite its scope. Preserve one shared authority packet and reload only paths changed by admitted commits.
4. Recalculate dependencies and repeat. Do not spawn a fresh agent merely to continue dependency-heavy work; assign the remaining chain to one executor.
5. After all children are provisional, the orchestrator follows `$implement` Epic closure: one composed review, remediation, one representative suite and justified matrix, one reconciliation, one merge, accepted-state publication, and one atomic final transaction.

No child branch merges to primary or becomes terminal. Do not commit per-child evidence or maintain a second task document.

### Standalone WORK set

Delegate each authorized standalone item once through `$implement WORK-NNN`. Scope-disjoint items may run concurrently. Each remains its own acceptance unit with one review, one representative suite, one merge, one reconciliation, and start/final transactions. Reuse verification across code-identical merges and non-executable documentation changes.
## Verification And Recovery

Verify cited commits, merge ancestry, claims, rank, statuses, indexes, archives, review mode, focused checks, suite freshness, matrix rationale, reconciliation, and acceptance. Trust fresh consistent evidence; rerun only when evidence is missing, stale, contradictory, or code-affecting integration inputs differ.

For an Epic require one integration branch and acceptance merge; all children provisional until atomic completion; targeted reviews only for narrow high risk; one comprehensive Epic review; one representative suite; justified risk-triggered matrix expansion or complete release matrix; one wiki/ADR transaction; and exactly one normal start plus final backlog transaction.

On failure, send one focused follow-up to the same agent. Under an autonomous run, retry the outcome three times, then release all owned claims and return unfinished records to `ready` in one recovery transaction. Never replace a live agent, accept partial Epic state, or alter another executor's claim.
## Epic Closure

Only explicit Epic input authorizes closure. Follow `$implement` and [its Epic reference](../implement/references/epic-mode.md); do not add an orchestrator-specific review, suite, merge, reconciliation, or completion gate. The closure report and repository evidence must show the single shared acceptance transaction set.
## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report topology and its reason; executor/child agents and branches; code commits and focused evidence; targeted reviews or skips; the one composed review; representative suite and matrix rationale; acceptance merge; reconciliation/ADRs; start and final transactions; final claims/rank/status/archive state; unsupported settings; and blockers.

End with `Next step:` — blocked → exact resume command; otherwise `$implement-with-subagents` or `$implement` with the next highest-ranked scope, or `$discuss` naming the next open outcome.
