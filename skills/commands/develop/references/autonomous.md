# Autonomous Run

Load only after explicit `product`, `unattended`, `autonomous`, or `owner-proxy` intent. Outside that invocation, none of this authority applies.

## Contract

Realize the supplied PRD or explicit outcome without growing it. Ask no user questions between start and termination. The owner-proxy answers required decisions from the PRD, then repository evidence, then accepted wiki; otherwise it chooses the safest coherent default, labels it `ASSUMPTION`, and records it. Never present assumptions as sourced.

The run may approve PRD-required planning, guidance, research, records, scope refinement, rank, readiness, claims, status, acceptance, recovery, accepted knowledge, ADR supersession, and branch cleanup. Log every approval with its source. Log destructive approvals individually. It may never implement unrelated scope, push, open a PR/MR, publish outside the repository, force-push, rewrite published history, falsify evidence, or retry a parked outcome.

## Input And Preflight

Resolve one PRD file, directory, inline brief, or explicit proposed record set. Without a resolvable source, stop; never infer a product from repository contents.

Read instructions and the source completely; record its path/content commit. Inspect scaffold, validator, branches, changes, recent history, wiki/backlog indexes, guidance indexes, ADR index, and prior `docs/runs` transcript. Resume matching outcomes instead of duplicating records. Setup/repair governance only when the run needs governed persistence.

Preserve unrelated changes. Before deleting an extra local branch, preserve unique/uncommitted state under recorded recovery refs/stashes. Never alter remote refs.

Create `docs/runs/<YYYY-MM-DD>-develop-<slug>.md` from `assets/run-transcript.md` when governed persistence exists; otherwise keep the same ledger in the final report.

## Outcome Loop

1. Build an outcome graph: outcomes, dependencies, shared contracts/files, conflict domains, serial order, and read-only frontiers. Do not slice children during this pass.
2. For each ready outcome, run the discussion questions as one visible batched block, each numbered question immediately followed by the verbatim owner-proxy answer and source/`ASSUMPTION`.
3. Route internally to planning, current knowledge, guidance, or execution. Inspect touched technologies and standards; adopt/refresh missing, draft, mismatched, or stale guidance only when required by the PRD. Research version/security-sensitive questions.
4. Apply `execution.md`'s context-fit gate. Use fresh serial implementation workers for work that fails it. Without worker capacity, implement only a coherent local delta that passes the gate; park the outcome when none does. Keep mutation and acceptance serial.
5. Verify from repository evidence, not reports: scope, review, representative suite/matrix, reconciliation, records/archives, decisions/ADRs, current named guidance, dated version evidence, validator, branch cleanup, and transcript.
6. Record outcome evidence and continue dependency-independent work.

An Epic is closable when every required child is provisionally complete with evidence; children and Epic become terminal together in the final transaction.

## Failure

Repair workflow state, claims, ordering, branch clutter, merge conflicts, and worker availability automatically. Retry a technical/external failure up to three times while addressing its cause. On the third failure, preserve state, release owned claims, return unfinished records to `ready`, delete the acceptance branch after recovery capture, record blocker/attempts/resumption, park the outcome, and continue independent outcomes. Never retry it in the same run.

Terminate when every outcome is complete or everything remaining is parked. Report graph, discussions, assumptions, approvals, destructive gates, records, agents/fallback, commits/merges, review/suites, guidance/research, ADRs, retries/recovery, transcript, validator, and exact resume commands.
