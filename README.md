# Beeltec Skills

[![skills.sh](https://skills.sh/b/beeltec/skills)](https://skills.sh/beeltec/skills)

A collection of reusable skills for Codex, Claude Code, Cursor, and other agents that support the [Agent Skills](https://agentskills.io) open standard.

## Install

```bash
npx skills add beeltec/skills
```

Choose skills interactively, or install a specific skill:

```bash
npx skills add beeltec/skills --skill glab
npx skills add beeltec/skills --skill elementor-content
```

Install globally with `--global`, or inspect the catalog without installing:

```bash
npx skills add beeltec/skills --global
npx skills add beeltec/skills --list
```

## Available Skills

| Skill | Description |
|-------|-------------|
| **bump-version** | Versioning workflow — detect patch/minor/major bumps, update version files and changelog, then create a release commit |
| **check-context-window** | Inspect the current session's context and token usage |
| **code-review** | Review a diff independently against repository standards and its originating specification |
| **discuss** | Stress-test a plan or decision through a guided, one-question-at-a-time discussion |
| **elementor-content** | Create and edit Elementor JSON or WordPress database content via WP-CLI |
| **glab** | Manage GitLab merge requests, issues, pipelines, releases, and repositories with `glab` |
| **implement** | Execute an existing task plan with branching, commits, tests, and review |
| **maestro-e2e-testing** | Write, run, and debug Maestro end-to-end tests for mobile apps |
| **to-tasks** | Convert a conversation or specification into linked implementation tasks |
| **wiki** | Maintain a project llmwiki using the Open Knowledge Format |

## Manual Installation

If you prefer not to use the CLI, clone the repository and copy or symlink the desired directory:

```bash
git clone https://github.com/beeltec/skills.git
cp -RL skills/.agents/skills/glab ~/.codex/skills/glab
```

## Maintaining the Repository

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
6. Test bundled scripts and validate every public symlink:

   ```bash
   for skill in .agents/skills/*; do
     uvx --from skills-ref agentskills validate "$skill"
   done
   ```

7. Confirm skills.sh discovery before publishing:

   ```bash
   npx skills add . --list
   ```

See the [Agent Skills specification](https://agentskills.io/specification), [creator best practices](https://agentskills.io/skill-creation/best-practices), and [skills CLI documentation](https://github.com/vercel-labs/skills#readme).

## License

[MIT](LICENSE)
