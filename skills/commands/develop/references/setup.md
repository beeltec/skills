# Project Setup

Load only when the user asks to initialize/upgrade governance or selected governed work requires a missing or legacy scaffold. Stay on the current branch unless the user explicitly requests otherwise.

## Procedure

1. Read instructions, manifests, product documentation, existing code, and any wiki/backlog. Never touch `docs/tasks`.
2. Derive project-specific terminology from evidence. In normal mode, confirm the complete proposed set with the owner; in explicit autonomous mode, accept terms established by the PRD or code. Exclude generic technical vocabulary.
3. From this skill directory run:

```sh
python3 scripts/setup_project.py --root /absolute/path/to/project
```

Use `--instructions agents|claude|both` only when `auto` is unsuitable and `--no-package-script` when `package.json` must remain unchanged.

4. Review every created, updated, kept, skipped, and manual-action result. The installer never overwrites project-owned pages and updates only recognized managed files/blocks.
5. Add only confirmed terms to `docs/wiki/domains/ubiquitous-language.md`. Replace generic orientation text with concise project-specific facts and record accepted wiki changes in `docs/wiki/log.md`. Leave the backlog empty until desired work is approved.
6. Run `node scripts/validate-project.mjs` and any installed package alias.
7. On brownfield code with an otherwise empty wiki, publish only repository-verifiable foundation facts: stack/versions, architecture/module map, commands, observable conventions, and code-derived terminology. Report intent, rationale, product language, and observed decisions as owner-judgment candidates; never infer an ADR.
8. Seed `draft` guidance pages for detected primary technologies and applicable standards from `assets/wiki-guidance-template.md`. Fill only evidence, version path, triggers, tooling, and observed conventions; keep unresearched sections explicit. Adopt/refine only subjects the user names, except under explicit autonomous policy.
9. Inspect diff, links, scaffold, managed instructions, and log. Run the installer again and require no byte changes.

Installed structure is governed by `assets/wiki-maintenance.md`, `assets/backlog-maintenance.md`, and the flat `assets/backlog-template-*.md` sources. Do not restate their schemas during setup.
