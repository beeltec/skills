---
name: parallel-execution
description: Coordinate bounded parallel read-only work or independent verification processes for another delivery skill. Use only after a caller identifies at least two independent units; never for repository mutations or as an implementation entry point.
---

# Parallel Execution

Minimize wall-clock time without weakening the caller's authority, validation, or reproducibility gates. The caller owns synthesis, every mutation, and the final report.

## Workflow

### 1. Qualify the fan-out

Require a fixed brief and at least two read-only units with explicit scope, output, dependencies, and stop conditions. Otherwise return them for serial execution.

Use subagents for judgement or separate context. Run deterministic lint, typecheck, test, and build commands concurrently only when they cannot mutate shared caches, outputs, ports, databases, simulators, or repository state; otherwise serialize them.

Never delegate from a worker. Without parallel subagents, return control; the caller continues serially.

### 2. Build the schedule

Map dependencies and the ready frontier. Treat planning evidence as provisional until revalidated against live state.

Reserve the manager's capacity. Use one shared budget for the complete top-level run; nested caller skills consume its remaining slots rather than opening another pool. Run at most four workers concurrently, or fewer when the harness exposes fewer free slots. Queue the remainder.

Route roles by capability:

- mechanical read-only discovery → cheapest capable tier, low reasoning;
- bounded analysis → balanced capable tier, default reasoning;
- high-risk review questions → strongest available tier, high reasoning.

If per-agent selection is unavailable, use the harness default and report it once. Escalate only an unusable return; never replace a live worker merely to change its model.

### 3. Dispatch

Launch the ready frontier together. Give each worker only its brief, authority paths, output shape, validation, and stop conditions. Require it to report unreadable authority and never spawn agents.

Require concrete unresolved questions that cannot be answered cheaply in the caller's context; never create generic code, test, guidance, or risk inventories. Workers must not edit files, create commits or branches, change records, or run commands with shared side effects.

Refill a free slot with a dependency-free unit while the manager inspects completed work. Never start a unit that depends on an unverified result.

### 4. Admit and verify

Inspect every return and verify its cited artifacts or commands. Revalidate dependencies and authority freshness after each result. The caller alone applies any resulting mutation.

### 5. Recover

Send an invalid, conflicting, or incomplete result back to the same worker with focused evidence. Pause only its dependents and continue unaffected units. Apply the caller's retry limit.

Stop the affected group only when shared authority or the baseline becomes invalid. Preserve valid results and return exact recovery state; never broaden scope.

### 6. Return

Return dependencies, worker roles, model/effort applied or unsupported, completion order, checks, retries, conflicts, rework, and blockers. Report exposed wall-clock and token use; never invent metrics.

## Boundaries

- **Always:** keep one manager, bounded capacity, fixed briefs, fresh authority, read-only workers, and caller-owned decisions.
- **Ask first:** any scope, authority, destructive action, or cost commitment the caller did not authorize.
- **Never:** recursive delegation, repository mutation, unbounded fan-out, worker-owned user decisions, or scheduling CI, release, deployment, or monitoring work.

## Examples

```text
Planning: two workers answer named, independent unresolved compatibility questions; the caller handles routine inspection, synthesis, and the one backlog transaction.
Verification: run isolation-safe lint and typecheck processes concurrently; spawn one diagnostic worker only after a failure needs judgement.
```
