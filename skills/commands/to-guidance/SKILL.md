---
name: to-guidance
description: Owner entry point that runs guidance under one standing approval for the named subjects. Use when asked to persist or refresh adopted technology or standards guidance.
disable-model-invocation: true
---

# To Guidance

Invoking this skill is the owner's standing approval for publishing and refreshing durable engineering guidance for the named subjects: page creation, rule additions, corrections, version and review-metadata updates, and the derived index, link, and log changes. This supersedes the per-transaction approval pauses in `$guidance` and `$wiki` for exactly those additive and corrective transactions.

It never authorizes reversing or removing an already-adopted rule without the rule-replacement pause, deprecating or deleting a page, mutating `docs/backlog`, or publishing guidance for a subject the project does not actually use.

User-invoked only — or invoked by `$to-product`, whose autonomous contract additionally auto-approves the rule-replacement pause and reports each reversal individually.

Stay on the current branch — never create, switch, merge, or delete branches. Never create, inspect, or depend on `docs/tasks`.

Run `$guidance` under this standing approval for the subjects the user named — with none named, let it inventory candidates from repository evidence and ask — then report its result.
