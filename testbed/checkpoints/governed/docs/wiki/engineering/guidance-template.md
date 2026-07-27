---
type: Reference
title: Guidance page template
description: Non-record example structure for a technology or standard guidance page under engineering/.
tags: [okf, engineering, guidance, template]
timestamp: 2026-07-27T09:21:14+02:00
status: active
---

# Guidance page template

Copy this structure for one canonical page per subject: a technology under [`technologies/`](/engineering/technologies/), a cross-cutting standard under [`standards/`](/engineering/standards/). Create and refresh pages with `$to-guidance`; replace every instruction with project evidence.

This file is a non-record example and states no accepted guidance itself.

Frontmatter carries `type`, `title`, `description`, `timestamp`, `status`, plus `resource` naming the subject, `tags`, `last_reviewed`, and `sources`.

Requirements on a page are rules the owner has **adopted as binding on new code**. Adoption is accepted current state even where existing code is non-compliant; record non-compliant areas under `## Known gaps` and track their remediation in `docs/backlog`.

## Scope

State which parts of the project this page governs, and what it does not — the modules, layers, or code areas the subject is used in. Link the concepts that own adjacent rules instead of restating them.

## Versions

One row per component. `Installed` is the exact version or constraint with the repository path that establishes it. `Latest stable` comes from a live registry or release-feed call — never from documentation, a tutorial, or memory. Guidance below applies to the installed version.

| Component | Installed (path) | Latest stable | Resolved via / on | Gap relevance |
|---|---|---|---|---|
| example | 1.2.3 (`package.json`) | 2.0.1 | `npm view example version` / YYYY-MM-DD | no known security impact; upgrade is separate backlog work |

For a standard, record the target conformance level, the enforcing tooling and its configuration path, and the specification version instead.

## Requirements

Binding rules for new code. State each concretely enough to implement from without reopening a source, and cite the source that establishes it. Never list a rule here that an in-force ADR or a recorded deviation contradicts.

## Recommendations

Preferred approaches with their rationale, not binding. Say when each applies.

## Conventions

Project-local choices verified in the repository — naming, layout, configuration, idioms — each with the path that shows it in use.

## Deviations

Where the project deliberately departs from upstream guidance, with the rationale and the deciding ADR or record when one exists. State `None known` only after comparison.

## Known gaps

Code areas that contradict a Requirement, each with the path that shows it and its `WORK-NNN` or `EPIC-NNN` link when remediation is tracked. State `None known` only after inspection.

## Sources

- [Source title](https://example.com) - official, maintainer, or secondary; applies to version <version>; reviewed <YYYY-MM-DD>; supports <rule>.
