---
name: implement
description: Implement Epics, Stories or Bug Tickets either directly or using subagents
---

## Direct implementation vs. subagent-driven implementation

Analyze all tickets and their subtasks that need to be implemented. 
If they are likely to be finished in a single session with less than 150k tokens implement them directly. Otherwise use subagents. 

## Possible subagents (see `references/models.md`)

- UI-heavy work: role: Frontend engineer; job: implement the UI heavy task; model: the one with the best taste
- Coding-heavy work: role: Backend engineer; job: implement the Coding-heavy task; model: the most intelligent model
- Database-heavy work: role: Database specialist; job: implement the Database-heavy task; model: a balanced one

## Follow-ups

If new tickets are created during the implementation work, queue them up so they are worked on as well automatically during this run.

## Style / Preferences

- Focus on building complex things as simple as possible. Find ways to reduce complexity when solving problems
- Keep things simple. Channel "YAGNI" energy unless told otherwise
- Type safety is useful - take advantage of it
- Keep comments inside code to a minimum. Never mention any tickets and/or Epics inside them

## Claiming

When claiming a ticket in the backlog use the exact model name of the implementing agent as the owner and the asignee. 
The asignee must not be changed or removed afterwards while the owner will be released after implementation.

## Code review

After each ticket is done, do a code review using the review subskill. Fix all findings that are reported. 
If using subagent-driven implementation direct the findings to the subagent that did the original implementation as that still has all the necessary context.
If working on an Epic, do an additional code review pass using the review subskill at the end of the Epic and spawn fresh subagents to mitigate the findings.

## Wiki usage

Before implementation always check the wiki for important infos (for example on coding guidelines and best practices).
Add or update the Wiki as the tasks are implemented.

## Backlog Updates

When a ticket or Epic is done and green, check all marks inside the document and mark it as done inside the backlog index document. Finally release the claim on it.

## Versioning

- If on main branch create a new branch per ticket and merge it with a merge commit when done and green
- Always make sure to delete every merged branch
- Commit units of work (ie. one commit after each subtask and after a ticket or Epic is done)
