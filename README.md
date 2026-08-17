# Project Flow Skills

This workflow keeps project truth and planned work in separate spaces.

- Established knowledge lives in `docs/knowledge/` as Open Knowledge Format v0.2.
- Agreed project terms live in `docs/knowledge/ubiquitous-language.md`.
- Official documentation notes live in `docs/knowledge/sources/`.
- Desired state lives in `docs/work/` as briefs, tickets, releases, and outcomes.
- Completed work promotes drafted knowledge only after every declared gate passes.
- Green releases and observed outcomes promote their own verified knowledge.

## Skills

Use the skills as one suite:

1. `setup` initializes the workflow once.
2. `rules` installs and verifies managed `AGENTS.md` rule fragments.
3. `source` verifies external facts through live official documentation.
4. `language` manages terms explicitly agreed with the user.
5. `discuss` resolves product and technical choices.
6. `plan` creates Jira-like work items.
7. `implement` delivers a ticket or coordinates a complete epic and its review loops.
8. `review` is the separate two-subagent engine used by implementation.
9. `document` promotes knowledge, merges green work, and removes its branch and worktree.
10. `ship` releases done tickets and verifies the deployed or published result.
11. `measure` compares product evidence with the brief's agreed success measure.
12. `next` finds the smallest valid next action without changing project state.

Use `next` at any point when the correct workflow action is unclear. It reads
local state and recommends one action without changing the project.

`discuss` must use the harness's structured user-question tool when one is
available.

Use `language` whenever a project term is unclear or changes meaning. It applies
only the Ubiquitous Language principle from DDD. It adds no other DDD process.

`source` is also a gate before every later stage. It reads the local source
index, opens relevant official pages, and refreshes concise source notes. The
workflow never treats model memory or a search-result snippet as authority.

`review` must use two separate subagents in parallel. The orchestrator prepares
the scope and aggregates their reports. It never performs either review pass.
The review stops when the harness cannot provide subagents.

An implementation request also authorizes the review loop and valid in-scope
P0-P2 repairs. The agent does not ask whether it should start that loop.

When a brief is planned as an epic with stories, `next` recommends the epic.
Implementation coordinates every descendant and merges passing tickets serially.
After every descendant is done, it runs another review loop over the whole epic.

The setup skill installs a dependency-free Node.js CLI at
`.project/bin/project-flow.mjs`. Workflow-stage skills use that local copy.

The CLI creates `docs/knowledge/ubiquitous-language.md`. Use `language-show`,
`language-add`, `language-update`, and `language-deprecate` to manage it. Every
change records the actor, reason, time, and prior value. The file stores each
term once in structured frontmatter. `language-show` renders the readable view
without persisting a second copy.

Canonical records own workflow data. Generated boards and indexes repeat only
small summaries for progressive reading. Validation rejects stale generated
views and obsolete duplicated fields.

## Agent rules

Reusable `AGENTS.md` rule fragments live in `agent-rules/`. They are separate
from task-triggered skills. Each Markdown file covers one topic.

The recommended scopes are:

| Rule source | Scope | Reason |
| --- | --- | --- |
| `user/plain-english` | User | Communication preferences should follow the user. |
| `user/official-sources` | User | The evidence preference applies across projects. |
| `project/project-evidence` | Project | Knowledge paths and workflow gates are repository state. |
| `project/ubiquitous-language` | Project | Each repository owns its agreed vocabulary. |
| `project/ticket-git-workflow` | Project | Branch, worktree, and integration rules are shared policy. |
| `project/code-quality` | Project | Contributors need the same coding expectations. |
| `project/comments` | Project | Contributors need one code-comment policy. |
| `project/testing` | Project | Contributors need one focused test policy. |
| `project/review-policy` | Project | Contributors need the same approval gate. |

The [plain English rule](agent-rules/user/plain-english.md) adapts ISO 24495-1
and selected ASD-STE100 principles for non-native English speakers.

Codex does not load `agent-rules/` automatically. The `rules` skill installs
selected fragments into an active `AGENTS.md`. The `setup` skill installs the
recommended project profile. It never installs personal rules without an
explicit user request.

Each installed block has named start and end markers. Its start marker contains
a SHA-256 digest of the embedded source. The rules manager fails when a block
is missing, duplicated, malformed, stale, or changed by hand. It preserves text
outside managed blocks. Research links stay in `docs/research.md`, so installed
rules spend tokens only on active instructions.

Install the personal profile once, after checking the target:

```bash
node skills/rules/scripts/manage-rules.mjs install --scope user --dry-run
node skills/rules/scripts/manage-rules.mjs install --scope user
node skills/rules/scripts/manage-rules.mjs check --scope user
```

Install project rules directly when you do not invoke `setup`:

```bash
node skills/rules/scripts/manage-rules.mjs install \
  --scope project --root /path/to/project --dry-run
node skills/rules/scripts/manage-rules.mjs install \
  --scope project --root /path/to/project
node skills/rules/scripts/manage-rules.mjs check \
  --scope project --root /path/to/project
```

Keep active instructions concise. Put repository-wide rules at the root and
specialized rules near the files they govern. State required behavior and any
safe path or exception. Keep mechanical formatting checks in automated tools.

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
whole-item verification, automatic review, and repair-loop control.

An epic implementation request keeps the epic as the delivery unit. The
coordinator schedules all child tickets by dependency. It invokes `document`
to integrate each passing child before dependent work starts.

## Git workflow

The workflow uses short-lived ticket branches and linked Git worktrees.

- `main` is the default integration branch.
- `.worktrees/<ticket-key>/` contains one isolated worktree per ticket.
- Stories use `feat/<ticket-key>-<slug>`.
- Bugs use `fix/<ticket-key>-<slug>`.
- Tasks and subtasks use `chore/<ticket-key>-<slug>` by default.
- Epics receive one final review worktree only after every descendant is done.
- Every commit follows Conventional Commits 1.0.0.
- Green branches merge into `main` with a conventional `--no-ff` merge commit.
- Successful finalization removes the clean worktree and merged local branch.

Independent ready tickets without likely overlap in non-generated files may run in parallel. A ticket with an open
`blocked-by` link cannot start implementation. The blocker must first finish
and merge into `main`. Final merges always run one at a time.

The final epic review inspects the complete integrated range from the target
commit recorded before its first child. P0, P1, and P2 repairs stay in the epic
review worktree. The epic cannot complete until both review axes pass again.

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

Ticket `done` means merged, reviewed, and documented repository state. An epic
also needs its final integrated review. Neither state means deployed. A release becomes `green` only after preflight, immutable
artifact, rollout, and post-release checks. Product success is measured later
against the unchanged brief baseline, target, window, and data source.

## Requirements

- Use Node.js 20.9 or newer for the workflow CLI.
- Use Node.js 24.15 or newer for the disposable SQLite verification project.
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
node skills/rules/scripts/manage-rules.mjs install \
  --scope project --root /path/to/project --dry-run
node skills/rules/scripts/manage-rules.mjs install \
  --scope project --root /path/to/project
node skills/rules/scripts/manage-rules.mjs check \
  --scope project --root /path/to/project
```

The direct commands do not perform the setup skill's official-source research.

Then inspect the board:

```bash
node .project/bin/project-flow.mjs status
```

The normal workflow is:

```text
discuss → plan → implement (automatic review loop) → document → ship → measure
```

Ask `next` to locate the current position and choose the next valid skill.

The `source` skill verifies current official documentation at every stage.
Run `brief-show`, `release-show`, and `outcome-show` to inspect their evidence.
Run `language-show` to inspect the agreed vocabulary.

Run `node .project/bin/project-flow.mjs help` for every command.

Run `setup` again after updating this skill suite. Its refresh procedure
migrates older duplicated language, source, outcome, log, and check data.

## Real-project verification

This repository does not keep an automated skill or CLI test suite.

The tracked prompt creates a fresh Next.js and SQLite project under the ignored
`.verification/` directory. It exercises all twelve skills through a real agent
harness and records its evidence inside that disposable project.

```bash
cat verification/full-workflow.md
```

Give the prompt to a new agent session started at this repository root. The
prompt links both supported skill directories before it creates workflow state.
It does not commit the project or its evidence to this repository.

See [docs/research.md](docs/research.md) for sources and design decisions.
