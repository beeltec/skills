---
name: to-tasks
description: Turn a conversation or specification into linked task documents with bounded subtasks and progress checklists. Use when the user asks to plan work, break a spec into tasks, or create an implementation backlog.
---

If the folder docs/tasks does not exist yet, create it and add it to the .gitignore file

Break the work down into smaller tasks that will likely not exceed a context window of 175.000 tokens. Create task documents out of it in docs/tasks/{shell_safe_branch_name}/{001}_description.md.

Each task document should have comprehensive instructions and a markdown checklist of all substasks this task contains.

Create one master task document that contains a summary of all of the work that needs to be done and add links to all tasks including their status.

Each task document should also have a link to the master document, the previous task document and the next task document.
