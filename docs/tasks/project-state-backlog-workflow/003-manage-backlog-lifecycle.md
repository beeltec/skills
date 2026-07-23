# 003 — Manage the complete backlog lifecycle

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Add a broad `backlog` planning skill that manages approved
desired work from lightweight intake through refinement, ranking, execution
state, cancellation, and archival, and remove the obsolete `to-tasks` skill.

**Blocked by:** [001 — Initialize fresh projects with wiki and backlog governance](001-initialize-project-governance.md).

**Status:** completed

## Subtasks

- [x] Create the canonical planning skill, matching `backlog` directory, frontmatter name, UI metadata, and relative cross-client symlink.
- [x] Require a valid `setup-project` scaffold and read wiki indexes, backlog maintenance, active rank, related records, and applicable repository instructions before mutation.
- [x] Support lightweight proposed Epic and work-item intake with immutable IDs, type, title, problem or desired delta, and provenance.
- [x] Require explicit user approval before creating records or changing scope, acceptance criteria, rank, cancellation, parentage, or relationship links.
- [x] Support refinement of Stories, Tasks, and Bugs with their distinct outcome templates and outcome-oriented slicing rules.
- [x] Enforce the strict Definition of Ready before presenting a proposed transition for user approval.
- [x] Maintain one authoritative global rank of all unfinished executable work, placing new proposed work at an explicitly approved position.
- [x] Support standalone work items without manufacturing single-item Epics.
- [x] Manage parent and Jira-style links consistently in both directions where the schema requires reciprocal representation.
- [x] Calculate actionability from `ready` status and unresolved blocking links rather than adding a separate blocked status.
- [x] Allow gate-backed agents to set and clear temporary execution claims and update checklists and normal execution statuses without repeated scope approval.
- [x] Require cancellation rationale and appropriate duplicate, replacement, or superseding links when applicable.
- [x] Require explicit disposition of every unfinished child before cancelling an Epic.
- [x] Remove done children from active rank while retaining them with an active Epic; archive a completed or cancelled Epic directory atomically and archive standalone records immediately.
- [x] Run project validation after every mutation, stage only backlog changes, and create a concise Conventional Commit for approved durable transactions.
- [x] Remove the canonical `to-tasks` skill and its symlink immediately without adding compatibility behavior or migrating `docs/tasks`.
- [x] Add focused fixtures or smoke tests for intake, readiness, rank changes, graph links, claims, cancellation, and archive transitions.

## Acceptance criteria

- [x] The `backlog` skill can create and refine an approved Epic with typed child work items and a standalone item while preserving global IDs and rank.
- [x] Invalid readiness, hierarchy, relationship, cancellation, and archive transitions are rejected before files are committed.
- [x] Approval boundaries distinguish owner-controlled scope and priority changes from gate-backed execution bookkeeping.
- [x] Backlog mutations validate and commit only intended tracked records.
- [x] `to-tasks` is no longer discoverable and no backlog behavior depends on `docs/tasks`.
