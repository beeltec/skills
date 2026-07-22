---
name: research-tech-stack
description: Research current, version-matched documentation, recommendations, and best practices for technologies affected by planned work, then persist curated project-relevant guidance under docs/wiki/engineering/technologies. Use only when the user explicitly requests this optional planning step before creating tasks.
---

# Research Tech Stack

Create current engineering knowledge before implementation tasks are derived.
This is an optional planning step immediately before `$to-tasks`. Research only
technologies affected by the intended work, and turn web evidence into concise,
project-relevant wiki guidance rather than copying documentation or retaining
search transcripts.

Stay on the user's current Git branch. Never create or switch branches while
researching or updating technology guidance, including when the current branch
is not the primary branch.

## Preconditions

1. Resolve the project root and read applicable repository instructions.
2. Require `docs/wiki/index.md` and `docs/wiki/maintenance.md`. If either is
   missing, stop and direct the user to run `$setup-wiki` first.
3. Read the wiki root, maintenance rules, `engineering/index.md`,
   `engineering/technologies/index.md` when present, and relevant technology
   pages before researching.

## Workflow

1. Inspect the planned work and repository evidence such as manifests,
   lockfiles, runtime files, build configuration, source imports, and existing
   wiki pages. Inventory only the languages, frameworks, runtimes, libraries,
   and major tools whose use or structure the implementation could affect.
2. Resolve installed or constrained versions from the repository. Do not infer
   a version from general familiarity when project evidence can establish it.
3. For each affected technology, decide whether its canonical page is current:
   - Research immediately when guidance is absent, materially uncertain, or
     does not cover the project's version.
   - Treat fast-moving frameworks and tools as stale after 30 days.
   - Treat stable technologies as stale after 90 days.
   - Re-check security-sensitive guidance for every applicable implementation.
   - Re-check immediately when a known release or source change may invalidate
     the existing guidance.
4. Search the web for every technology that requires research. Prefer sources
   in this order:
   1. version-matched official documentation, specifications, and repositories;
   2. guidance from the technology's maintainers;
   3. reputable secondary sources for practical gaps or comparisons.
5. Open and verify the sources used. Confirm version applicability, publication
   or update context when available, and whether a statement is normative,
   recommended, or merely one viable convention. Search results alone are not
   evidence.
6. When authoritative sources are unavailable or contradictory, use the best
   reputable secondary guidance available. Label it as lower-authority and
   preserve the uncertainty; never present it as an official recommendation.
7. Synthesize only guidance relevant to this project and planned work. Include
   file and folder structure when applicable. Do not copy long source passages,
   store search queries, or preserve a research transcript.
8. Write one canonical page per technology under
   `docs/wiki/engineering/technologies/<technology>.md`, using
   [the technology page template](assets/technology-guidance.md). Update an
   existing page instead of creating overlapping guidance.
9. If current external guidance conflicts with established repository
   conventions, preserve the project structure. Record the recommendation,
   project deviation, and known rationale. Do not expand the implementation
   into a migration without an explicit decision.
10. Update `docs/wiki/engineering/technologies/index.md`, every other affected
    nearest index, and `docs/wiki/log.md`. Keep one canonical statement of each
    rule and link to it elsewhere.
11. Run `node scripts/validate-wiki.mjs` or the repository's documented wiki
    check. Fix errors, review warnings, and inspect the final diff before
    declaring the gate complete.

## Page Contract

Every technology page must record:

- the technology and applicable version range;
- where and how the project uses it;
- current project-relevant recommendations;
- recommended file and folder structure when relevant;
- deliberate project deviations and their rationale;
- source links labeled `official`, `maintainer`, or `secondary`;
- `last_reviewed` and a `fast-moving`, `stable`, or `security-sensitive`
  freshness tier;
- unresolved uncertainty, including lower-authority fallbacks.

Store all web-fetched technology guidance in `engineering/technologies/`, not
in `research/`. Other architecture, engineering, or operational pages may link
to these canonical pages for their external technical basis.

## Completion

When this optional step is invoked, finish it before running `$to-tasks`: every
affected technology must either have current, version-applicable guidance or be
researched, persisted, and wiki-validated. Report which pages were reused and
which were updated.
