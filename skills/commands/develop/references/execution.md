# Execution And Branching

Load for code changes, deployments, explicit branch/PR intent, selected governed work, or implementation workers. Read `review.md` for standalone/Epic acceptance and `delegation.md` before dispatching workers.

## Select The Lane

- **Direct:** bounded ordinary change; current branch unless explicitly asked otherwise; focused verification; no automatic wiki/backlog trace.
- **Ungoverned implementation:** substantial work without selected governed records; one conventional branch by default, coherent local commits, proportionate plan/review/verification, no scaffold creation.
- **Governed acceptance:** explicit ready `WORK-NNN` or `EPIC-NNN`, or a matching interrupted `in-progress` unit; one acceptance branch, claims, record transactions, comprehensive review, merge/reconciliation/archive.

If direct work grows, finish safely in the selected lane and report the overrun. Never abandon a partly applied coherent fix solely to introduce ceremony.

## Context-Fit Gate

Before coding and after each coherent delta, assess the complete remaining acceptance unit: implementation, focused checks, final review, remediation, and reconciliation. Use exposed context capacity when available; never rely on future compaction as capacity.

Keep work local only when it should finish with ample context and is one bounded item or a tiny, tightly coupled Epic. Broad discovery, multiple subsystems, migration, large verification evidence, uncertainty about fit, or compaction since the authority packet fails the gate. Then load `delegation.md` and use fresh serial implementation workers. If local work grows, finish the current coherent delta, record its fixed point and evidence, and delegate the remainder.

## Branches

Inspect `git status --short --branch`, remotes, worktrees, and local branches before switching. Follow repository branch conventions; otherwise use `<feat|fix|hotfix|release|chore>/<lowercase-description>`. Never overwrite a remote name.

Direct/advisory/planning/knowledge/setup work stays on the current branch unless explicitly requested. Substantial or governed implementation uses one branch per acceptance unit. Selecting ungoverned implementation authorizes that local branch and coherent commits needed for fixed-point review, but not merge, push, or PR/MR creation. Outside explicit autonomy, stop and list conflicting local branches; never delete them. For accepted work, merge/delete only when the requested outcome includes acceptance. For parked work, preserve uncommitted/unique state with a recorded stash and recovery ref before deletion.

## Implementation

1. Read affected code/tests and all scope, instructions, accepted guidance, decisions, and research that constrain the change. For new governed scope, validate readiness, actionability, rank, claims, relationships, and the complete acceptance unit before branch/claim mutation. For resume, validate matching scope/session/branch/claims and remaining blockers instead; an owned `in-progress` unit is exempt from the `ready` actionability test.
2. Establish the fixed point and branch. Resume an `in-progress` unit only when its sole branch, session, scope, and live claims match; resume its first incomplete delta. Repair an expired owned interruption claim only when no competing executor exists, otherwise ask. For new governed work, apply one validated start transaction: claim the standalone item, or move the Epic and required children to `in-progress` and claim every child to one session/branch.
3. Implement the real changed path first. For bugs, capture the cheapest reliable failing-before reproduction. Commit coherent increments when the request, ungoverned branch lane, or governed procedure authorizes them.
4. Run the smallest affected checks as increments stabilize. Run lint/typecheck once unless invalidated. Parallelize deterministic checks only without shared mutable caches, outputs, ports, databases, simulators, or repository state.
5. Reuse coverage. Add one durable test only for an uncovered observable contract: acceptance-critical E2E, then integration/contract, then unit for impractical isolated edges/invariants. Never chase coverage, duplicate layers, or require feature TDD.
6. Keep temporary verification executables outside the workspace or remove them before final verification. Keep only conventional durable tests reachable through an established/documented command.
7. Never broaden scope. Ask for material adjacent changes; in governed work, record them separately.

## Epic And Worker Topology

An Epic and approved children are one acceptance unit. Execute eligible children serially. Before start, eligibility uses normal actionability. After Epic start or resume, a child is eligible when it is `in-progress`, claimed by this session/branch, not yet provisionally complete, and its inward blockers are provisionally complete; rank breaks ties. Keep children provisional: no child review, merge, wiki publication, terminal status, rank removal, or evidence commit. After every child, verify its commit/evidence and revalidate dependencies/shared interfaces.

When the context-fit gate requires workers, dispatch one child per fresh worker by default. Combine only tiny, tightly coupled children whose combined scope would pass the local gate. A fresh worker receives the live session, acceptance unit, branch and expected HEAD, fixed point, claims, authority paths, exact delta, verification, optional model/effort settings, and stop conditions. Only one writer runs at a time. The manager owns claims, ordering, review, reconciliation, merge, recovery, and acceptance. A worker stops after code commits and a compact evidence return.

## Deployment

Use only a repository-defined script, target, CI trigger, or project tool. Present mechanism, target, expected effect, and rollback, then always obtain confirmation before execution. Never invent deployment commands or alter infrastructure merely to force deployment.

## Governed Acceptance

After all standalone/Epic deltas are stable, follow `review.md`. Draft accepted-state reconciliation without wiki mutation on the branch. Merge once using the repository's accepted strategy (default merge commit; never rewrite published history), reverify changed code-affecting inputs, publish approved wiki/ADRs on primary, then apply one final backlog transaction clearing claims/ranks, recording evidence, setting terminal state, and archiving atomically. Never mark an Epic child done early.

On failure before acceptance, keep records nonterminal. Preserve recovery state, release owned claims, return unfinished scope to `ready`, and report the exact resumption point.
