---
name: setup-wiki
description: Scaffold and configure a project-owned llmwiki using Open Knowledge Format 0.1. Use when Codex needs to create a new docs/wiki knowledge bundle, add progressive-disclosure indexes and maintenance rules, install structural/link/length validation, or add wiki usage instructions to AGENTS.md and CLAUDE.md.
disable-model-invocation: true
---

# Setup Wiki

Create a durable, project-owned OKF wiki without overwriting existing knowledge.

## Workflow

1. Inspect the project root, `AGENTS.md`, `CLAUDE.md`, `package.json`, and any
   existing `docs/wiki` content. Read applicable repository instructions first.
2. Run the installer from this skill directory:

   ```sh
   python3 scripts/setup_wiki.py --root /absolute/path/to/project
   ```

   Use `--instructions agents`, `claude`, or `both` only when the default
   `auto` selection is unsuitable. Use `--no-package-script` when package.json
   must not be changed.
3. Review every `kept` or `skipped` result. The installer never overwrites an
   existing wiki page or validation script. Merge missing conventions manually
   when a project already has equivalent files.
4. Replace generic orientation text and empty directory indexes with concise,
   project-specific descriptions. Preserve existing durable knowledge.
5. Run validation:

   ```sh
   node scripts/validate-wiki.mjs
   ```

   Run `pnpm wiki:check`, `npm run wiki:check`, or the repository-equivalent
   when the installer added the package script.
6. Review the resulting diff, local links, agent-instruction block, and wiki
   log before handing off.

## Structure rules

- Keep `docs/wiki/index.md` as the small routing entry point. Link immediate
  concepts and child directories with one-sentence descriptions.
- Give every directory containing wiki Markdown its own `index.md`.
- Keep `log.md` newest-first with ISO 8601 `YYYY-MM-DD` headings.
- Give every non-reserved Markdown file parseable frontmatter with non-empty
  `type`, `title`, `description`, `timestamp`, and `status`.
- Use standard Markdown links. Prefer bundle-relative `/path.md` links inside
  the wiki.
- Organize concepts by durable responsibility or domain, not by the agent,
  task, or session that created them.
- Keep one canonical owner for each rule or fact; other pages link to it.
- Keep transient task state outside the durable wiki.

## Length and splitting rules

- Target at most 350 lines per concept page. At this threshold, review whether
  the page still represents one cohesive concept.
- Never exceed 500 lines in a concept page. The installed validator treats this
  as an error. Reserved `index.md` and `log.md` files are exempt but should stay
  concise.
- Split before 350 lines when sections have different owners, audiences,
  lifecycles, source sets, or concept types; when a section is independently
  reusable; or when readers commonly need one section without the others.
- Keep a cohesive runbook or reference intact below the hard limit when
  splitting would force readers to jump between files during one task.
- When splitting, create focused sibling or child concepts, add the nearest
  directory index entries, replace duplicated prose with links, repair inbound
  links, and record the change in `log.md`.

## Installed resources

- `scripts/setup_wiki.py` creates missing assets, updates managed agent
  instructions, and optionally adds the package script.
- `assets/wiki/` contains the generic OKF bundle templates.
- `assets/validate-wiki.mjs` validates metadata, reserved files, links, index
  coverage, duplicate titles, status values, and length limits.
- `assets/agent-instructions.md` is the managed instruction block installed in
  `AGENTS.md` and/or `CLAUDE.md`.
