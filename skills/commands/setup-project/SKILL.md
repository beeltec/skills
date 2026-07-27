---
name: setup-project
description: Initialize or safely upgrade a project's wiki, backlog, validation, and agent instructions; back-fill a foundation wiki on brownfield repositories. Use when creating or upgrading project governance.
disable-model-invocation: true
---

# Setup Project

Initialize or upgrade two governed, tracked systems without overwriting project-owned files: an OKF wiki for accepted primary-branch state and a backlog for desired deltas and execution state.

Stay on the current branch — never create, switch, merge, or delete branches.

User-invoked only — or invoked by `$to-product`, whose autonomous contract auto-answers the step 3 terminology approval and the step 9 guidance offer.

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

   Seed one `engineering/technologies/` page per detected primary technology from `assets/wiki/engineering/guidance-template.md`, filling only what code establishes: the installed version with the path that establishes it, and observed project conventions. Also seed one `engineering/standards/` page per standard candidate that `$research` step 2's concept triggers detect from repository evidence, filling only what code establishes: the trigger evidence and any enforcing tooling and configuration. On every seeded page set `Requirements`, `Recommendations`, and `Sources` to `Not yet researched.` and `status: draft`. Never leave template instruction text on a published page.

   Then offer `$guidance` for the seeded `draft` pages, naming each with its evidence. Adoption is owner judgement: publish only the subjects the owner explicitly names in reply, and leave the rest `draft`.
10. Review the diff, local links, backlog scaffold, agent-instruction block, and wiki log. Run setup a second time and confirm it changes no bytes.

End the report with `Next step:` — one copy-pasteable command: greenfield → `/discuss` naming the first outcome to shape; pages left `draft` after the step 9 guidance offer → `/to-guidance` naming them so their adopted rules and sources get researched; otherwise brownfield → `/discuss` naming the highest-value judgment candidate or first desired change.

## Canonical rules

The installed assets are canonical for structure and governance — never restate their rules elsewhere: `assets/wiki/maintenance.md` (authority, organization, concept metadata, ADRs, adopted guidance, length and splitting, links, indexes, log), `assets/backlog/maintenance.md` (hierarchy, lifecycle, Definition of Ready, relationships, ranking, claims, cancellation, archival), and `assets/wiki/domains/ubiquitous-language.md` (the canonical language agreement — no lifecycle states or agent signatures). Read the relevant asset before editing what it governs during steps 6-9.

## Installed resources

- `scripts/setup_project.py` — creates missing assets, updates managed agent instructions, and optionally adds a non-conflicting package script without touching lockfiles. It removes a leftover `.setup-project.json` manifest from earlier installer versions.
- CI: compatible GitHub Actions projects get a standalone managed workflow; GitLab projects get a standalone job only when `.gitlab-ci.yml` has no include or one simple block-list include. Unsupported CI is reported, not changed.
- `assets/wiki/` — generic accepted-state OKF bundle templates. `assets/backlog/` — desired-change governance, indexes, archives, and type templates.
- `assets/validate-project.mjs` — reports wiki and backlog validation separately and enforces their structural and lifecycle contracts.
- `assets/agent-instructions.md` — the managed instruction block installed in `AGENTS.md` and/or `CLAUDE.md`.
