---
name: to-guidance
description: Research and publish durable technology and standards guidance — versions, coding guidelines, best practices, adopted rules, project deviations — as canonical wiki pages under docs/wiki/engineering/, and refresh them when they go stale. Use when persisting or updating guidance for a language, framework, runtime, library, tool, or cross-cutting standard so implementation agents stop re-researching it for every Epic.
disable-model-invocation: true
---

# To Guidance

Invoking this skill is the owner's standing approval for publishing and refreshing durable engineering guidance for the named subjects: page creation, rule additions, corrections, version and review-metadata updates, and the derived index, link, and log changes. This supersedes the per-transaction approval pauses in `$guidance` and `$wiki` for exactly those additive and corrective transactions.

It never authorizes reversing or removing an already-adopted rule without the rule-replacement pause, deprecating or deleting a page, mutating `docs/backlog`, or publishing guidance for a subject the project does not actually use.

Stay on the current branch — never create, switch, merge, or delete branches. Never create, inspect, or depend on `docs/tasks`.

Run `$guidance` under this standing approval for the subjects the user named — with none named, let it inventory candidates from repository evidence and ask — then report its result.
