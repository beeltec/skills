---
name: research
description: Research a proposed backlog record before readiness, attaching version and standards evidence to it. Only on explicit request for identified proposed work; never for general questions or wiki guidance.
---

# Research

Resolve technical uncertainty for one identified proposed backlog record before readiness. Research covers both the technologies the delta touches and the concepts, standards, and guidelines it implicates. Findings live with the desired change in `docs/backlog`.

## Preconditions

1. Resolve the project root and read applicable repository instructions.
2. Require the `$setup-project` scaffold: `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, all four backlog type templates, and `scripts/validate-project.mjs`. If any is missing, stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`; on an invalid baseline, report and stop unless the user explicitly asks to repair that state.
4. Require one named `EPIC-NNN` or `WORK-NNN` with `status: proposed`. Without one, offer `$backlog` intake first. Reject research on a `ready`, `in-progress`, or terminal record; never silently reopen it.
5. Read backlog maintenance, the matching type template, the complete named record (delta, parent and child scope, relationships) and directly related records; the wiki root, maintenance rules, nearest indexes, and accepted architecture concepts. Guidance pages are read per subject at step 3, once the inventory exists.

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

Check each subject against its guidance page under `docs/wiki/engineering/technologies/` or `docs/wiki/engineering/standards/` first. A page whose recorded installed version matches the repository and whose `last_reviewed` is within thresholds — 30 days for fast-moving evidence, 90 for stable — already answers the subject: cite it and research only what it leaves open. Research a subject when accepted guidance is absent, materially uncertain, or not version-applicable. When a subject has no page or a stale one, offer `$guidance` for it before the step 4 fan-out; on a decline, research it here. Re-check security-sensitive guidance every run, and immediately when a release, source change, or repository deviation may invalidate prior evidence.

## 4. Fan out one sub-agent per subject

Degrade by harness capability: with parallel sub-agents, spawn one per subject in a single message; with per-agent model selection, run each on the cheapest available tier at low reasoning effort, reserving the stronger model for inspection, conflict resolution, and synthesis; with neither, run the same briefs sequentially in the main context. If a subject's return breaks the required output shape or cites an unopened source, re-run it on a stronger tier and record the escalation in the report.

Resolve each subject's version per step 5 first — a sub-agent never resolves versions. Then give each sub-agent the subject, the proposed delta, that subject's repository evidence and resolved version, and this brief:

> Research this subject only, at the version given. Verify sources in order: version-matched official documentation, specifications, and repositories; then maintainer guidance; then reputable secondary sources for remaining gaps. Open every source you cite — a search snippet is not evidence. Return only: findings split into normative requirements, recommendations, and optional conventions, each stated concretely enough to implement from without reopening the source; unresolved questions; and sources as title, URL, authority label, applicable version, and review date. No prose outside that shape. Under 500 words.

## 5. Resolve versions from the release source

The authoritative version source is a live call to the ecosystem's registry, release feed, or tagged releases — `npm view <pkg> version`, the PyPI JSON API, `gh release list`, crates.io, and equivalents. Record the resolved version, that source, and the resolution date.

Never take a version from training memory, a documentation example snippet, a tutorial, or a blog post. Distinguish latest stable from prerelease and from the maintained LTS line.

- **Introduced by this delta** — recommend the latest stable version compatible with the project's real constraints (engine, peers, lockfile). State the reason whenever the recommendation is not the newest stable.
- **Already installed** — research at the installed version. Record the gap to latest stable and its security relevance as a finding. An upgrade the delta genuinely requires is a finding; anything else is separate proposed work. Never absorb a migration into this record.

## 6. Synthesize

Reject any source lacking an opened URL and a review date. Demote any finding its source does not support into uncertainty rather than dropping it. Resolve contradictions between sub-agents by source authority, or preserve them as uncertainty.

Compare the result with accepted wiki knowledge and actual repository conventions. Record each relevant project deviation and its known rationale; never silently replace current practice.

## 7. Draft and set state

Draft the record's `## Research` section using [the proposal research template](assets/backlog-research.md). Do not create or update a wiki page during planning.

Set the frontmatter research state:

- `complete` — every applicable version-specific and security-sensitive question is resolved with sufficient conclusions and sources;
- `not-needed` — inspected evidence establishes no external research applies, with that reasoning in the section;
- `pending` — a source is unavailable, version applicability is ambiguous, sources conflict, a security-sensitive question is open, or more investigation is required.

For Epic research, keep the full result in the Epic's `## Research`. Mark every affected proposed child `research: pending` and name the inherited question in its Research section. Epic evidence may be linked rather than copied; each child resolves and records its applicable conclusions before `ready`.

Present findings, proposed edits, resulting research state, and readiness effect to the project owner. Apply only the exact transaction they explicitly approve. Under an active autonomous run, `$to-product`'s autonomous contract supplies that approval.

## Readiness and persistence

- Never change a record's status here — `$backlog` owns all transitions, including the `ready -> proposed` walk-back that makes a record eligible for research again.
- `pending` research is a hard readiness failure. Never relabel uncertainty as `complete`; the validator requires `complete` or `not-needed` before `ready`.
- Proposal-specific sources, findings, recommendations, uncertainty, and deviations stay in the backlog record.
- During post-acceptance reconciliation, promote only conclusions that became durable accepted guidance to the owning wiki concept via `$wiki` under its approval rules, summarizing rather than copying; retain the backlog research as history. When the owning subject has no page under `docs/wiki/engineering/technologies/` or `docs/wiki/engineering/standards/`, route the promotion through `/to-guidance` for that subject so it lands on a canonical guidance page instead of being folded into a generic engineering concept.

After an approved edit, update all affected records as one transaction, run `node scripts/validate-project.mjs`, inspect the diff, and stage only the intended `docs/backlog` paths. Create a concise `docs(backlog): <research outcome>` Conventional Commit and report the record IDs, subjects researched, resolved versions, any subject re-run on a stronger tier, research state, unresolved readiness blockers, commit hash, and validation result.

End the report with `Next step:` — one copy-pasteable command: research resolved → the exact command that resumes planning (`/to-epic EPIC-NNN` or `/to-backlog WORK-NNN`); `pending` → the concrete action that resolves the open question.
