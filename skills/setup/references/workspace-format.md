# Workspace format

## Contents

- Two spaces
- Generated layout
- OKF v0.2 profile
- Target AGENTS.md block
- Git policy

## Two spaces

`docs/knowledge/` is an OKF v0.2 bundle. It describes the verified current
state.

`docs/work/` stores desired outcomes and delivery evidence. Its item files
are JSON for deterministic updates.

## Generated layout

```text
.project/
├── workflow.json
└── bin/project-flow.mjs
.woktrees/                    # Ignored linked worktrees, one per ticket
docs/
├── knowledge/
│   ├── index.md
│   ├── log.md
│   └── sources/
│       └── index.md            # Concise notes from official documentation
└── work/
    ├── board.md
    ├── items/
    ├── drafts/
    └── handoffs/              # Created when delegated work needs it
```

The workflow config uses `main` as `git.targetBranch` by default. It fixes the
worktree directory at `.woktrees` and the merge strategy at `no-ff`. A user may
select another target branch during setup or finalization.

## OKF v0.2 profile

Every concept except `index.md` and `log.md` needs frontmatter and a non-empty
`type`. The workflow creates JSON-formatted frontmatter between YAML delimiters.

Use these fields when known:

- `title` gives a display name.
- `description` gives one search-friendly sentence.
- `tags` supports cross-cutting discovery.
- `sources` records provenance.
- `generated` records the authoring actor and time.
- `verified` records independent checks.
- `status` is `draft`, `stable`, or `deprecated`.

Use `human:<id>` only for actual human authors or reviewers. Use
`process:project-flow` for the automated completion gate.

`docs/knowledge/sources/` contains `OfficialSource` concepts. The `source`
skill may update them directly after live verification. Product knowledge must
still pass through the work-item completion gate.

Source: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

## Target AGENTS.md block

Add these instructions without removing local rules:

```markdown
## Project state workflow

- Read `docs/knowledge/index.md` and `docs/knowledge/sources/index.md` first.
- Treat model memory as a search lead, not factual evidence.
- Verify material external claims against current official documentation.
- Save concise official source notes under `docs/knowledge/sources/`.
- Re-open relevant official URLs once per work session before relying on them.
- Treat `docs/work/` as desired state, not current fact.
- Assume Codex uses ChatGPT subscription access unless the user says otherwise.
- Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
- Assess session fit before code changes. Delegate bounded implementation when it will not fit.
- Keep the configured target worktree clean for coordination and serial integration.
- Implement each non-epic ticket in `.woktrees/<ticket-key>/` on its own branch.
- Do not create a worktree while any `blocked-by` ticket is open.
- Use Conventional Branch 1.1.0 names and Conventional Commits 1.0.0 messages.
- Merge green ticket branches into the configured target, `main` by default, then remove local ticket state.
- Never set a work item to `done` by editing JSON.
- Record separate Standards and Spec reviews with zero P0-P2 findings.
- Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
- Run `.project/bin/project-flow.mjs complete <KEY>` after all gates pass.
- Validate the workspace after workflow changes.
```

## Git policy

- Treat the configured target as stable integration history, not an implementation workspace.
- Use `feat/<key>-<slug>` for stories and `fix/<key>-<slug>` for bugs.
- Use `chore/<key>-<slug>` for tasks and subtasks unless another supported type fits.
- Keep epics as coordination items. Do not create epic worktrees.
- Parallelize only ready tickets without open blockers or likely write overlap.
- Integrate ticket branches one at a time.
- Require the latest target commit as the final review fixed point.
- Use `git branch -d`, never force deletion, after a successful merge.
- Leave remote pushes, pull requests, and remote branch deletion to explicit user instructions.

Official references:

- https://git-scm.com/docs/git-worktree.html
- https://git-scm.com/docs/gitworkflows
- https://www.conventionalcommits.org/en/v1.0.0/
- https://conventionalbranch.org/
- https://support.atlassian.com/jira-software-cloud/docs/what-are-dependencies-in-advanced-roadmaps/
