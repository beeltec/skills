---
name: language
description: Use this helper skill when a user wants to define, inspect, clarify, revise, rename, or retire shared project terms; when users and agents use conflicting words; or when an unclear term could change product meaning. Manage `docs/knowledge/ubiquitous-language.md` through the project CLI after explicit user agreement. Apply only the Ubiquitous Language principle, not Domain-Driven Design in general. Do not create tickets or product code.
---

# Language

Maintain one agreed project vocabulary so users and agents mean the same thing.

## Procedure

1. Require `.project/workflow.json`. Use `setup` when it is missing.
2. Read [references/language-contract.md](references/language-contract.md).
3. Read `docs/knowledge/ubiquitous-language.md` before interpreting project terms.
4. Read the local Ubiquitous Language source note when it exists.
5. Use `$source` only when that principle note is missing or conflicts with its official page.
6. Use `language-show [TERM]` for lookup without changing the file.
7. Separate observed wording, proposed meaning, and confirmed meaning.
8. Ask for confirmation only when the current message does not confirm the exact canonical term and definition.
9. Confirm accepted aliases and examples only when they improve understanding.
10. Use the authenticated human identity when available.
11. Use `human:user` when the current user directly confirms the change.
12. Run the required language mutation commands serially from the configured target worktree.
13. After a proposed or completed mutation, inspect candidate usages by meaning.
14. Ignore unrelated homonyms and exact external identifiers.
15. Run `validate`.
16. For lookup, report the term, definition, status, aliases, and replacement.
17. For mutation, also report the action, actor, reason, and affected usages.

Never infer an agreed meaning from model memory, code, or external documentation.
Those sources may expose a mismatch, but the user must confirm project meaning.

## Commands

Add an agreed term:

```bash
node .project/bin/project-flow.mjs language-add \
  --term "Task" \
  --definition "A piece of user work that can be completed." \
  --alias "todo" \
  --example "A user completes a task." \
  --by human:user \
  --reason "The user confirmed this meaning."
```

Replace a definition or the complete alias and example lists:

```bash
node .project/bin/project-flow.mjs language-update "Task" \
  --definition "A tracked piece of user work that can be completed." \
  --alias \
  --by human:user \
  --reason "The alias conflicted with another project concept."
```

A bare `--alias` or `--example` clears that list. Omit an option to preserve
its current list.

To rename a term, add the new canonical term. Then deprecate the old term and
name the new term as its replacement.

Use `language-update <TERM> --replacement <TERM>` to correct a deprecated
term's replacement. A bare `--replacement` clears the link.

Retire a term without erasing history:

```bash
node .project/bin/project-flow.mjs language-deprecate "Todo" \
  --replacement "Task" \
  --by human:user \
  --reason "Task is now the agreed canonical term."
```

## Boundaries

- Do not add a term before explicit user agreement.
- Do not use an alias for two meanings.
- Do not silently change a definition during another workflow stage.
- Do not delete terms. Deprecate them and name a replacement when one exists.
- Do not rename code, interfaces, or tickets from this skill.
- Do not replace official API names when exact external terminology matters.
- Do not introduce bounded contexts, aggregates, entities, repositories, or other DDD patterns.
- Serialize vocabulary mutations in the configured target worktree.
- Before the first Git commit, use the initialized project root instead.
- Do not modify the language file in a ticket worktree.
- Do not commit or push unless the user requests it.
