---
name: create-conventional-branch
description: Create and switch to a Conventional Branch. Automatic only for $implement or $implement-with-subagents, or an explicit branch or PR request — never for backlog, discussion, wiki, or research.
---

# Create Conventional Branch

Create and switch to a branch whose name communicates the work's purpose.

## Authorization

Create or switch branches only when `$implement` or `$implement-with-subagents` is executing implementation work, or the user explicitly requests a branch or a pull/merge-request publishing workflow.

Never for `$setup-project`, `$backlog`, `$discuss`, `$wiki`, or `$research` — those stay on the user's selected branch, even off the primary branch. Documentation or repository writes alone never justify a new branch.

## Workflow

1. Confirm authorization; otherwise change nothing and return control to the calling workflow.
2. Read repository instructions and inspect `git status --short --branch`.
3. Derive the branch purpose from the task, preserving any issue or ticket identifier.
4. Choose the narrowest prefix: `feature/`/`feat/` (new feature), `bugfix/`/`fix/` (bug fix), `hotfix/` (urgent production fix), `release/` (release preparation), `chore/` (dependencies, docs, maintenance, other non-feature work). Prefer the repository's documented long/short alias choice.
5. Write a concise lowercase, hyphen-separated description and validate the full name against the rules below.
6. If the name exists locally or on a configured remote, do not overwrite or reset it; choose a more specific valid name, or ask before reusing when intent is ambiguous.
7. `git switch -c <branch-name>` and report the created name.

## Naming Rules

Structure: `<type>/<description>`

- Only lowercase ASCII letters, numbers, and hyphens in descriptions; dots only for version numbers in release descriptions (`release/v1.2.0`).
- No spaces, underscores, uppercase, or other special characters; no consecutive, leading, or trailing hyphens or dots; no hyphen adjacent to a dot.
- Include a ticket identifier when applicable: `feature/issue-123-add-login`.
- `main`, `master`, and `develop` are unprefixed trunk branches — never create them for task work.
- Follow a repository's documented custom branch types when present; otherwise only the standard prefixes above.

Examples: `feature/add-login-page`, `feat/issue-123-add-login`, `fix/header-overflow`, `hotfix/security-patch`, `release/v1.2.0`, `chore/update-dependencies`.
