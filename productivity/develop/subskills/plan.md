---
name: plan
description: Plan an Epic, a User Story or a Bug Ticket
---

Based on the data you got think about what would make the most sense:

- Is it simple enough to fit into one Story? -> Create a standalone Story
- Do we need multiple Stories to reflect it? -> Create an Epic with multiple Stories

Before creating the markdown files, make sure the backlog structure noted in `references/folder-structure` exists. If not create it. 

This is only about backlog, not Wiki. Do not read Wiki related references like okf.md if not explicitly stated.

Use one of these templates:

- Backlog Index `assets/templates/backlog/backlog-index.md`
- Epic: `assets/templates/backlog/epic.md`
- Story: `assets/templates/backlog/story.md`
- Bug Ticket: `assets/templates/backlog/bug.md`

Keep the Backlog index current at all times. Update it after adding or updating work items.

When creating subtasks be very granular about it. Always ask yourself "Will the agent implementing it likely exceed a context window of 150.000?". If so, be more granular so it will likely stay under it.
