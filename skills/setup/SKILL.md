---
name: setup
description: Use this skill when a user wants to initialize, bootstrap, install, refresh, or validate the project workflow and its Git policy. Create `.project/`, `docs/knowledge/`, `docs/work/`, and `.woktrees/`; install the local workflow CLI; configure `main` as the default integration branch; add project rules to `AGENTS.md`; and seed verified knowledge and official source notes. Use once before discussion or planning. Do not create briefs, work items, releases, outcomes, or product code.
---

# Setup

Initialize the two project-state spaces without changing product behavior.

Use Node.js 20.9 or newer for the bundled workflow CLI.

## Procedure

1. Inspect the repository, package metadata, Git state, and existing `AGENTS.md` files.
2. Read [references/workspace-format.md](references/workspace-format.md).
3. Check whether `.project/workflow.json` already exists.
4. If it exists, follow the refresh procedure below and stop.
5. For a new workflow, choose a two-to-ten character uppercase project key.
6. Derive a clear project name from repository metadata.
7. Use `main` as the integration branch unless the user names another branch.
8. Initialize Git with `git init -b main` when no Git repository exists.
9. Do not create a baseline commit from unrelated files without user approval.
10. Resolve this skill's directory from the loaded `SKILL.md` path.
11. Run the initialization command.
12. Confirm `.woktrees/` exists and `/.woktrees/` is ignored by Git.
13. Confirm the brief, release, outcome, source, item, and knowledge folders exist.
14. Add the reference's workflow block to `AGENTS.md` without removing rules.
15. Use `$source` to cache current Git, Jira dependency, commit, and branch rules.
16. Use `$source` to verify official docs for material detected technologies.
17. Add small OKF concepts only for facts verified from the repository.
18. Run `sync` and `validate`.
19. Report the target branch, missing initial commit, created paths, and sources.

Ask for the project key or name only when repository context cannot provide a
safe value.

## Initialize

```bash
node <skill-directory>/scripts/project-flow.mjs init \
  --root . \
  --key APP \
  --name "Project name" \
  --target-branch main
node .project/bin/project-flow.mjs sync
node .project/bin/project-flow.mjs validate
```

## Refresh an existing workflow

Do not initialize twice. Refresh the installed CLI, Git settings, `.woktrees/`,
and the AGENTS.md block. Use `$source` to refresh relevant notes. Then validate:

```bash
node <skill-directory>/scripts/project-flow.mjs install --root .
node .project/bin/project-flow.mjs sync
node .project/bin/project-flow.mjs validate
```

## Safety

- Inspect non-empty target folders before setup.
- Do not merge legacy or conflicting state automatically.
- Do not overwrite existing knowledge or AGENTS.md rules.
- Do not create briefs, tickets, releases, or outcome records.
- Do not modify product code.
- Do not turn model memory into project knowledge or source notes.
- Do not rename an established integration branch without user approval.
- Do not commit pre-existing or unrelated files during setup.
