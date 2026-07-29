# Routing

Read this file on every `develop` invocation. Select the first specific match; do not load every procedure speculatively.

## Help

When `help` is the first word after the explicit invocation, load `help.md` and stop before preflight. Treat `helpful`, embedded mentions of help, and other words as ordinary request text.

## Preflight

1. Resolve the requested outcome and stopping point. When no objective is supplied, ask and stop before repository inspection.
2. Resolve the repository root and read applicable root and nested instructions.
3. Inspect branch, status, recent history, and relevant manifests. Preserve unrelated work.
4. Detect `docs/wiki`, `docs/backlog`, and `scripts/validate-project.mjs`. Read records only when they materially inform the request; their presence never forces governed execution. Ask only when materially different interpretations remain.

## Precedence

1. **Explicit autonomy:** `product`, `unattended`, `autonomous`, or `owner-proxy` -> autonomous, plus every procedure the outcome requires. A PRD path or broad build request alone is not autonomous authority.
2. **Explicit operation:** resolve the aliases below, then compose only procedures required by an explicitly requested later outcome.
3. **Advisory intent:** challenge, decide, compare, explain, audit, or review without requested mutation -> discussion or review; stop after the requested answer. Treat close conversational variants of the explicit discussion phrases the same way.
4. **Accepted current state:** publish or correct already-current knowledge -> project state. Proposed target state never enters the wiki.
5. **Desired state:** explicit planning/tracking intent, a named active backlog record, or a coordinated outcome needing durable decomposition -> planning. Continue to execution only when the request includes build, implement, ship, or end-to-end delivery.
6. **Ordinary implementation:** use direct execution when the request is bounded and no governed record was selected. Use ungoverned implementation for substantial work without a scaffold. Do not create governance merely to execute code.

## Aliases

Canonical modes route directly: `discuss` to discussion, `plan` to planning, `setup` to setup, `knowledge` to project state, `guidance` to evidence and guidance, `implement` to execution, `review` to review, `release` to release, and `product` to autonomous delivery.

Legacy skill names are routing aliases, not separate skill invocations.

| Words or intent | Route |
|---|---|
| `discuss`, `let's discuss`, `let's talk about`, `talk through`, `think through`, `brainstorm`, `help me decide` | discussion |
| `to-epic`, `plan epic`, coordinated outcome, break into work items | Epic planning |
| `to-backlog`, add to backlog, create/refine a Story, Task, Bug, or standalone item | standalone planning |
| `to-wiki`, publish/document accepted knowledge, current-state fact, terminology, or decision already in force | project state |
| `to-guidance`, `guidance`, `research-tech-stack`, adopt/refresh technology or standards rules | evidence and guidance |
| `research`, research a named proposed `EPIC-NNN`/`WORK-NNN`, resolve proposal evidence | planning plus proposal research |
| `setup-project`, initialize/upgrade wiki or backlog governance | setup |
| `implement`, build, fix, ship | execution |
| `implement-with-subagents`, implement with workers/subagents, delegate implementation | execution plus implementation-worker delegation |
| `code-review`, review a fixed point, audit changes | review |
| `to-product`, product, unattended, autonomous, owner-proxy | autonomous |
| `bump-version`, prepare/release a version | release |

Disambiguate `research-tech-stack` as adopted guidance and `research <record>` as proposal evidence. A general factual research question remains advisory unless the request asks to persist evidence or guidance.

Legacy `to-epic`, `to-backlog`, `research <record>`, `to-wiki`, and `to-guidance` aliases preserve their former standing approval for the exact scoped governed transaction and its local commit. They never authorize implementation, remote publication, destructive knowledge changes, rule replacement, or unrelated records.

## Burden Rules

- Direct work may span multiple files when coherent; file count alone never forces backlog governance.
- Existing project records are context, not automatic ceremony. A selected `EPIC-NNN`/`WORK-NNN` uses governed execution; unrelated direct changes do not mutate records.
- Offer setup only when the user wants persistent governance or selected records require a missing/legacy scaffold. Never auto-scaffold ordinary work.
- Discussion, planning, setup, knowledge, guidance, and direct work stay on the current branch unless the user explicitly requests a branch.
- Substantial implementation, selected governed work, or explicit branch/PR intent uses one conventional acceptance branch. Tiny direct work stays on the current branch by default.
- Deploy always requires confirmation after presenting the repository-defined mechanism and target.
- Use one primary lane. Compose supporting procedures only for concrete needs discovered inside it.

## Continuation

- `discuss`, `plan`, `review`, `knowledge`, `guidance`, `setup`, and `release` stop when explicitly requested as the terminal outcome.
- `implement`, `build`, `fix`, and `ship` continue through code and proportionate verification. Governed scope continues through its selected acceptance lifecycle.
- `product` continues through all required outcomes until complete or technically parked.
- Preserve the governed lifecycle: discussion classifies each conclusion; accepted current knowledge may publish directly, while desired change enters Epic or standalone planning; planning resolves adopted guidance and proposal research before readiness; ready work enters local or requested worker execution; acceptance reconciles durable wiki/ADR state.
- Never emit chains of old skill commands. Any follow-up is one complete `$develop ...` request presented through the gateway handoff convention.

## Examples

| Request | Route |
|---|---|
| `$develop help` | canonical help and objective navigator; no repository preflight |
| `$develop help plan a checkout redesign` | canonical help plus one recommended invocation; do not execute it |
| `$develop Add CSV export` | direct or ungoverned implementation, based on scope |
| `$develop discuss whether to replace Redis` | advisory discussion |
| `$develop let's talk about replacing Redis` | advisory discussion |
| `$develop to-wiki publish the confirmed cache terminology` | project-state publication |
| `$develop to-epic plan checkout v2` | Epic planning |
| `$develop research WORK-014` | planning plus proposal research |
| `$develop implement-with-subagents EPIC-003` | governed execution with fresh implementation workers |
| `$develop plan checkout v2` | planning; Epic only if multiple independently valuable children serve one outcome |
| `$develop WORK-014` | governed implementation when ready/in-progress; otherwise refine a proposed record to ready and stop |
| `$develop update our React guidance` | guidance publication |
| `$develop review main` | review from `main...HEAD` |
| `$develop release minor` | release procedure |
| `$develop product docs/prd/checkout.md` | explicit autonomous run |
| `Add CSV export` | gateway does not activate |
