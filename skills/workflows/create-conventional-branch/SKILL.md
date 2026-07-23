---
name: create-conventional-branch
description: Create and switch to a purpose-driven Git branch that follows the Conventional Branch specification. Use automatically only when $implement or $implement-with-subagents needs a work branch, or when the user explicitly requests a branch or pull/merge-request publishing workflow. Never use for discussion, research, wiki maintenance, wiki setup, or task planning alone.
---

# Create Conventional Branch

Create and switch to a branch whose name communicates the work's purpose.

## Authorization

Create or switch branches only when:

- `$implement` or `$implement-with-subagents` is executing implementation work; or
- the user explicitly requests creating a branch or running a pull/merge-request publishing workflow.

Do not create or switch branches for `$discuss`, `$setup-project`, `$to-wiki`, `$research-tech-stack`, or `$to-tasks`. Those workflows stay on the branch the user selected, including when it is not the primary branch. Documentation or repository writes alone do not make a new branch necessary.

## Workflow

1. Confirm that the invocation meets the authorization rules above. Otherwise, do not change branches and return control to the calling workflow.
2. Read repository instructions and inspect the current branch and worktree with `git status --short --branch`.
3. Derive the branch purpose from the task. Preserve an issue or ticket identifier when one is available.
4. Choose the narrowest applicable prefix:
   - `feature/` or `feat/` for a new feature.
   - `bugfix/` or `fix/` for a bug fix.
   - `hotfix/` for an urgent production fix.
   - `release/` for release preparation.
   - `chore/` for dependency updates, documentation, maintenance, and other non-feature work.
5. Write a concise description in lowercase words separated by single hyphens. Prefer the repository's documented choice when it specifies a long or short alias.
6. Validate the complete name against the rules below.
7. Check whether the name already exists locally or on a configured remote. If it does, do not overwrite or reset it; choose a more specific valid name or ask before reusing it when intent is ambiguous.
8. Create and switch to the branch with `git switch -c <branch-name>`.
9. Report the created branch name.

## Naming Rules

Use this structure:

```text
<type>/<description>
```

- Use only lowercase ASCII letters (`a-z`), numbers (`0-9`), and hyphens in descriptions.
- Allow dots only for version numbers in release descriptions, such as `release/v1.2.0`.
- Do not use spaces, underscores, uppercase letters, or other special characters.
- Do not use consecutive, leading, or trailing hyphens or dots. Do not place a hyphen next to a dot.
- Keep the description clear and concise.
- Include a ticket identifier when applicable, such as `feature/issue-123-add-login`.
- Treat `main`, `master`, and `develop` as unprefixed trunk branches; do not create them for task work.
- Follow a repository's documented custom branch types when present. Otherwise use only the standard purpose prefixes above.

## Examples

```text
feature/add-login-page
feat/issue-123-add-login
fix/header-overflow
hotfix/security-patch
release/v1.2.0
chore/update-dependencies
```
