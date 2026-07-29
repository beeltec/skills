# Routing

Read this file on every `develop` invocation. Select the first specific match; do not load every procedure speculatively.

## Preflight

1. Resolve the requested outcome and stopping point. When no objective is supplied, ask and stop before repository inspection.
2. Resolve the repository root and read applicable root and nested instructions.
3. Inspect branch, status, recent history, and relevant manifests. Preserve unrelated work.
4. Detect `docs/wiki`, `docs/backlog`, and `scripts/validate-project.mjs`. Read records only when they materially inform the request; their presence never forces governed execution. Ask only when materially different interpretations remain.

## Precedence

1. **Explicit autonomy:** `product`, `unattended`, `autonomous`, or `owner-proxy` -> autonomous, plus every procedure the outcome requires. A PRD path or broad build request alone is not autonomous authority.
2. **Explicit operation:** `discuss`, `plan`, `setup`, `knowledge`, `guidance`, `implement`, `review`, `release`, deploy, branch, PR/MR, or a named record -> matching procedure.
3. **Advisory intent:** challenge, decide, compare, explain, audit, or review without requested mutation -> discussion or review; stop after the requested answer.
4. **Accepted current state:** publish or correct already-current knowledge -> project state. Proposed target state never enters the wiki.
5. **Desired state:** explicit planning/tracking intent, a named active backlog record, or a coordinated outcome needing durable decomposition -> planning. Continue to execution only when the request includes build, implement, ship, or end-to-end delivery.
6. **Ordinary implementation:** use direct execution when the request is bounded and no governed record was selected. Use ungoverned implementation for substantial work without a scaffold. Do not create governance merely to execute code.

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
- Never emit chains of old skill commands. Any follow-up is `$develop <complete request>`.

## Examples

| Request | Route |
|---|---|
| `$develop Add CSV export` | direct or ungoverned implementation, based on scope |
| `$develop discuss whether to replace Redis` | advisory discussion |
| `$develop plan checkout v2` | planning; Epic only if multiple independently valuable children serve one outcome |
| `$develop WORK-014` | governed implementation when ready/in-progress; otherwise refine a proposed record to ready and stop |
| `$develop update our React guidance` | guidance publication |
| `$develop review main` | review from `main...HEAD` |
| `$develop release minor` | release procedure |
| `$develop product docs/prd/checkout.md` | explicit autonomous run |
| `Add CSV export` | gateway does not activate |
