---
name: develop
description: A gateway skill to route to subskills that help planning and developing features
metadata:
  author: Christian Beelte
  version "0.1"
---

When communicating with the user always adhere to ISO 24495 at `references/iso-24495.md`. and ASD-STE100 Simplified Technical English at `references/asd-ste100.md`.

Based on the prompt load the instructions for one of the following subskills from `subskills/{subskill_name}.md`:

- discuss -> Exact word's `discuss`, `let's talk about...` or if the prompt contains a question about a new feature or extension of an existing one
- plan -> Exact word `plan` or if the user mentions creating an Epic, a User Story or a Bug Ticket. Can be a follow-up from a discussion session
