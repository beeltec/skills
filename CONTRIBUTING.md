# Maintaining the Repository

Keep canonical skill directories categorized under `skills/`. Expose each skill through a relative symlink in the cross-client `.agents/skills/` directory:

```text
skills/
├── commands/
├── planning/
├── tools/
├── utilities/
└── workflows/

skills/<category>/<skill-name>/
├── SKILL.md            # Required metadata and core instructions
├── agents/             # Optional client-specific UI metadata
├── scripts/            # Optional executable helpers
├── references/         # Optional documentation loaded on demand
└── assets/             # Optional templates and static resources

.agents/skills/<skill-name> -> ../../skills/<category>/<skill-name>
```

For each change:

1. Choose the narrowest existing category; add a category only when several related skills need it. `commands/` holds every skill with `disable-model-invocation: true`, where invoking it is itself the owner's decision; put the machinery it drives in `planning/` or `workflows/`.
2. Keep the canonical directory name, symlink name, and frontmatter `name` identical and lowercase with hyphens.
3. Create symlinks relative to `.agents/skills/` so they remain valid in every clone.
4. Make `description` explain both capability and activation context.
5. Keep `SKILL.md` focused and under 500 lines; move conditional detail into directly linked resource files.
6. Confirm skills.sh discovery before publishing:

   ```bash
   npx skills add . --list
   ```

7. After changing a delivery-chain skill (`commands/`, `planning/`, `workflows/`), run its testbed scenarios before publishing — `testbed/bin/run.sh` selects them from the diff; see `testbed/README.md`. Regenerate the checkpoint fixtures (`testbed/bin/regen.sh`) when a skill changes its output shape.

## Next-step handoff convention

Every delivery-workflow skill ends its final report with a `Next step:` line — one exact copy-pasteable command for the follow-up in canonical `$name` form, selected from the run's actual outcome with real arguments, never placeholders; omit it only when no follow-up exists. The canonical convention — recommend only, never invoke, last line, numbered list in run order when several apply, `$name` rendered per harness — is stated once in `skills/commands/setup-project/assets/agent-instructions.md`, which `setup-project` installs into every project's agent instructions; each skill states only its outcome-to-command routing. Apply this convention when adding or changing workflow skills.

The line stays a recommendation in the skill that writes it. Under an autonomous run, `to-product` reads it as control flow and executes it — which is why it must always be a real command with real arguments.

See the [Agent Skills specification](https://agentskills.io/specification), [creator best practices](https://agentskills.io/skill-creation/best-practices), and [skills CLI documentation](https://github.com/vercel-labs/skills#readme).
