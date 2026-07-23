---
name: research-tech-stack
description: Research version-matched technical guidance for a proposed Epic or work item and attach proposal-specific evidence, recommendations, deviations, and uncertainty to its setup-project backlog record before readiness. Use only when the user explicitly requests research for identified proposed backlog work.
---

# Research Tech Stack

Resolve technical uncertainty for one identified proposed backlog record before readiness. Proposal-specific research belongs with the desired change in `docs/backlog`; `docs/wiki` remains the authority for accepted current project guidance.

Stay on the user's current Git branch. Never create, switch, merge, or delete branches while researching or updating backlog evidence, including when the current branch is not the primary branch.

## Preconditions

1. Resolve the project root and read applicable repository instructions.
2. Require `.setup-project.json`, `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, the installed backlog templates, and `scripts/validate-project.mjs`. If the scaffold is incomplete, stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`. If the baseline is invalid, report it and stop unless the user explicitly asks to repair that existing state.
4. Require one named `EPIC-NNN` or `WORK-NNN` record with `status: proposed`. If no record is identified, offer `$backlog` intake first. Reject research as a pre-readiness mutation when the named record is already `ready`, `in-progress`, or terminal; do not silently reopen it.
5. Read backlog maintenance, the matching type template, the complete named record, its desired delta, parent and child scope, relationships, and directly related records. Read the wiki root, maintenance rules, ubiquitous language, nearest relevant indexes, and accepted technology or architecture concepts.

## Research Workflow

1. Inspect repository evidence that bears on the proposed delta: manifests, lockfiles, runtime files, build configuration, source imports, deployment configuration, and tests. Record exact installed or constrained versions and relevant file paths; do not infer versions from general familiarity.
2. Inventory only languages, frameworks, runtimes, libraries, protocols, platforms, and major tools whose use or structure the proposed change could affect.
3. For each affected technology, determine whether external research is needed:
   - Research when accepted guidance is absent, materially uncertain, or not applicable to the repository's version.
   - Treat fast-moving technology evidence as stale after 30 days and stable technology evidence as stale after 90 days.
   - Re-check security-sensitive guidance for every applicable proposal, regardless of prior review date.
   - Re-check immediately when a known release, source change, or repository deviation may invalidate prior evidence.
4. Search and verify sources in this order: version-matched official documentation, specifications, and repositories; maintainer guidance; then reputable secondary sources for remaining practical gaps. Open every source used. Search-result snippets are not evidence.
5. Distinguish normative requirements, recommendations, and optional conventions. When authoritative sources are missing or contradictory, use the best available evidence, label its authority, and preserve the uncertainty.
6. Compare external guidance with accepted wiki knowledge and actual repository conventions. Do not silently replace current project practice or expand the proposal into a migration. Record each relevant project deviation and known rationale with the proposed record.
7. Draft the target record's `## Research` section using [the proposal research template](assets/backlog-research.md). Include the affected delta, repository and version evidence, concise findings and recommendations, unresolved uncertainty, project deviations, and labeled source links. Do not create or update a wiki technology page during planning.
8. Set executable work's frontmatter research state consistently:
   - `complete` only when all applicable version-specific and security-sensitive questions are resolved and the section contains sufficient conclusions and sources for implementation;
   - `not-needed` only when inspected evidence establishes that no external technical research applies, with that reasoning in the section;
   - `pending` whenever a source is unavailable, version applicability is ambiguous, authoritative sources conflict, a security-sensitive question remains open, or further investigation is required.
9. For Epic research, keep the full result in the Epic's `## Research` section. Mark every affected proposed child `research: pending` and identify the inherited unresolved question in its Research section. Epic-level evidence may be linked rather than copied, but each child must resolve and record its applicable conclusions before becoming `ready`.
10. Present the findings, proposed record edits, resulting research state, and readiness effect to the project owner. Apply only the exact transaction they explicitly approve.

## Readiness And Persistence

- Never change a record from `proposed` to `ready` in this workflow. `$backlog` owns the separately approved readiness transition.
- Treat `pending` research as a hard readiness failure. Do not relabel uncertainty as `complete`; `node scripts/validate-project.mjs` requires executable work to be `complete` or `not-needed` before `ready`.
- Keep proposal-specific sources, version findings, recommendations, uncertainty, and project deviations in the backlog record. They are evidence for a desired delta, not accepted current project guidance.
- During post-acceptance implementation reconciliation, promote only conclusions that became durable accepted current guidance to the owning wiki concept. Use `$wiki` under its approval rules, summarize current guidance rather than copying the proposal record, and retain the backlog research as history.

After an approved edit, update all affected backlog records as one transaction, run `node scripts/validate-project.mjs`, inspect the diff, and stage only the intended `docs/backlog` paths. Create a concise `docs(backlog): <research outcome>` Conventional Commit and report the record IDs, sources, research state, unresolved readiness blockers, commit hash, and validation result.
