# Planning

Load for desired-state decomposition, backlog intake/refinement, proposal research, or a named non-ready record. Read `project-state.md` when mutating records and `evidence-guidance.md` when external evidence applies.

## Select The Shape

- Use an Epic only for one coordinated outcome with multiple coherent, independently valuable work items, shared acceptance, or ordering. A single outcome stays standalone.
- Use a Story for stakeholder-visible behavior, a Task for a bounded engineering/operational result, and a Bug for observed failure against accepted behavior.
- Slice vertically into the smallest independently implementable and verifiable outcomes. Avoid layer tasks and agent-sized busywork.
- Reuse an existing matching `proposed` record. Never duplicate it.

## Authority

An explicit request to plan a named outcome, or bare selection of one `proposed` record, authorizes its non-destructive intake/refinement, relationship updates, rank placement, evidence edits, and transition to `ready`; bare selection stops there. Present and ask before cancellation, destructive lifecycle changes, material scope not carried by the request, rule replacement, or accepted-knowledge mutation. Planning intent alone never authorizes implementation.

## Procedure

1. Read project instructions, backlog/wiki maintenance, type templates, relevant accepted knowledge, related records, active/archive indexes, IDs, and global rank. Validate the baseline before mutation.
2. Establish outcome, criteria, exclusions, provenance, parent, relationships, rank, and unresolved decisions. For an Epic, establish child scope and a provisional serial graph covering dependencies, shared contracts/files, conflict domains, and live-code revalidation.
3. Inventory only technologies and standards touched by the delta. Inspect before asking. Run proposal research when version, security, privacy, accessibility, protocol, regulatory, or unresolved technical evidence materially affects readiness. Record `not-needed` with inspected evidence when none applies.
4. Research at installed versions using opened authoritative sources and live registry/release evidence. Keep proposal findings on the record. Never absorb unrelated upgrades.
5. Apply the project's Definition of Ready. Resolve significant decisions as ADR-shaped drafts naming superseded ADRs, or record `none` with the test reason. Allocate no ADR ID before acceptance.
6. Plan minimal verification: real-path smoke proof first, existing coverage next, and one durable test only for an uncovered observable contract. Prefer acceptance-critical E2E, then integration/contract, then unit proof for otherwise impractical edges.
7. Validate each coherent transaction, inspect narrow diffs, and commit only when project rules or the request authorize planning commits. Leave blocked records `proposed` with exact blockers; never force readiness.

## Proposal Research State

- `complete`: all applicable version-specific and security-sensitive questions resolved, with source/review dates and one live resolution row per technology.
- `not-needed`: inspected evidence proves no external research applies.
- `pending`: unavailable sources, ambiguous applicability, conflicts, or open security-sensitive questions remain; this blocks readiness.

Use `assets/backlog-research.md` when drafting a governed record's Research section.

## Result

Report IDs, types, rank, research, decisions, evidence, validation, and blockers. Stop at ready when the request was planning-only. Continue to `execution.md` only when the original request also asked to build, implement, ship, or run end to end.
