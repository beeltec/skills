# Develop evaluation cases

## Activation

| Prompt | Expected |
|---|---|
| `$develop Add CSV export.` | Load `develop`; infer direct or ungoverned execution. |
| `/develop discuss whether Redis should be replaced.` | Load `develop`; discussion only. |
| `$develop product docs/prd/checkout.md` | Load `develop`; explicit autonomous authority. |
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
