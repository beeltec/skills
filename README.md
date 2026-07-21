# Beeltec Skills

[![skills.sh](https://skills.sh/b/beeltec/skills)](https://skills.sh/beeltec/skills)

A collection of 13 reusable skills for Codex, Claude Code, Cursor, and other agents that support the [Agent Skills](https://agentskills.io) open standard.

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
| **code-review** | Review changes in parallel against repository standards and their originating specification |
| **codex-subagent** | From non-Codex harnesses such as Claude Code or OpenCode only, delegate implementation tasks to a workspace-scoped Codex CLI agent with configurable model and reasoning effort; never invoke from Codex itself |
| **create-conventional-branch** | Create and switch to a purpose-driven branch that follows the Conventional Branch specification |
| **discuss** | Stress-test a plan or decision through a guided, one-question-at-a-time discussion |
| **elementor-content** | Create and edit Elementor JSON or WordPress database content via WP-CLI |
| **glab** | Manage GitLab merge requests, issues, pipelines, releases, and repositories with `glab` |
| **handoff** | Save unfinished work context so another agent can resume it |
| **implement** | Execute an existing task plan with branching, commits, tests, and review |
| **maestro-e2e-testing** | Write, run, and debug Maestro end-to-end tests for mobile apps |
| **setup-wiki** | Scaffold an Open Knowledge Format 0.1 project wiki with validation and agent instructions |
| **to-tasks** | Convert a conversation or specification into linked implementation tasks |
| **to-wiki** | Turn confirmed conclusions into durable, canonical project wiki knowledge |

## Development Workflow

The development skills form a workflow that carries project knowledge from discovery through implementation and review. Run **setup-wiki first** in every project. It creates the shared knowledge structure and agent instructions that the other development skills rely on to find durable context and work efficiently.

1. **setup-wiki** — create and configure the project wiki before using the rest of the workflow.
2. **discuss** — explore an idea or decision until its requirements and tradeoffs are understood.
3. **to-wiki** — turn the conclusions from a discussion into durable project knowledge.
4. **to-tasks** — break the agreed specification into bounded, linked implementation tasks.
5. **implement** — execute the task plan with branching, incremental commits, tests, and review.
6. **code-review** — independently check the resulting changes against both repository standards and the originating specification.
7. **handoff** — preserve the relevant conversation and workspace state when unfinished work must continue in another agent or session.

`handoff` can be used at any point in the workflow. The other skills are most effective in the order shown because each stage produces context for the next one.

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
6. Confirm skills.sh discovery before publishing:

   ```bash
   npx skills add . --list
   ```

See the [Agent Skills specification](https://agentskills.io/specification), [creator best practices](https://agentskills.io/skill-creation/best-practices), and [skills CLI documentation](https://github.com/vercel-labs/skills#readme).

## Acknowledgments

The **discuss**, **code-review**, **implement**, and **handoff** skills are customized adaptations of skills created by [Matt Pocock](https://github.com/mattpocock) in [mattpocock/skills](https://github.com/mattpocock/skills), which is licensed under the MIT License. Thanks to Matt for creating and sharing the originals.

## License

[MIT](LICENSE)
