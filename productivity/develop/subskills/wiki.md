---
name: wiki
description: Write to the project's OKF Wiki
---

## The bundle

The wiki is an [OKF](references/okf.md) v0.2 knowledge bundle rooted at `docs/wiki/`.

Check if it exists in this project (based on the file and folder structure in `references/folder-structure.md` ## OKF Wiki)

If not, ask the user if it should be created. Cancel here if the answer is "no".

Bundle-relative links (starting with `/`) resolve against `docs/wiki/`.

## Naming

- Files and directories are lowercase kebab-case.
- Technology directories are named after the technology, not the layer
  (`postgres/`, not `database/`).
- ADRs are `adr-NNN-<slug>.md` with zero-padded, sequential, never-reused
  numbers.
- External systems are one file per system, named after the system.
- `index.md` and `log.md` are reserved OKF filenames and carry no frontmatter,
  except the bundle-root `index.md`, which may carry only `okf_version`.

## Conventions

- Every other `.md` file carries YAML frontmatter with a non-empty `type`.
- A technology directory holds only what is specific to that technology;
  `technology/general/` holds shared guidance and is never contradicted.
- Each technology directory contains all four documents; a document with nothing
  specific to say links to its `general/` counterpart rather than being omitted.
- ADRs are written only after a decision is made; `decision_status` is
  `accepted`, `superseded`, or `deprecated`. There is no proposed state.
- `architecture.md` records the structure that exists today; intended changes
  belong in an ADR.
- Machine-readable specifications (OpenAPI, SDL, Protobuf) live in
  `references/` or in the codebase, and `api.md` points at them rather than
  restating them.
- `log.md` records meaningful changes, newest first, under ISO 8601 date
  headings.

## Templates

Templates live in `assets/templates/wiki/`.

| Target file | Template |
|-------------|----------|
| `index.md` | `root-index.md` |
| `log.md` | `log.md` |
| `ubiquitous-language.md` | `ubiquitous-language.md` |
| `architecture.md` | `architecture.md` |
| `technology/index.md` | `technology-index.md` |
| `technology/*/guidelines.md` | `technology-guidelines.md` |
| `technology/*/best-practices.md` | `technology-best-practices.md` |
| `technology/*/examples.md` | `technology-examples.md` |
| `technology/*/api.md` | `technology-api.md` |
| `external-systems/index.md` | `external-systems-index.md` |
| `external-systems/*.md` | `external-system.md` |
| `adrs/index.md` | `adr-index.md` |
| `adrs/adr-NNN-*.md` | `adr.md` |

The four `technology-*` templates serve both `general/` and technology
directories; each notes how its framing differs between the two.
