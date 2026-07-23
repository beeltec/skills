# 005 — Review changes against wiki and backlog authority

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Make `code-review` reliably review implementation against
the two agreed authorities: accepted wiki standards and the active work item's
desired delta and acceptance criteria, with relevant Epic context.

**Blocked by:** [001 — Initialize fresh projects with wiki and backlog governance](001-initialize-project-governance.md), [003 — Manage the complete backlog lifecycle](003-manage-backlog-lifecycle.md).

**Status:** ready-for-agent

## Subtasks

- [x] Update skill metadata and terminology from originating tasks or feature-matching wiki specs to backlog-backed work.
- [x] Keep fixed-point resolution, merge-base diffing, empty-diff handling, and parallel Standards and Spec axes intact.
- [x] Discover an explicitly supplied work item first, then an unambiguous active claim or branch-linked work item, and ask rather than guess when several candidates remain.
- [x] Read the complete work item, its Epic when present, linked current-state wiki concepts, and relevant proposal research before spawning review agents.
- [x] Treat applicable wiki engineering and architecture guidance plus repository standards as Standards-axis authority.
- [x] Treat the active work item's desired delta and acceptance criteria as primary Spec-axis authority, using Epic outcomes and constraints as context without replacing child scope.
- [x] Ensure current-state wiki facts do not mask missing desired behavior and backlog scope does not override explicit repository standards.
- [x] Update the Standards subagent prompt to cite wiki or repository rules and retain the documented smell baseline as heuristic guidance.
- [x] Update the Spec subagent prompt to cite work-item requirements and report missing behavior, incorrect behavior, and scope creep.
- [x] Preserve separate reporting and finding counts for Standards and Spec.
- [ ] Add representative smoke tests or fixtures for explicit item selection, claim-based discovery, Epic context, absent specs, ambiguity, and conflicting wiki/backlog evidence.

## Acceptance criteria

- [ ] Reviewing a backlog-backed change requires no feature-name wiki page and uses the correct work item as its specification.
- [ ] Standards findings cite accepted wiki or repository guidance; Spec findings cite the work item and relevant Epic constraints.
- [ ] Ambiguous or missing work-item context is surfaced to the user rather than guessed.
- [ ] Parallel review axes and their independent severity reporting remain intact.
