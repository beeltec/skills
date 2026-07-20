---
name: handoff
description: Save task-relevant conversation and workspace context to a temporary Markdown file in docs/handoffs, then provide the exact prompt another agent should use to resume. Use when handing unfinished work to a new agent or session.
---
Create one self-contained handoff that lets another agent continue without asking the user to repeat context.

1. Stop task work and resolve the project root with `git rev-parse --show-toplevel`, falling back to the current directory outside Git.
2. Inspect the conversation, applicable agent instructions, branch, `git status`, relevant diffs, changed files, and validation results.
3. Create `<project-root>/docs/handoffs/` and a unique `handoff-YYYYMMDD-HHMMSS.md`; never overwrite another handoff.
4. Record the timestamp, project root, branch, objective, original requirements, completed and partial work, exact stopping point, workspace state, decisions and rationale, validation, blockers, failed approaches, ordered next steps, first concrete action, and key files. Mark empty sections `None`.
5. Exclude secrets, environment dumps, and unrelated conversation. Do not commit this temporary file unless asked.
6. Read the file back and verify that it is non-empty, accurate, and names the next action.

After success, present the repository-relative path followed by this exact prompt with the path substituted:
`Continue the work from <repository-relative handoff path>`
Do not continue the underlying task after presenting the prompt.
