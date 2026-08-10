---
name: codebase
description: Analyze the codebase and return a summary of it
---

Using three subagents analyze the entire codebase of this project (excluding docs folder):

1. role: analyst; job: tech stack including all used libraries
2. role: analyst; job: code styling / conventions
3. role: analyst; job: api contracts

Use the cheapest model available to the harness (check `references/models.md`).

Return a comprehensive summary.
