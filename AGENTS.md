# Agent instructions

## Purpose

This repository provides one project workflow through six Agent Skills:
`setup`, `discuss`, `plan`, `implement`, `review`, and `document`.

Keep two information spaces separate:

- `docs/knowledge/` describes the verified current state in OKF v0.2.
- `docs/work/` describes the desired state through Jira-like work items.

Promote knowledge only through the completion gate.

## Repository layout

- `skills/` contains the installable skills.
- `skills/setup/scripts/project-flow.mjs` is the source CLI.
- `examples/next-sqlite/` is the reproducible example and workflow fixture.
- `tests/` verifies the shared workflow behavior.
- `docs/research.md` records the source-backed design decisions.

## Working rules

1. Run `setup` once before using the project workflow.
2. Discuss material choices before planning.
3. Read the active skill before changing workflow files.
4. Read `docs/knowledge/index.md` before implementing a work item.
5. Treat `docs/work/items/*.json` as plans, not established facts.
6. Assume Codex uses ChatGPT subscription access unless the user says otherwise.
7. Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
8. Assess the active model's remaining context before changing product code.
9. Use bounded implementation subagents when the full change will not fit safely.
10. Keep workflow state, integration, and final verification with the coordinator.
11. Never move a work item directly to `done`.
12. Run the configured checks and record acceptance evidence.
13. Use `review` to check Standards and Spec separately.
14. Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
15. Use `complete` to close work and promote drafted knowledge.
16. Keep generated board and knowledge indexes synchronized.

## Commands

Run the repository tests:

```bash
npm test
```

Validate an initialized project:

```bash
node .project/bin/project-flow.mjs validate
```

Test the example:

```bash
cd examples/next-sqlite
npm ci
npm test
npm run build
```

## Code conventions

- Keep the workflow file-based and dependency-free.
- Prefer direct validation over hidden inference.
- Preserve unknown OKF metadata when reading established knowledge.
- Never use `any` in TypeScript.
- Update this file when commands, paths, or invariants change.
