# Example project instructions

## Project state workflow

- Run `setup` once. Then use `source`, `language`, `discuss`, `plan`, `implement`, `review`, `document`, `ship`, and `measure`.
- Use `next` when the current workflow action is unclear.
- Read `docs/knowledge/index.md`, `docs/knowledge/ubiquitous-language.md`, and `docs/knowledge/sources/index.md` first.
- Use active canonical project terms across discussion, work, code, tests, and knowledge.
- Use `language` only after explicit user agreement to add, revise, or deprecate terms.
- Do not introduce other Domain-Driven Design patterns through this rule.
- Treat model memory as a search lead, not factual evidence.
- Verify material external claims against current official documentation.
- Save concise source notes under `docs/knowledge/sources/`.
- Re-open relevant official URLs once per work session before relying on them.
- Treat `docs/work/` as desired state, not current fact.
- Require a confirmed brief before moving an epic or story to `ready`.
- Keep delivery acceptance separate from the product success measure.
- Declare risk factors and record every required quality gate.
- Keep `main` clean for coordination and serial integration.
- Implement each ticket in `.woktrees/<key>/` on its own Conventional Branch.
- Do not implement epics or tickets with open blockers.
- Parallelize only independent tickets without likely overlap in non-generated files.
- Use Conventional Commits for ticket and merge commits.
- Merge green branches into `main`, then remove their clean worktrees and local branches.
- Assume Codex uses ChatGPT subscription access unless the user says otherwise.
- Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
- Assess session fit before code changes. Delegate bounded implementation when it will not fit.
- Keep workflow state, integration, and final verification with the coordinator.
- Never set a work item to `done` by editing JSON.
- Record separate Standards and Spec reviews with zero P0-P2 findings.
- Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
- Run `.project/bin/project-flow.mjs complete <KEY>` after all gates pass.
- Run `.project/bin/project-flow.mjs worktree-finish <KEY>` from `main` after completion.
- Treat ticket `done` as merged repository state, not a successful release.
- Use `ship` for approved release actions and verified live checks.
- Use `measure` after the brief's agreed observation window.
- Validate the workspace after workflow changes.

## Commands

- Run tests with `npm test`.
- Run type checks with `npm run typecheck`.
- Create a production build with `npm run build`.
- Use Node.js 24.15 or newer for `node:sqlite`.

Never use `any` in TypeScript.
