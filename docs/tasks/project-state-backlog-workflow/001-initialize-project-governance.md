# 001 — Initialize fresh projects with wiki and backlog governance

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Replace the wiki-only setup with a consolidated
`setup-project` skill that initializes a fresh project with an accepted-state
wiki, a tracked desired-change backlog, project-local governance, agent
instructions, and one executable validation command.

**Blocked by:** None — can start immediately.

**Status:** completed

## Subtasks

- [x] Rename the canonical `setup-wiki` skill directory, frontmatter, UI metadata, scripts, assets, and cross-client symlink to `setup-project` without retaining a second public setup skill.
- [x] Preserve the existing OKF wiki structure and its ownership of accepted primary-branch knowledge.
- [x] Define the tracked `docs/backlog` scaffold with a root ranked index, `maintenance.md`, Epic-centered directories, a standalone-work area, and an archive area that can exist in a fresh Git repository.
- [x] Document in backlog maintenance that the backlog owns desired deltas while the wiki owns accepted current state.
- [x] Define immutable global `EPIC-NNN` and `WORK-NNN` identifiers and peer Story, Task, and Bug work-item types below Epics.
- [x] Define `proposed`, `ready`, `in-progress`, `done`, and `cancelled` statuses with distinct Epic and executable-work transition rules.
- [x] Define lightweight proposed-item requirements and the strict Definition of Ready agreed in the discussion.
- [x] Define Jira-style parent, blocks, clones, duplicates, relates-to, and causes relationships with directional inward/outward semantics where applicable.
- [x] Define global executable-work ranking, checklist subtasks, temporary execution claims, cancellation rationale, and atomic Epic archival rules.
- [x] Provide distinct Markdown/frontmatter templates for Epics, Stories, Tasks, and Bugs, including outcome/delta, acceptance, relationship, wiki-reference, research, and execution sections as applicable.
- [x] Replace the installed wiki validator with one dependency-free `scripts/validate-project.mjs` entry point that runs separately reported wiki and backlog checks.
- [x] Preserve existing wiki checks while enforcing required wiki roots, safe local links, metadata, indexes, status values, and documented length limits.
- [x] Validate backlog IDs, types, statuses, parent rules, relationships, missing references, blocking cycles, global rank coverage, readiness fields, claims, checklists, archive placement, and active-to-archived link rules.
- [x] Install a non-conflicting package command for the project validator when a compatible `package.json` exists, without changing lockfiles.
- [x] Install managed agent instructions that explain the wiki/backlog boundary, required reading, approval rules, and the single project validation command.
- [x] Add dependency-free fixture tests for a fresh install, valid wiki/backlog content, malformed backlog graphs and records, and a byte-for-byte no-op second setup run.
- [x] Run the fresh-project installer tests and validate the generated project with the installed command.

## Acceptance criteria

- [x] The public setup skill is named only `setup-project`; fresh setup creates both governed knowledge systems without creating or inspecting `docs/tasks`.
- [x] A fresh generated project clearly separates accepted primary-branch state in `docs/wiki` from tracked desired changes in `docs/backlog`.
- [x] The installed templates and maintenance rules represent every agreed hierarchy, lifecycle, relationship, readiness, ranking, claim, and archive rule.
- [x] `node scripts/validate-project.mjs` passes for the generated scaffold and fails with actionable errors for representative invalid wiki and backlog fixtures.
- [x] Running fresh setup twice leaves the generated project unchanged on the second run.
