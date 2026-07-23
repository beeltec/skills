---
name: to-wiki
description: Publish the durable knowledge confirmed in the current conversation — from discussion or codebase inspection — to a setup-project wiki as one end-to-end transaction set without per-edit approval pauses. Use when the user asks to publish confirmed current-state conclusions to the wiki.
disable-model-invocation: true
---

# To Wiki

Invoking this skill is the project owner's standing approval for publishing the durable knowledge explicitly confirmed in the current conversation — whether it emerged from discussion or from inspecting the existing codebase: concept creation, correction or extension of existing concepts, ubiquitous-language additions and corrections, and the derived index, link, metadata, and log changes. This supersedes `$wiki`'s per-transaction approval pauses for exactly these additive and corrective transactions; follow `$wiki` for everything else — preflight, knowledge eligibility, ownership, evidence, sources, validation, staging, commits.

It never authorizes deprecating or deleting an existing concept, mutating `docs/backlog`, publishing proposal-shaped content, or touching knowledge the conversation did not confirm. Pause for user input only on destructive candidates (step 3) and hard blockers; otherwise run to completion and report.

Stay on the current branch. Never create or use `docs/tasks`.

## Workflow

1. **Collect candidates** — Enumerate every conclusion the user explicitly confirmed in this conversation, including confirmed terminology. Classify each against `$wiki` knowledge eligibility: accept only durable facts, behavior, rules, decisions, and guidance already describing accepted current primary-branch state. Reject desired changes, target specifications, and unresolved questions — route them to `$backlog` in the report; never publish them.
2. **Verify and publish** — For each accepted candidate in dependency order: verify its claims against repository evidence per `$wiki`; place it under its canonical owning concept or create the narrowest cohesive concept; apply the edit with required indexes, links, metadata, and log entries as validated `$wiki` durable transactions, citing this invocation as the recorded approval. Batch coherent edits into shared transactions where `$wiki` allows.
3. **Destructive pause** — When a confirmed conclusion requires deprecating or deleting an existing concept, present that exact transaction individually — evidence, inbound references, and effects — and apply it only on explicit per-item approval. Never fold it into the standing approval.
4. **Report** — Published concepts and terminology with their transactions and commit hashes; rejected candidates with their `$backlog` routing; any destructive decisions and their outcomes; the final `node scripts/validate-project.mjs` result.

A failed validator, evidence contradicting a confirmed conclusion, or unestablished current acceptance is a blocker: publish nothing for that candidate, keep committed transactions intact, and report — never force acceptance.

End the report with `Next step:` — one copy-pasteable command from the outcome: rejected desired-change candidates → `/to-backlog` naming them; otherwise `/implement` with the highest-ranked ready `WORK-NNN` when one exists. Recommend only — never invoke it; omit the line when no follow-up exists.
