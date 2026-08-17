---
name: setup
description: Use this skill when a user wants to initialize, bootstrap, install, refresh, or validate the project workflow and its Git policy. Create `.project/`, `docs/knowledge/`, `docs/work/`, `.worktrees/`, and the shared ubiquitous language file; install the local workflow CLI; configure `main` as the default integration branch; install the recommended project `AGENTS.md` rules through `$rules`; and seed verified knowledge and official source notes. Use once before discussion or planning. Do not create briefs, work items, releases, outcomes, or product code.
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
12. Confirm `.worktrees/` exists and `/.worktrees/` is ignored by Git.
13. Confirm the brief, release, outcome, source, item, and knowledge folders exist.
14. Confirm `docs/knowledge/ubiquitous-language.md` exists.
15. Load `$rules` and use its recommended project-scope procedure.
16. Confirm `$rules` reports a passing check for every project-profile block.
17. Do not install the user profile unless the user explicitly requests it.
18. Use `$source` to cache the Ubiquitous Language principle from Eric Evans.
19. Store it at `docs/knowledge/sources/methods/ubiquitous-language.md`.
20. Use `$source` to cache current Git, Jira dependency, commit, and branch rules.
21. Use `$source` to verify official docs for material detected technologies.
22. Add small OKF concepts only for facts verified from the repository.
23. Run `sync` and `validate`.
24. Report the target branch, missing initial commit, agent-rule check, created paths, and sources.

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

Do not initialize twice. Refresh the installed CLI, Git settings, and
`.worktrees/`. Use `$rules` to update and check the project profile. Use
`$source` to refresh relevant notes. Then validate:

```bash
node <skill-directory>/scripts/project-flow.mjs install --root .
node .project/bin/project-flow.mjs sync
node .project/bin/project-flow.mjs validate
```

## Safety

- Inspect non-empty target folders before setup.
- Do not merge legacy or conflicting state automatically.
- Do not overwrite existing knowledge.
- Do not change text outside managed `AGENTS.md` rule blocks.
- Do not install user-scoped rules without explicit user intent.
- Do not create briefs, tickets, releases, or outcome records.
- Do not add vocabulary terms without explicit user agreement.
- Do not modify product code.
- Do not turn model memory into project knowledge or source notes.
- Do not rename an established integration branch without user approval.
- Do not commit pre-existing or unrelated files during setup.
