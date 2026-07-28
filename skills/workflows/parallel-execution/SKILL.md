---
name: parallel-execution
description: Coordinate bounded parallel work for another delivery skill through one central manager, a dependency graph, isolated workers, serialized admission, and focused recovery. Use only after a caller identifies at least two independent units; not a standalone implementation entry point — use implement-with-subagents for approved backlog execution.
---

# Parallel Execution

Minimize delivery wall-clock time without weakening the caller's authority, acceptance, validation, or reproducibility gates. The caller remains the manager and owns every decision, synthesis, admission, shared-state mutation, integration, and final report.

## Workflow

### 1. Qualify the fan-out

Require a fixed brief and at least two units with explicit scope, output, dependencies, conflict domain, and mutation permission. Continue locally when independence is uncertain, coordination would dominate, or units need the same context.

Use sub-agents for judgement or separate context. Run deterministic lint, typecheck, test, and build commands as parallel processes only when their caches, generated outputs, ports, databases, simulators, and worktrees are isolated; otherwise serialize them.

Never delegate from a depth-one worker. Without parallel sub-agents, execute the same units sequentially and report that limitation.

### 2. Build the schedule

Map a dependency graph and its ready frontier. Mark shared contracts, files, state, and integration order as conflict domains. Treat a planning graph as provisional until revalidated against live code.

Reserve the manager's capacity. Use one shared budget for the complete top-level run; nested caller skills consume its remaining slots rather than opening another pool. Run at most three workers concurrently, or fewer when the harness exposes fewer free slots. Queue the remainder.

Route roles by capability:

- mechanical read-only discovery → cheapest capable tier, low reasoning;
- bounded implementation → balanced capable tier, default reasoning;
- synthesis, high-risk review, conflict resolution → strongest available tier, high reasoning.

If per-agent selection is unavailable, use the harness default and report it once. Escalate only an unusable return; never replace a live worker merely to change its model.

### 3. Dispatch

Launch the ready frontier together. Give each worker only its brief, authority paths and roles, required output shape, validation, and stop conditions. Require it to report unreadable authority and never spawn agents.

Parallelize read-only discovery by concern. For mutations, assign one owner per conflict domain and isolate every writer in its own worktree. Add another writer only behind a fixed interface with disjoint scope.

Use a rolling ready queue: refill a free slot immediately with a dependency-free unit while the manager inspects and serially admits completed work. Never start a unit that depends on an unadmitted result.

### 4. Admit and verify

Inspect every return and verify its cited artifacts or commands. Admit mutations serially in dependency order; revalidate the graph, authority freshness, and affected checks after each admission.

Start targeted review when a stable admitted increment meets the caller's narrow high-risk rule and unrelated work remains. Keep the caller's one final composed review after integration; never add routine duplicate review.

### 5. Recover

Send an invalid, conflicting, or incomplete result back to the same worker with focused evidence. Pause only its dependents and continue unaffected units. Apply the caller's retry limit.

Retry a unit-local acceptance failure through the same worker and pause only its dependents. Stop the affected concurrency group only when a shared contract, baseline validator, or integration fails. Preserve completed work and return exact recovery state; never broaden scope to unblock it.

### 6. Return

Return the dependency graph, worker roles, model/effort applied or unsupported, admission order, checks, targeted reviews, retries, conflicts, rework, and blockers. Report wall-clock and token use when the harness exposes them; never invent either metric.

## Boundaries

- **Always:** keep one manager, bounded capacity, fixed briefs, fresh authority, isolated writers, serialized shared-state mutation, and caller-owned acceptance.
- **Ask first:** any scope, authority, destructive action, overlapping writer, or cost commitment the caller did not already authorize.
- **Never:** recursive delegation, unbounded fan-out, concurrent integration or governance writes, worker-owned user decisions, or scheduling CI, release, deployment, or monitoring work.

## Examples

```text
Planning: three read-only workers analyze slicing, dependencies, and verification; the caller synthesizes and commits one backlog transaction.
Epic: isolated writers implement dependency-free children; the manager serially admits commits and never starts a dependent child early.
Verification: run isolation-safe lint and typecheck processes concurrently; spawn one diagnostic worker only after a failure needs judgement.
```
