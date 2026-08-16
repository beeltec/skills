---
name: plan
description: Use this skill when a user wants to turn a confirmed idea into project work in an initialized workflow. Read established knowledge and official source notes, refresh material external facts from current official documentation, then create or refine Jira-like epics, stories, bugs, tasks, and subtasks in `docs/work/`. Use after setup and discussion. Stop before implementation.
---

# Plan

Convert a confirmed discussion brief into the smallest useful delivery plan.
Keep desired outcomes separate from established facts.

## Prerequisite

Require `.project/workflow.json`. If it is missing, stop and use `setup`.
Use the installed `.project/bin/project-flow.mjs` for every command.

## Plan work

1. Require a user-confirmed brief. Use `discuss` if material choices remain.
2. Read `docs/knowledge/index.md`, `docs/knowledge/sources/index.md`, and the board.
3. Use `$source` to verify material external constraints from official docs.
4. Read [references/work-item-model.md](references/work-item-model.md).
5. Create one epic only when several standard items share one outcome.
6. Create sprint-sized stories for independent user value.
7. Add bugs, tasks, or subtasks only when they clarify real work.
8. Add measurable acceptance criteria.
9. Add verification commands for code changes.
10. Name relevant local source-note paths in the work-item description.
11. Mark knowledge `required` for every epic and story.
12. Link actual blockers.
13. Move ready items to `ready`.
14. Run `validate` and report the created keys and source notes.

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
- Do not plan against an external technical claim supported only by model memory.
- Do not use an epic when one story is enough.
- Do not enter `done` through a status edit.
- Stop after the plan is valid and ready.
