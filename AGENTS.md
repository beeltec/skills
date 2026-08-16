# Agent instructions

## Purpose

This repository provides one project workflow through nine Agent Skills:
`setup`, `source`, `discuss`, `plan`, `implement`, `review`, `document`, `ship`,
and `measure`.

Keep two information spaces separate:

- `docs/knowledge/` describes the verified current state in OKF v0.2.
- `docs/knowledge/sources/` caches concise notes from official documentation.
- `docs/knowledge/releases/` records verified green release state.
- `docs/knowledge/outcomes/` records observed product results.
- `docs/work/briefs/` stores confirmed product intent and success definitions.
- `docs/work/items/` stores Jira-like delivery tickets.
- `docs/work/releases/` stores planned and historical release attempts.
- `docs/work/outcomes/` stores planned and observed outcome checks.

Promote repository knowledge through ticket completion. Promote deployed facts
only from green releases. Promote product results only from observed outcomes.
The `source` skill may refresh official source notes directly.

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
2. Read the active skill before changing workflow files.
3. Read both knowledge indexes before substantive workflow work.
4. Treat model memory as a search lead, not factual evidence.
5. Verify material external claims against current official documentation.
6. Save concise source notes under `docs/knowledge/sources/`.
7. Re-open relevant official URLs once per work session before relying on them.
8. Discuss material choices and product evidence before planning.
9. Persist and confirm a brief before moving an epic or story to `ready`.
10. Keep delivery acceptance separate from the product success measure.
11. Treat all files under `docs/work/` as plans or history, not current facts.
12. Declare risk factors and add every required quality gate to each ticket.
13. Keep the configured target branch clean for coordination and serial integration.
14. Use one Conventional Branch and `.woktrees/<key>/` worktree per ticket.
15. Never implement an epic or a ticket with an open blocker.
16. Parallelize only independent tickets without likely write overlap.
17. Use Conventional Commits for every ticket and merge commit.
18. Merge green ticket branches into the configured target branch. Its default is `main`.
19. Remove only clean, successfully merged worktrees and local branches.
20. Assume Codex uses ChatGPT subscription access unless the user says otherwise.
21. Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
22. Assess the active model's remaining context before changing product code.
23. Use bounded implementation subagents when the full change will not fit safely.
24. Keep workflow state, integration, and final verification with the coordinator.
25. Never move a work item directly to `done`.
26. Run configured checks and record acceptance and quality-gate evidence.
27. Use `review` to check Standards and Spec separately.
28. Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
29. Use `complete` to close work and promote drafted repository knowledge.
30. Treat ticket `done` as merged and documented, not released.
31. Use `ship` for approved external release actions and live checks.
32. Mark a release green only after its post-release checks pass.
33. Use `measure` after the agreed observation window.
34. Keep generated board and knowledge indexes synchronized.

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
