---
name: setup-project
description: Initialize or safely upgrade a project with an accepted-state OKF wiki and a tracked desired-change backlog. Use when creating or migrating project governance, templates, validation, managed CI, and agent instructions.
disable-model-invocation: true
---

# Setup Project

Initialize or upgrade a project with two governed, tracked systems without overwriting project-owned files: an OKF wiki for accepted primary-branch state and a backlog for desired deltas and execution state.

Stay on the user's current Git branch. Never create or switch branches while scaffolding, configuring, or populating the wiki, including when the current branch is not the primary branch.

## Workflow

1. Inspect the project root, `AGENTS.md`, `CLAUDE.md`, `package.json`, existing product documentation and code, and any `docs/wiki` or `docs/backlog` content. Read applicable repository instructions first. Do not create, inspect, validate, move, or modify `docs/tasks`.
2. Derive a concise set of candidate product and domain terms from that evidence. For each term, propose a canonical name, precise definition, applicable context, and preferred or forbidden synonyms when ambiguity exists. Exclude generic technical vocabulary; keep project-specific technical knowledge in architecture or engineering concepts.
3. Review the complete candidate set with the user as project owner. Apply their corrections, then ask for explicit agreement on the complete revised set. Keep unapproved candidates in the conversation only. Do not write them to the wiki. If the evidence yields no terms, say so and leave the scaffolded terminology document empty.
4. Run the installer from this skill directory:

   ```sh
   python3 scripts/setup_project.py --root /absolute/path/to/project
   ```

   Use `--instructions agents`, `claude`, or `both` only when the default `auto` selection is unsuitable. Use `--no-package-script` when package.json must not be changed.
5. Review every `kept`, `skipped`, and manual-action result. Existing wiki and backlog pages are never overwritten. The installer upgrades only recognized managed instruction blocks, an installer-owned validator or package script, and compatible managed CI integrations; custom collisions are preserved for manual reconciliation.
6. Add only the explicitly agreed terms to `docs/wiki/domains/ubiquitous-language.md`. Preserve existing agreed terms unless the project owner explicitly agrees to revise them. Format each entry with its canonical term, definition, and context. Add preferred or forbidden synonyms only when relevant; examples, counterexamples, rationale, and code references are optional.
7. Replace generic orientation text and empty wiki indexes with concise, project-specific descriptions. Preserve durable accepted knowledge and record project-specific wiki changes in `docs/wiki/log.md`. Leave the empty backlog scaffold unchanged until the project owner approves proposed work.
8. Run validation:

   ```sh
   node scripts/validate-project.mjs
   ```

   Run the package-script equivalent when the installer reports that it added one.
9. Review the resulting diff, local links, backlog scaffold, agent-instruction block, and wiki log before handing off. Run setup a second time and confirm it changes no bytes.

## Structure rules

- Keep `docs/wiki/index.md` as the small routing entry point. Link immediate concepts and child directories with one-sentence descriptions.
- Give every directory containing wiki Markdown its own `index.md`.
- Keep `log.md` newest-first with ISO 8601 `YYYY-MM-DD` headings.
- Give every non-reserved Markdown file parseable frontmatter with non-empty `type`, `title`, `description`, `timestamp`, and `status`.
- Use standard Markdown links. Prefer bundle-relative `/path.md` links inside the wiki.
- Organize concepts by durable responsibility or domain, not by the agent, task, or session that created them.
- Keep one canonical owner for each rule or fact; other pages link to it.
- Treat `docs/wiki/domains/ubiquitous-language.md` as the canonical agreement between the project owner and developers about product and domain language. Do not add lifecycle states or agent signatures. Agents acknowledge the agreement by reading, challenging inconsistencies, and using its terms.
- Keep transient task state outside the durable wiki.

## Backlog rules

- Read `docs/backlog/maintenance.md` before creating or changing backlog records. It is canonical for hierarchy, statuses, readiness, relationships, ranking, claims, cancellation, and archival.
- Keep desired deltas in the backlog until completed outcomes are accepted into the wiki.
- Require explicit project-owner approval before moving executable work to `ready`, changing global rank, cancelling work, or changing accepted wiki state.
- Use immutable global `EPIC-NNN` IDs for Epics and `WORK-NNN` IDs for peer Story, Task, and Bug records.
- Keep every active executable item exactly once in the root global rank. Use checklist subtasks for local execution steps and temporary claims for in-progress coordination.
- Archive standalone terminal work promptly. Archive an Epic and all children together only when every record is terminal.

## Length and splitting rules

- Target at most 350 lines per concept page. At this threshold, review whether the page still represents one cohesive concept.
- Never exceed 500 lines in a concept page. The installed validator treats this as an error. Reserved `index.md` and `log.md` files are exempt but should stay concise.
- Split before 350 lines when sections have different owners, audiences, lifecycles, source sets, or concept types; when a section is independently reusable; or when readers commonly need one section without the others.
- Keep a cohesive runbook or reference intact below the hard limit when splitting would force readers to jump between files during one task.
- When splitting, create focused sibling or child concepts, add the nearest directory index entries, replace duplicated prose with links, repair inbound links, and record the change in `log.md`.

## Installed resources

- `scripts/setup_project.py` creates missing assets, updates managed agent instructions, and optionally adds a non-conflicting package script without touching lockfiles.
- `.setup-project.json` records the installer version and hashes or locations of managed validators, instructions, package scripts, and CI assets for safe future upgrades.
- Compatible GitHub Actions projects receive a standalone managed workflow. GitLab projects receive a standalone job only when `.gitlab-ci.yml` has no include or one simple block-list include; unsupported CI is reported without changing its configuration.
- `assets/wiki/` contains the generic accepted-state OKF bundle templates.
- `assets/backlog/` contains desired-change governance, indexes, archives, and type-specific templates.
- `assets/validate-project.mjs` reports wiki and backlog validation separately and enforces their structural and lifecycle contracts.
- `assets/agent-instructions.md` is the managed instruction block installed in `AGENTS.md` and/or `CLAUDE.md`.
