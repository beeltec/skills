---
name: setup
description: Use this skill when a user wants to initialize, bootstrap, install, refresh, or validate the project workflow. Create `.project/`, `docs/knowledge/`, and `docs/work/`; install the local workflow CLI; add project-state rules to `AGENTS.md`; and seed only verified current knowledge. Use once before planning. Do not create work items or product code.
---

# Setup

Initialize the two project-state spaces without changing product behavior.

Use Node.js 20.9 or newer for the bundled workflow CLI.

## Procedure

1. Inspect the repository, package metadata, and existing `AGENTS.md` files.
2. Read [references/workspace-format.md](references/workspace-format.md).
3. Check whether `.project/workflow.json` already exists.
4. If it exists, follow the refresh procedure below and stop.
5. For a new workflow, choose a two-to-ten character uppercase project key.
6. Derive a clear project name from repository metadata.
7. Resolve this skill's directory from the loaded `SKILL.md` path.
8. Run the initialization command.
9. Add the reference's workflow block to `AGENTS.md` without removing rules.
10. Add small OKF concepts only for facts verified from the repository.
11. Run `sync` and `validate`.
12. Report created paths, the project key, and any facts left undocumented.

Ask for the project key or name only when repository context cannot provide a
safe value.

## Initialize

```bash
node <skill-directory>/scripts/project-flow.mjs init \
  --root . \
  --key APP \
  --name "Project name"
node .project/bin/project-flow.mjs sync
node .project/bin/project-flow.mjs validate
```

## Refresh an existing workflow

Do not initialize twice. Refresh the installed CLI, confirm the AGENTS.md block,
then validate:

```bash
node <skill-directory>/scripts/project-flow.mjs install --root .
node .project/bin/project-flow.mjs sync
node .project/bin/project-flow.mjs validate
```

## Safety

- Inspect non-empty target folders before setup.
- Do not merge legacy or conflicting state automatically.
- Do not overwrite existing knowledge or AGENTS.md rules.
- Do not create epics, stories, bugs, tasks, or subtasks.
- Do not modify product code.
