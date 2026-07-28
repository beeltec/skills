---
name: to-product
description: Run the whole delivery flow unattended from a PRD or plan to accepted primary-branch state, answering every owner gate as owner-proxy. Not for interactive shaping (use $discuss) or planning one outcome (use $to-epic).
disable-model-invocation: true
---

# To Product

Invoking this skill starts an **autonomous run**: one uninterrupted transaction set carrying every standing approval in this skill set, from an unshipped PRD to accepted primary-branch state. It supersedes every approval pause in `$setup-project`, `$discuss`, `$to-epic`, `$to-backlog`, `$to-wiki`, `$to-guidance`, `$backlog`, `$wiki`, `$guidance`, `$research`, `$implement`, and `$implement-with-subagents`.

Read [the autonomous contract](references/autonomous-contract.md) before step 1 and follow it for every gate. It is authoritative when another skill conflicts.

The run asks the user nothing between invocation and termination. Every decision the owner would have made is answered by the **owner-proxy** and logged.

Realize the PRD. Never grow it.

## Inputs

Resolve exactly one:

- a PRD file path — `$to-product docs/prd/checkout-v2.md`;
- a directory of PRD files — `$to-product docs/prd/`;
- inline prose — `$to-product "Build a CLI that ..."`;
- existing `proposed` `EPIC-NNN` or `WORK-NNN` IDs — `$to-product EPIC-012 EPIC-013`.

With none resolvable, or more than one, list what was found and stop. Never infer a PRD from repository contents.

Optional `model` and `reasoning effort` select `$implement-with-subagents`' bounded-implementation tier; discovery and judgement keep `$parallel-execution`'s role routing unless the user explicitly requires one uniform setting.

## Preflight

1. Resolve the repository root. Read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and contributing or coding standards.
2. Read the PRD completely. Record its path and the commit that establishes its content.
3. When the scaffold is missing **or** `docs/backlog/maintenance.md` lacks the Epic acceptance-unit lifecycle (one start transaction, provisional children, batched checklist evidence, atomic final acceptance/archive), invoke `$setup-project` under this run's approval. Reconcile any customized maintenance file the installer preserves before planning; never run the redesigned workflow against legacy per-child acceptance rules.
4. Run `node scripts/validate-project.mjs`. On an invalid baseline, repair it under this run's approval before any planning; report what was repaired.
5. Inspect branches, remotes, staged/unstaged changes, and recent history. Preserve unrelated file changes; never stage them.
6. Read the wiki root index, maintenance rules, the `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` indexes, the ADR index at `docs/wiki/architecture/decisions/index.md`, and the backlog root index and global rank. Open an individual ADR, active record, or the ubiquitous language only when an outcome touches it; the invoked skills read their own authorities.
7. **Resume detection** — read `docs/runs/` for a prior run transcript naming this PRD. Match each outcome to its existing record: terminal → skip; `in-progress` or parked → resume at its first incomplete step; absent → plan it fresh. Never create a second record for an outcome that already has one.
8. Run `$create-conventional-branch`'s autonomous gate: preserve recoverable state, delete extra local branches, and leave primary plus at most the branch step 7 proved resumable.
9. Open the run transcript from [the template](assets/run-transcript.md) at `docs/runs/<YYYY-MM-DD>-to-product-<slug>.md`. Append in memory or that file, but never commit per-child or per-subtask entries. Pass its path into implementation so accumulated evidence joins the final acceptance transaction.

Invoke `$parallel-execution` only for at least two independent read-only questions or side-effect-free checks. Owner-proxy decisions, mutations, implementation, merges, and acceptance stay serial.

## 1. Outcome graph

Run `$discuss` once over the whole PRD with the owner-proxy answering, to establish the **outcome graph**: every required outcome, dependencies, shared contracts/files, conflict domains, serial implementation order, and candidate read-only frontiers.

Classify each outcome by `$discuss`'s own routing rules — coordinated multi-item outcome, standalone item, durable current-state knowledge, adopted technology or standard rules. Record the map and the opening discussion's question/answer/source rows in the transcript before planning anything.

Do not plan or slice children here. This pass establishes order only.

## 2. Per-outcome loop

Maintain a rolling ready queue from the outcome graph. Precompute read-only evidence and planning analysis for dependency-independent outcomes through `$parallel-execution`, then revalidate it against current primary state. Admit one implementation outcome at a time:

1. **Discuss** — run `$discuss` scoped to that outcome, with the owner-proxy answering. It reads the wiki as it stands now, so outcomes shipped earlier in this run inform it. Print the whole exchange.
2. **Route** — execute the command `$discuss` recommends: `$to-epic` for a coordinated outcome, `$to-backlog` for standalone items, `$to-wiki` for durable current-state knowledge and confirmed terminology, `$to-guidance` for adopted rules. Run several in the recommended order.
3. **Answer the evidence decision** — preserve the complete evidence policy: name every touched subject whose guidance is missing, `draft`, version-mismatched, or stale, and run `$research` whenever the outcome carries a version-specific or security-sensitive question.
4. **Ship** — invoke `$implement-with-subagents` with the resulting records and transcript path. It runs one fresh writer at a time on the sole acceptance branch. If no worker is available, run `$implement` here; capacity is never a blocker.
5. **Verify** — confirm from repository evidence, not the report alone. Require one acceptance branch, one primary merge, one comprehensive acceptance-unit review, one representative suite, justified matrix expansion, one reconciliation, and exactly one normal start plus final backlog transaction except recorded recovery. Require terminal records archived atomically, claims/ranks cleared, decisions published or `none`, named guidance current, live research rows dated within this run, the validator green, and the acceptance branch deleted. Resolve a failed check or park only for technical impossibility.
6. **Record** — ensure the final acceptance transaction includes the accumulated outcome discussion, records, implementation commits, one acceptance merge, review and suite evidence, matrix rationale, published ADRs, and guidance pages. Do not create separate child-delivery transcript commits.

Refill free capacity with dependency-independent read-only work while implementation continues. Never overlap writers or start work depending on an unverified result.
## Owner-proxy protocol

The owner-proxy is a role this run plays in the same context, never a subagent. Because the answerer shares the context, `$discuss`'s one-question-per-turn protocol collapses: emit each discussion as **one batched block** — the whole numbered question set for that outcome (or the opening graph pass), each question immediately followed by its answer — printed verbatim on screen. Batching is not summarizing: every question and answer still appears in full, and the transcript's discussion rows are the auditable record.

Answer from the PRD first, then repository evidence, then the accepted wiki. Cite which. When no source supports an answer, answer anyway, mark it `ASSUMPTION`, and add it to the **assumption register**.

```text
Question 3 / ~12:
Which session strategy?
  → recommended: signed cookies

[owner-proxy] Signed cookies.
  source: PRD §4 "browser-only clients, no mobile"

Question 4 / ~12:
Session lifetime?

[owner-proxy] 24 hours.
  ASSUMPTION — the PRD is silent; registered.
```

Never present an assumption as sourced. Never answer a question the PRD settles by contradicting it. Never skip a question because the answer seems obvious.

Carry every assumption into the record it shaped, as provenance naming this run.

The owner-proxy may authorize every user-authorizable change required to realize the PRD: record creation, rewriting, splitting, merging, type, scope, criteria, exclusions, child set, parentage, relationships, rank, research, decisions, readiness, claims, status, cancellation, recovery, archival, accepted knowledge, and branch cleanup. It may repair malformed or legacy workflow state. Never change unrelated records or grow the PRD.

## Blockers

A workflow condition is never a blocker: resolve approvals, malformed records, stale claims, branch clutter, merge conflicts, dependency ordering, and unavailable workers autonomously.

A blocker is technical or external impossibility after fixes: a persistently failing required check/validator, unavailable required credential/service/runtime, or irreconcilable repository corruption.

Retry the outcome up to **three** times, addressing the actual cause. On the third failure:

1. Preserve the acceptance tip and uncommitted state under recorded recovery refs/stashes.
2. Release owned claims and return unfinished records to `ready` in one validated recovery transaction.
3. Switch to primary, delete the acceptance branch, record the blocker/attempts/resumption point, and mark the outcome parked.
4. Continue with the next dependency-independent outcome.

Never re-attempt a parked outcome in the same run. When no actionable work remains, terminate rather than idle.
## Termination

The run ends when every outcome in the map has a `done`, archived record on the primary branch and no actionable work remains, or when everything left is parked. Nothing else ends it.

## Report

Report the PRD and outcome graph; agents/fallback, models/effort, execution order, exposed metrics, retries/conflicts/rework; discussions and assumptions; record changes; guidance/research; commits/merges/ADRs; every destructive gate; deleted branches and recovery refs/stashes; out-of-PRD proposals; parked items/resume commands; transcript path; final validator result.

End the report with `Next step:` — one copy-pasteable command: parked items → the exact command that resumes the highest-ranked one; unshipped map outcomes → `$to-product` with the same PRD to resume; out-of-PRD records filed → `$to-backlog` naming them; otherwise omit it.
