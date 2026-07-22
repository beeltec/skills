---
name: implement-with-subagents
description: Orchestrate implementation of a `$to-tasks` master task document by assigning each task to its own subagent, strictly one at a time and in dependency order. Use only when the user explicitly invokes `$implement-with-subagents` and supplies or identifies the master `000-overview.md`; never invoke implicitly for ordinary implementation requests.
---

# Implement with Subagents

Act almost entirely as an orchestrator. Keep ownership of sequencing, context, verification, and recovery; delegate the implementation of every task to a separate subagent. Do not implement task work in the orchestrator unless needed to inspect or verify it.

## Inputs

Require the master `docs/tasks/<feature>/000-overview.md` created by `$to-tasks`, either as a path supplied by the user or as an unambiguous document identified from the conversation. Read the complete master document and every linked task document before starting.

Accept these optional user settings:

- `model`: model to use for every task subagent.
- `reasoning effort`: reasoning effort to use for every task subagent.

Pass supplied settings through the spawn interface when it supports them. If the available interface cannot select a model or reasoning effort, state that once and use its defaults; do not claim the requested setting was applied.

## Workflow

1. Read applicable `AGENTS.md` files, the master document, all linked task documents, and relevant project instructions.
2. Validate that task links resolve, blockers refer to earlier tasks, and at least one incomplete task is actionable. Stop and report malformed or deadlocked plans instead of guessing.
3. Choose the lowest-numbered incomplete task whose blockers are complete.
4. Spawn exactly one fresh subagent dedicated to that task. Never have multiple task subagents running or paused at the same time. Do not spawn the next one until the current one has finished and its work has been verified.
5. Give the subagent a self-contained prompt containing:
   - an explicit instruction to invoke and follow `/implement` while executing its assigned task, scoped only to that task;
   - the task document path and instruction to read it completely;
   - the master document path and relevant blocker outcomes;
   - applicable repository and user constraints;
   - an instruction to inspect the existing workspace before editing;
   - an instruction to implement only that task, run proportionate checks, and update its checklists and status plus the matching master status;
   - an instruction to report changed files, checks, and remaining concerns.
6. Wait for that subagent to finish. Inspect its changes and evidence. Run cheap targeted checks when useful and confirm the task's acceptance criteria, checklist, and status are consistent with the master document.
7. If work is incomplete or verification fails, send a focused follow-up to the same task subagent with the evidence and wait again. Do not create another subagent for that task and do not start a later task. If the same subagent cannot continue, stop and report the blocker rather than violating the one-subagent-per-task rule.
8. After verification succeeds, finish that subagent before selecting and spawning a fresh subagent for the next actionable task.
9. Repeat sequentially until every task is complete. Then run the plan's final validation, reconcile all statuses and links, and summarize the completed work and verification.

## Guardrails

- One task maps to one subagent for the entire run.
- One subagent may work on only one task.
- Every task subagent must use `/implement` for its assigned task.
- Never parallelize task execution, even when tasks have no dependency edge.
- Never let a subagent broaden its task to later work.
- Preserve user changes and shared-workspace state between subagents.
- Do not mark a task complete until its acceptance criteria are verified.
- Pause for the user only when the plan is ambiguous, no task is actionable, a required decision is missing, or continuing would exceed authorized scope.
