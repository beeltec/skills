---
name: plan
description: Plan an Epic, a User Story or a Bug Ticket
---

If this project does not use the Beelte backlog, do the planning in a single root `PLAN-XXX.md` file in the root of the project.

Based on the data you got think about what would make the most sense:

- Is it simple enough to fit into one Story? -> Create a standalone Story
- Do we need multiple Stories to reflect it? -> Create an Epic with multiple Stories
- Create more than one Epic if the Stories can be broken up into several logical units

Use one of these templates:

- Backlog Index `assets/templates/backlog/backlog-index.md`
- Epic: `assets/templates/backlog/epic.md`
- Story: `assets/templates/backlog/story.md`
- Bug Ticket: `assets/templates/backlog/bug.md`

Keep the Backlog index current at all times. Update it after adding or updating work items.

When creating subtasks be very granular about it. Always ask yourself "Will the agent implementing it likely exceed a context window of 150.000?". If so, be more granular so it will likely stay under it.

Check the Wiki for each mentioned technology. If it does not exist in it, use tools like Context7 and the web search to fill it with guidelines, best practices, examples, etc. 
Use research subagents (max amount of 4, see `references/models.md`) with cheapest model. Wait until all subagents have finished their work before you start writing the Epics and tickets.
Otherwise read these documents and use their info.

Commit your work when done.
