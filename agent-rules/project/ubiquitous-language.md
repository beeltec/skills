# Ubiquitous language

Use one shared project vocabulary to reduce meaning conflicts between users,
agents, work records, and code.

Apply only the Ubiquitous Language principle. Do not infer other Domain-Driven
Design practices.

## Rules

- Read `docs/knowledge/ubiquitous-language.md` before interpreting project terms.
- Use one active canonical term for each project concept.
- Use canonical terms consistently in discussion, work records, code, tests, and knowledge.
- Recognize accepted aliases, but prefer the canonical term in new text.
- Let the user or responsible domain expert decide project meaning.
- Treat a changed definition as a changed meaning, not an editorial correction.
- Require explicit user agreement before adding, revising, renaming, or deprecating a term.
- Use qualified terms when one word would otherwise represent two meanings.
- Preserve deprecated terms and their replacements instead of deleting history.
- Inspect affected uses after an agreed term changes.
- Ignore text matches that describe a different concept.
- Preserve exact vendor names, commands, API identifiers, interface names, and quotations.
- Do not let external documentation choose the project's preferred vocabulary.
- Use the `language` skill for managed vocabulary changes.
- Do not edit the generated readable body by hand.
