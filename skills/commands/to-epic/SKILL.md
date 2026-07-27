---
name: to-epic
description: Plan one coordinated outcome end-to-end into a ready Epic under one standing approval. Use when asked to plan an Epic; not for standalone items — use to-backlog.
disable-model-invocation: true
---

# To Epic

Invoking this skill is the owner's standing approval for the full planning transaction set of one Epic: Epic intake, child work-item intake, refinement, rank placement, and every `proposed -> ready` transition. This supersedes `$backlog`'s per-transaction approval pauses for exactly these transactions; follow `$backlog` for everything else — preflight, templates, relationships, Definition of Ready, validation, staging, commits. It additionally authorizes `$guidance` publication for the subjects the owner names at step 2, and nothing else in `docs/wiki`. It never authorizes cancellation, other wiki mutation, execution claims, or touching records outside this Epic and its children.

Pause for user input only at the evidence decision (step 2), on a `$guidance` rule-replacement pause, and on hard blockers; otherwise run to completion and report. No standing approval but `$to-product`'s covers the rule-replacement pause — never otherwise suppress it to preserve the single pause.

User-invoked only — or invoked by `$to-product`, whose autonomous contract auto-answers every pause above.

Stay on the current branch — never create, switch, merge, or delete branches. Never create, inspect, or depend on `docs/tasks`.

## Workflow

1. **Epic intake** — Establish the coordinated outcome from the conversation or named sources, then create the `proposed` Epic via `$backlog` intake with provenance. If the outcome doesn't need multiple work items, stop and recommend `/to-backlog` instead. If the user names an existing `proposed` Epic, resume at its first incomplete step; reject `ready`, `in-progress`, or terminal Epics.
2. **Evidence decision** — Before proposing any child, inventory the technologies and standards the Epic's outcome implicates, using `$research`'s delta-scoped subject rule — never a whole-stack survey. Report each subject's page state under `docs/wiki/engineering/`: missing, `draft`, version-mismatched against the manifest, stale (fast-moving evidence after 30 days, stable after 90), or current. Then ask the owner one question covering both: run `$guidance` for which of those subjects, and run `$research` on the Epic? Never skip or answer either half yourself, unless `$to-product`'s autonomous contract answers it.
   - `$guidance` → run it first, for the named subjects only, under this invocation's approval; its fresh pages then answer those subjects for research and for child refinement.
   - `$research` yes → run it after guidance; use the findings to inform child slicing.
   - `$research` no → record the decision on the Epic. Children still need individually justified research states; if a version-specific or security-sensitive question surfaces later, ask again for that record — never relabel uncertainty.
3. **Child intake** — Slice the outcome into the smallest coherent, independently valuable Stories/Tasks/Bugs with `parent: EPIC-NNN`, relationships, blockers, and provenance via `$backlog`. Rank placement: the user's stated position, else append in dependency order at the end of the global rank.
4. **Refine to ready** — For each child in rank order: refine against its template and accepted wiki state; resolve research (`complete` from Epic findings or a child-level `$research` run, `not-needed` only with inspecting evidence); resolve `decisions` by applying the ADR significance test — draft each qualifying decision under `## Decisions` in ADR shape, or set `none` with a stated reason, reading existing ADRs first and naming any one it would supersede; fill `## Execution` with approach and verification commands, citing this invocation as the recorded approval; verify the full Definition of Ready; transition to `ready`. Then refine the Epic — outcome, objective criteria, exclusions, coordination approach, and its own Epic-level decisions — and set it `ready`. Never allocate an `ADR-NNN` or publish an ADR here; publication happens at acceptance.
5. **Report** — Epic and child IDs with type, status, rank position, research state, and decisions state with each drafted decision named; the evidence decision, every guidance page created or refreshed, and every rule-replacement pause with its outcome; commit hashes; final `node scripts/validate-project.mjs` result. Any record left `proposed` gets its named blocker and resumption point.

A failed validator, unresolved research the owner declined, or a missing readiness requirement is a blocker: leave the record `proposed`, keep committed transactions intact, and report — never force `ready`.

End the report with `Next step:` — one copy-pasteable command from the outcome: everything ready → `/implement EPIC-NNN` (or `/implement-with-subagents EPIC-NNN` for isolated per-child sessions); a record left `proposed` → the exact command that resumes it after its named blocker. Recommend only — never invoke it; make it the last line, or a numbered list in run order if several apply.
