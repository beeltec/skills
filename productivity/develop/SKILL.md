---
name: develop
description: A gateway skill to route to subskills that help planning and developing features
metadata:
  author: Christian Beelte
  version "0.1"
---

First check the AGENTS.md if we are using our file and folder structure for the backlog and Wiki. If no mention of it is in it, load `setup` subskill and execute it. 
The execution of this skill **has to be done before the execution of any other skill** and the user needs to answer. It cannot be run autonomously.

If this project uses the Wiki only use the terms from `docs/wiki/ubiquitous-language.md`. If a new term is introduced by the user, ask if it should be added to the document.

When communicating with the user always adhere to ISO 24495 at `references/iso-24495.md`. and ASD-STE100 Simplified Technical English at `references/asd-ste100.md`.

Based on the prompt load the instructions for one of the following subskills from `subskills/{subskill_name}.md`:

- codebase -> Exact words `analyze codebase` or general instruction to analyze and/or map the codebase
- discuss -> Exact words `discuss`, `let's talk about...` or if the prompt contains a question about a new feature or extension of an existing one
- implement -> Exact word `implement` or if the user mentions coding or implementing something
- plan -> Exact word `plan` or if the user mentions creating an Epic, a User Story or a Bug Ticket. Can be a follow-up from a discussion session
- setup -> Exact word `setup` or invoked by the model. Sets up the file and folder structure or adds a note that this project is not using it
- wiki -> Use it when writing to the Wiki

When asking the user anything use AskUserQuestion tool for every question if the tool is available (in that case **it is non negotiable**).
