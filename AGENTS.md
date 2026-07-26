# Agent Instructions

This repository contains agent skills under `skills/<category>/<skill-name>/`. Follow `CONTRIBUTING.md` for repository layout, symlinks, and the next-step handoff convention. The rules below govern creating and maintaining skills.

## Word economy

Every skill file is billed to the context window on every matched task, so treat words as budget.

- Use the fewest words that still make the instruction unambiguous. Precision first, brevity second: never drop a distinction, condition, exact command, flag, or path to save words.
- Cut what does not change behavior: motivation, background, rationale, restated context, hedging, transitions, courtesy phrasing, and anything the agent already does reliably. Measured skills in the wild carry only ~38% actionable rules; the rest is loadable-on-demand or dead weight.
- Prefer the compact form: imperative sentence over paragraph, table or list over prose, pointer (`path:line`) over pasted snippet, one exact command over a description of it.
- Use one term per concept throughout a skill. Alternating synonyms ("template" / "markup" / "HTML") costs words and creates ambiguity.
- Cutting words is an edit, not a cleanup: re-verify behavior on a real matched task afterward. Compression without evaluation is hopeful deletion — restore anything whose removal degrades the run.

## Creating a skill

- One skill fixes one repeatable failure or encodes one procedure of real domain expertise. Do not create a skill for behavior the agent already handles reliably without help.
- Keep `SKILL.md` under 500 lines and roughly 5,000 tokens: the minimum viable procedure — when to use it, the ordered steps, the critical decision branches, and the definition of done. Move bulky references, examples, schemas, and scripts into `references/`, `assets/`, or `scripts/`, loaded only on demand.
- Keep resource files exactly one level deep (`references/schema.md`, not `references/db/v1/schema.md`) and link them with relative forward-slash paths.
- Gate every resource load on a stated condition — "Read `references/api-errors.md` when the API returns a non-200" — never a bare "see `references/` for details".
- Follow a predictable body shape: short overview, when-to-use, numbered workflow, concrete examples.
- Write instructions as direct third-person imperative commands, in strict chronological order, with explicit decision branches.
- Give exact executable commands with their flags, not tool names. Tooling named in an instruction file gets used far more often than tooling left implicit.
- Provide concrete templates for anything the agent must produce repeatedly; agents pattern-match templates better than prose descriptions.
- Put deterministic, repeated mechanics in `scripts/` rather than prose the agent must re-derive each run.
- State boundaries in three tiers where a skill can act destructively or irreversibly: always do, ask first, never do.
- Close the rationalization loophole: for any step that must not be skipped, say so explicitly and state what to do when it cannot run. A missing guardrail on a required step is the most common defect in published skills.
- Write once for every harness. The same `SKILL.md` runs in Claude Code, Codex, Cursor, and other clients — do not fork client-specific wording; put client-only metadata in `agents/`.

## Frontmatter and activation

- `name` and `description` are required; `name` matches the directory and symlink, lowercase with hyphens, 64 characters maximum.
- The `description` is the only part competing for activation — the body is never read if it fails to match. State both the capability and the activation context in phrasing users actually use. Never pair a detailed body with a lazy one-line description.
- Keep the `description` discriminative rather than padded: generic trigger phrases make routing noisier, not broader. Add explicit negative triggers when a neighbouring skill would otherwise be shadowed ("not for X — use `<other-skill>`").

## Validating a skill

- Test discovery from metadata alone: given only `name` and `description`, is the skill selected for tasks it owns and skipped for tasks it does not?
- Test execution against at least three real historical tasks, not hypotheticals. Establish the baseline without the skill first, then confirm the skill improves the outcome.
- Test the failure edges: unsupported inputs, missing tools, and the branches where the procedure must stop and ask.
- Verify discovery after structural changes: `npx skills add . --list`.

## Maintaining a skill

- Delete any instruction the agent already follows reliably without it; unnecessary rules are context cost and maintenance debt.
- Balance specificity against brittleness: detailed enough to guide behavior reliably, not so detailed it breaks on minor environment or workflow changes.
- Grow skills by iteration — add a rule when a real run gets it wrong, not in anticipation. Do not let an agent generate a skill file wholesale.
- Evaluate changes against real matched tasks, not by reading the prose; a skill earns its place by measurably fixing its target failure.
- When a rule appears in more than one skill or asset (e.g., approval gates restated in scaffold files), update every restatement in the same change.
- Re-run a skill's tests when the systems, schemas, or commands it depends on change, not only when its text changes.
- Retire skills whose failure no longer occurs or whose procedure has been superseded. Deletion is version-controlled and reversible; a stale skill silently misroutes work.

## Maintaining this file

- `AGENTS.md` is a runtime instruction set loaded every session, not human documentation. Keep it under 150 lines; past that, cost rises without measurable gain.
- Only universal rules belong here. Task-specific or occasional guidance goes in the relevant skill.
- Do not add directory listings or code-style prose — agents discover structure themselves, and formatters and linters enforce style more cheaply and deterministically.
- Edit it deliberately by hand. A wrong line here degrades every session in the repository.

Sources: [GitHub: how to write a great AGENTS.md (2,500+ repos)](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/), [Phil Schmid: writing a good AGENTS.md](https://www.philschmid.de/writing-good-agents), [agentsmd.io best practices](https://agentsmd.io/agents-md-best-practices), [mgechev/skills-best-practices](https://github.com/mgechev/skills-best-practices), [Agent Skills best practices](https://agentskills.io/skill-creation/best-practices), [Atlan: agent skill best practices](https://atlan.com/know/ai-agent/ai-agent-skills/agent-skill-best-practices/), [Skill bloat is the new context tax](https://www.antoinebuteau.com/skill-bloat-is-the-new-context-tax/), [Firecrawl: agent skills explained](https://www.firecrawl.dev/blog/agent-skills).
