---
name: implement
description: Implement a task plan from start to finish, including branching, incremental commits, tests, documentation lookup, review, and local integration. Use when the user asks to execute an existing task breakdown or work plan.
---

Implement the work described by the user.

First check the wiki at docs/wiki for information and guidance regarding the current task including tech documentation in docs/wiki/engineering/technologies.

If we are not yet on a work branch create it with /create-conventional-branch

After each subtask is done (**subtask**, not the entire task!), check the task document's checklist, mark the completed subtask as done there, and do a conventional git commit with optional scope.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Do not overengineer. Also always ask yourself if you can implement something more elegantly with less code.

When a task is done (and only a task, not a subtask) use /code-review to review the work.

When all tasks are done and green, merge the branch with a merge commit, checkout the primary branch and delete the work branch locally
