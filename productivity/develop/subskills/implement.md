---
name: implement
description: Implement Epics, Stories or Bug Tickets either directly or using subagents
---

## Direct implementation vs. subagent-driven implementation

Analyze all tickets and their subtasks that need to be implemented. 
If they are likely to be finished in a single session with less than 150k tokens implement them directly. 
Otherwise use a dynamic workflow (use the name of the branch) with one implementing subagent. The workflow is necessary for code review agents later one.
If the harness does not support dynamic workflows just use a normal subagent.
Keep the implementing subagent alive as it will be responsible for implementing the fixes proposed by the code reviewing subagents.

## Possible subagents

see `references/models.md`

## Follow-ups

If new work comes up during implementation (like bugs that need new bug tickets or additional work that need stories) use the plan subskill to plan this work.
If this comes up during the implementation of an Epic add these tickets to the current epic. 
Queue the new tickets up so they are implemented in the same run unless stated otherwise by the user.

## Style / Preferences

- Focus on building complex things as simple as possible. Find ways to reduce complexity when solving problems
- Keep things simple. Channel "YAGNI" energy unless told otherwise
- Type safety is useful - take advantage of it
- Keep comments inside code to a minimum. Never mention any tickets and/or Epics inside them

## Claiming

When claiming a ticket in the backlog use the exact model name of the implementing agent as the owner and the asignee. 
The asignee must not be changed or removed afterwards while the owner will be released after implementation.

## Code review

Before a ticket is marked done and merged back do a code review loop using the review subskill. 
If using subagent-driven implementation spawn them inside the dynamic workflow, not on the orchestrator.
If the harness does not support dynamic workflows spawn the code review subagents on the orchestrator instead.
Let the subagent that originally did the implementation do the fixing as it still has all the context!
If working on an Epic, do an additional code review loop using the review subskill at the end of the Epic and spawn fresh subagents to mitigate the findings.
Keep doing code reviews until no P0, P1 and P2 findings are left.

## Wiki usage

Before implementation always check the wiki for important infos (for example on coding guidelines and best practices).
Add or update the Wiki as the tasks are being implemented.

## Backlog Updates

When a ticket or Epic is done and green, check all marks inside the document and mark it as done inside the backlog index document. Finally release the claim on it.

## Versioning

- If on main branch create a new branch per ticket (`{feat,fix,hotfix,chore,docs}/{story,bug}-xxx_title`) and merge it with a merge commit when done and green
- Always make sure to delete every merged branch and their worktrees
- Commit units of work (ie. one commit after each subtask and after a ticket or Epic is done)
- If working with subagents create a worktree for each ticket and run the subagents in parallel on tickets that are not blocked
- Parallel worktrees make branches independently green but say nothing about their combination, so a semantic-conflict check on the merge result is mandatory, not optional
- Worktrees need to be created in the gitignored folder {project_root}/.worktrees in the format `{story,bug}-xxx_title`.
