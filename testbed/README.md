# Skills Testbed

Rerunnable test project for the delivery-chain skills (`commands/`, `planning/`,
`workflows/`). Each scenario copies a checkpoint fixture into a temp directory, links the
working-tree skills into it, runs one fixed prompt through a headless harness, and judges
the outcome with a deterministic assertion script. `tools/` skills are out of scope (they
need external systems).

## Usage

```bash
testbed/bin/run.sh                       # scenarios affected by uncommitted skill changes
testbed/bin/run.sh --since origin/main   # affected by committed changes since origin/main
testbed/bin/run.sh --all                 # full suite
testbed/bin/run.sh implement code-review # named scenarios
HARNESS=codex testbed/bin/run.sh --all   # different harness (or -H codex)
```

Run artifacts (project copy, `report.txt`, `report.txt.stderr`) land under
`$TESTBED_RUNS_DIR` (default `$TMPDIR/skills-testbed`) and are kept for inspection.

## Harnesses

| Harness | Headless invocation |
| --- | --- |
| claude (default) | `claude -p --dangerously-skip-permissions "<prompt>"` |
| codex | `codex exec --dangerously-bypass-approvals-and-sandbox "<prompt>"` |
| opencode | `opencode run [--model $OPENCODE_MODEL] "<prompt>"` |
| pi | `pi -p "<prompt>"` |
| omp | `omp --mode text -p "<prompt>"` |

Adapters live in `lib/harness.sh`. The pi and omp print-mode flags vary between releases —
verify against the installed version when one misbehaves. Skills are exposed to the temp
project via `.claude/skills` and `.agents/skills` symlinks to this repo's `.agents/skills`,
so every run tests the current working tree.

## Checkpoints

Static trees under `checkpoints/`, checked in; `seed` resolves to `template/seed`.

| Checkpoint | State | Consumed by |
| --- | --- | --- |
| seed | ungoverned strict-TS utility library | setup-project |
| governed | after `$setup-project` (no `docs/wiki/research/`; draft guidance pages) | to-backlog, to-epic, to-wiki, to-guidance, to-product, backlog, wiki, guidance |
| ready-item | governed + WORK-001 (percent function) `ready` + WORK-002 (formatBytes) `proposed` | research, implement, implement-with-subagents, create-conventional-branch |
| changed-branch | ready-item + `_setup.sh` recreating the claimed WORK-001 and a `feat/work-001-percent` branch with the change committed | code-review, bump-version |

When an upstream skill changes its output shape, regenerate and commit the diff:

```bash
testbed/bin/regen.sh governed        # or ready-item | changed-branch | all
```

Regeneration runs the upstream skills headlessly (network + agent cost); `changed-branch`
is deterministic. Always review the checkpoint diff and rerun the downstream scenarios
before committing.

## Scenarios

One directory per skill under `scenarios/`: `scenario.sh` (checkpoint + owned skill paths
for affected-scenario selection), `prompt.md` (fixed owner-voiced prompt with the approvals
the skill's authority rules demand), `assert.sh` (structural checks: expected files,
frontmatter and status fields, `validate-project.mjs`, branch names, tests/type-check,
`Next step:` line). Assertions check presence and shape, never live-resolved version values.

Caveats:

- `discuss` is interactive by design; its owner-proxy path is exercised by the `to-product`
  scenario instead of a scenario of its own.
- `to-guidance`, `guidance`, `research`, `implement`, `implement-with-subagents`, and
  `to-product` need network access (live registry/doc research).
- `to-product` runs the whole chain and is by far the slowest and costliest scenario.
- Agent runs are non-deterministic; a failed assertion means "inspect the run dir", and a
  pass means the structural contract held — not that the prose is good.
