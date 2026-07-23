# 006 — Execute work items and Epics through completion

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Adapt `implement` to execute either one ready work item or a
whole Epic while preserving per-item gates from claim through primary-branch
integration, wiki reconciliation, completion, and archival.

**Blocked by:** [002 — Upgrade existing project setups safely](002-upgrade-existing-projects.md), [003 — Manage the complete backlog lifecycle](003-manage-backlog-lifecycle.md), [005 — Review changes against wiki and backlog authority](005-review-wiki-backlog-authority.md).

**Status:** completed

## Subtasks

- [x] Update `implement` metadata and inputs to accept an explicit ready work item, an Epic, or an unambiguous selection established by the conversation.
- [x] Read project instructions, backlog maintenance, the complete selected records, linked wiki concepts, relationships, proposal research, and repository evidence before editing.
- [x] Reject proposed, cancelled, done, malformed, claimed-by-another-executor, or blocked work before creating a branch.
- [x] For Epic scope, select the highest-ranked ready unblocked child while preserving per-work-item completion gates and dependency order.
- [x] Create one conventional work branch per invocation and record its human or agent execution claim and branch/session reference on each item when work begins.
- [x] Transition claimed work to `in-progress` through validated backlog mutations without changing approved scope or rank.
- [x] Work through comprehensive checklist subtasks while committing coherent independently green increments rather than forcing one commit per checkbox.
- [x] Run targeted typechecks and tests throughout and the full applicable suite at the end.
- [x] Invoke the backlog-aware `code-review` for each work item, address findings, and repeat review until both axes pass or a blocker is reported.
- [x] Verify every work-item acceptance criterion with concrete evidence before preparing completion.
- [x] Reconcile durable accepted conclusions into the wiki before completion when project knowledge changed, while leaving temporary execution and proposal history in the backlog.
- [x] Run the consolidated project validator after backlog and wiki reconciliation.
- [x] Ensure the completion transaction represents primary-branch acceptance, clears the execution claim, marks the item done, removes it from active rank, and applies the agreed standalone or Epic archival behavior.
- [x] For Epic scope, repeat the gated item flow and mark the Epic done only after all required children are closed, Epic success measures pass, and current wiki knowledge is reconciled.
- [x] Preserve cancellation and out-of-scope decisions for owner approval instead of changing desired scope autonomously.
- [x] Merge completed work with a merge commit, return to the primary branch, and delete the local work branch only after all authorized scope is green and integrated.
- [x] Add scenario tests or dry-run fixtures for a standalone item, a dependency-linked Epic, blocked and conflicting claims, review failure, wiki reconciliation, completion, and archival.

## Acceptance criteria

- [x] A ready standalone work item can move through claim, implementation, review, validation, primary-branch integration, completion, and archive with consistent records.
- [x] An Epic invocation completes children in actionable rank order but never skips per-work-item acceptance, review, and reconciliation gates.
- [x] Commits correspond to coherent green increments and checklist state remains accurate.
- [x] No item is marked done before its outcome is verified, durable knowledge is reconciled, validation passes, and primary-branch acceptance is established.
- [x] Concurrent claims, blockers, or required owner decisions stop safely without corrupting backlog state.
