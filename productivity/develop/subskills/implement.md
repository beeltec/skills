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

Add or update the Wiki as the tasks are implemented.

Commit units of work (ie. one commit after each Story or Bug Ticket and after an Epic is done)
