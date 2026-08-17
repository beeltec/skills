# Shared language contract

## Adopted principle

Use one shared vocabulary in conversation, writing, diagrams, tests, and code
when each place describes the same project concept. Let users and agents refine
the vocabulary together. Treat a changed definition as a changed project
meaning, not an editorial correction.

This workflow adopts only this Ubiquitous Language principle. It does not
require Domain-Driven Design architecture, modeling, or tactical patterns.

Primary source:

- https://www.domainlanguage.com/ddd/reference/
- https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf

The local verified note belongs at
`docs/knowledge/sources/methods/ubiquitous-language.md`.
Validation requires this file to use the `OfficialSource` type and cite the
official Ubiquitous Language reference above.

## Canonical file

`docs/knowledge/ubiquitous-language.md` is an OKF v0.2 concept with type
`UbiquitousLanguage`. Its JSON-compatible frontmatter stores the canonical
persisted data. Do not repeat terms or history in the Markdown body. Run
`language-show` for a readable Markdown view.

Each term contains:

- one unique canonical term;
- one precise definition;
- zero or more accepted aliases;
- zero or more correct usage examples;
- `active` or `deprecated` status;
- an optional active replacement;
- the latest actor and timestamp.

The file also stores an append-only change history with the actor and reason.
Only the latest content confirmations remain in `verified`. Use CLI commands
because manual data edits bypass agreement and validation.

## Agreement rules

- Let the user or responsible domain expert decide project meaning.
- Use `human:user` only after the current user explicitly confirms the change.
- Record an agent actor only when project policy grants that agent authority.
- Prefer one canonical term. Keep aliases only to recognize established wording.
- When one word has two meanings, create qualified terms instead of overloading it.
- When a term changes, inspect briefs, tickets, code, tests, knowledge, releases,
  and outcomes for affected usages.
- Treat a text match as affected only when it describes the same project concept.
- Route behavior or code changes through `discuss`, `plan`, and implementation.
- Preserve obsolete wording as a deprecated term instead of deleting history.
- Update a deprecated replacement link before deprecating its active target.

## External terminology

Official documentation proves an external tool's terms, not this project's
preferred vocabulary. Keep exact vendor names in commands, API identifiers,
and quotations. Add an explicit project alias only when the user confirms both
expressions have the same project meaning.
