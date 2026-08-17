# Code quality

Prefer the simplest implementation that makes the required behavior clear and
unsurprising.

## Rules

- Follow the repository's existing language, framework, and formatting conventions.
- Keep responsibilities clear and names precise.
- Prefer early returns over deeply nested conditions.
- Use the type system to make invalid states difficult to represent.
- Never use `any` in TypeScript.
- Use one typed model for related values that must remain consistent.
- Avoid wrappers that only delegate without adding meaning.
- Keep one change within the smallest coherent set of modules.
- Do not change one module for unrelated reasons.
- Handle relevant error paths and boundary conditions.
- Protect sensitive data and validate untrusted input.
- Add focused tests that prove changed behavior or a repaired defect.
- Do not add broad regression tests without a concrete risk.
- Keep comments concise and update them when behavior changes.

## DRY

Apply Don't Repeat Yourself (DRY) to duplicated knowledge and decisions.

- Keep each fact or rule in one unambiguous, authoritative representation.
- Derive repeated outputs from that source when practical.
- Do not treat similar-looking code as a DRY violation without shared meaning.
- Prefer small local duplication when one abstraction would couple unrelated concepts.

## YAGNI

Apply You Aren't Gonna Need It (YAGNI) to presumed future capabilities.

- Build only behavior required by accepted current work.
- Do not add speculative features, options, extension points, or general frameworks.
- Add an abstraction when current behavior needs it, not only because future work might.
- Refactor when it keeps current code healthy and easy to change.
- Do not use YAGNI to excuse weak tests, unsafe code, or known defects.

## Review focus

Check correctness, security, error handling, data handling, maintainability, and
type safety. Treat a style preference as advice unless it creates a concrete
risk or violates an explicit repository rule.
