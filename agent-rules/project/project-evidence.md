# Project evidence and state

Keep established project knowledge separate from intended work. Use the correct
evidence for each kind of claim.

## Information spaces

- Treat `docs/knowledge/` as verified current project state.
- Treat `docs/work/` as desired state, delivery evidence, or work history.
- Never present a brief, ticket, draft, release plan, or outcome plan as current fact.
- Promote repository knowledge only after implementation, acceptance, checks, and review pass.
- Promote deployed facts only from a verified green release.
- Promote product-result facts only from an observed outcome.

## Evidence roles

- Use official documentation to prove external behavior and constraints.
- Use repository code and tests to prove implemented behavior.
- Use release checks to prove an artifact reached its named target.
- Use analytics, observed usage, and user research to prove product outcomes.
- Use an explicit owner decision when evidence cannot choose product intent.
- Never substitute one evidence role for another.

## Workflow gates

- Use `next` when the current workflow action is unclear.
- Require a persisted, confirmed brief before moving an epic or story to `ready`.
- Keep ticket delivery acceptance separate from the product success measure.
- Declare applicable risk factors and record each required quality gate.
- Never set a work item to `done` by editing its JSON file.
- Complete a ticket only after acceptance, checks, gates, and review pass.
- Treat ticket `done` as merged and documented repository state.
- Treat release `green` as verified deployed or published state.
- Treat `met`, `missed`, or `inconclusive` as an observed product result.
- Validate generated indexes and boards after workflow state changes.
