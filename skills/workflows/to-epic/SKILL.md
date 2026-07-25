---
name: to-epic
description: Plan one Epic end-to-end in a setup-project backlog without per-step approval pauses — Epic intake, one explicit owner decision on research-tech-stack, child work-item intake, and refinement until the Epic and every child are ready. Use when the user asks to plan an outcome into a ready Epic.
disable-model-invocation: true
---

# To Epic

Invoking this skill is the project owner's standing approval for the full planning transaction set of one Epic: Epic intake, child work-item intake, refinement, rank placement, and every `proposed -> ready` transition. This supersedes `$backlog`'s per-transaction approval pauses for exactly these transactions; follow `$backlog` for everything else — preflight, templates, relationships, Definition of Ready, validation, staging, commits. It never authorizes cancellation, wiki mutation, execution claims, or touching records outside this Epic and its children.

Pause for user input only at the research decision (step 2) and on hard blockers; otherwise run to completion and report.

Stay on the current branch. Never create or use `docs/tasks`.

## Workflow

1. **Epic intake** — Establish the coordinated outcome from the conversation or named sources, then create the `proposed` Epic via `$backlog` intake with provenance. If the outcome doesn't need multiple work items, stop and recommend `/to-backlog` instead. If the user names an existing `proposed` Epic, resume at its first incomplete step; reject `ready`, `in-progress`, or terminal Epics.
2. **Research decision** — Before proposing any child, ask the owner explicitly: run `$research-tech-stack` on the Epic first? Never skip or answer this yourself.
   - Yes → run it; use the findings to inform child slicing.
   - No → record the decision on the Epic. Children still need individually justified research states; if a version-specific or security-sensitive question surfaces later, ask again for that record — never relabel uncertainty.
3. **Child intake** — Slice the outcome into the smallest coherent, independently valuable Stories/Tasks/Bugs with `parent: EPIC-NNN`, relationships, blockers, and provenance via `$backlog`. Rank placement: the user's stated position, else append in dependency order at the end of the global rank.
4. **Refine to ready** — For each child in rank order: refine against its template and accepted wiki state; resolve research (`complete` from Epic findings or a child-level `$research-tech-stack` run, `not-needed` only with inspecting evidence); resolve `decisions` by applying the ADR significance test — draft each qualifying decision under `## Decisions` in ADR shape, or set `none` with a stated reason, reading existing ADRs first and naming any one it would supersede; fill `## Execution` with approach and verification commands, citing this invocation as the recorded approval; verify the full Definition of Ready; transition to `ready`. Then refine the Epic — outcome, objective criteria, exclusions, coordination approach, and its own Epic-level decisions — and set it `ready`. Never allocate an `ADR-NNN` or publish an ADR here; publication happens at acceptance.
5. **Report** — Epic and child IDs with type, status, rank position, research state, and decisions state with each drafted decision named; the research decision; commit hashes; final `node scripts/validate-project.mjs` result. Any record left `proposed` gets its named blocker and resumption point.

A failed validator, unresolved research the owner declined, or a missing readiness requirement is a blocker: leave the record `proposed`, keep committed transactions intact, and report — never force `ready`.

End the report with `Next step:` — one copy-pasteable command from the outcome: everything ready → `/implement EPIC-NNN` (or `/implement-with-subagents EPIC-NNN` for isolated per-child sessions); a record left `proposed` → the exact command that resumes it after its named blocker. Recommend only — never invoke it. The command must be the report's last line — nothing after it; if several must run in order, end with them as a numbered list in run order.
