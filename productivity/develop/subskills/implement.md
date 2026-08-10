---
name: implement
description: Implement Epics, Stories or Bug Tickets either directly or using subagents
---

Check if the implementation is likely to extend a context window of 150.000 tokens. If not, implement it directly.

If it is though (like when implementing entire Epics or Stories / Bug tickets), create a subagent for each task. 

If there are several tasks to be worked on, analyze them first to see if multiple subagents working on them could interfer with each other. If that is the case, work on the tasks sequentially. If not, use parallel subagents.

## Possible subagents (see `references/models.md`)

- UI-heavy work: role: Frontend engineer; job: implement the UI heavy task; model: the one with the best taste
- Coding-heavy work: role: Backend engineer; job: implement the Coding-heavy task; model: the most intelligent model
- Database-heavy work: role: Database specialist; job: implement the Database-heavy task; model: a balanced one

## Code review

After each ticket is done, do a code review using the review subskill. Fix all findings that are reported.

## Wiki Updates

Add or update the Wiki as the tasks are implemented.

## Backlog Updates

- When a ticket or Epic is done, check all marks inside the document and mark it as done inside the backlog index document. Release the claim on it.

## Versioning

- If on main branch create a new branch per ticket and merge it with a merge commit when done and green
- Commit units of work (ie. one commit after each subtask and after a ticket or Epic is done)
