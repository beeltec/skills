---
name: develop
description: A gateway skill to route to subskills that help planning and developing features
metadata:
  author: Christian Beelte
  version "0.1"
---

When communicating with the user always adhere to ISO 24495 at `references/iso-24495.md`. and ASD-STE100 Simplified Technical English at `references/asd-ste100.md`.

If this project uses the okf wiki (check if docs/wiki/ubiquitous-language.md exists) only use these terms. If a new term is introduced by the user, ask if it should be added to the document.

Based on the prompt load the instructions for one of the following subskills from `subskills/{subskill_name}.md`:

- codebase -> Exact words `analyze codebase` or general instruction to analyze and/or map the codebase
- discuss -> Exact words `discuss`, `let's talk about...` or if the prompt contains a question about a new feature or extension of an existing one
- plan -> Exact word `plan` or if the user mentions creating an Epic, a User Story or a Bug Ticket. Can be a follow-up from a discussion session
- implement -> Exact word `implement` or if the user mentions coding or implementing something
