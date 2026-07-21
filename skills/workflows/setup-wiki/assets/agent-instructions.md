<!-- setup-wiki:start -->
## Project knowledge

- Before starting work, read `docs/wiki/index.md` and then the nearest directory index for the task.
- Before domain-relevant work, read `docs/wiki/domains/ubiquitous-language.md` and use its agreed terms consistently in conversations, specifications, documentation, and code.
- When a new, ambiguous, or conflicting domain term materially affects the work, resolve it with the user as project owner. Update the ubiquitous language only after the user explicitly approves the complete revised terminology set.
- Treat the wiki as durable project knowledge: preserve existing facts, keep one canonical owner per topic, and link instead of duplicating rules.
- Keep working notes, task status, temporary probes, and planned changes outside `docs/wiki`.
- Target at most 350 lines per concept page and split before then when sections have different owners, audiences, lifecycles, source sets, or concept types. Never exceed 500 lines in a concept page.
- After changing the wiki, update its nearest index and `docs/wiki/log.md`, then run `node scripts/validate-wiki.mjs` or the repository's `wiki:check` command.
<!-- setup-wiki:end -->
