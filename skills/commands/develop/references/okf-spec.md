# Open Knowledge Format 0.1

Read for structural wiki operations or uncertain frontmatter, link, index, or citation semantics. Project maintenance may impose stricter producer rules; preserve unknown extensions.

## Bundle

An OKF bundle is a UTF-8 Markdown directory tree:

```text
bundle/
├── index.md
├── log.md
├── concept.md
└── area/
    ├── index.md
    └── concept.md
```

`index.md` and `log.md` are reserved and are not concept documents. Other Markdown files are concepts. Organize by durable subject; the format defines no fixed taxonomy.

## Concepts

Every concept begins with YAML frontmatter and has a Markdown body:

```yaml
---
type: Reference
title: Display name
description: One-sentence summary.
resource: https://example.com/canonical-resource
tags: [example]
timestamp: 2026-01-01T00:00:00Z
---
```

`type` is required and non-empty. Consumers tolerate unknown types and fields. Producers should provide title, description, tags, resource, and timestamp when useful. Preserve unknown metadata when editing.

Use structured headings, lists, tables, and code blocks. No body heading is universally required. Keep external evidence beside claims or under a Sources/Citations section according to project maintenance.

## Links

Use standard Markdown links:

- `/area/concept.md`: bundle-root relative and preferred for stable wiki links;
- `./concept.md` or `../area/concept.md`: source-relative;
- `https://example.com`: external citation.

A concept link asserts a relationship whose meaning comes from surrounding prose. Repair inbound links during structural changes even though permissive consumers can tolerate broken links.

## Indexes

An `index.md` lists immediate concepts and child directories for progressive disclosure. It normally has no frontmatter. Use grouped headings and descriptive links:

```markdown
# Area

- [Concept](concept.md) - One-sentence description.
- [Child area](child/) - One-sentence description.
```

Project maintenance may require complete nearest-index coverage; apply that stricter rule.

## Logs

`log.md` is optional in base OKF. When present, use newest-first ISO date groups and concise knowledge changes:

```markdown
## 2026-01-31

- **Creation**: Added [Concept](/area/concept.md).
```

Do not log formatting or editing-session noise unless project maintenance requires it.

## Citations

External citations may be inline or listed with title and URL. Open each source used. Keep enough context to identify which claim it supports. Version-sensitive project guidance also records authority, applicable version, and review date.

## Structural Operations

Before creating, moving, splitting, merging, or deleting concepts:

1. Identify canonical ownership, nearest indexes, duplicates, and every inbound wiki/backlog reference.
2. Preserve unknown metadata and accepted meaning.
3. Apply the concept edit, links, indexes, and required log entry as one transaction.
4. Validate project-local structure and inspect the complete diff.

A bundle is base-conformant when every concept has parseable frontmatter with non-empty `type`, and reserved files follow their roles. Project validators may correctly reject states that base OKF would merely tolerate.
