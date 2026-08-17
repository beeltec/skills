---
name: rules
description: Use this setup helper when a user wants to install, update, list, or verify reusable agent-rule fragments in a project `AGENTS.md` or the user-scoped Codex `AGENTS.md`. Manage named SHA-256 blocks without changing other instructions. Use project scope for repository workflow rules and user scope for personal defaults. Do not initialize the project workflow or edit malformed managed blocks automatically.
---

# Rules

Install and verify reusable `AGENTS.md` fragments without requiring manual copy
and paste.

## Recommended scopes

User scope installs personal defaults into `${CODEX_HOME:-~/.codex}/AGENTS.md`:

- `plain-english`
- `official-sources`

Their source files live in `agent-rules/user/`.

Project scope installs shared repository rules into `<project>/AGENTS.md`:

- `project-evidence`
- `ubiquitous-language`
- `ticket-git-workflow`
- `code-quality`
- `comments`
- `testing`
- `review-policy`

Their source files live in `agent-rules/project/`.

Any rule may be installed at either scope when the user explicitly requests a
different placement. Prefer project scope when a rule names repository paths,
state, Git conventions, or shared merge gates.

## Procedure

1. Resolve this skill's directory from the loaded `SKILL.md` path.
2. Run `list` when the available rules or recommended scopes are unclear.
3. Require explicit user intent before changing the user-scoped file.
4. Inspect the target `AGENTS.md` and any same-directory `AGENTS.override.md`.
5. Run `install` with `--dry-run` and the explicit scope.
6. Report any malformed, duplicated, or overridden block without changing it.
7. Run `install` without `--dry-run` after the target is safe.
8. Run `check` with the same scope and selected rules.
9. Report the target, installed rules, and verification result.

With no `--rule`, `install` and `check` use the recommended profile for their
scope. Repeat `--rule` to select exact fragments. Use `--all` only when the user
wants every fragment in one file.

## Commands

List the catalog:

```bash
node <skill-directory>/scripts/manage-rules.mjs list
```

Install and verify the recommended project profile:

```bash
node <skill-directory>/scripts/manage-rules.mjs install \
  --scope project --root /path/to/project --dry-run
node <skill-directory>/scripts/manage-rules.mjs install \
  --scope project --root /path/to/project
node <skill-directory>/scripts/manage-rules.mjs check \
  --scope project --root /path/to/project
```

Install and verify the recommended user profile:

```bash
node <skill-directory>/scripts/manage-rules.mjs install --scope user --dry-run
node <skill-directory>/scripts/manage-rules.mjs install --scope user
node <skill-directory>/scripts/manage-rules.mjs check --scope user
```

Install one explicit project rule:

```bash
node <skill-directory>/scripts/manage-rules.mjs install \
  --scope project --root /path/to/project --rule plain-english
```

## Managed boundary

Each installed fragment has one named boundary and a SHA-256 digest:

```markdown
<!-- agent-rule:review-policy:start sha256=<digest> -->
## Review policy
...
<!-- agent-rule:review-policy:end -->
```

The digest covers the exact embedded fragment. `check` verifies the marker,
digest, content, uniqueness, and required profile membership.

## Boundaries

- Do not change content outside managed blocks.
- Do not overwrite a malformed or duplicated managed block.
- Do not write through a symlinked `AGENTS.md`.
- Do not claim rules are active when a same-directory `AGENTS.override.md` hides them.
- Do not modify the user-scoped file without explicit user intent.
- Do not remove an installed rule automatically.
- Do not initialize project workflow files from this skill.
- Do not commit changes unless the user requests it.
