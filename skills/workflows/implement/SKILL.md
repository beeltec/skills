---
name: implement
description: Implement a task plan from start to finish, including branching, incremental commits, tests, documentation lookup, review, and local integration. Use when the user asks to execute an existing task breakdown or work plan.
---

Implement the work described by the user.

If we are not yet on a work branch create it using [Conventional Branch Specification](https://conventionalbranch.org/#specification) but never use AI Agent Source Prefixes.

After each subtask is done, mark it as done in the task document and do a conventional git commit with optional scope.

Check the wiki regularly for guidance and documentation on used technologies.

If the wiki has no data on the used technologies, use context7 and web search before using a technology to retrieve the latest documenation, best practices and recommendations on it. Update the wiki with this info.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

When a task is done (and only a task, not a subtask) use /code-review to review the work.

When all tasks are done and green, merge the branch with a merge commit, checkout the primary branch and delete the work branch locally
