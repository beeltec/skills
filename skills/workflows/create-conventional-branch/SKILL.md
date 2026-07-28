---
name: create-conventional-branch
description: Enforce one local acceptance branch and its Conventional Branch lifecycle. Automatic only for $implement or $implement-with-subagents, or an explicit branch or PR request — never for planning, discussion, wiki, or research.
---

# Create Conventional Branch

Create, resume, recover, and remove the sole local acceptance branch.

## Authorization

Create or switch branches only when `$implement` or `$implement-with-subagents` executes implementation, `$to-product` performs its autonomous cleanup, or the user explicitly requests a branch or pull/merge-request workflow.

Never for `$setup-project`, `$backlog`, `$discuss`, `$wiki`, or `$research` — those stay on the user's selected branch, even off the primary branch. Documentation or repository writes alone never justify a new branch.

## Invariant

Allow only the primary branch plus one local acceptance branch. Remote refs do not count; never create, push, or delete one here. One standalone item or Epic owns the acceptance branch.

## Open Or Resume

1. Confirm authorization; otherwise change nothing and return control to the calling workflow.
2. Read repository instructions; inspect `git status --short --branch`, remotes, claims, and `git for-each-ref --format='%(refname:short)' refs/heads/`.
3. Identify any branch whose claim matches this acceptance unit. If other non-primary branches exist, stop and list them. Under `$to-product`, instead:
   - in each dirty checkout run `git stash push --include-untracked -m "to-product recovery <branch> <YYYYMMDDTHHMMSSZ>"`;
   - use the matching branch as `<baseline>`, otherwise primary; delete directly when `git merge-base --is-ancestor <branch> <baseline>` passes or `git rev-parse <branch>^{tree}` equals `git rev-parse <baseline>^{tree}`; otherwise preserve the tip with `git update-ref refs/recovery/to-product/<YYYYMMDDTHHMMSSZ>/<branch> <branch>`;
   - record every recovery ref/stash; run `git -C <checkout> switch --detach <primary>` where needed, then `git branch -D <branch>`;
   - never alter remote refs.
4. After cleanup, resume only when the sole non-primary branch and claim identify this unit. Repair an interruption-expired claim under existing authority.
5. Otherwise derive the task-specific name. Choose the narrowest repository-supported prefix: `feature`/`feat`, `bugfix`/`fix`, `hotfix`, `release`, or `chore`.
6. If that name exists remotely, do not overwrite it; choose a more specific local name. Run `git switch -c <branch-name>` and report it.

## Close

- **Accepted:** switch to primary, then `git branch -d <branch-name>`. Verify only primary remains before another acceptance unit starts.
- **Parked or cancelled:** stash with `--include-untracked`, preserve the tip with `git update-ref refs/recovery/<YYYYMMDDTHHMMSSZ>/<branch> <branch>`, record both, release claims on primary, then `git branch -D <branch>`. Resume the next sole acceptance branch from that state.
- Never leave a completed or parked acceptance branch.

## Naming Rules

Structure: `<type>/<description>`

- Only lowercase ASCII letters, numbers, and hyphens in descriptions; dots only for version numbers in release descriptions (`release/v1.2.0`).
- No spaces, underscores, uppercase, or other special characters; no consecutive, leading, or trailing hyphens or dots; no hyphen adjacent to a dot.
- Include a ticket identifier when applicable: `feature/issue-123-add-login`.
- `main`, `master`, and `develop` are unprefixed trunk branches — never create them for task work.
- Follow a repository's documented custom branch types when present; otherwise only the standard prefixes above.

Examples: `feature/add-login-page`, `feat/issue-123-add-login`, `fix/header-overflow`, `hotfix/security-patch`, `release/v1.2.0`, `chore/update-dependencies`.
