---
name: to-guidance
description: Research and publish durable technology and standards guidance — versions, coding guidelines, best practices, adopted rules, project deviations — as canonical wiki pages under docs/wiki/engineering/, and refresh them when they go stale. Use when persisting or updating guidance for a language, framework, runtime, library, tool, or cross-cutting standard so implementation agents stop re-researching it for every Epic.
disable-model-invocation: true
---

# To Guidance

Invoking this skill is the owner's standing approval for publishing and refreshing durable engineering guidance for the named subjects: page creation, rule additions, corrections, version and review-metadata updates, and the derived index, link, and log changes. This supersedes `$wiki`'s per-transaction approval pauses for exactly those additive and corrective transactions; follow `$wiki` for everything else — preflight, ownership, evidence, sources, validation, staging, commits.

It never authorizes reversing or removing an already-adopted rule without the pause in step 6, deprecating or deleting a page, mutating `docs/backlog`, or publishing guidance for a subject the project does not actually use.

Guidance here is accepted current state because the owner has **adopted** it as binding on new code — not because every existing file already complies. Non-compliant areas belong in the page's `## Known gaps`; closing them is separate `/to-backlog` work that this skill never creates.

Stay on the current branch — never create, switch, merge, or delete branches. Never create, inspect, or depend on `docs/tasks`.

## Subjects

A **subject** is one of:

- a **technology** — language, framework, runtime, library, or major tool → one page under `docs/wiki/engineering/technologies/`;
- a **standard** — a cross-cutting security, privacy, accessibility, protocol, or regulatory standard (OWASP ASVS, WCAG, a wire-format specification) → one page under `docs/wiki/engineering/standards/`.

Accept explicitly named subjects. When the user names none, inventory the stack from repository evidence, present the candidate subjects with the evidence that establishes each, and ask which to process — never publish a page for a subject repository evidence does not show in use.

Reject a subject the project neither uses nor has adopted; say so and continue with the rest.

## Preflight

1. Resolve the project root and read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and contributing or documentation standards.
2. Require the `$setup-project` scaffold: `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/log.md`, `docs/wiki/engineering/index.md`, `docs/wiki/engineering/technologies/index.md`, `docs/wiki/engineering/standards/index.md`, `docs/wiki/engineering/guidance-template.md`, and `scripts/validate-project.mjs`. If any is missing, stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`; on an invalid baseline, report and stop unless the user explicitly asks to repair that state.
4. Read wiki maintenance rules, the root and nearest indexes, the guidance template, every existing page for the named subjects, the ubiquitous language, and any in-force ADR or `docs/wiki/architecture/` concept bearing on a subject — an ADR outranks external guidance and the page must not contradict it.
5. Read `docs/wiki/engineering/` concepts that already state rules for a subject, so guidance lands in one canonical page instead of a second competing one.

## 1. Resolve repository evidence

For every subject, inspect manifests, lockfiles, engine and runtime files, build, lint, formatter, and deployment configuration, source imports, and tests. Record the exact installed version or constraint **with the repository path that establishes it**. Never infer a version from familiarity or from a documentation example.

For a standard, record instead what the project actually applies today: the target conformance level, the enforcing tooling and configuration, and the code areas within its reach.

Also record observed project conventions and any departure from upstream guidance — these become `## Conventions` and `## Deviations`, and they are never silently replaced by an external recommendation.

## 2. Fan out one sub-agent per subject

Degrade by harness capability:

- **Parallel sub-agents available** — spawn one per subject, all in a single message.
- **Per-agent model selection also available** — give subject agents the cheapest tier that reliably follows the brief; keep the stronger model for evidence inspection, conflict resolution, and synthesis.
- **Neither available** — run the same briefs sequentially in the main context, with the same output shape.

Give each sub-agent the subject, its repository version evidence and observed conventions, the version rules in step 3, and this brief:

> Research this subject only. Verify sources in order: version-matched official documentation, specifications, and repositories; then maintainer guidance; then reputable secondary sources for remaining gaps. Open every source you cite — a search snippet is not evidence. Return only: the resolved version with the exact source and how you resolved it; findings split into normative requirements, recommendations, and optional conventions, each stated concretely enough to implement from without reopening the source; unresolved questions; and sources as title, URL, authority label, applicable version, and review date. No prose outside that shape. Under 500 words.

## 3. Resolve versions from the release source

The authoritative version source is a live call to the ecosystem's registry, release feed, or tagged releases — `npm view <pkg> version`, the PyPI JSON API, `gh release list`, crates.io, and equivalents. Record the resolved version, that source, and the resolution date. Distinguish latest stable from prerelease and from the maintained LTS line.

Research and publish at the **installed** version. Record the gap to latest stable and its security relevance in the page; an upgrade is separate `/to-backlog` work, never absorbed here.

## 4. Synthesize

Re-resolve every version with your own live registry call — a sub-agent's version claim is input, not evidence. Reject any source lacking an opened URL and a review date. Demote a finding its source does not support rather than dropping it silently. Resolve contradictions between sub-agents by source authority.

Classify every rule the page will carry:

- **Requirements** — binding on new code. Include only rules the owner is adopting; if a normative upstream requirement conflicts with an in-force ADR or a deliberate project deviation, record it under `## Deviations` with its rationale instead.
- **Recommendations** — preferred approaches with their rationale.
- **Conventions** — project-local choices verified in the repository.

Then determine `## Known gaps`: code areas that contradict a Requirement, each with the path that shows it and its existing `WORK-NNN`/`EPIC-NNN` link when one exists. Leave unresolved research questions out of the page entirely — report them instead.

## 5. Publish or refresh

Create-or-refresh is one mode. For each subject, apply the project's installed guidance page template at `docs/wiki/engineering/guidance-template.md` as a validated `$wiki` durable transaction:

- **No page exists** — create `engineering/technologies/<slug>.md` or `engineering/standards/<slug>.md` with complete frontmatter (`type`, `title`, `description`, `timestamp`, `status`, plus `resource`, `tags`, `last_reviewed`, `sources`), add its nearest index entry, and add a `log.md` entry.
- **A page exists** — re-resolve versions, re-verify every version-sensitive and security-sensitive claim, update `last_reviewed`, and change only the meaning the new evidence changes. Never rewrite unchanged rules, and never drop a recorded deviation because upstream guidance disagrees with it.

Keep one canonical page per subject and link rather than restate: a rule owned by another concept or an ADR is referenced, never copied. Target at most 350 lines per page; split by cohesive subject before the 500-line hard limit.

Run `node scripts/validate-project.mjs`, inspect the diff, stage only the intended `docs/wiki` paths, and create one concise `docs(wiki): <guidance outcome>` Conventional Commit per coherent transaction.

## 6. Pause on rule replacement

When a refresh would **reverse, weaken, or remove a Requirement or Convention the page already records as adopted**, that is not covered by the standing approval. Present that exact change individually: the current rule, the replacement, the source authority and version that forces it, affected pages and inbound references, and the code the change makes non-compliant. Apply it only on explicit per-item approval, and never fold it into another transaction.

A failed validator, a source that contradicts a claim already published, or evidence that a subject is not actually in use is a blocker: publish nothing for that subject, keep committed transactions intact, and report.

## Report

Report per subject: the page path and whether it was created or refreshed; the installed version with its establishing path and the resolved latest stable with its live source and date; counts of requirements, recommendations, conventions, deviations, and known gaps; sources with authority labels; every rule-replacement pause and its outcome; unresolved questions; commit hashes; and the final validation result.

End the report with `Next step:` — one copy-pasteable command: known gaps found → `/to-backlog` naming the non-compliant areas to remediate; a subject blocked or its research unresolved → the concrete action that resolves it; otherwise `/implement` with the highest-ranked ready `WORK-NNN` when one exists. Recommend only — never invoke it; make it the last line, or a numbered list in run order if several apply.
