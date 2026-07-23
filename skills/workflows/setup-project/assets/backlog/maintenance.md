# Backlog maintenance

`docs/backlog` is the tracked system of record for desired project deltas and their execution state. `docs/wiki` is the canonical record of accepted current state on the primary branch. A completed backlog item does not redefine current state by itself: update the owning wiki concepts when the outcome is accepted, then archive the backlog records.

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
- `ready -> in-progress` when execution of a child begins.
- `in-progress -> done` only when every child is `done` or `cancelled`, Epic acceptance is satisfied, accepted-state wiki updates are complete, and the entire Epic is archived atomically.
- `proposed`, `ready`, or `in-progress -> cancelled` only with a recorded cancellation rationale. Cancel or complete every child and archive the entire Epic atomically.

Executable-work transitions are:

- `proposed -> ready` only after the Definition of Ready is met and the project owner approves execution.
- `ready -> in-progress` only when an agent records a temporary execution claim.
- `in-progress -> done` only when acceptance and checklist subtasks are complete and applicable wiki updates are made.
- `in-progress -> ready` when a claim is released without completion.
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
- `## Execution` states an actionable approach, verification commands, and explicit project-owner approval.
- Checklist subtasks under `## Subtasks` are small enough to complete and verify coherently. Use `No subtasks.` when decomposition adds no value.
- The item is present exactly once in the root global rank.

Proposal-specific research remains with the backlog record. During implementation reconciliation, promote only guidance that became durable accepted current state to its canonical wiki concept; summarize it there instead of copying the proposal evidence.

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
- Checklist subtasks are local execution steps, not separate backlog records. Keep them in `## Subtasks`; all must be checked before `done`.
- An in-progress work item has a non-empty `claim` naming the agent/session and an ISO 8601 `claim_expires` in the future. Claims are coordination leases, not ownership. Release or renew before expiry. Every other status uses `claim: none` and `claim_expires: none`.

## Cancellation and archival

- A cancelled record has a concrete `cancelled_reason`; all other statuses use `cancelled_reason: none`.
- Move done/cancelled standalone work to `archive/standalone/` and remove it from global rank.
- Archive an Epic atomically by moving its whole directory to `archive/epics/`. The Epic and every child must already be `done` or `cancelled`; no child may remain active or outside that directory.
- Active records may not link or relate to archived records. Archived records may retain links among archived records and wiki references for history.
