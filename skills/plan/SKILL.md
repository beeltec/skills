---
name: plan
description: Use this skill when a user wants to turn a persisted, confirmed brief into Jira-like project work. Read established knowledge and official sources, create or refine epics, stories, bugs, tasks, and subtasks, declare risk-driven quality gates and release needs, and define an acyclic dependency graph for parallel worktrees. Use after setup and discussion. Stop before implementation or Git branch creation.
---

# Plan

Convert a confirmed discussion brief into the smallest useful delivery plan.
Keep desired outcomes separate from established facts.

## Prerequisite

Require `.project/workflow.json`. If it is missing, stop and use `setup`.
Use the installed `.project/bin/project-flow.mjs` for every command.

## Plan work

1. Require a persisted, confirmed brief ID. Use `discuss` if it is missing or material choices remain.
2. Run `brief-show <BRIEF-N>` and read the brief file, knowledge indexes, source index, and board.
3. Use `$source` to verify material external constraints from official docs.
4. Read [references/work-item-model.md](references/work-item-model.md).
5. Create one epic only when several standard items share one outcome.
6. Create sprint-sized stories for independent user value.
7. Add bugs, tasks, or subtasks only when they clarify real work.
8. Add measurable delivery acceptance criteria. Do not copy the product outcome metric as ticket acceptance.
9. Classify applicable risks and add their required quality gates.
10. Add verification commands for code changes.
11. Name relevant local source-note paths in the work-item description.
12. Link each epic and story to the confirmed brief with `--brief`.
13. Mark knowledge `required` for every epic and story.
14. Link every hard ordering dependency with `blocked-by`.
15. Keep the dependency graph acyclic.
16. Identify tickets that can run in parallel without likely write overlap.
17. Treat epics as coordination items, not implementation branches.
18. Describe the expected release slice, target, migration, rollout, recovery, and outcome measurement.
19. Move fully defined items to `ready`, even when a blocker delays their start.
20. Run `validate` and report ready, blocked, parallel, risk-gated, and release groups.

## Example

```bash
node .project/bin/project-flow.mjs create \
  --type story \
  --parent APP-1 \
  --brief BRIEF-1 \
  --summary "Persist tasks" \
  --description "As a user, I want saved tasks so that they survive restarts." \
  --accept "A valid task is stored in SQLite." \
  --accept "Saved tasks appear after a reload." \
  --risk-factor migration \
  --gate migration \
  --check "Tests::npm test" \
  --check "Build::npm run build"
```

## Boundaries

- Do not implement code.
- Do not initialize or refresh the workflow.
- Do not create speculative knowledge facts.
- Do not plan against an external technical claim supported only by model memory.
- Do not treat official technical documentation as product-need evidence.
- Do not move an epic or story to ready without a confirmed brief.
- Do not omit a quality gate required by a declared risk factor.
- Do not use an epic when one story is enough.
- Do not use `relates-to` when one ticket must finish before another starts.
- Do not claim worktrees make dependent or overlapping changes independent.
- Do not enter `done` through a status edit.
- Stop after the plan is valid and ready.
