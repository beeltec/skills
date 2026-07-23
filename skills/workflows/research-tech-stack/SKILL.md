---
name: research-tech-stack
description: Research version-matched technical guidance, best practices, and recommended coding guidelines for a proposed Epic or work item and attach proposal-specific evidence, recommendations, deviations, and uncertainty to its setup-project backlog record before readiness. Use only when the user explicitly requests research for identified proposed backlog work.
---

# Research Tech Stack

Resolve technical uncertainty for one identified proposed backlog record before readiness. Proposal-specific research lives with the desired change in `docs/backlog`; `docs/wiki` remains the authority for accepted current guidance.

Stay on the user's current Git branch — never create, switch, merge, or delete branches, even off the primary branch.

## Preconditions

1. Resolve the project root and read applicable repository instructions.
2. Require `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, the installed backlog templates, and `scripts/validate-project.mjs`; otherwise stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`. On an invalid baseline, report and stop unless the user explicitly asks to repair that state.
4. Require one named `EPIC-NNN` or `WORK-NNN` with `status: proposed`. Without one, offer `$backlog` intake first. Reject research as a pre-readiness mutation when the record is already `ready`, `in-progress`, or terminal; never silently reopen it.
5. Read backlog maintenance, the matching type template, the complete named record (delta, parent and child scope, relationships) and directly related records; the wiki root, maintenance rules, ubiquitous language, nearest indexes, and accepted technology or architecture concepts.

## Research Workflow

1. Inspect repository evidence bearing on the proposed delta: manifests, lockfiles, runtime files, build and deployment configuration, source imports, tests. Record exact installed or constrained versions and file paths — never infer versions from familiarity.
2. Inventory only technologies whose use or structure the proposed change could affect.
3. For each, decide whether external research is needed: research when accepted guidance is absent, materially uncertain, or not version-applicable. Treat fast-moving evidence as stale after 30 days, stable after 90. Re-check security-sensitive guidance for every applicable proposal regardless of prior review, and re-check immediately when a known release, source change, or repository deviation may invalidate prior evidence.
4. Verify sources in order: version-matched official documentation, specifications, and repositories; maintainer guidance; then reputable secondary sources for remaining gaps. Open every source used — snippets are not evidence.
5. Where applicable, also research current best practices and recommended coding guidelines for each affected technology — official style guides, idiomatic usage and configuration patterns, security recommendations, and maintainer-recommended project conventions — using the same source order and version-matching rules. Skip only when inspected evidence shows the proposed delta touches no code or configuration the guidelines would govern. Record conclusions self-contained enough to implement from without reopening sources; links are provenance, not content.
6. Distinguish normative requirements, recommendations, and optional conventions. When sources are missing or contradictory, use the best available evidence, label its authority, and preserve the uncertainty.
7. Compare external guidance with accepted wiki knowledge and actual repository conventions. Do not silently replace current practice or expand the proposal into a migration; record each relevant project deviation and known rationale with the record.
8. Draft the record's `## Research` section using [the proposal research template](assets/backlog-research.md): affected delta, repository and version evidence, concise findings and recommendations including applicable best practices and coding guidelines, unresolved uncertainty, project deviations, labeled source links. Do not create or update a wiki technology page during planning.
9. Set executable work's frontmatter research state: `complete` only when all applicable version-specific and security-sensitive questions are resolved with sufficient conclusions and sources; `not-needed` only when inspected evidence establishes no external research applies, with that reasoning in the section; `pending` whenever a source is unavailable, version applicability is ambiguous, sources conflict, a security-sensitive question is open, or more investigation is required.
10. For Epic research, keep the full result in the Epic's `## Research`. Mark every affected proposed child `research: pending` and identify the inherited question in its Research section. Epic evidence may be linked rather than copied, but each child must resolve and record its applicable conclusions before `ready`.
11. Present findings, proposed edits, resulting research state, and readiness effect to the project owner. Apply only the exact transaction they explicitly approve.

## Readiness And Persistence

- Never change a record from `proposed` to `ready` here — `$backlog` owns that separately approved transition.
- `pending` research is a hard readiness failure. Never relabel uncertainty as `complete`; the validator requires `complete` or `not-needed` before `ready`.
- Proposal-specific sources, findings, recommendations, uncertainty, and deviations stay in the backlog record — evidence for a desired delta, not accepted guidance.
- During post-acceptance reconciliation, promote only conclusions that became durable accepted guidance to the owning wiki concept via `$wiki` under its approval rules, summarizing rather than copying; retain the backlog research as history.

After an approved edit, update all affected records as one transaction, run `node scripts/validate-project.mjs`, inspect the diff, and stage only the intended `docs/backlog` paths. Create a concise `docs(backlog): <research outcome>` Conventional Commit and report the record IDs, sources, research state, unresolved readiness blockers, commit hash, and validation result.
