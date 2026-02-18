# Skills

A collection of reusable AI agent skills for [Claude Code](https://code.claude.com/) and other agents that support the [Agent Skills](https://agentskills.io) open standard.

Browse all available skills at [skills.sh](https://skills.sh).

## Install

```bash
npx skills add beeltec/skills
```

This installs all skills from this repository into your agent's skills directory. To install a specific skill:

```bash
npx skills add beeltec/skills -s glab
npx skills add beeltec/skills -s elementor-content
```

Install globally (available across all projects) with the `-g` flag:

```bash
npx skills add beeltec/skills -g
```

## Available Skills

| Skill | Description |
|-------|-------------|
| **glab** | GitLab CLI — create and manage merge requests, issues, CI/CD pipelines, releases, repositories, and more using `glab` |
| **elementor-content** | Elementor page builder — create, read, update, and delete Elementor content by editing exported JSON templates or WordPress database records via WP-CLI |

## Manual Installation

If you prefer not to use the CLI, clone the repo and copy the skill directories:

```bash
# Project-scoped (this project only)
cp -r .agents/skills/glab .claude/skills/glab

# User-scoped (all projects)
cp -r .agents/skills/glab ~/.claude/skills/glab
```

## Skill Structure

Each skill follows the Agent Skills standard:

```
.agents/skills/<skill-name>/
  SKILL.md              # Main instructions (required)
  references/           # Detailed reference guides (optional)
    topic-a.md
    topic-b.md
```

`SKILL.md` contains YAML frontmatter (`name`, `description`) and markdown instructions. Reference files hold detailed documentation that Claude loads on demand to keep the main skill focused.

## License

[MIT](LICENSE)
