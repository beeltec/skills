# Agent instructions

<!-- setup-project:start -->
## Project state and backlog

- Before work, read `docs/wiki/index.md` and `docs/backlog/index.md`. Before changing either system, read its `maintenance.md` and nearest relevant indexes.
- `docs/wiki` owns accepted primary-branch state; `docs/backlog` owns desired deltas, proposal evidence, and execution history. Keep proposals and working notes out of the wiki.
- Before domain work, read and follow `docs/wiki/domains/ubiquitous-language.md`. Change it only with project-owner approval of the complete revision.
- Use `$backlog` for backlog mutations and `$wiki` for all accepted-knowledge reads and wiki lifecycle operations. Follow the selected skill and project maintenance rules.
- Record architecturally significant decisions as ADRs under `docs/wiki/architecture/decisions/`. Draft a proposed decision on its backlog record (`decisions:` and `## Decisions`); publish it as an ADR only at primary-branch acceptance. A replaced ADR is superseded in place, never deleted.
- Require project-owner approval to mark work `ready`, walk work back from `ready` to `proposed`, change rank, cancel work, supersede an ADR, or change accepted wiki state.
- Run `node scripts/validate-project.mjs` after wiki or backlog changes and before handoff.
- Stay on the current branch. Only `$implement` and `$implement-with-subagents` create branches, via `$create-conventional-branch`; never create, switch, merge, or delete branches from any other workflow.
- Never create, inspect, or depend on `docs/tasks`.

## Verification artifacts

- Any executable created only to verify the change is temporary, regardless of extension: use the system temporary directory when writable; otherwise delete the workspace fallback before final verification and handoff. Keep it only when it protects an observable contract, lives in a conventional test or test-helper location, and runs through an established or clearly documented test command; a new obscure alias alone does not qualify. With no test structure, add no permanent test infrastructure unless approved scope requires automated coverage.

## Work routing

Never perform these intents ad hoc. Invoke the skill that owns each, and follow it:

| Intent | Skill |
|---|---|
| Shape, challenge, or decide an idea | `$discuss` |
| Create or change a backlog record | `$backlog` |
| Plan a coordinated outcome to a ready Epic | `$to-epic` |
| Plan standalone items to ready | `$to-backlog` |
| Resolve technical uncertainty on proposed work | `$research` |
| Adopt technology or standards rules | `$to-guidance` |
| Build ready work | `$implement` or `$implement-with-subagents` |
| Review a diff | `$code-review` |
| Change accepted knowledge | `$to-wiki` or `$wiki` |
| Ship a whole PRD unattended | `$to-product` |

`$name` is the harness-neutral command form. Render every command offered to the user in the running harness's syntax: Codex CLI `$name`; Claude Code and OpenCode `/name`; Kimi Code, Pi, and Oh-My-Pi `/skill:name`.

There is no direct-implementation route: execution always passes through backlog readiness. When no skill covers the intent, say so before acting.

Every workflow skill ends its report with `Next step:` — one copy-pasteable command with real arguments as the report's last line, or a numbered list in run order when several apply. Recommend only; never invoke it.
<!-- setup-project:end -->
