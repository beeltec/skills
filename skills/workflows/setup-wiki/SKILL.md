---
name: setup-wiki
description: Scaffold and configure a project-owned llmwiki using Open Knowledge Format 0.1. Use when Codex needs to create a new docs/wiki knowledge bundle, establish an owner-approved ubiquitous language, add progressive-disclosure indexes and maintenance rules, install structural/link/length validation, or add wiki usage instructions to AGENTS.md and CLAUDE.md.
disable-model-invocation: true
---

# Setup Wiki

Create a durable, project-owned OKF wiki without overwriting existing knowledge.

Stay on the user's current Git branch. Never create or switch branches while scaffolding, configuring, or populating the wiki, including when the current branch is not the primary branch.

## Workflow

1. Inspect the project root, `AGENTS.md`, `CLAUDE.md`, `package.json`, existing product documentation and code, and any `docs/wiki` content. Read applicable repository instructions first.
2. Derive a concise set of candidate product and domain terms from that evidence. For each term, propose a canonical name, precise definition, applicable context, and preferred or forbidden synonyms when ambiguity exists. Exclude generic technical vocabulary; keep project-specific technical knowledge in architecture or engineering concepts.
3. Review the complete candidate set with the user as project owner. Apply their corrections, then ask for explicit agreement on the complete revised set. Keep unapproved candidates in the conversation only. Do not write them to the wiki. If the evidence yields no terms, say so and leave the scaffolded terminology document empty.
4. Run the installer from this skill directory:

   ```sh
   python3 scripts/setup_wiki.py --root /absolute/path/to/project
   ```

   Use `--instructions agents`, `claude`, or `both` only when the default `auto` selection is unsuitable. Use `--no-package-script` when package.json must not be changed.
5. Review every `kept` or `skipped` result. The installer never overwrites an existing wiki page or validation script. Merge missing conventions manually when a project already has equivalent files.
6. Add only the explicitly agreed terms to `docs/wiki/domains/ubiquitous-language.md`. Preserve existing agreed terms unless the project owner explicitly agrees to revise them. Format each entry with its canonical term, definition, and context. Add preferred or forbidden synonyms only when relevant; examples, counterexamples, rationale, and code references are optional.
7. Replace generic orientation text and empty directory indexes with concise, project-specific descriptions. Preserve existing durable knowledge and record the populated language and other project-specific wiki changes in `docs/wiki/log.md`.
8. Run validation:

   ```sh
   node scripts/validate-wiki.mjs
   ```

   Run `pnpm wiki:check`, `npm run wiki:check`, or the repository-equivalent when the installer added the package script.
9. Review the resulting diff, local links, agent-instruction block, and wiki log before handing off.

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

## Length and splitting rules

- Target at most 350 lines per concept page. At this threshold, review whether the page still represents one cohesive concept.
- Never exceed 500 lines in a concept page. The installed validator treats this as an error. Reserved `index.md` and `log.md` files are exempt but should stay concise.
- Split before 350 lines when sections have different owners, audiences, lifecycles, source sets, or concept types; when a section is independently reusable; or when readers commonly need one section without the others.
- Keep a cohesive runbook or reference intact below the hard limit when splitting would force readers to jump between files during one task.
- When splitting, create focused sibling or child concepts, add the nearest directory index entries, replace duplicated prose with links, repair inbound links, and record the change in `log.md`.

## Installed resources

- `scripts/setup_wiki.py` creates missing assets, updates managed agent instructions, and optionally adds the package script.
- `assets/wiki/` contains the generic OKF bundle templates.
- `assets/validate-wiki.mjs` validates metadata, reserved files, links, index coverage, duplicate titles, status values, and length limits.
- `assets/agent-instructions.md` is the managed instruction block installed in `AGENTS.md` and/or `CLAUDE.md`.
