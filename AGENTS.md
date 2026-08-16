# Agent instructions

## Purpose

This repository provides one project workflow through eleven Agent Skills:
`setup`, `source`, `language`, `discuss`, `plan`, `implement`, `review`,
`document`, `ship`, `measure`, and the read-only `next` helper.

Keep two information spaces separate:

- `docs/knowledge/` describes the verified current state in OKF v0.2.
- `docs/knowledge/ubiquitous-language.md` stores user-agreed project terms.
- `docs/knowledge/sources/` caches concise notes from official documentation.
- `docs/knowledge/releases/` records verified green release state.
- `docs/knowledge/outcomes/` records observed product results.
- `docs/work/briefs/` stores confirmed product intent and success definitions.
- `docs/work/items/` stores Jira-like delivery tickets.
- `docs/work/releases/` stores planned and historical release attempts.
- `docs/work/outcomes/` stores planned and observed outcome checks.

Promote repository knowledge through ticket completion. Promote deployed facts
only from green releases. Promote product results only from observed outcomes.
The `source` skill may refresh official source notes directly. The `language`
skill may update agreed terms directly after explicit user confirmation.

## Repository layout

- `skills/` contains the installable skills.
- `scripts/link-skills.sh` links every skill for Codex and Claude Code.
- `skills/setup/scripts/project-flow.mjs` is the source CLI.
- `.woktrees/` contains ignored ticket worktrees created by the workflow.
- `examples/next-sqlite/` is the reproducible example and workflow fixture.
- `tests/` verifies the shared workflow behavior.
- `docs/research.md` records the source-backed design decisions.

## Working rules

1. Run `setup` once before using the project workflow.
2. Use `next` when the current workflow action is unclear.
3. Read the active skill before changing workflow files.
4. Read both knowledge indexes before substantive workflow work.
5. Read `docs/knowledge/ubiquitous-language.md` before interpreting project terms.
6. Use active canonical terms across discussion, work, code, tests, and knowledge.
7. Use `language` only after explicit user agreement to change project meaning.
8. Apply no other Domain-Driven Design patterns through the language workflow.
9. Treat model memory as a search lead, not factual evidence.
10. Verify material external claims against current official documentation.
11. Save concise source notes under `docs/knowledge/sources/`.
12. Re-open relevant official URLs once per work session before relying on them.
13. Discuss material choices and product evidence before planning.
14. Persist and confirm a brief before moving an epic or story to `ready`.
15. Keep delivery acceptance separate from the product success measure.
16. Treat all files under `docs/work/` as plans or history, not current facts.
17. Declare risk factors and add every required quality gate to each ticket.
18. Keep the configured target branch clean for coordination and serial integration.
19. Use one Conventional Branch and `.woktrees/<key>/` worktree per ticket.
20. Never implement an epic or a ticket with an open blocker.
21. Parallelize only independent tickets without likely write overlap.
22. Use Conventional Commits for every ticket and merge commit.
23. Merge green ticket branches into the configured target branch. Its default is `main`.
24. Remove only clean, successfully merged worktrees and local branches.
25. Assume Codex uses ChatGPT subscription access unless the user says otherwise.
26. Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
27. Assess the active model's remaining context before changing product code.
28. Use bounded implementation subagents when the full change will not fit safely.
29. Keep workflow state, integration, and final verification with the coordinator.
30. Never move a work item directly to `done`.
31. Run configured checks and record acceptance and quality-gate evidence.
32. Use `review` to check Standards and Spec separately.
33. Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
34. Use `complete` to close work and promote drafted repository knowledge.
35. Treat ticket `done` as merged and documented, not released.
36. Use `ship` for approved external release actions and live checks.
37. Mark a release green only after its post-release checks pass.
38. Use `measure` after the agreed observation window.
39. Keep generated board and knowledge indexes synchronized.

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
