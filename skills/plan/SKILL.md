---
name: plan
description: Use this skill when a user wants to turn a confirmed idea into project work in an initialized workflow. Read current knowledge from `docs/knowledge/`, then create or refine Jira-like epics, stories, bugs, tasks, and subtasks in `docs/work/`. Use after setup and discussion. Stop before implementation.
---

# Plan

Convert a confirmed discussion brief into the smallest useful delivery plan.
Keep desired outcomes separate from established facts.

## Prerequisite

Require `.project/workflow.json`. If it is missing, stop and use `setup`.
Use the installed `.project/bin/project-flow.mjs` for every command.

## Plan work

1. Require a user-confirmed brief. Use `discuss` if material choices remain.
2. Read `docs/knowledge/index.md` and `docs/work/board.md`.
3. Read [references/work-item-model.md](references/work-item-model.md).
4. Create one epic only when several standard items share one outcome.
5. Create sprint-sized stories for independent user value.
6. Add bugs, tasks, or subtasks only when they clarify real work.
7. Add measurable acceptance criteria.
8. Add verification commands for code changes.
9. Mark knowledge `required` for every epic and story.
10. Link actual blockers.
11. Move ready items to `ready`.
12. Run `validate` and report the created keys.

## Example

```bash
node .project/bin/project-flow.mjs create \
  --type story \
  --parent APP-1 \
  --summary "Persist tasks" \
  --description "As a user, I want saved tasks so that they survive restarts." \
  --accept "A valid task is stored in SQLite." \
  --accept "Saved tasks appear after a reload." \
  --check "Tests::npm test" \
  --check "Build::npm run build"
```

## Boundaries

- Do not implement code.
- Do not initialize or refresh the workflow.
- Do not create speculative knowledge facts.
- Do not use an epic when one story is enough.
- Do not enter `done` through a status edit.
- Stop after the plan is valid and ready.
