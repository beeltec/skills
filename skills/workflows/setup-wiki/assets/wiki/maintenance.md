---
title: 'Wiki maintenance'
type: Reference
description: Organization, metadata, provenance, length, linking, and validation conventions for the project knowledge bundle.
tags: [okf, documentation, maintenance, validation]
timestamp: {{TIMESTAMP}}
confidence: high
status: active
---

# Wiki maintenance

This directory is an Open Knowledge Format 0.1 bundle. Read the root
[index](/index.md) first, then use the nearest directory index for progressive
disclosure.

## Organization

- `architecture/` owns system-wide design, security, delivery, and compatibility decisions.
- `engineering/` owns application-specific coding and review guidance.
- `engineering/technologies/` owns curated, web-fetched guidance for languages,
  frameworks, runtimes, libraries, and major tools. Keep one canonical page per
  technology with applicable versions, review metadata, labeled sources, and
  project deviations.
- `domains/` owns product behavior, policies, contracts, and controls.
- `operations/` owns executable runbooks.
- `research/` owns compiled evidence supporting durable knowledge.

Organize by durable responsibility, not by the task or agent that created the
page. Keep one canonical owner per concept and link to it instead of restating
its rules.

## Concept metadata

Every concept document has YAML frontmatter with a descriptive `type`, `title`,
one-sentence `description`, ISO 8601 `timestamp`, and `status`. Allowed status
values are `draft`, `active`, `deprecated`, and `superseded`. Add `tags`,
`confidence`, `last_reviewed`, and bundle-relative `sources` when useful.

Reserved `index.md` and `log.md` files follow OKF rules and are not concepts.

## Length and splitting

- Target at most 350 lines per concept. Review the page for splitting at that threshold.
- Never exceed 500 lines in a concept page; validation fails above this limit.
- Split earlier when sections have different owners, audiences, lifecycles,
  source sets, or concept types, or when a section is independently reusable.
- Keep a cohesive runbook or reference together below 500 lines when splitting
  would make one task harder to execute.
- After splitting, update the nearest index, repair inbound links, remove
  duplicated prose, and add a log entry.

## Provenance and durability

Technology research and its curated conclusions belong together under
`engineering/technologies/`. Other compiled external evidence belongs in
`research/` and links claims to their sources; durable conclusions belong in
their owning architecture, engineering, domain, or operations page. Keep
search transcripts, session state, temporary probes, active checklists, and
planned commits outside the wiki.

## Links and indexes

Use standard Markdown links. Prefer bundle-relative links beginning with `/`
inside the wiki. Every directory containing wiki Markdown has an `index.md`
that lists each immediate concept and child directory with a short description.

## Validation

Run after every wiki change:

```sh
node scripts/validate-wiki.mjs
```

The check validates metadata, reserved files, statuses, duplicate titles,
links, indexes, index coverage, and the 500-line hard limit. Pages over the
350-line target produce warnings.
