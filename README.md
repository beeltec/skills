# Project Flow Skills

This workflow keeps project truth and planned work in separate spaces.

- Established knowledge lives in `docs/knowledge/` as Open Knowledge Format v0.2.
- Official documentation notes live in `docs/knowledge/sources/`.
- Desired state lives in `docs/work/` as briefs, tickets, releases, and outcomes.
- Completed work promotes drafted knowledge only after every declared gate passes.
- Green releases and observed outcomes promote their own verified knowledge.

## Skills

Use the skills as one suite:

1. `setup` initializes the workflow once.
2. `source` verifies external facts through live official documentation.
3. `discuss` resolves product and technical choices.
4. `plan` creates Jira-like work items.
5. `implement` gives each ticket a branch and worktree, then changes code.
6. `review` checks Standards and Spec until both have no P0-P2 findings.
7. `document` promotes knowledge, merges green work, and removes its branch and worktree.
8. `ship` releases done tickets and verifies the deployed or published result.
9. `measure` compares product evidence with the brief's agreed success measure.

`source` is also a gate before every later stage. It reads the local source
index, opens relevant official pages, and refreshes concise source notes. The
workflow never treats model memory or a search-result snippet as authority.

The setup skill installs a dependency-free Node.js CLI at
`.project/bin/project-flow.mjs`. The remaining skills use that local copy.

## Link skills into a project

The script links every skill into both supported project locations:

- `.agents/skills` for Codex
- `.claude/skills` for Claude Code

Both products support symlinked skill directories. Link this suite into any
existing project with:

```bash
/absolute/path/to/skills-new/scripts/link-skills.sh /path/to/project
```

Omit the project path to use the current directory. The script resolves its
own repository path, even when the script itself is called through a symlink.
This makes it safe to place the script on `PATH`.

The command preserves other skills under both directories. It checks both
destinations before writing and refuses to replace files or directories. Use
`--force` only to replace an existing skill symlink. Use `--dry-run` to inspect
the result first.

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

## Git workflow

The workflow uses short-lived ticket branches and linked Git worktrees.

- `main` is the default integration branch.
- `.woktrees/<ticket-key>/` contains one isolated worktree per ticket.
- Stories use `feat/<ticket-key>-<slug>`.
- Bugs use `fix/<ticket-key>-<slug>`.
- Tasks and subtasks use `chore/<ticket-key>-<slug>` by default.
- Every commit follows Conventional Commits 1.0.0.
- Green branches merge into `main` with a conventional `--no-ff` merge commit.
- Successful finalization removes the clean worktree and merged local branch.

Independent ready tickets without likely overlap in non-generated files may run in parallel. A ticket with an open
`blocked-by` link cannot start implementation. The blocker must first finish
and merge into `main`. Final merges always run one at a time.

Create a ticket worktree from a clean `main` worktree:

```bash
node .project/bin/project-flow.mjs worktree-add APP-2
```

After review, knowledge promotion, completion, and a final conventional commit,
finish it from `main`:

```bash
node .project/bin/project-flow.mjs worktree-finish APP-2
```

The target branch board shows integrated state. Use `worktree-list`, then run
`show <KEY>` inside a ticket worktree, to inspect active branch-local state.

The workflow never force-removes worktrees or force-deletes branches. External
pushes, deployments, publications, and remote deletion require user authority.

Conventional Commits records release intent. The `ship` skill records release
versions when the project has a version policy. It does not infer version bumps
or create tags without an explicit project decision.

## Product and release gates

A confirmed brief records the problem, users, evidence, scope, assumptions,
delivery acceptance, and measurable product target. Epic and story work cannot
become ready without one.

Tickets declare risk factors. Each factor maps to a focused quality gate. For
example, a migration risk requires migration evidence. Review and completion
remain blocked until every required gate passes.

Ticket `done` means merged, reviewed, and documented repository state. It does
not mean deployed. A release becomes `green` only after preflight, immutable
artifact, rollout, and post-release checks. Product success is measured later
against the unchanged brief baseline, target, window, and data source.

## Requirements

- Use Node.js 20.9 or newer for the workflow and its tests.
- Use Node.js 24.15 or newer for the example's built-in SQLite module.
- Provide web access when a stage needs current external technical facts.
- Use Git with at least one baseline commit before ticket implementation.

## Quick start

Activate `setup` in a target repository. Or run its script
directly:

```bash
node skills/setup/scripts/project-flow.mjs init \
  --root /path/to/project \
  --key APP \
  --name "Example App" \
  --target-branch main
```

Then inspect the board:

```bash
node .project/bin/project-flow.mjs status
```

The normal workflow is:

```text
discuss → plan → implement ⇄ review → document → ship → measure
```

The `source` skill verifies current official documentation at every stage.
Run `brief-show`, `release-show`, and `outcome-show` to inspect their evidence.

Run `node .project/bin/project-flow.mjs help` for every command.

## Verification

Run the workflow tests from this repository:

```bash
npm test
```

On Node.js 24.15 or newer, this also copies the example into a temporary Git
repository and completes its build, release, and outcome cycle.

Run the reproducible Next.js and SQLite example:

```bash
cd examples/next-sqlite
npm ci
npm test
npm run build
node .project/bin/project-flow.mjs validate
```

See [docs/research.md](docs/research.md) for sources and design decisions.
