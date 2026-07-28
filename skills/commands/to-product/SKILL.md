---
name: to-product
description: Run the whole delivery flow unattended from a PRD or plan to accepted primary-branch state, answering every owner gate as owner-proxy. Not for interactive shaping (use $discuss) or planning one outcome (use $to-epic).
disable-model-invocation: true
---

# To Product

Invoking this skill starts an **autonomous run**: one uninterrupted transaction set carrying every standing approval in this skill set, from an unshipped PRD to accepted primary-branch state. It supersedes every approval pause in `$setup-project`, `$discuss`, `$to-epic`, `$to-backlog`, `$to-wiki`, `$to-guidance`, `$backlog`, `$wiki`, `$guidance`, `$research`, `$implement`, and `$implement-with-subagents`.

Read [the autonomous contract](references/autonomous-contract.md) before step 1 and follow it for every gate. It is the only statement of what the run may decide; no other file restates it.

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
5. Inspect the current branch, primary branch, remotes, staged and unstaged changes, and recent history. Preserve unrelated changes; never stage them.
6. Read the wiki root index, maintenance rules, the `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` indexes, the ADR index at `docs/wiki/architecture/decisions/index.md`, and the backlog root index and global rank. Open an individual ADR, active record, or the ubiquitous language only when an outcome touches it; the invoked skills read their own authorities.
7. **Resume detection** — read `docs/runs/` for a prior run transcript naming this PRD. Match each outcome to its existing record: terminal → skip; `in-progress` or parked → resume at its first incomplete step; absent → plan it fresh. Never create a second record for an outcome that already has one.
8. Open the run transcript from [the template](assets/run-transcript.md) at `docs/runs/<YYYY-MM-DD>-to-product-<slug>.md`. Append in memory or the worktree throughout, but never commit per-child or per-subtask entries. Pass its path into implementation so the outcome's accumulated delivery evidence can join the final Epic acceptance transaction.

When the PRD exposes at least two independent discovery or delivery units, invoke `$parallel-execution`. This run remains the central manager; owner-proxy decisions, routing, backlog/wiki writes, admission, primary merges, and acceptance stay serialized here.

## 1. Outcome graph

Run `$discuss` once over the whole PRD with the owner-proxy answering, to establish the **outcome graph**: every distinct outcome the PRD requires, its dependencies, shared contracts or files, conflict domains, and candidate parallel frontiers.

Classify each outcome by `$discuss`'s own routing rules — coordinated multi-item outcome, standalone item, durable current-state knowledge, adopted technology or standard rules. Record the map and the opening discussion's question/answer/source rows in the transcript before planning anything.

Do not plan or slice children here. This pass establishes order only.

## 2. Per-outcome loop

Maintain a rolling ready queue from the outcome graph. Precompute read-only evidence and planning analysis for dependency-independent outcomes through `$parallel-execution`, then revalidate it against current primary state before use. For each admitted outcome:

1. **Discuss** — run `$discuss` scoped to that outcome, with the owner-proxy answering. It reads the wiki as it stands now, so outcomes shipped earlier in this run inform it. Print the whole exchange.
2. **Route** — execute the command `$discuss` recommends: `$to-epic` for a coordinated outcome, `$to-backlog` for standalone items, `$to-wiki` for durable current-state knowledge and confirmed terminology, `$to-guidance` for adopted rules. Run several in the recommended order.
3. **Answer the evidence decision** — preserve the complete evidence policy: name every touched subject whose guidance is missing, `draft`, version-mismatched, or stale, and run `$research` whenever the outcome carries a version-specific or security-sensitive question.
4. **Ship** — invoke `$implement-with-subagents` with the resulting `EPIC-NNN` or `WORK-NNN` set and the transcript path. It chooses one Epic executor for dependency-heavy work and fans out only genuinely independent children. Never `$implement` directly or implement in this context.
5. **Verify** — confirm from repository evidence, not the report alone. An Epic outcome requires one integration branch and primary acceptance merge, one comprehensive Epic review, one representative full suite, justified risk-triggered matrix expansion, one accepted-state/ADR reconciliation, and exactly one start/claim plus one final acceptance/archive backlog transaction except recorded recovery. Every child and the Epic must be `done` and archived atomically; claims and rank entries must be cleared. A standalone item follows its own single-item acceptance. In either route, require `decisions` resolved to published `ADR-NNN`s or `none`, every evidence-decision guidance subject current, research version rows dated within this run with live sources, and the validator green. A failed check blocks the outcome; resolve it or park it.
6. **Record** — ensure the final acceptance transaction includes the accumulated outcome discussion, records, implementation commits, one acceptance merge, review and suite evidence, matrix rationale, published ADRs, and guidance pages. Do not create separate child-delivery transcript commits.

Refill free capacity with dependency-independent read-only work while admissions continue. Implementation may overlap only behind fixed, disjoint interfaces in isolated worktrees; serialize routing mutations, integration, accepted-state publication, and final transactions. Never start work depending on an unadmitted result.
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

## Blockers

A blocker is a wall, not a decision: a failing required check after fixes, merge conflict, validator failure, unavailable authority, or dependency deadlock.

Retry the outcome up to **three** times, addressing the actual cause. On the third failure:

1. Release every claim owned by this run and return its unfinished Epic/children or standalone item to `ready` in one validated recovery transaction.
2. Record the blocker, attempts, and exact resumption point on the affected record and transcript.
3. Mark the outcome parked and report its exact resume command.
4. Continue with the next dependency-independent outcome.

Never re-attempt a parked outcome in the same run. When no actionable work remains, terminate rather than idle.
## Termination

The run ends when every outcome in the map has a `done`, archived record on the primary branch and no actionable work remains, or when everything left is parked. Nothing else ends it.

## Report

Report the PRD source and outcome graph; worker roles, models/effort applied or unsupported, admission order, wall-clock and token use when exposed, retries, conflicts, and rework; every discussion with its question count; the assumption count, citing the transcript's register; records created with type, status, and rank; every guidance page created or refreshed; research decisions per outcome; commits, merge commits, and published `ADR-NNN`s with any ADR superseded; every destructive gate auto-approved under the contract, individually; out-of-PRD scope filed as `proposed`; parked items with their blockers and resume commands; the transcript path; the final `node scripts/validate-project.mjs` result.

End the report with `Next step:` — one copy-pasteable command: parked items → the exact command that resumes the highest-ranked one; unshipped map outcomes → `$to-product` with the same PRD to resume; out-of-PRD records filed → `$to-backlog` naming them; otherwise omit it.
