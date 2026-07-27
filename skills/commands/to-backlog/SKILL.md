---
name: to-backlog
description: Intake the conversation's confirmed standalone work items and refine each to ready under one standing approval. Not for coordinated multi-item outcomes — use to-epic.
disable-model-invocation: true
---

# To Backlog

Invoking this skill is the owner's standing approval for the full planning transaction set of the standalone work items confirmed in this conversation — intake, refinement, rank placement, every `proposed -> ready` transition — superseding `$backlog`'s per-transaction pauses for exactly these transactions; follow `$backlog` for everything else. It additionally authorizes `$guidance` publication for the subjects the owner names at step 2, and nothing else in `docs/wiki`. It never authorizes Epic creation, cancellation, other wiki mutation, execution claims, or records outside these items.

Pause only at the evidence decision (step 2), a `$guidance` rule-replacement pause, and hard blockers; otherwise run to completion and report. Only `$to-product`'s contract covers the rule-replacement pause — never otherwise suppress it. User-invoked only — or by `$to-product`, whose autonomous contract auto-answers every pause.

## Workflow

1. **Item intake** — Enumerate the desired changes the user explicitly confirmed in this conversation and create each as the smallest coherent, independently valuable Story, Task, or Bug with `parent: none`, relationships, blockers, and provenance via `$backlog` intake. If the changes are coherent parts of one coordinated outcome that should form an Epic, stop and recommend `/to-epic` instead — never manufacture sibling fragments of a hidden Epic. If the user names existing `proposed` standalone records, resume each at its first incomplete step; reject `ready`, `in-progress`, or terminal records. Rank placement: the user's stated position, else append in dependency order at the end of the global rank.
2. **Evidence decision** — Before refinement, inventory the technologies and standards the items implicate, using `$research`'s delta-scoped subject rule — never a whole-stack survey. Apply `$research` step 2's concept triggers; name each implicated standard subject or record why none applies — an empty standards half without a recorded reason is invalid. Report each subject's page state under `docs/wiki/engineering/`: missing, `draft`, version-mismatched against the manifest, stale per `$research`'s thresholds, or current. Then ask the owner one question covering both: run `$guidance` for which of those subjects, and run `$research` for which items? Never skip or answer either half yourself, unless `$to-product`'s autonomous contract answers it.
   - `$guidance` → naming a subject is the decision to run `$guidance` for it now, before refinement — deferring it to implementation or acceptance is not an outcome. Run it for the named subjects only, under this invocation's approval; `$research`'s no-wiki-during-planning rule does not apply to `$guidance` pages.
   - `$research` yes → run it per named item after guidance; use the findings in refinement.
   - `$research` no → record the decision on each item. If a version-specific or security-sensitive question surfaces later, ask again for that record — never relabel uncertainty.
3. **Refine to ready** — For each item in rank order: refine against its type template and accepted wiki state; resolve research (`complete` from a run, `not-needed` only with inspecting evidence); resolve `decisions` per `$backlog`'s Definition of Ready, reading existing ADRs first and naming any one a draft would supersede — `decisions: none` only when the significance test records no qualifying decision; every decision confirmed in discussion or named in the record body stays `pending` with an ADR-shaped draft, never deferred in prose; fill `## Execution` with approach and verification commands, citing this invocation as the recorded approval; verify the full Definition of Ready; transition to `ready`. Never allocate or publish an ADR here — publication happens at acceptance.
4. **Report** — Item IDs with type, status, rank position, research state, and decisions state with each drafted decision named; the evidence decision, every guidance page created or refreshed, and every rule-replacement pause with its outcome; commit hashes; the final `node scripts/validate-project.mjs` result. Any record left `proposed` gets its named blocker and resumption point.

A failed validator, unresolved research the owner declined, or a missing readiness requirement is a blocker: leave the record `proposed`, keep committed transactions intact, and report — never force `ready`.

End the report with `Next step:` — one copy-pasteable command from the outcome: everything ready → `/implement` with the highest-ranked new `WORK-NNN`; a record left `proposed` → the exact command that resumes it after its named blocker.
