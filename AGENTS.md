# Agent Instructions

This repository contains agent skills under `skills/<category>/<skill-name>/`. Follow `CONTRIBUTING.md` for repository layout, symlinks, and the next-step handoff convention. The rules below govern creating and maintaining skills.

## Creating a skill

- One skill fixes one repeatable failure or encodes one procedure of real domain expertise. Do not create a skill for behavior the agent already handles reliably without help.
- Keep `SKILL.md` under 500 lines and roughly 5,000 tokens: the minimum viable procedure — when to use it, the ordered steps, the critical decision branches, and the definition of done. Move bulky references, examples, schemas, and scripts into `references/`, `assets/`, or `scripts/`, loaded only on demand.
- Keep resource files exactly one level deep (`references/schema.md`, not `references/db/v1/schema.md`) and link them with relative forward-slash paths.
- Follow a predictable body shape: short overview, when-to-use, numbered workflow, concrete examples.
- Write instructions as direct third-person imperative commands, in strict chronological order, with explicit decision branches.
- Provide concrete templates for anything the agent must produce repeatedly; agents pattern-match templates better than prose descriptions.

## Frontmatter and activation

- `name` and `description` are required; `name` matches the directory and symlink, lowercase with hyphens.
- The `description` is the only part competing for activation — the body is never read if it fails to match. State both the capability and the activation context in phrasing users actually use. Never pair a detailed body with a lazy one-line description.

## Maintaining a skill

- Delete any instruction the agent already follows reliably without it; unnecessary rules are context cost and maintenance debt.
- Balance specificity against brittleness: detailed enough to guide behavior reliably, not so detailed it breaks on minor environment or workflow changes.
- Evaluate changes against real matched tasks, not by reading the prose; a skill earns its place by measurably fixing its target failure.
- When a rule appears in more than one skill or asset (e.g., approval gates restated in scaffold files), update every restatement in the same change.
- Verify discovery after structural changes: `npx skills add . --list`.

Sources: [Agent Skills best practices](https://agentskills.io/skill-creation/best-practices), [mgechev/skills-best-practices](https://github.com/mgechev/skills-best-practices), [Arize: effective agent skills](https://arize.com/blog/how-to-write-effective-ai-agent-skills/), [DigitalOcean: implementing agent skills](https://www.digitalocean.com/community/tutorials/how-to-implement-agent-skills), [SKILL.md anatomy study (arXiv)](https://arxiv.org/pdf/2607.01456).
