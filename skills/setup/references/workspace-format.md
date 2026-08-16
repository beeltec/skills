# Workspace format

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
docs/
├── knowledge/
│   ├── index.md
│   └── log.md
└── work/
    ├── board.md
    ├── items/
    ├── drafts/
    └── handoffs/              # Created when delegated work needs it
```

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

Source: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

## Target AGENTS.md block

Add these instructions without removing local rules:

```markdown
## Project state workflow

- Read `docs/knowledge/index.md` before implementation.
- Treat `docs/work/` as desired state, not current fact.
- Assume Codex uses ChatGPT subscription access unless the user says otherwise.
- Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
- Assess session fit before code changes. Delegate bounded implementation when it will not fit.
- Never set a work item to `done` by editing JSON.
- Record separate Standards and Spec reviews with zero P0-P2 findings.
- Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
- Run `.project/bin/project-flow.mjs complete <KEY>` after all gates pass.
- Validate the workspace after workflow changes.
```
