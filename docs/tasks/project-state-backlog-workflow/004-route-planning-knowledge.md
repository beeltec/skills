# 004 — Route discussion and research by knowledge state

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Adapt planning and research so accepted primary-branch facts
are documented in the wiki, desired changes and their proposal-specific evidence
remain in the backlog, and unresolved technical decisions prevent premature
readiness.

**Blocked by:** [001 — Initialize fresh projects with wiki and backlog governance](001-initialize-project-governance.md), [003 — Manage the complete backlog lifecycle](003-manage-backlog-lifecycle.md).

**Status:** ready-for-agent

## Subtasks

- [x] Update `discuss` to read the project wiki when present and preserve its one-question-at-a-time decision process.
- [x] Route a confirmed desired change to the `backlog` skill and route only already-current durable conclusions to `to-wiki`.
- [x] Prevent `discuss` from recommending unimplemented specifications for wiki publication.
- [x] Update `to-wiki` to require `setup-project`, reject proposed or unimplemented desired-state content, and keep active backlog state out of OKF concepts.
- [x] Update `to-wiki` to use the consolidated project validator and to link accepted current knowledge to relevant backlog history only when that improves traceability without duplicating it.
- [x] Adapt `research-tech-stack` to require a proposed Epic or work item and inspect its desired delta, repository evidence, and current wiki context.
- [x] Store proposal-specific sources, version findings, recommendations, uncertainty, and project deviations with the backlog record rather than under wiki technology guidance.
- [x] Make unresolved version-specific or security-sensitive research prevent the work item from satisfying the Definition of Ready.
- [x] Promote research conclusions to the wiki only when they become durable accepted guidance during implementation reconciliation.
- [x] Update research templates and UI metadata to describe the new pre-readiness output and remove task-plan sequencing language.
- [x] Update conventional-branch authorization so `setup-project`, `backlog`, `discuss`, `to-wiki`, and research stay on the user-selected branch while implementation workflows may create work branches.
- [x] Run static searches and representative planning smoke tests to verify each handoff chooses the correct knowledge owner.

## Acceptance criteria

- [ ] A discussion about desired behavior ends with a backlog handoff, while a correction to accepted current knowledge can end with `to-wiki`.
- [ ] Proposal-specific technical research is attached to its backlog work and can block readiness until uncertainty is resolved.
- [ ] The wiki is not used as a second copy of an unimplemented target specification.
- [ ] All affected skills use `setup-project` and `validate-project.mjs` terminology and remain on the current branch during planning.
