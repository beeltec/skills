---
id: WORK-002
type: task
title: Add a formatBytes helper
status: proposed
parent: none
outcome: The library exports formatBytes(size: number): string returning a human-readable size with a binary unit (B, KiB, MiB, GiB) and one decimal place; negative sizes throw a RangeError.
wiki_refs: [none]
research: pending
decisions: pending
blocks: []
clones: []
duplicates: []
relates_to: []
causes: []
claim: none
claim_expires: none
cancelled_reason: none
---

# WORK-002: Add a formatBytes helper

## Outcome / delta

The library exports `formatBytes(size: number): string`, returning a human-readable size with a binary unit (B, KiB, MiB, GiB) and one decimal place; negative sizes throw a `RangeError`. Placement in the source tree, README treatment, and edge-case detail beyond the stated contract are unresolved and left to refinement.

## Acceptance criteria

- [ ] To be refined; the outcome above is the owner-approved contract.

## Relationships

Standalone (`parent: none`); all relationship arrays are empty per the owner's intake request.

## Wiki references

`none` — relevant accepted-state pages will be identified during refinement.

## Research

`pending` — not yet performed; this record was taken in as a lightweight proposal without research per the owner's instruction.

## Decisions

`pending` — the ADR significance test has not yet been applied.

## Execution

No approach or verification yet; the item is `proposed` and, per the owner's intake instruction, must not be refined or moved toward `ready` without a further owner-approved transaction.

## Provenance

Project-owner request (cbeelte@markveys.com) in the skills-testbed fixture regeneration conversation, 2026-07-27. The owner approved exactly this record and its placement at the last position of the global executable-work rank, and directed that it remain `status: proposed` with no refinement or research.

## Subtasks

No subtasks.
