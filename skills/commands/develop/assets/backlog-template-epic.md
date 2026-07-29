---
id: EPIC-NNN
type: epic
title: Replace with an outcome-centered title
status: proposed
outcome: Replace with the measurable project outcome
decisions: pending
blocks: []
clones: []
duplicates: []
relates_to: []
causes: []
cancelled_reason: none
---

# EPIC-NNN: Outcome title

## Outcome

Describe the accepted-state change this Epic coordinates and why it matters.

## Acceptance criteria

- [ ] State a measurable Epic-level outcome.

## Scope

List initial child `WORK-NNN` records and explicit exclusions.

## Relationships

Explain non-empty relationship fields and their direction.

## Wiki references

Link accepted current-state concepts affected by this outcome.

## Research

Record proposal-specific affected technologies, repository and version evidence, findings, recommendations, uncertainty, project deviations, and labeled sources. Identify affected children whose research remains pending.

## Decisions

Draft each architecturally significant decision this outcome makes, in ADR shape — context, decision, alternatives considered and why each was rejected, consequences. Published as an ADR at primary-branch acceptance. Keep `decisions: pending` while any significant decision is unresolved; set `decisions: draft` once every qualifying decision is confirmed and drafted here; use `none` only after applying the significance test and stating why no decision qualifies. Identify affected children whose decisions remain pending.

## Execution

Record approval, sequencing, one fresh delegated composed acceptance-unit review, minimal verification, suite-evidence reuse, and archive coordination. Never prescribe child or remediation reviews. Run the smallest affected checks after stable increments, each applicable lint/typecheck once unless invalidated, and one representative suite after final-review remediation.

### Provisional serial execution graph

- **Dependencies:** child edges or `none`.
- **Shared contracts/files:** paths or interfaces shared by children, or `none`.
- **Conflict domains:** `domain -> owner child` mappings, or `none`.
- **Child order:** dependency-safe sequence with the reason for each edge.
- **Revalidation:** required against live code before execution.
