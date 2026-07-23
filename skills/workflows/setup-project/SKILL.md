---
name: setup-project
description: Initialize or safely upgrade a project with an accepted-state OKF wiki and a tracked desired-change backlog. Use when creating or migrating project governance, templates, validation, managed CI, and agent instructions.
disable-model-invocation: true
---

# Setup Project

Initialize or upgrade two governed, tracked systems without overwriting project-owned files: an OKF wiki for accepted primary-branch state and a backlog for desired deltas and execution state.

Stay on the user's current Git branch — never create or switch branches while scaffolding, configuring, or populating the wiki, even off the primary branch.

## Workflow

1. Inspect the project root, `AGENTS.md`, `CLAUDE.md`, `package.json`, existing product documentation and code, and any `docs/wiki` or `docs/backlog` content. Read applicable repository instructions first. Never create, inspect, validate, move, or modify `docs/tasks`.
2. Derive candidate product and domain terms from that evidence: for each, a canonical name, precise definition, applicable context, and preferred or forbidden synonyms where ambiguity exists. Exclude generic technical vocabulary; project-specific technical knowledge belongs in architecture or engineering concepts.
3. Review the complete candidate set with the project owner, apply corrections, and get explicit agreement on the complete revised set. Unapproved candidates stay in the conversation — never in the wiki. If evidence yields no terms, say so and leave the scaffolded terminology document empty.
4. Run the installer from this skill directory:

   ```sh
   python3 scripts/setup_project.py --root /absolute/path/to/project
   ```

   Use `--instructions agents|claude|both` only when the default `auto` is unsuitable; `--no-package-script` when package.json must not change. When the installer creates a new `AGENTS.md` and no `CLAUDE.md` exists, it also creates `CLAUDE.md` as a symlink to `AGENTS.md`.
5. Review every `kept`, `skipped`, and manual-action result. Existing wiki and backlog pages are never overwritten; the installer upgrades only recognized managed instruction blocks and the installer-owned package script, and adds compatible managed CI integrations. Any file that differs from its installed asset is preserved for manual reconciliation.
6. Add only the explicitly agreed terms to `docs/wiki/domains/ubiquitous-language.md` (canonical term, definition, context; synonyms only when relevant; examples, counterexamples, rationale, and code references optional). Preserve existing agreed terms unless the owner explicitly agrees to revise them.
7. Replace generic orientation text and empty wiki indexes with concise, project-specific descriptions. Preserve durable accepted knowledge; record project-specific wiki changes in `docs/wiki/log.md`. Leave the empty backlog scaffold unchanged until the owner approves proposed work.
8. Run `node scripts/validate-project.mjs` (and the package-script equivalent when the installer added one).
9. Review the diff, local links, backlog scaffold, agent-instruction block, and wiki log. Run setup a second time and confirm it changes no bytes.

## Structure rules

- `docs/wiki/index.md` stays a small routing entry point: immediate concepts and child directories with one-sentence descriptions. Every directory containing wiki Markdown gets its own `index.md`.
- `log.md` is newest-first with ISO 8601 `YYYY-MM-DD` headings.
- Every non-reserved Markdown file has parseable frontmatter with non-empty `type`, `title`, `description`, `timestamp`, and `status`.
- Use standard Markdown links; prefer bundle-relative `/path.md` links inside the wiki.
- Organize by durable responsibility or domain, never by the agent, task, or session that created content. One canonical owner per rule or fact; other pages link to it.
- `docs/wiki/domains/ubiquitous-language.md` is the canonical language agreement between owner and developers — no lifecycle states or agent signatures. Agents acknowledge it by reading, challenging inconsistencies, and using its terms.
- Keep transient task state out of the durable wiki.

## Backlog rules

- Read `docs/backlog/maintenance.md` before creating or changing records — it is canonical for hierarchy, statuses, readiness, relationships, ranking, claims, cancellation, and archival.
- Desired deltas stay in the backlog until completed outcomes are accepted into the wiki. Use `$wiki` for accepted-knowledge operations.
- Explicit project-owner approval is required before moving work to `ready`, changing global rank, cancelling work, or changing accepted wiki meaning.
- Immutable global `EPIC-NNN` IDs for Epics; `WORK-NNN` for peer Story, Task, and Bug records.
- Every active executable item appears exactly once in the root global rank. Checklist subtasks for local steps; temporary claims for in-progress coordination.
- Archive standalone terminal work promptly; archive an Epic and all children together only when every record is terminal.

## Length and splitting rules

- Target at most 350 lines per concept page; at that threshold, review whether it is still one cohesive concept. Never exceed 500 (a validator error; reserved `index.md` and `log.md` are exempt but stay concise).
- Split before 350 lines when sections have different owners, audiences, lifecycles, source sets, or concept types, when a section is independently reusable, or when readers commonly need one section alone. Keep a cohesive runbook or reference intact below the hard limit when splitting would force jumping between files during one task.
- When splitting: create focused sibling or child concepts, add nearest index entries, replace duplicated prose with links, repair inbound links, record the change in `log.md`.

## Installed resources

- `scripts/setup_project.py` — creates missing assets, updates managed agent instructions, and optionally adds a non-conflicting package script without touching lockfiles. It removes a leftover `.setup-project.json` manifest from earlier installer versions.
- CI: compatible GitHub Actions projects get a standalone managed workflow; GitLab projects get a standalone job only when `.gitlab-ci.yml` has no include or one simple block-list include. Unsupported CI is reported, not changed.
- `assets/wiki/` — generic accepted-state OKF bundle templates. `assets/backlog/` — desired-change governance, indexes, archives, and type templates.
- `assets/validate-project.mjs` — reports wiki and backlog validation separately and enforces their structural and lifecycle contracts.
- `assets/agent-instructions.md` — the managed instruction block installed in `AGENTS.md` and/or `CLAUDE.md`.
