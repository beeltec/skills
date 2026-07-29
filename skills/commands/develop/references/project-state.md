# Project State

Load when reading or mutating a governed wiki/backlog, publishing accepted knowledge, or changing record lifecycle. Project-local maintenance and templates are authoritative.

## Ownership

- `docs/wiki`: durable accepted primary-branch facts, behavior, rules, runbooks, terminology, guidance, and decisions.
- `docs/backlog`: desired deltas, proposal evidence, priority, relationships, claims, execution evidence, and history.
- work branch: unaccepted implementation and conditional reconciliation drafts.
- `docs/tasks`: forbidden; never create, inspect, or depend on it.

Read progressively from root indexes. Require the complete scaffold only for mutations that depend on it; read-only work may report missing/invalid pieces. Run `node scripts/validate-project.mjs` before and after governed mutations.

## Backlog

Use immutable independent sequences `EPIC-NNN` and `WORK-NNN`; never reuse archived IDs. Every active unfinished executable item appears exactly once in the global rank; Epics never do. Parent plus physical placement defines membership. Relationships are directional except symmetric `relates_to`; reject missing targets, duplicates, self-links, active/archive links, and blocking cycles.

Actionability is calculated: `ready`, ranked, unclaimed by another live executor, and no nonterminal inward blocker. Never add a blocked status.

Execution uses one start transaction and one final transaction. A standalone item has one claim. An Epic moves itself and required children to `in-progress`, claims children to one session/branch, keeps them provisional, then completes and archives all retained children and the Epic atomically. Incomplete evidence forbids `done`.

For walk-back, cancellation, or archival:

- `ready -> proposed` requires owner approval and a recorded reason; release claims first and preserve rank/evidence.
- Epic walk-back/cancellation requires an explicit disposition for every child.
- Cancellation requires rationale, relationship effects, and rank removal; never infer bulk cancellation.
- Archive terminal standalone items immediately. Keep terminal children inside an active Epic; archive the complete terminal Epic directory atomically. Update indexes and remove terminal ranks in the same transaction.

## Accepted Knowledge

Include only claims already true and accepted on primary. Reject proposals, target architecture, planned migrations, work-branch behavior, active checklists, and unresolved claims. Verify discoverable facts; owner approval accepts meaning but does not prove future state.

Update the existing canonical concept or create the narrowest cohesive owner under architecture, engineering, domains, or operations. Keep one canonical statement and link instead of duplicating it. Read [okf-spec.md](okf-spec.md) before structural concept operations or when format semantics are uncertain.

Every semantic transaction needs exact approved meaning unless the invocation already carries standing approval for those confirmed additive/corrective facts. An explicit `knowledge` or `to-wiki` publication request authorizes the exact additive/corrective transaction and its local commit. Deprecation, deletion, ADR supersession, and meaning-changing reorganization require per-item approval outside explicit autonomy. Repair indexes, inbound links, metadata, and the newest-first log in the same transaction.

## Decisions

Draft proposed significant decisions on the backlog record. Publish one ADR only after the decision is in force, allocating `ADR-NNN` at publication. Never delete a replaced ADR; supersede it in place with both directions linked. An active backlog reference affected by a wiki move/deletion requires a separate backlog transaction first.

During implementation, draft the exact conditional wiki transaction after review and verification, mutate nothing on the work branch, then reverify and publish on primary. Changed meaning requires renewed approval.

## Transactions

Apply one coherent logical transaction across records, reciprocal links, indexes, rank, metadata, and log. Stage narrow paths, preserve unknown metadata and unrelated edits, validate, and inspect staged diff/status. Default to `docs(wiki): <summary>` for wiki transactions and `docs(backlog): <summary>` for backlog transactions unless the repository requires another convention. A failed transaction never becomes terminal; keep earlier valid commits intact and report the recovery point.
