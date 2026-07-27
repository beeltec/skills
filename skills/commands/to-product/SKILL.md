---
name: to-product
description: Run the whole delivery flow unattended from a PRD or plan to accepted primary-branch state, answering every owner gate as owner-proxy. Not for interactive shaping (use /discuss) or planning one outcome (use /to-epic).
disable-model-invocation: true
---

# To Product

Invoking this skill starts an **autonomous run**: one uninterrupted transaction set carrying every standing approval in this skill set, from an unshipped PRD to accepted primary-branch state. It supersedes every approval pause in `$setup-project`, `$discuss`, `$to-epic`, `$to-backlog`, `$to-wiki`, `$to-guidance`, `$backlog`, `$wiki`, `$guidance`, `$research`, `$implement`, and `$implement-with-subagents`.

Read [the autonomous contract](references/autonomous-contract.md) before step 1 and follow it for every gate. It is the only statement of what the run may decide; no other file restates it.

The run asks the user nothing between invocation and termination. Every decision the owner would have made is answered by the **owner-proxy** and logged.

Realize the PRD. Never grow it.

## Inputs

Resolve exactly one:

- a PRD file path — `/to-product docs/prd/checkout-v2.md`;
- a directory of PRD files — `/to-product docs/prd/`;
- inline prose — `/to-product "Build a CLI that ..."`;
- existing `proposed` `EPIC-NNN` or `WORK-NNN` IDs — `/to-product EPIC-012 EPIC-013`.

With none resolvable, or more than one, list what was found and stop. Never infer a PRD from repository contents.

Optional `model` and `reasoning effort` pass unchanged to `$implement-with-subagents`.

## Preflight

1. Resolve the repository root. Read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and contributing or coding standards.
2. Read the PRD completely. Record its path and the commit that establishes its content.
3. When `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, all four backlog type templates, or `scripts/validate-project.mjs` is missing, invoke `$setup-project` under this run's approval and continue once it reports success. Never improvise a partial scaffold.
4. Run `node scripts/validate-project.mjs`. On an invalid baseline, repair it under this run's approval before any planning; report what was repaired.
5. Inspect the current branch, primary branch, remotes, staged and unstaged changes, and recent history. Preserve unrelated changes; never stage them.
6. Read the wiki root index, maintenance rules, the `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` indexes, the ADR index at `docs/wiki/architecture/decisions/index.md`, and the backlog root index and global rank. Open an individual ADR, active record, or the ubiquitous language only when an outcome touches it; the invoked skills read their own authorities.
7. **Resume detection** — read `docs/runs/` for a prior run transcript naming this PRD. Match each outcome to its existing record: terminal → skip; `in-progress` or parked → resume at its first incomplete step; absent → plan it fresh. Never create a second record for an outcome that already has one.
8. Open the run transcript from [the template](assets/run-transcript.md) at `docs/runs/<YYYY-MM-DD>-to-product-<slug>.md`. Append to it throughout; it is not written only at the end.

## 1. Outcome map

Run `$discuss` once over the whole PRD with the owner-proxy answering, to establish the **outcome map**: every distinct outcome the PRD requires, its dependencies, and the order they must ship in.

Classify each outcome by `$discuss`'s own routing rules — coordinated multi-item outcome, standalone item, durable current-state knowledge, adopted technology or standard rules. Record the map in the transcript before planning anything.

Do not plan or slice children here. This pass establishes order only.

## 2. Per-outcome loop

For each outcome in map order:

1. **Discuss** — run `$discuss` scoped to that outcome, with the owner-proxy answering. It reads the wiki as it stands now, so outcomes shipped earlier in this run inform it. Print the whole exchange (see below).
2. **Route** — execute the command `$discuss` recommends, not a substitute: `/to-epic` for a coordinated outcome, `/to-backlog` for standalone items, `/to-wiki` for durable current-state knowledge and confirmed terminology, `/to-guidance` for adopted rules. Several may apply; run them in the order `$discuss` gives.
3. **Answer the evidence decision** — `$to-epic` step 2 and `$to-backlog` step 2 both stop for the owner. The owner-proxy answers both halves per the contract: name every subject whose page is missing, `draft`, version-mismatched, or stale for `$guidance`, and run `$research` whenever the outcome carries a version-specific or security-sensitive question.
4. **Ship** — invoke `$implement-with-subagents` with the resulting `EPIC-NNN` or `WORK-NNN` set. Never `$implement` directly, and never implement in this context.
5. **Verify** — confirm from repository evidence, not from the report alone: every child `done`, a merge commit and green post-merge checks on the primary branch, `decisions` resolved off `pending` with each published `ADR-NNN`, wiki reconciliation applied or its absence justified, claims cleared, records archived, validator green.
6. **Record** — append the outcome's records, commits, merge commits, published ADRs, and guidance pages to the transcript.

Then take the next outcome. Never start an outcome whose dependencies have not shipped.

## Owner-proxy protocol

The owner-proxy is a role this run plays in the same context, never a subagent. Because the answerer shares the context, `$discuss`'s one-question-per-turn protocol collapses: emit each discussion as **one batched block** — the whole numbered question set for that outcome (or the opening map pass), each question immediately followed by its answer — printed verbatim on screen. Batching is not summarizing: every question and answer still appears in full, and the transcript's discussion rows are the auditable record.

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

A blocker is a wall, not a decision: a failing suite after fixes, a merge conflict, a validator failure, an unavailable authority, or a dependency deadlock.

Retry the item up to **three** times, addressing the actual cause each time. On the third failure:

1. Release the claim and return the record to `ready` — never invent a blocked status.
2. Record the blocker, the three attempts, and the resumption point on the record.
3. Mark it **parked** in the transcript and report, with the exact command that resumes it.
4. Select the next actionable work and continue.

Never re-attempt a parked item in the same run. When no actionable work remains and required work is parked, terminate and report — do not idle.

## Termination

The run ends when every outcome in the map has a `done`, archived record on the primary branch and no actionable work remains, or when everything left is parked. Nothing else ends it.

## Report

Report the PRD source and outcome map; every discussion with its question count; the assumption count, citing the transcript's register; records created with type, status, and rank; every guidance page created or refreshed; research decisions per outcome; commits, merge commits, and published `ADR-NNN`s with any ADR superseded; every destructive gate auto-approved under the contract, individually; out-of-PRD scope filed as `proposed`; parked items with their blockers and resume commands; the transcript path; the final `node scripts/validate-project.mjs` result.

End the report with `Next step:` — one copy-pasteable command: parked items → the exact command that resumes the highest-ranked one; unshipped map outcomes → `/to-product` with the same PRD to resume; out-of-PRD records filed → `/to-backlog` naming them; otherwise omit it.
