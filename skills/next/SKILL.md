---
name: next
description: Use this helper skill whenever a user asks what to do next, where the project is in the workflow, which workflow skill to use, why work cannot proceed, or how to resume after an interruption. Inspect local workflow, Git, shared language, brief, ticket, epic-wide review, release, and outcome state. Recommend the single smallest valid next action, using an epic rather than one child story when a brief has an epic, without changing state or performing that action.
---

# Next

Find the next valid workflow action from repository evidence. Give guidance,
not execution.

## Procedure

1. Find the project root from `.project/workflow.json`.
2. If it is missing, recommend `$setup` and stop.
3. Run the remaining checks from that project root.
4. Read project `AGENTS.md` instructions and `.project/workflow.json`.
5. Read the indexes and `docs/knowledge/ubiquitous-language.md` as the project Ubiquitous Language.
6. Read the work board and the brief, release, and outcome indexes.
7. If `.project/bin/project-flow.mjs` is missing, recommend `$setup` and stop.
8. Run `node .project/bin/project-flow.mjs validate` without changing state.
9. Use the user's named record as the focus when one is named.
10. Read [references/routing.md](references/routing.md).
11. Inspect active release records first for a rollout or user-harm risk.
12. Resolve the Git root. Recommend `$setup` if no Git repository exists.
13. Resolve canonical workflow and Git root paths and compare them.
14. If the roots differ, report the scope choice from the routing reference.
15. Check whether the Git repository has an initial commit.
16. Run `git status --short --branch` and the CLI's `worktree-list` command.
17. Locate the configured target-branch worktree and inspect its status.
18. Inspect active records and read each focused source record.
19. Resolve a story with an epic parent to that epic implementation scope.
20. Select the smallest valid action from the strongest local evidence.
21. Report one recommendation, its reason, blockers, and the likely action after it.

Prefer finishing active work over starting more work. Prioritize a deploying or
harmful release because it may affect users. Never route a blocked ticket to
implementation. Follow its open blocker chain instead.

Use `$source` as the next action only when a missing or stale external fact is
the immediate blocker. Later workflow skills invoke their own source gate.

## Response format

```markdown
Next: `$implement APP-1`

Why: BRIEF-1 is planned as APP-1 with stories. Implement the epic as one coordinated unit.

Blocked by: Nothing.

Prompt: Use $implement to deliver APP-1 and run its one integrated review round.

After that: `$document APP-1` after review remediation is complete.
```

Replace the example with actual state. Keep the answer short. Include other
eligible work only when it materially affects the recommendation.

If an observation window is still open, state the wait condition and resume
action. If no work remains, say so and recommend `$discuss` only for a new or
changed outcome.

## Boundaries

- Do not edit, generate, synchronize, commit, merge, deploy, or measure.
- Do not discard, stash, move, or commit existing changes.
- Do not create an initial commit without user approval.
- Do not run another workflow skill.
- Do not infer state from model memory or conversation alone.
- Do not guess what an ambiguous project term means.
- Do not trust a stale generated index over its source record.
- Do not recommend one story when its confirmed brief is planned as an epic.
- Do not recommend an epic with an open blocker outside that epic.
- Do not recommend `document` while a P0, P1, or P2 lacks remediation evidence.
- Do not equate `done`, `green`, and `met`.
- Do not invent priority when two actions have equal evidence.
- Ask one short choice only when repository evidence cannot break a real tie.
