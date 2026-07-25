---
name: to-wiki
description: Publish the conversation's confirmed durable knowledge — from discussion or codebase inspection — to a setup-project wiki without per-edit approval pauses, including ADRs for decisions already in force. Use when the user asks to publish confirmed current-state conclusions or ADRs to the wiki.
disable-model-invocation: true
---

# To Wiki

Invoking this skill is the owner's standing approval for publishing the durable knowledge explicitly confirmed in the current conversation — whether it emerged from discussion or from inspecting the existing codebase: concept creation, correction or extension of existing concepts, ADR publication for decisions already in force, ubiquitous-language additions and corrections, and the derived index, link, metadata, and log changes. This supersedes `$wiki`'s per-transaction approval pauses for exactly these additive and corrective transactions; follow `$wiki` for everything else — preflight, knowledge eligibility, ownership, evidence, sources, validation, staging, commits.

It never authorizes deprecating or deleting an existing concept, superseding an existing ADR, mutating `docs/backlog`, publishing proposal-shaped content, or touching knowledge the conversation did not confirm. Pause for user input only on the per-item candidates in step 3 and hard blockers; otherwise run to completion and report.

Stay on the current branch — never create, switch, merge, or delete branches. Never create, inspect, or depend on `docs/tasks`.

## Workflow

1. **Collect candidates** — Enumerate every conclusion the user explicitly confirmed in this conversation, including confirmed terminology and confirmed architectural decisions. Classify each against `$wiki` knowledge eligibility: accept only durable facts, behavior, rules, decisions, and guidance already describing accepted current primary-branch state. Apply the ADR significance test to every confirmed decision and mark each qualifying one as an ADR candidate. Reject desired changes, target specifications, decisions that only take effect once proposed work ships, and unresolved questions — route them to `$backlog` in the report; never publish them.
2. **Verify and publish** — For each accepted candidate in dependency order: verify its claims against repository evidence per `$wiki`; place it under its canonical owning concept or create the narrowest cohesive concept; apply the edit with required indexes, links, metadata, and log entries as validated `$wiki` durable transactions, citing this invocation as the recorded approval. Batch coherent edits into shared transactions where `$wiki` allows.
3. **Per-item pause** — When a confirmed conclusion requires deprecating or deleting an existing concept, or superseding an existing ADR, present that exact transaction individually — evidence, inbound references, the ADR pair in both directions, and effects — and apply it only on explicit per-item approval. Never fold it into the standing approval.
4. **Report** — Published concepts, ADRs with their allocated `ADR-NNN`, and terminology with their transactions and commit hashes; rejected candidates with their `$backlog` routing; any destructive or supersession decisions and their outcomes; the final `node scripts/validate-project.mjs` result.

A failed validator, evidence contradicting a confirmed conclusion, or unestablished current acceptance is a blocker: publish nothing for that candidate, keep committed transactions intact, and report — never force acceptance.

End the report with `Next step:` — one copy-pasteable command from the outcome: rejected desired-change candidates → `/to-backlog` naming them; otherwise `/implement` with the highest-ranked ready `WORK-NNN` when one exists; omit when none follows. Recommend only — never invoke it. It is the report's last line; if several must run, end with a numbered list in run order.
