<!-- develop:start -->
## Project records

- Read `docs/wiki` or `docs/backlog` only when it materially informs the request or the request changes those records. Before mutation, read that system's `maintenance.md`, nearest indexes, and applicable templates.
- `docs/wiki` owns accepted primary-branch state; `docs/backlog` owns desired deltas, proposal evidence, priority, claims, and execution history. Keep proposals and working notes out of the wiki.
- Read `docs/wiki/domains/ubiquitous-language.md` before domain-language changes. Change accepted terminology only with project-owner approval of the complete revision.
- Draft significant proposed decisions on their backlog records. Publish ADRs only when decisions are in force; supersede replaced ADRs in place, never delete them.
- Require project-owner approval to mark work `ready`, walk it back, change rank, cancel work, supersede an ADR, or change accepted wiki meaning unless an explicitly invoked workflow carries that authority.
- Run `node scripts/validate-project.mjs` after wiki or backlog mutations. Never create, inspect, or depend on `docs/tasks`.

## Development gateway

- `$develop` is optional and user-invoked only. Never activate it for an ordinary development request; without explicit invocation, follow normal repository instructions and do not load its internal procedures.
- When invoked, `$develop` chooses the lightest suitable procedure. Existing project records do not force a direct change through backlog governance.
- Render `$develop` in the running harness's syntax: Codex CLI `$develop`; Claude Code and OpenCode `/develop`; Kimi Code, Pi, and Oh-My-Pi `/skill:develop`.
<!-- develop:end -->
