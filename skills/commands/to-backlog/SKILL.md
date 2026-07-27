---
name: to-backlog
description: Intake the conversation's confirmed standalone work items and refine each to ready under one standing approval. Not for coordinated multi-item outcomes — use to-epic.
disable-model-invocation: true
---

# To Backlog

Invoking this skill is the owner's standing approval for the full planning transaction set of the standalone work items confirmed in the current conversation: intake, refinement, rank placement, and every `proposed -> ready` transition. This supersedes `$backlog`'s per-transaction approval pauses for exactly these transactions; follow `$backlog` for everything else — preflight, templates, relationships, Definition of Ready, validation, staging, commits. It never authorizes Epic creation, cancellation, wiki mutation, execution claims, or touching records outside these items.

Pause for user input only at the research decision (step 2) and on hard blockers; otherwise run to completion and report.

User-invoked only — or invoked by `$to-product`, whose autonomous contract auto-answers every pause above.

Stay on the current branch — never create, switch, merge, or delete branches. Never create, inspect, or depend on `docs/tasks`.

## Workflow

1. **Item intake** — Enumerate the desired changes the user explicitly confirmed in this conversation and create each as the smallest coherent, independently valuable Story, Task, or Bug with `parent: none`, relationships, blockers, and provenance via `$backlog` intake. If the changes are coherent parts of one coordinated outcome that should form an Epic, stop and recommend `/to-epic` instead — never manufacture sibling fragments of a hidden Epic. If the user names existing `proposed` standalone records, resume each at its first incomplete step; reject `ready`, `in-progress`, or terminal records. Rank placement: the user's stated position, else append in dependency order at the end of the global rank.
2. **Research decision** — Before refinement, ask the owner explicitly: run `$research` first, and for which items? Never skip or answer this yourself, unless `$to-product`'s autonomous contract answers it.
   - Yes → run it per named item; use the findings in refinement.
   - No → record the decision on each item. If a version-specific or security-sensitive question surfaces later, ask again for that record — never relabel uncertainty.
3. **Refine to ready** — For each item in rank order: refine against its type template and accepted wiki state; resolve research (`complete` from a run, `not-needed` only with inspecting evidence); resolve `decisions` by applying the ADR significance test — draft each qualifying decision under `## Decisions` in ADR shape, or set `none` with a stated reason, reading existing ADRs first and naming any one it would supersede; fill `## Execution` with approach and verification commands, citing this invocation as the recorded approval; verify the full Definition of Ready including structured subtasks; transition to `ready`. Never allocate an `ADR-NNN` or publish an ADR here; publication happens at acceptance.
4. **Report** — Item IDs with type, status, rank position, research state, and decisions state with each drafted decision named; the research decision; commit hashes; the final `node scripts/validate-project.mjs` result. Any record left `proposed` gets its named blocker and resumption point.

A failed validator, unresolved research the owner declined, or a missing readiness requirement is a blocker: leave the record `proposed`, keep committed transactions intact, and report — never force `ready`.

End the report with `Next step:` — one copy-pasteable command from the outcome: everything ready → `/implement` with the highest-ranked new `WORK-NNN`; a record left `proposed` → the exact command that resumes it after its named blocker. Recommend only — never invoke it; make it the last line, or a numbered list in run order if several apply.
