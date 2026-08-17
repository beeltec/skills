# Code comments

Use comments to preserve important information that clear code, names, and
types cannot express. Follow the repository's language-specific documentation
format when one exists.

## Function and API comments

- Describe a public or non-obvious function's contract directly above its declaration.
- Use one or two sentences by default.
- State purpose and correct use, not facts already clear from its name and types.
- Add necessary constraints, side effects, errors, ownership, or lifecycle details.
- Omit a comment for a simple private function when its purpose and use are obvious.
- Do not add boilerplate comments to every function only for consistency.
- At a definition, explain only non-obvious implementation choices.
- Do not repeat a declaration comment at the function definition.

## Implementation comments

- Prefer clearer code, names, types, or smaller functions over explanatory narration.
- Explain intent, constraints, tradeoffs, invariants, or surprising behavior.
- Do not translate each statement into prose.
- Place a short comment before the smallest non-obvious block it explains.
- Use inline end-of-line comments sparingly.
- Preserve exact identifiers and technical terms.
- Do not keep commented-out code. Git already stores deleted code.

## Length and maintenance

- Keep routine comments short and focused.
- Do not write a paragraph when one or two sentences preserve the needed fact.
- Keep necessary API contract details near the API, even when they need more space.
- Move long rationale or tutorials to maintained project documentation and link to it.
- Update or remove affected comments in the same change as the code.
- Treat an inaccurate comment as a defect.
