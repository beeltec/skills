---
name: setup-project
description: Initialize or safely upgrade a project with an accepted-state OKF wiki and a desired-change backlog; on brownfield repositories, back-fill a foundation wiki from code-verified facts. Use when creating or migrating project governance, templates, validation, managed CI, or agent instructions.
disable-model-invocation: true
---

# Setup Project

Initialize or upgrade two governed, tracked systems without overwriting project-owned files: an OKF wiki for accepted primary-branch state and a backlog for desired deltas and execution state.

Stay on the current branch — never create, switch, merge, or delete branches.

## Workflow

1. Inspect the project root, `AGENTS.md`, `CLAUDE.md`, `package.json`, existing product documentation and code, and any `docs/wiki` or `docs/backlog` content. Read applicable repository instructions first. Never create, inspect, validate, move, or modify `docs/tasks`.
2. Derive candidate product and domain terms from that evidence: for each, a canonical name, precise definition, applicable context, and preferred or forbidden synonyms where ambiguity exists. Exclude generic technical vocabulary; project-specific technical knowledge belongs in architecture or engineering concepts.
3. Review the complete candidate set with the project owner, apply corrections, and get explicit agreement on the complete revised set. Unapproved candidates stay in the conversation — never in the wiki. If evidence yields no terms, say so and leave the scaffolded terminology document empty.
4. Run the installer from this skill directory:

   ```sh
   python3 scripts/setup_project.py --root /absolute/path/to/project
   ```

   Use `--instructions agents|claude|both` only when the default `auto` is unsuitable; `--no-package-script` when package.json must not change. When the installer creates a new `AGENTS.md` and no `CLAUDE.md` exists, it also creates `CLAUDE.md` as a symlink to `AGENTS.md`.
5. Review every `kept`, `skipped`, and manual-action result. Existing wiki and backlog pages are never overwritten; the installer upgrades only recognized managed instruction blocks and the installer-owned package script, and adds compatible managed CI integrations. Any file that differs from its installed asset is preserved for manual reconciliation. When an upgrade `kept` a customized `docs/wiki/maintenance.md`, `docs/backlog/maintenance.md`, or type template, reconcile the new ADR and `decisions` rules into it — the installed validator enforces them regardless. Existing records without `decisions` validate with a warning until their next readiness transition; add the field when refining each one rather than in a bulk rewrite.
6. Add only the explicitly agreed terms to `docs/wiki/domains/ubiquitous-language.md` (canonical term, definition, context; synonyms only when relevant; examples, counterexamples, rationale, and code references optional). Preserve existing agreed terms unless the owner explicitly agrees to revise them.
7. Replace generic orientation text and empty wiki indexes with concise, project-specific descriptions. Preserve durable accepted knowledge; record project-specific wiki changes in `docs/wiki/log.md`. Leave the empty backlog scaffold unchanged until the owner approves proposed work.
8. Run `node scripts/validate-project.mjs` (and the package-script equivalent when the installer added one).
9. **Brownfield back-fill** — When the repository already contains application code (source directories, manifests, build configuration) and the wiki has no accepted concepts beyond the scaffold, this invocation is the owner's standing approval to explore the codebase and publish a foundation overview as validated `$wiki` transactions: tech stack with exact versions, architecture and module map, build/test/run commands, observable conventions, and code-derived terminology. Publish only facts verified against repository evidence; collect owner-judgment candidates (intent, rationale, product language) in the report for a later `/discuss` and `/to-wiki`. Never back-fill an ADR: a decision's rejected alternatives and rationale are owner judgement, not code-verifiable, so report observed significant decisions as ADR candidates instead. Rerun the validator. Skip on greenfield repositories and already-populated wikis.

   Seed one `engineering/technologies/` page per detected primary technology from `assets/wiki/engineering/guidance-template.md`, filling only what code establishes: the installed version with the path that establishes it, and observed project conventions. Set `Requirements`, `Recommendations`, and `Sources` to `Not yet researched.` and `status: draft` — external best practices need live registry calls and opened sources, which back-fill does not perform. Never leave template instruction text on a published page. Never seed a `standards/` page: which standards the project has adopted is owner judgement, so report them as `/to-guidance` candidates instead.
10. Review the diff, local links, backlog scaffold, agent-instruction block, and wiki log. Run setup a second time and confirm it changes no bytes.

End the report with `Next step:` — one copy-pasteable command: greenfield → `/discuss` naming the first outcome to shape; brownfield with seeded `draft` technology pages → `/to-guidance` naming them so their adopted rules and sources get researched; otherwise brownfield → `/discuss` naming the highest-value judgment candidate or first desired change. Recommend only — never invoke it. It is the report's last line; if several must run, end with a numbered list in run order.

## Structure rules

- `docs/wiki/index.md` stays a small routing entry point: immediate concepts and child directories with one-sentence descriptions. Every directory containing wiki Markdown gets its own `index.md`.
- `log.md` is newest-first with ISO 8601 `YYYY-MM-DD` headings.
- Every non-reserved Markdown file has parseable frontmatter with non-empty `type`, `title`, `description`, `timestamp`, and `status`.
- Use standard Markdown links; prefer bundle-relative `/path.md` links inside the wiki.
- Organize by durable responsibility or domain, never by the agent, task, or session that created content. One canonical owner per rule or fact; other pages link to it.
- `docs/wiki/architecture/decisions/` owns ADRs — one `type: Decision` concept per architecturally significant decision, `ADR-NNN` allocated at publication, superseded in place, never deleted for being replaced. `template.md` there is a non-record example. Its `index.md` separates in-force from superseded entries.
- `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` own adopted guidance — one canonical page per technology or cross-cutting standard, shaped by `docs/wiki/engineering/guidance-template.md` and maintained with `$to-guidance`. Requirements there bind new code even where existing code is non-compliant; non-compliant areas belong under `## Known gaps` with their remediation tracked in the backlog.
- `docs/wiki/domains/ubiquitous-language.md` is the canonical language agreement between owner and developers — no lifecycle states or agent signatures. Agents acknowledge it by reading, challenging inconsistencies, and using its terms.
- Keep transient task state out of the durable wiki.

## Backlog rules

- Read `docs/backlog/maintenance.md` before creating or changing records — it is canonical for hierarchy, statuses, readiness, relationships, ranking, claims, cancellation, and archival.
- Desired deltas stay in the backlog until completed outcomes are accepted into the wiki. Use `$wiki` for accepted-knowledge operations.
- Explicit project-owner approval is required before moving work to `ready`, walking work back from `ready` to `proposed`, changing global rank, cancelling work, superseding an ADR, or changing accepted wiki meaning.
- Each record's `decisions` field and `## Decisions` section carry decisions drafted in ADR shape; `pending` blocks readiness, and publication as an ADR happens only at primary-branch acceptance.
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
