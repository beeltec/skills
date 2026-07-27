---
name: to-wiki
description: Publish the conversation's confirmed durable knowledge to the wiki under one standing approval, including ADRs for decisions already in force. Not for unimplemented proposals — use to-backlog.
disable-model-invocation: true
---

# To Wiki

Invoking this skill is the owner's standing approval for publishing the durable knowledge explicitly confirmed in this conversation — from discussion or codebase inspection: concept creation, correction or extension, ADR publication for decisions already in force, ubiquitous-language additions and corrections, and derived index, link, metadata, and log changes — superseding `$wiki`'s per-transaction pauses for exactly these additive and corrective transactions; follow `$wiki` for everything else. It never authorizes deprecating or deleting an existing concept, superseding an existing ADR, mutating `docs/backlog`, publishing proposal-shaped content, or touching unconfirmed knowledge.

Pause only at the step 3 per-item candidates and hard blockers; otherwise run to completion and report. User-invoked only — or by `$to-product`, whose autonomous contract additionally auto-approves the step 3 pauses — concept deprecation, concept deletion, ADR supersession — and reports each individually.

## Workflow

1. **Collect candidates** — Enumerate every conclusion the user explicitly confirmed in this conversation, including confirmed terminology and confirmed architectural decisions. Classify each against `$wiki` knowledge eligibility: accept only durable facts, behavior, rules, decisions, and guidance already describing accepted current primary-branch state. Apply the ADR significance test to every confirmed decision and mark each qualifying one as an ADR candidate. Reject desired changes, target specifications, decisions that only take effect once proposed work ships, and unresolved questions — route them to `$backlog` in the report; never publish them.
2. **Verify and publish** — For each accepted candidate in dependency order: verify its claims against repository evidence per `$wiki`; place it under its canonical owning concept or create the narrowest cohesive concept; apply the edit with required indexes, links, metadata, and log entries as validated `$wiki` durable transactions, citing this invocation as the recorded approval. Batch coherent edits into shared transactions where `$wiki` allows.
3. **Per-item pause** — When a confirmed conclusion requires deprecating or deleting an existing concept, or superseding an existing ADR, present that exact transaction individually — evidence, inbound references, the ADR pair in both directions, and effects — and apply it only on explicit per-item approval. Never fold it into the standing approval, except under `$to-product`'s autonomous contract, which approves it and logs it individually.
4. **Report** — Published concepts, ADRs with their allocated `ADR-NNN`, and terminology with their transactions and commit hashes; rejected candidates with their `$backlog` routing; any destructive or supersession decisions and their outcomes; the final `node scripts/validate-project.mjs` result.

A failed validator, evidence contradicting a confirmed conclusion, or unestablished current acceptance is a blocker: publish nothing for that candidate, keep committed transactions intact, and report — never force acceptance.

End the report with `Next step:` — one copy-pasteable command from the outcome: rejected desired-change candidates → `/to-backlog` naming them; otherwise `/implement` with the highest-ranked ready `WORK-NNN` when one exists; omit when none follows.
