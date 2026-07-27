# Backlog maintenance

`docs/backlog` is the tracked system of record for desired project deltas and their execution state. `docs/wiki` is the canonical record of accepted current state on the primary branch. A completed backlog item does not redefine current state by itself: after primary-branch acceptance, use `$wiki` to update the owning concepts before completing and archiving the backlog records.

Run `node scripts/validate-project.mjs` after every wiki or backlog change.

## Hierarchy and placement

- An **Epic** is an outcome-centered container identified by `EPIC-NNN`. Each active Epic has one directory under `epics/`, containing its Epic record and all of its work records.
- A **Story**, **Task**, or **Bug** is executable work identified by `WORK-NNN`. These three types are peers; none may parent another.
- Epic work sets `parent` to the containing Epic ID. Standalone work sets `parent: none` and lives under `standalone/`.
- IDs are immutable, globally unique, and never reused, including after cancellation or archival. Allocate the next unused numeric value independently for `EPIC-NNN` and `WORK-NNN`; zero-pad to at least three digits.
- `templates/` contains non-record examples. Never place active records under `archive/`. A done/cancelled Epic child remains with its active Epic until the entire directory can be archived atomically; other completed/cancelled records belong under `archive/`.

## Lifecycle

Allowed statuses are `proposed`, `ready`, `in-progress`, `done`, and `cancelled`.

Epic transitions are:

- `proposed -> ready` after its outcome, acceptance criteria, and initial child scope are approved.
- `ready -> in-progress` in the Epic acceptance unit's single start transaction, together with every required child.
- `in-progress -> done` in one final transaction that also moves every child to `done` or preserves an approved cancellation, proves Epic acceptance and accepted-state reconciliation, and archives the whole directory atomically.
- `ready -> proposed` only with owner approval, a recorded walk-back reason in `## Execution`, and an explicit disposition for every non-`proposed` child.
- `proposed`, `ready`, or `in-progress -> cancelled` only with a recorded cancellation rationale. Cancel or complete every child and archive the entire Epic atomically.

Executable-work transitions are:

- `proposed -> ready` only after the Definition of Ready is met and the project owner approves execution.
- `ready -> in-progress` only when an agent records a temporary execution claim.
- `in-progress -> done` only when acceptance and checklist subtasks are complete and applicable wiki updates are made.
- `in-progress -> ready` when a claim is released without completion.
- `ready -> proposed` only with owner approval and a recorded walk-back reason in `## Execution`. Claim fields must be `none`; keep existing research, decisions, criteria, and rank position unchanged.
- `proposed`, `ready`, or `in-progress -> cancelled` only with a recorded cancellation rationale.

Do not skip states or infer approval. Record owner approval in the work item's `## Execution` section.

## Proposed items and Definition of Ready

A lightweight proposed item requires only an immutable ID, type, title, status, a concise outcome or desired delta, valid parent placement, and declared relationship fields. Unknown detail may remain explicit in its body.

Before executable work becomes `ready`, all of the following are required:

- The outcome/delta is specific, bounded, and contains no unresolved placeholder.
- Acceptance criteria contain at least one objectively checkable item.
- The parent and all relationships are valid; blockers are explicit.
- `wiki_refs` names every relevant accepted-state page as a `docs/wiki/...` project-relative path, or contains only `none` after confirming no page applies.
- `research` is `pending`, `complete`, or `not-needed` while work is proposed. Ready work requires `complete` or `not-needed`. Keep proposal-specific sources, version findings, recommendations, uncertainty, and project deviations under `## Research`; unresolved version-specific or security-sensitive questions require `pending` and prevent readiness.
- `decisions` is `pending`, `draft`, `none`, or a YAML inline array of published `ADR-NNN` IDs. Ready work requires `draft`, `none`, or published IDs. Apply the ADR significance test in `docs/wiki/maintenance.md`: draft each qualifying decision under `## Decisions` in ADR shape and set `draft`, or record `none` with a stated reason. `pending` means a qualifying decision is still unresolved and prevents readiness; never use `none` to skip an unresolved decision, and never use `draft` without every qualifying decision drafted in ADR shape.
- `## Execution` states the implementation-first approach, minimal verification commands, and explicit owner approval. Reuse coverage; add only the cheapest test for an uncovered observable contract: acceptance-critical E2E for user-visible behavior, integration/contract for a boundary, unit only for otherwise impractical isolated edges or invariants. Never require feature TDD, coverage targets, duplicate layers, or excessive E2E.
- Every checklist subtask is one bounded coherent implementation step naming scope and its cheapest command, test, or observable verification. Use `No subtasks.` when decomposition adds no value.
- The item is present exactly once in the root global rank.

Proposal-specific research remains with the backlog record. During post-acceptance implementation reconciliation, promote only guidance that became durable accepted current state to its canonical wiki concept; summarize it there instead of copying the proposal evidence.

A drafted decision under `## Decisions` is published as an ADR under `docs/wiki/architecture/decisions/` during that same reconciliation, and its allocated `ADR-NNN` IDs replace `draft` in `decisions` — `done` never retains `draft`. Where the new decision replaces one already in force, supersede that ADR in place in the same wiki transaction.

## Relationships

Relationship fields contain IDs in YAML inline arrays. Keep the relationship on the outward/source record; tools derive the inward wording:

| Field | Outward wording | Inward wording | Direction |
| --- | --- | --- | --- |
| `parent` | belongs to | contains | directional |
| `blocks` | blocks | is blocked by | directional |
| `clones` | clones | is cloned by | directional |
| `duplicates` | duplicates | is duplicated by | directional |
| `relates_to` | relates to | relates to | symmetric; declare both directions |
| `causes` | causes | is caused by | directional |

Relationships may target Epics or executable work, must resolve to an existing ID, and may not target the source itself. Do not introduce a cycle through `blocks`. Active records may not relate to archived records; preserve those historical relationships after the active side is archived.

## Ranking, subtasks, and claims

- The ordered list under `## Global executable-work rank` in the root index is the sole global rank. It contains every active `WORK-NNN` exactly once, across Epic and standalone work. Epics are not ranked. Reorder only with project-owner approval.
- Checklist subtasks are local execution steps, not separate records. During an Epic, retain focused-check evidence in the execution ledger and batch supported child/Epic checklist updates into the final acceptance transaction. A standalone workflow may do the same. Every subtask must have evidence before `done`; never create per-subtask backlog commits.
- Each in-progress work item has a non-empty claim naming the shared acceptance session/integration branch and a future ISO 8601 `claim_expires`. Epics have no claim fields. Release or renew before expiry; every other work-item status uses `none`.

## Cancellation and archival

- A cancelled record has a concrete `cancelled_reason`; all other statuses use `cancelled_reason: none`.
- Move done/cancelled standalone work to `archive/standalone/` and remove it from global rank.
- Archive an Epic atomically by moving its whole directory to `archive/epics/`. The Epic and every child must already be `done` or `cancelled`; no child may remain active or outside that directory.
- Active records may not link or relate to archived records. Archived records may retain links among archived records and wiki references for history.
- Active `wiki_refs` must resolve. Archived records may retain a missing historical wiki path after an approved concept deletion; validation reports it as a warning.
