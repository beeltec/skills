<!-- setup-project:start -->
## Project state and backlog

- Before starting work, read `docs/wiki/index.md`, `docs/backlog/index.md`, and each system's `maintenance.md`. Then read the nearest relevant wiki and backlog indexes.
- Before domain-relevant work, read `docs/wiki/domains/ubiquitous-language.md` and use its agreed terms consistently in conversations, specifications, documentation, and code.
- When a new, ambiguous, or conflicting domain term materially affects the work, resolve it with the user as project owner. Update the ubiquitous language only after the user explicitly approves the complete revised terminology set.
- Treat `docs/wiki` as accepted current state on the primary branch. Preserve existing facts, keep one canonical owner per topic, and link instead of duplicating rules.
- Treat `docs/backlog` as desired deltas and execution state. Keep proposals out of the wiki until their completed outcomes are accepted.
- Keep proposal-specific technical sources, version findings, recommendations, deviations, and uncertainty with the backlog record. Unresolved version-specific or security-sensitive research prevents readiness.
- Do not move work to `ready`, reorder global rank, cancel work, or change accepted wiki knowledge without explicit project-owner approval. Record approvals where backlog maintenance requires them.
- Keep working notes, temporary probes, and session-only state outside both governed systems.
- Target at most 350 lines per concept page and split before then when sections have different owners, audiences, lifecycles, source sets, or concept types. Never exceed 500 lines in a concept page.
- After changing the wiki, update its nearest index and `docs/wiki/log.md`. After changing the backlog, update its indexes and global rank as applicable.
- Run `node scripts/validate-project.mjs` after every wiki or backlog change and before handoff.
<!-- setup-project:end -->
