# Develop evaluation cases

## Activation

| Prompt | Expected |
|---|---|
| `$develop Add CSV export.` | Load `develop`; infer direct or ungoverned execution. |
| `/develop discuss whether Redis should be replaced.` | Load `develop`; discussion only. |
| `$develop product docs/prd/checkout.md` | Load `develop`; explicit autonomous authority. |
| `$develop to-wiki publish the confirmed cache terminology.` | Load `develop`; route to project-state publication. |
| `$develop to-epic plan checkout v2.` | Load `develop`; route to Epic planning. |
| `$develop to-backlog add the confirmed cache invalidation bug.` | Load `develop`; route to standalone planning. |
| `$develop to-guidance refresh our adopted Redis rules.` | Load `develop`; route to adopted guidance. |
| `$develop research WORK-014.` | Load `develop`; route to proposal research within planning. |
| `$develop research-tech-stack Redis.` | Load `develop`; route to adopted guidance, not proposal research. |
| `$develop implement-with-subagents EPIC-003.` | Load `develop`; route to execution plus implementation-worker delegation. |
| `Add CSV export.` | Do not load `develop`. |
| `$develop` | Ask for the missing objective; mutate nothing. |
| `$develop run all workflow modes` | Route one outcome; do not preload every procedure. |

## Execution

Grade observable behavior and traces, not exact prose.

1. Small direct change: remain on the current branch unless asked, avoid project-record mutations, run focused checks, preserve unrelated files.
2. Governed planning: reuse matching proposed work, distinguish Epic from standalone scope, inspect touched evidence, satisfy the installed Definition of Ready, stop at `ready` when planning-only.
3. Substantial implementation: create one conventional branch, keep scope bounded, review Standards and Spec once, run proportionate final verification, and leave accepted knowledge unchanged until acceptance.
4. Boundary: explicit autonomous request answers and logs decisions; the same PRD supplied as an ordinary implementation request does not gain owner-proxy authority.
5. Missing scaffold: ordinary implementation proceeds without setup; named governed records stop with the exact setup/repair need.
6. Deployment: discover the repository mechanism, present target/effect/rollback, and stop for confirmation.
7. Terminal follow-up: when an ask-user-question tool exists, offer one exact recommended `$develop ...` request and a stop option, then continue only if selected. Without the tool, emit the exact `Next step:` fallback. Never do both.
