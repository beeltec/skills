---
name: codebase
description: Analyze the codebase and return a summary of it
---

Using three subagents analyze the entire codebase of this project (excluding docs folder):

1. role: analyst; job: tech stack including all used libraries
2. role: analyst; job: code styling / conventions
3. role: analyst; job: api contracts

Use the cheapest model available (check `references/models.md`).

Return an aggregated report from all subagents with a heading for each of them verbatim or lightly cleaned. Do not merge or rerank findings.
