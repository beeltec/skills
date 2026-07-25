---
name: research
description: Research a proposed Epic or work item before readiness — current versions of its technologies plus the concepts, standards, and guidelines its delta implicates (for example OWASP for authentication) — fanned out across parallel sub-agents, and attach the evidence, recommendations, deviations, and uncertainty to its setup-project backlog record. Use only when the user explicitly requests research for identified proposed backlog work. Never for general questions, for ready or in-progress records, or to publish accepted wiki guidance.
---

# Research

Resolve technical uncertainty for one identified proposed backlog record before readiness. Research covers both the technologies the delta touches and the concepts, standards, and guidelines it implicates. Findings live with the desired change in `docs/backlog`; `docs/wiki` remains the authority for accepted current guidance.

Stay on the user's current Git branch — never create, switch, merge, or delete branches.

## Preconditions

1. Resolve the project root and read applicable repository instructions.
2. Require `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, the installed backlog templates, and `scripts/validate-project.mjs`; otherwise stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`. On an invalid baseline, report and stop unless the user explicitly asks to repair that state.
4. Require one named `EPIC-NNN` or `WORK-NNN` with `status: proposed`. Without one, offer `$backlog` intake first. Reject research on a `ready`, `in-progress`, or terminal record; never silently reopen it.
5. Read backlog maintenance, the matching type template, the complete named record (delta, parent and child scope, relationships) and directly related records; the wiki root, maintenance rules, ubiquitous language, nearest indexes, and accepted technology or architecture concepts.

## 1. Inspect the repository

Inspect evidence bearing on the proposed delta: manifests, lockfiles, runtime and engine files, build and deployment configuration, source imports, tests. Record exact installed or constrained versions with the paths that establish them. Never infer a version from familiarity.

## 2. Build the subject inventory

A **subject** is one technology, or one concept, standard, or guideline, that the proposed delta affects or implicates. Inventory subjects only — never survey the whole stack.

Derive concept subjects from the delta. These triggers are the common cases, not the whole list:

- authentication, authorization, sessions, tokens, secrets → OWASP ASVS, Top 10, and the applicable Cheat Sheets;
- personal or sensitive data, its retention or logging → applicable privacy and data-protection guidance;
- user-facing interface → WCAG at the level the project targets;
- public or cross-service API, wire format, protocol → the governing specification;
- payments, health, or other regulated data → the applicable standard.

Beyond these, derive any further concept the delta implicates and treat it as a subject.

Drop a subject only when inspected evidence shows the delta touches nothing it governs. Record the reason.

## 3. Decide what needs external research

Research a subject when accepted wiki guidance is absent, materially uncertain, or not version-applicable. Treat fast-moving evidence as stale after 30 days, stable after 90. Re-check security-sensitive guidance every run regardless of prior review, and re-check immediately when a release, source change, or repository deviation may invalidate prior evidence.

## 4. Fan out one sub-agent per subject

Degrade by harness capability:

- **Parallel sub-agents available** — spawn one per subject, all in a single message.
- **Per-agent model selection also available** — give subject agents the cheapest tier that reliably follows the brief below; keep the stronger model for inspection, conflict resolution, and synthesis.
- **Neither available** — run the same briefs sequentially in the main context, with the same output shape.

Give each sub-agent the subject, the proposed delta, that subject's repository version evidence, the version rules in step 5, and this brief:

> Research this subject only. Verify sources in order: version-matched official documentation, specifications, and repositories; then maintainer guidance; then reputable secondary sources for remaining gaps. Open every source you cite — a search snippet is not evidence. Return only: the resolved version with the exact source and how you resolved it; findings split into normative requirements, recommendations, and optional conventions, each stated concretely enough to implement from without reopening the source; unresolved questions; and sources as title, URL, authority label, applicable version, and review date. No prose outside that shape. Under 500 words.

## 5. Resolve versions from the release source

The authoritative version source is a live call to the ecosystem's registry, release feed, or tagged releases — `npm view <pkg> version`, the PyPI JSON API, `gh release list`, crates.io, and equivalents. Record the resolved version, that source, and the resolution date.

Never take a version from training memory, a documentation example snippet, a tutorial, or a blog post. Distinguish latest stable from prerelease and from the maintained LTS line.

- **Introduced by this delta** — recommend the latest stable version compatible with the project's real constraints (engine, peers, lockfile). State the reason whenever the recommendation is not the newest stable.
- **Already installed** — research at the installed version, because guidance must match what the code runs. Record the gap to latest stable and its security relevance as a finding. An upgrade the delta genuinely requires is a finding; anything else is separate proposed work. Never absorb a migration into this record.

## 6. Synthesize

Re-resolve every version you are about to record with your own live registry call — a sub-agent's version claim is input, not evidence. Reject any source lacking an opened URL and a review date. Demote any finding its source does not support into uncertainty rather than dropping it. Resolve contradictions between sub-agents by source authority, or preserve them as uncertainty.

Compare the result with accepted wiki knowledge and actual repository conventions. Record each relevant project deviation and its known rationale; never silently replace current practice.

## 7. Draft and set state

Draft the record's `## Research` section using [the proposal research template](assets/backlog-research.md). Do not create or update a wiki page during planning.

Set the frontmatter research state:

- `complete` — every applicable version-specific and security-sensitive question is resolved with sufficient conclusions and sources;
- `not-needed` — inspected evidence establishes no external research applies, with that reasoning in the section;
- `pending` — a source is unavailable, version applicability is ambiguous, sources conflict, a security-sensitive question is open, or more investigation is required.

For Epic research, keep the full result in the Epic's `## Research`. Mark every affected proposed child `research: pending` and name the inherited question in its Research section. Epic evidence may be linked rather than copied; each child resolves and records its applicable conclusions before `ready`.

Present findings, proposed edits, resulting research state, and readiness effect to the project owner. Apply only the exact transaction they explicitly approve.

## Readiness and persistence

- Never change a record from `proposed` to `ready` here — `$backlog` owns that transition.
- `pending` research is a hard readiness failure. Never relabel uncertainty as `complete`; the validator requires `complete` or `not-needed` before `ready`.
- Proposal-specific sources, findings, recommendations, uncertainty, and deviations stay in the backlog record.
- During post-acceptance reconciliation, promote only conclusions that became durable accepted guidance to the owning wiki concept via `$wiki` under its approval rules, summarizing rather than copying; retain the backlog research as history.

After an approved edit, update all affected records as one transaction, run `node scripts/validate-project.mjs`, inspect the diff, and stage only the intended `docs/backlog` paths. Create a concise `docs(backlog): <research outcome>` Conventional Commit and report the record IDs, subjects researched, resolved versions, research state, unresolved readiness blockers, commit hash, and validation result.

End the report with `Next step:` — one copy-pasteable command: research resolved → the exact command that resumes planning (`/to-epic EPIC-NNN` or `/to-backlog WORK-NNN`); `pending` → the concrete action that resolves the open question. Recommend only — never invoke it. The command must be the report's last line — nothing after it; if several must run in order, end with them as a numbered list in run order.
