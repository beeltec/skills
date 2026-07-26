<!-- setup-project:start -->
## Project state and backlog

- Before work, read `docs/wiki/index.md` and `docs/backlog/index.md`. Before changing either system, read its `maintenance.md` and nearest relevant indexes.
- `docs/wiki` owns accepted primary-branch state; `docs/backlog` owns desired deltas, proposal evidence, and execution history. Keep proposals and working notes out of the wiki.
- Before domain work, read and follow `docs/wiki/domains/ubiquitous-language.md`. Change it only with project-owner approval of the complete revision.
- Use `$backlog` for backlog mutations and `$wiki` for all accepted-knowledge reads and wiki lifecycle operations. Follow the selected skill and project maintenance rules.
- Record architecturally significant decisions as ADRs under `docs/wiki/architecture/decisions/`. Draft a proposed decision on its backlog record (`decisions:` and `## Decisions`); publish it as an ADR only at primary-branch acceptance. A replaced ADR is superseded in place, never deleted.
- Require project-owner approval to mark work `ready`, walk work back from `ready` to `proposed`, change rank, cancel work, supersede an ADR, or change accepted wiki state.
- Run `node scripts/validate-project.mjs` after wiki or backlog changes and before handoff.
<!-- setup-project:end -->
