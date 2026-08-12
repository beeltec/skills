---
name: codebase
description: Analyze the codebase and return a summary of it
---

## Subagents (see `references/models.md`)

Using up to 10 subagents analyze the entire codebase of this project (excluding docs folder):

- applications, services, packages, and libraries;
- languages, frameworks, package managers, and build systems;
- workspaces, tests, generated code, and documentation;
- infrastructure, CI/CD, schemas, migrations, and protocol definitions;
- probable entry points, runtime units, and deployment units.

Use the cheapest model available.

## Aggregate

Return an aggregated report from all subagents with a heading for each of them verbatim or lightly cleaned. Do not merge or rerank findings.
