# Agent instructions

## Purpose

This repository provides one project workflow through seven Agent Skills:
`setup`, `source`, `discuss`, `plan`, `implement`, `review`, and `document`.

Keep two information spaces separate:

- `docs/knowledge/` describes the verified current state in OKF v0.2.
- `docs/knowledge/sources/` caches concise notes from official documentation.
- `docs/work/` describes the desired state through Jira-like work items.

Promote product knowledge only through the completion gate. The `source` skill
may refresh official source notes directly.

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
8. Discuss material choices before planning.
9. Treat `docs/work/items/*.json` as plans, not established facts.
10. Keep the configured target branch clean for coordination and serial integration.
11. Use one Conventional Branch and `.woktrees/<key>/` worktree per ticket.
12. Never implement an epic or a ticket with an open blocker.
13. Parallelize only independent tickets without likely write overlap.
14. Use Conventional Commits for every ticket and merge commit.
15. Merge green ticket branches into the configured target branch. Its default is `main`.
16. Remove only clean, successfully merged worktrees and local branches.
17. Assume Codex uses ChatGPT subscription access unless the user says otherwise.
18. Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
19. Assess the active model's remaining context before changing product code.
20. Use bounded implementation subagents when the full change will not fit safely.
21. Keep workflow state, integration, and final verification with the coordinator.
22. Never move a work item directly to `done`.
23. Run the configured checks and record acceptance evidence.
24. Use `review` to check Standards and Spec separately.
25. Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
26. Use `complete` to close work and promote drafted knowledge.
27. Keep generated board and knowledge indexes synchronized.

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
