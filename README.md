# Project Flow Skills

This workflow keeps project truth and planned work in separate spaces.

- Established knowledge lives in `docs/knowledge/` as Open Knowledge Format v0.2.
- Official documentation notes live in `docs/knowledge/sources/`.
- Desired work lives in `docs/work/` as epics, stories, bugs, tasks, and subtasks.
- Completed work promotes drafted knowledge only after every declared gate passes.

## Skills

Use the skills as one suite:

1. `setup` initializes the workflow once.
2. `source` verifies external facts through live official documentation.
3. `discuss` resolves product and technical choices.
4. `plan` creates Jira-like work items.
5. `implement` changes code and repairs blocking review findings.
6. `review` checks Standards and Spec until both have no P0-P2 findings.
7. `document` promotes established knowledge and closes green work.

`source` is also a gate before every later stage. It reads the local source
index, opens relevant official pages, and refreshes concise source notes. The
workflow never treats model memory or a search-result snippet as authority.

The setup skill installs a dependency-free Node.js CLI at
`.project/bin/project-flow.mjs`. The remaining skills use that local copy.

## Context-aware implementation

The `implement` skill checks whether the full change fits the active session.
The workflow assumes Codex with ChatGPT subscription access. It uses the
runtime context value first. When that value is unavailable, GPT-5.6 uses a
conservative 256,000-token fallback.

The 1.05M GPT-5.6 API context does not apply to this default profile. Use it
only when project instructions explicitly select API-key access.

When the work will not fit safely, the coordinator creates
`docs/work/handoffs/<KEY>.md`. It delegates bounded code packets sized for each
subagent's own context window. The coordinator keeps ticket state, integration,
whole-item verification, and the handoff to `review`.

## Requirements

- Use Node.js 20.9 or newer for the workflow and its tests.
- Use Node.js 24.15 or newer for the example's built-in SQLite module.
- Provide web access when a stage needs current external technical facts.

## Quick start

Activate `setup` in a target repository. Or run its script
directly:

```bash
node skills/setup/scripts/project-flow.mjs init \
  --root /path/to/project \
  --key APP \
  --name "Example App"
```

Then inspect the board:

```bash
node .project/bin/project-flow.mjs status
```

Run `node .project/bin/project-flow.mjs help` for every command.

## Verification

Run the workflow tests from this repository:

```bash
npm test
```

Run the reproducible Next.js and SQLite example:

```bash
cd examples/next-sqlite
npm ci
npm test
npm run build
node .project/bin/project-flow.mjs validate
```

See [docs/research.md](docs/research.md) for sources and design decisions.
