# Example project instructions

## Project state workflow

- Run `setup` once. Then use `discuss`, `plan`, `implement`, `review`, and `document`.
- Read `docs/knowledge/index.md` before implementation.
- Treat `docs/work/` as desired state, not current fact.
- Assume Codex uses ChatGPT subscription access unless the user says otherwise.
- Use runtime context values. Otherwise, use 256,000 tokens for GPT-5.6.
- Assess session fit before code changes. Delegate bounded implementation when it will not fit.
- Keep workflow state, integration, and final verification with the coordinator.
- Never set a work item to `done` by editing JSON.
- Record separate Standards and Spec reviews with zero P0-P2 findings.
- Loop `review` and `implement` until both passes have no P0, P1, or P2 findings.
- Run `.project/bin/project-flow.mjs complete <KEY>` after all gates pass.
- Validate the workspace after workflow changes.

## Commands

- Run tests with `npm test`.
- Run type checks with `npm run typecheck`.
- Create a production build with `npm run build`.
- Use Node.js 24.15 or newer for `node:sqlite`.

Never use `any` in TypeScript.
