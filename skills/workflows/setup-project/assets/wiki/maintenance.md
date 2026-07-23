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

This directory is an Open Knowledge Format 0.1 bundle. Read the root [index](/index.md) first, then use the nearest directory index for progressive disclosure.

The wiki owns accepted current state on the primary branch: durable product behavior, architecture, engineering guidance, operations, and supporting evidence. The tracked [`docs/backlog`](../backlog/index.md) owns desired deltas and execution state. Do not describe an unaccepted backlog proposal as current state here; update the wiki when completed work is accepted.

## Authority and lifecycle

The project owner approves the exact meaning of every addition, correction, deprecation, and deletion. A direct request expresses intent; review the canonical wording and affected concepts before approval. Derived index, link, metadata, and log edits do not require separate approval. Requested mechanical repairs may proceed without a second approval only when they preserve meaning.

- `draft` means documentation is incomplete, but every included statement is accepted current state. It never holds speculative or proposed claims.
- `active` means the current concept is sufficiently complete.
- `deprecated` is retained only while its subject remains in current state and consumers need compatibility or migration guidance.
- Replaced, erroneous, duplicate, and valueless concepts are deleted after approval rather than retained as new `superseded` pages. Git and archived backlog records preserve history.

Before moving or deleting a concept, repair all wiki references in the same transaction. An active backlog reference blocks the operation until `$backlog` applies a separately approved reference update. Archived backlog records may retain missing historical `wiki_refs`; validation reports those references as warnings.

## Organization

- `architecture/` owns system-wide design, security, delivery, and compatibility decisions.
- `engineering/` owns application-specific coding and review guidance.
- `engineering/technologies/` owns accepted, durable guidance for languages, frameworks, runtimes, libraries, and major tools. Keep one canonical page per technology with applicable versions, review metadata, labeled sources, and project deviations. Proposal-specific technical research remains with its backlog record until post-acceptance implementation reconciliation establishes accepted guidance.
- `domains/` owns product behavior, policies, contracts, and controls.
- `operations/` owns executable runbooks.
- `research/` owns compiled evidence supporting durable knowledge.

Organize by durable responsibility, not by the task or agent that created the page. Keep one canonical owner per concept and link to it instead of restating its rules.

## Concept metadata

Every concept document has YAML frontmatter with a descriptive `type`, `title`, one-sentence `description`, ISO 8601 `timestamp`, and `status`. Existing bundles may contain `superseded` history, but new lifecycle transactions use `draft`, `active`, or `deprecated` according to the rules above. Add `tags`, `confidence`, `last_reviewed`, `resource`, and bundle-relative `sources` when useful.

Reserved `index.md` and `log.md` files follow OKF rules and are not concepts.

## Length and splitting

- Target at most 350 lines per concept. Review the page for splitting at that threshold.
- Never exceed 500 lines in a concept page; validation fails above this limit.
- Split earlier when sections have different owners, audiences, lifecycles, source sets, or concept types, or when a section is independently reusable.
- Keep a cohesive runbook or reference together below 500 lines when splitting would make one task harder to execute.
- After splitting, update the nearest index, repair inbound links, remove duplicated prose, and add a log entry.

## Provenance and durability

Accepted technology guidance and its durable external basis belong together under `engineering/technologies/`. Verify version-sensitive claims against repository versions and current authoritative sources. Other compiled external evidence supporting accepted knowledge belongs in `research/` and links claims to its sources; durable conclusions belong in their owning architecture, engineering, domain, or operations page. Keep proposal-specific research with its desired change in the backlog. Keep desired changes, work-branch-only behavior, search transcripts, session state, temporary probes, active checklists, and planned commits outside the wiki.

## Links and indexes

Use standard Markdown links. Prefer bundle-relative links beginning with `/` inside the wiki. Every directory containing wiki Markdown has an `index.md` that lists each immediate concept and child directory with a short description.

Record creations, accepted corrections, deprecations, deletions, and meaningful reorganizations in the root `log.md`, newest first. Omit trivial formatting, metadata normalization, and link-repair noise.

## Validation

Run after every wiki change:

```sh
node scripts/validate-project.mjs
```

The check validates metadata, reserved files, statuses, duplicate titles, links, indexes, index coverage, and the 500-line hard limit. Pages over the 350-line target produce warnings.
