# Maintaining the Repository

Keep canonical skill directories categorized under `skills/`. Expose each skill through a relative symlink in the cross-client `.agents/skills/` directory:

```text
skills/
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

1. Choose the narrowest existing category; add a category only when several related skills need it.
2. Keep the canonical directory name, symlink name, and frontmatter `name` identical and lowercase with hyphens.
3. Create symlinks relative to `.agents/skills/` so they remain valid in every clone.
4. Make `description` explain both capability and activation context.
5. Keep `SKILL.md` focused and under 500 lines; move conditional detail into directly linked resource files.
6. Confirm skills.sh discovery before publishing:

   ```bash
   npx skills add . --list
   ```

See the [Agent Skills specification](https://agentskills.io/specification), [creator best practices](https://agentskills.io/skill-creation/best-practices), and [skills CLI documentation](https://github.com/vercel-labs/skills#readme).
