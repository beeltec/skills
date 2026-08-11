---
name: develop
description: A gateway skill to route to subskills that help planning and developing features
metadata:
  author: Christian Beelte
  version "0.1"
---

## AGENTS.md and CLAUDE.md

Based on the executing harness the memory file is either CLAUDE.md (Claude Code) or AGENTS.md (all other harnesses). 
When AGENTS.md is mentioned it means CLAUDE.md for Claude Code. The only exception is when no memory file is present, then AGENTS.md should be created and CLAUDE.md should be created as a symlink to AGENTS.md

## Setup check

First check if AGENTS.md exists using `[ -f ./AGENTS.md ] && echo 1 || echo 0`. If 0 load `setup` subskill and execute it.
If 1 check it if we are using our file and folder structure for the backlog and Wiki. If no mention of it is in it, load `setup` subskill and execute it.
In both cases explicitly write `Setup necessary, loading setup subskill`.
The execution of this skill **has to be done before the execution of any other skill** and the user needs to answer. It cannot be run autonomously.

## Wiki and Backlog scope

Instructions mentioning the Wiki and/or Backlog must only be executed if the project uses the Beelte Wiki and/or Backlog. **Skip them otherwise**.

## Language

Only use the terms from the Wiki's ubiquitous language document. If a new term is introduced by the user, ask if it should be added to the document.

When communicating with the user always adhere to ISO 24495 at `references/iso-24495.md`. and ASD-STE100 Simplified Technical English at `references/asd-ste100.md`.
Also assume the user is not a native English speaker and use simple terms during communication with them.

## List of subskills

Based on the prompt load the instructions for one of the following subskills from `subskills/{subskill_name}.md`:

- codebase -> Exact words `analyze codebase` or general instruction to analyze and/or map the codebase
- discuss -> Exact words `discuss`, `let's talk about...` or if the prompt contains a question about a new feature or extension of an existing one
- implement -> Exact word `implement` or if the user mentions coding or implementing something
- plan -> Exact word `plan` or if the user mentions creating an Epic, a User Story or a Bug Ticket. Can be a follow-up from a discussion session
- review -> Exact words `code review` or `review` as well as being invoked by the model. Does an adversarial code review on the changes since a fixed point on two axes
- setup -> Exact word `setup` or invoked by the model. Sets up the file and folder structure or adds a note that this project is not using it
- wiki -> Use it when writing to the Wiki

## Mapping the project

Use the codebase subskill if you need to map the project.

## Working with subagents

Always make sure to close a subagent when you received it's report except for implementation agents as they might still be needed for further work after code reviews. 
Close them when all work is done from them.

## Asking the user

When asking the user anything (not just in the discuss subskill) use AskUserQuestion tool if it is available (in that case **it is non negotiable**).

## Autonomous work

If the user mentions running the flow autonomously (or something like "don't stop working" or "work without asking me"), go through this flow without ever stopping to ask the user:
1. discuss with yourself using only recommended answers (discuss subskill)
2. plan the work (plan subskill)
3. implement the work including review cycle where applicable (implement subskill)
4. make sure no branches opened by yourself stay open
