# 008 — Publish and verify the redesigned workflow

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Publish a coherent public skill catalog and workflow for the
new project-state/backlog model, remove obsolete guidance, and verify discovery,
installation, setup, planning, review, and execution handoffs end to end.

**Blocked by:** [002 — Upgrade existing project setups safely](002-upgrade-existing-projects.md), [003 — Manage the complete backlog lifecycle](003-manage-backlog-lifecycle.md), [004 — Route discussion and research by knowledge state](004-route-planning-knowledge.md), [005 — Review changes against wiki and backlog authority](005-review-wiki-backlog-authority.md), [006 — Execute work items and Epics through completion](006-execute-backlog-work.md), [007 — Orchestrate backlog execution with subagents](007-orchestrate-backlog-subagents.md).

**Status:** ready-for-agent

## Subtasks

- [x] Update the README skill count and catalog rows to list the actual canonical skills after replacing setup and task planning.
- [x] Rewrite the development workflow around `setup-project`, state-aware discussion handoffs, proposal research, `backlog`, direct or subagent implementation, and two-axis review.
- [x] Replace all `docs/tasks` and `000-overview.md` invocation examples with Epic or work-item identifiers and paths.
- [x] Regenerate or replace the development workflow diagram so it matches the documented skills and contains no removed handoff or task-plan stages.
- [x] Verify every canonical skill directory, frontmatter name, UI metadata name, and `.agents/skills` relative symlink agrees.
- [x] Remove `setup-wiki` and `to-tasks` catalog entries and symlinks without modifying unrelated dangling or user-owned artifacts.
- [ ] Search all active documentation, metadata, and skills for stale `$setup-wiki`, `$to-tasks`, `validate-wiki.mjs`, `wiki:check`, and current-workflow `docs/tasks` references.
- [ ] Permit old names only in explicit setup-upgrade compatibility code and fixtures, clearly labeled as legacy behavior.
- [ ] Run installer and validator fixture suites, existing repository tests, and representative backlog, research, review, implement, and subagent smoke scenarios.
- [ ] Run `npx skills add . --list` and verify the expected public names and descriptions are discoverable.
- [ ] Check tracked skill symlink integrity and report the unrelated pre-existing dangling symlink separately rather than silently fixing it in this work.
- [ ] Perform a final diff review for accidental compatibility layers, duplicated authorities, stale status vocabulary, and disagreement between README and skill contracts.

## Acceptance criteria

- [ ] Public documentation presents one coherent path from project setup through current-state knowledge, desired backlog work, research, implementation, review, reconciliation, and archive.
- [ ] `setup-project` and `backlog` are discoverable; `setup-wiki` and `to-tasks` are not.
- [ ] No active workflow documentation treats the wiki as the owner of unimplemented desired state or `docs/tasks` as a supported plan format.
- [ ] Automated setup, upgrade, validator, backlog, review, implementation, and orchestration checks pass.
- [ ] Remaining legacy-name occurrences are restricted to intentional migration tests or detection code, and unrelated repository defects are reported without scope creep.
