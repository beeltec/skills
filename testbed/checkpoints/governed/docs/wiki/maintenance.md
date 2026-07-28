---
title: 'Wiki maintenance'
type: Reference
description: Organization, metadata, provenance, length, linking, and validation conventions for the project knowledge bundle.
tags: [okf, documentation, maintenance, validation]
timestamp: 2026-07-27T21:27:58+02:00
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
- Replaced, erroneous, duplicate, and valueless concepts are deleted after approval rather than retained as new `superseded` pages. ADRs are the sole exception: they are never deleted for being replaced.
- `superseded` applies only to an ADR whose decision has been replaced. No other concept may use it.

Before moving or deleting a concept, repair all wiki references in the same transaction. An active backlog reference blocks the operation until `$backlog` applies a separately approved reference update. Archived backlog records may retain missing historical `wiki_refs`; validation reports those references as warnings.

## Adopted guidance

Engineering guidance under `engineering/technologies/` and `engineering/standards/` is accepted current state because the owner has **adopted** it as binding on new code — not because every existing file already complies. A page separates rules that bind (`Requirements`) from preferred approaches (`Recommendations`) and verified project choices (`Conventions`).

Non-compliant existing code goes under the page's `## Known gaps` with the path that shows it, and its remediation is tracked in `docs/backlog` — never as prose that softens the rule. A rule the owner has not adopted is a proposal and stays out of the wiki. Reversing, weakening, or removing an already-adopted rule is a semantic change requiring its own explicit approval.

## Organization

- `architecture/` owns system-wide design, security, delivery, and compatibility decisions.
- `architecture/decisions/` owns ADRs. One ADR per architecturally significant decision, never merged into a broader concept page.
- `engineering/` owns application-specific coding and review guidance.
- `engineering/technologies/` owns accepted, durable guidance for languages, frameworks, runtimes, libraries, and major tools. Keep one canonical page per technology with applicable versions, review metadata, labeled sources, and project deviations. Proposal-specific technical research remains with its backlog record until post-acceptance implementation reconciliation establishes accepted guidance.
- `engineering/standards/` owns accepted, durable guidance for cross-cutting standards the project applies — security, privacy, accessibility, protocol, and regulatory. Keep one canonical page per standard with its specification version, target conformance level, enforcing tooling, adopted rules, deviations, and labeled sources.
- `engineering/guidance-template.md` is the shared non-record structure for both. Create and refresh those pages with `$to-guidance`; it is a non-record example and states no accepted guidance itself.
- `domains/` owns product behavior, policies, contracts, and controls.
- `operations/` owns executable runbooks.

Organize by durable responsibility, not by the task or agent that created the page. Keep one canonical owner per concept and link to it instead of restating its rules.

## Concept metadata

Every concept document has YAML frontmatter with a descriptive `type`, `title`, one-sentence `description`, ISO 8601 `timestamp`, and `status`. Lifecycle transactions use `draft`, `active`, or `deprecated`, except for the ADR-only `superseded` described below. Add `tags`, `confidence`, `last_reviewed`, `resource`, and bundle-relative `sources` when useful.

Reserved `index.md` and `log.md` files follow OKF rules and are not concepts. `architecture/decisions/template.md` is a non-record example and is exempt from concept and ADR validation.

## Architecture decision records

An ADR records one decision at one point in time.

Write an ADR when a decision changes system structure, affects a cross-cutting quality (security, performance, compatibility, delivery), adopts or drops a technology or dependency, or is costly to reverse — and a real alternative was rejected. Routine implementation choices do not qualify. When the test does not apply, record that explicitly on the originating backlog record; silence is not an answer.

- `id` is an immutable, globally unique, never-reused `ADR-NNN`, zero-padded to at least three digits. Allocate the next unused value across every ADR at the moment of publication, never at draft time. The filename is `adr-NNN-short-slug.md` and must agree with `id`.
- Frontmatter adds `decided` (ISO 8601 `YYYY-MM-DD`), `supersedes`, and `superseded_by`; the last two hold an `ADR-NNN` or `none`.
- Required sections: Context, Decision, Alternatives considered, Consequences, Affected concepts, Provenance.
- A replaced ADR keeps its path and filename, becomes `status: superseded`, and sets `superseded_by` to the replacement, which sets `supersedes` back to it. Both directions are required.
- Never edit a superseded ADR's Context, Decision, Alternatives considered, or Consequences. Correct a factual error in an `active` ADR; record a change of mind as a new ADR.
- `decisions/index.md` lists in-force and superseded ADRs in separate sections.
- A proposed decision belongs on its backlog record under `decisions:` and `## Decisions`. It is published here only after primary-branch acceptance, or retroactively once a decision is established as already in force.

## Length and splitting

- Target at most 350 lines per concept. Review the page for splitting at that threshold.
- Never exceed 500 lines in a concept page; validation fails above this limit.
- Split earlier when sections have different owners, audiences, lifecycles, source sets, or concept types, or when a section is independently reusable.
- Keep a cohesive runbook or reference together below 500 lines when splitting would make one task harder to execute.
- After splitting, update the nearest index, repair inbound links, remove duplicated prose, and add a log entry.

## Provenance and durability

Accepted technology guidance and its durable external basis belong together under `engineering/technologies/`. Verify version-sensitive claims against repository versions and current authoritative sources. Durable conclusions and the external evidence supporting them belong in their owning architecture, engineering, domain, or operations page, with sources linked beside the claims they support. Keep proposal-specific research with its desired change in the backlog. Keep desired changes, work-branch-only behavior, search transcripts, session state, temporary probes, active checklists, and planned commits outside the wiki.

## Links and indexes

Use standard Markdown links. Prefer bundle-relative links beginning with `/` inside the wiki. Every directory containing wiki Markdown has an `index.md` that lists each immediate concept and child directory with a short description.

Record creations, accepted corrections, deprecations, deletions, and meaningful reorganizations in the root `log.md`, newest first. Omit trivial formatting, metadata normalization, and link-repair noise.

## Validation

Run after every wiki change:

```sh
node scripts/validate-project.mjs
```

The check validates metadata, reserved files, statuses, duplicate titles, links, indexes, index coverage, and the 500-line hard limit. Pages over the 350-line target produce warnings.
