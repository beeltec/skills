# Lifecycle exits

Procedures for walk-back, cancellation, and archival transactions. Read this file only when the approved transaction is one of these.

## Walking Back To Proposed

`ready -> proposed` reverses an approved readiness decision and always requires explicit owner approval and a concrete reason (scope change, stale research or decisions, invalidated approach) recorded in `## Execution`. Refuse while the item is `in-progress` or any claim field is set — release to `ready` first. Preserve research, decisions, criteria, subtasks, and evidence as-is, and keep the rank position; rank removal is reserved for terminal transitions.

Before walking back an Epic, enumerate every non-`proposed` child and obtain an explicit disposition for each: walk it back too, leave it `ready`, or cancel it with its own rationale. Never infer bulk child walk-back. Warn that a child left `ready` remains individually executable.

After the transaction, recommend the re-entry command the reason implies (`/research`, `/to-backlog WORK-NNN`, or `/to-epic EPIC-NNN`) via `Next step:`.

## Cancellation

Cancellation always requires explicit owner approval and a concrete `cancelled_reason`. Present the rationale, relationship changes, rank removal, archive destination, and downstream effects together.

For duplication, point `duplicates` from the cancelled record to the survivor. For replacement or supersession, identify the replacing record with an applicable supported relationship and explain it in the cancellation rationale or Relationships section — never invent schema fields. Preserve other approved links when archival rules allow.

Before cancelling an Epic, enumerate every unfinished child and obtain an explicit disposition for each: complete it, cancel it with its own rationale, or reparent it through a separately approved parent/scope transaction. Never infer bulk child cancellation from Epic-cancellation approval.

## Archival

Archive terminal records promptly, updating all affected indexes and links in the same transaction:

- move a terminal standalone record to `archive/standalone/` immediately;
- leave a terminal child in its active Epic directory (removed from global rank) until the Epic is terminal;
- archive an Epic only by moving its entire directory to `archive/epics/` atomically after every retained child is done or cancelled;
- remove active index entries, add archive index entries, and reject any active link to the newly archived records.

Never split an Epic archive across commits or leave a terminal Epic active. Preserve IDs and historical relationships; never reuse archived IDs.
