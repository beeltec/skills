# Develop evaluation cases

## Activation

| Prompt | Expected |
|---|---|
| `$develop help` | Load `develop`, then `help`; show canonical guidance and ask for the objective without repository inspection. |
| `/develop help plan a checkout redesign` | Load `develop`, then `help`; recommend one exact canonical invocation without executing it. |
| `$develop helpful error messages` | Load `develop`; treat `helpful` as ordinary request text, not help mode. |
| `$develop Add CSV export.` | Load `develop`; infer direct or ungoverned execution. |
| `/develop discuss whether Redis should be replaced.` | Load `develop`; discussion only. |
| `$develop plan checkout v2.` | Load `develop`; planning only. |
| `$develop setup` | Load `develop`; project setup only. |
| `$develop knowledge publish the confirmed cache terminology.` | Load `develop`; project-state publication. |
| `$develop guidance refresh our adopted Redis rules.` | Load `develop`; evidence and guidance publication. |
| `$develop implement WORK-014.` | Load `develop`; governed execution when actionable, otherwise planning to ready. |
| `$develop review main.` | Load `develop`; terminal fixed-point review. |
| `$develop release minor.` | Load `develop`; release preparation. |
| `$develop product docs/prd/checkout.md` | Load `develop`; explicit autonomous authority. |
| `$develop to-wiki publish the confirmed cache terminology.` | Load `develop`; route to project-state publication. |
| `$develop to-epic plan checkout v2.` | Load `develop`; route to Epic planning. |
| `$develop to-backlog add the confirmed cache invalidation bug.` | Load `develop`; route to standalone planning. |
| `$develop to-guidance refresh our adopted Redis rules.` | Load `develop`; route to adopted guidance. |
| `$develop research WORK-014.` | Load `develop`; route to proposal research within planning. |
| `$develop research-tech-stack Redis.` | Load `develop`; route to adopted guidance, not proposal research. |
| `$develop implement-with-subagents EPIC-003.` | Load `develop`; route to execution plus implementation-worker delegation. |
| `$develop implement EPIC-003.` | Load `develop`; route to governed execution and apply the context-fit gate without requiring special mode words. |
| `Add CSV export.` | Do not load `develop`. |
| `$develop` | Ask for the missing objective; mutate nothing. |
| `$develop run all workflow modes` | Route one outcome; do not preload every procedure. |

## Execution

Grade observable behavior and traces, not exact prose.

1. **Routing:** missing objectives stop before inspection; aliases preserve their exact authority; unknown words remain request text; only concrete needs load supporting procedures.
2. **Help:** route exact `help` before preflight, teach canonical modes only, inspect and mutate nothing, and return either the one navigator question or one exact unexecuted invocation. State autonomous authority without implying remote-publication or unrelated-scope authority.
3. **Discussion:** inspect discoverable facts; expose a materially relevant, adaptive discussion map; resolve each area deeply one numbered decision at a time; expand it when answers expose dependencies; challenge the result; account for every area in the closing ledger; keep proposals out of accepted knowledge; and end with one explicit handoff decision when follow-up exists.
4. **Planning:** reuse matching proposals, choose Epic only for coordinated outcomes, satisfy readiness, and stop at `ready` when planning-only. Authorized planning commits leave a clean tree; `research <record>` commits only evidence without changing status.
5. **Project state:** keep accepted facts in the wiki and desired deltas in the backlog. Exact `knowledge`/`to-wiki` and `guidance`/`to-guidance` transactions may commit locally; destructive knowledge or adopted-rule replacement still pauses.
6. **Setup:** install the scaffold on the current branch, preserve customized files, validate, and produce no byte changes on rerun. A missing or failing validator blocks completion.
7. **Evidence and guidance:** resolve installed and current versions from live evidence, separate requirements from recommendations, publish only named adopted subjects, and keep proposal evidence on its record.
8. **Execution:** keep bounded direct work on the current branch; branch substantial or governed work; preserve unrelated changes; apply the context-fit gate before coding and after every delta; run focused checks and one delegated acceptance review. Missing governance blocks only selected governed work.
9. **Deployment:** discover the repository mechanism, present target, effect, and rollback, then stop for confirmation.
10. **Review:** resolve a non-empty fixed-point diff, use fresh reviewers distinct from implementers, report separate Standards and Spec findings, never fix during terminal review, and run no second review after in-run remediation.
11. **Delegation:** attempt every formal review through sub-agents; otherwise fan out only independent read-only units; use fresh serial implementation workers when the remaining acceptance unit fails the context-fit gate; keep decisions, records, review synthesis, merge, and acceptance with the manager; follow each unavailable-worker branch.
12. **Release:** update every authoritative version and the changelog, run the complete release matrix, commit only release paths, and keep publish, tag, and deploy separately confirmed.
13. **Autonomous:** require explicit autonomous intent and a resolvable source, log proxy decisions and assumptions, stay inside the PRD, bound retries, park only after the third addressed failure, and never push or publish without separate authority.
14. **Handoff:** offer one exact recommended `$develop ...` request plus stop when a question tool exists; otherwise emit one `Next step:` line. Never do both.
15. **Epic validation:** index active Epics as `- [EPIC-NNN: <title>](EPIC-NNN-short-title/) - <outcome>.`; reject malformed, missing, duplicate, record-file, and orphaned entries.

## Discussion Execution

Run each case in a clean context. Grade the map, trace, and closing ledger; keyword mention alone does not pass.

| Historical shape | Prompt | Required evidence |
|---|---|---|
| Greenfield product | `$develop discuss a WordPress product that uses AI to tag media images.` | Infers user workflow, WordPress integration, model/provider and cost, media metadata, privacy, failure handling, testing, local development, operations, and accessibility; adds dependencies discovered from answers. |
| Existing feature | `$develop discuss adding instructor management to an existing Pilates timetable app.` | Inspects current authentication, roles, schema, routes, UI, tests, and development setup; explores authorization, lifecycle, migration, concurrent edits, auditability, and deployment compatibility without re-asking discovered facts. |
| Narrow change | `$develop discuss changing a WordPress timeline from date order to editorial order.` | Infers query semantics, editor workflow, existing content migration, fallback behavior, regression coverage, local/staging verification, and rollback; excludes unrelated areas with reasons instead of expanding scope mechanically. |

For every case, fail when the agent hides the map, treats the baseline as a fixed questionnaire, asks several decisions together, stops after the stated concern, omits the challenge pass, or closes with an `open` area.

## Setup Execution

| Historical shape | Expected |
|---|---|
| Legacy wiki-only brownfield with existing terms plus approved additions or revisions | Upgrade the scaffold, apply only approved term transactions, preserve every unmentioned term, validate, and require a byte-idempotent installer rerun. |

## Context-Fit Execution

Run each case in a clean context. Inspect delegation decisions and worker briefs.

| Historical shape | Expected |
|---|---|
| One bounded `WORK-NNN` in a familiar subsystem with focused checks | Implement locally when the complete acceptance unit fits with ample context. |
| Tiny Epic with two tightly coupled children and one focused verification path | May implement locally when the complete Epic passes the gate. |
| Multi-child Epic spanning schema, API, UI, and browser acceptance | Use one fresh serial implementation worker per child by default; keep Epic acceptance with the manager. |
| Local item expands into multiple subsystems after its first coherent delta | Checkpoint that delta, then delegate the remainder instead of relying on compaction. |
| Context-risking unit with no worker capacity | Execute only a bounded local delta that independently passes the gate; otherwise stop or park it. |

## Review Delegation Execution

Run each case in a clean context. Inspect reviewer identity, dispatch attempts, retry behavior, findings, and fallback reporting.

| Historical shape | Expected |
|---|---|
| Bounded change implemented by the manager | Dispatch one fresh combined read-only reviewer; the manager synthesizes findings and inspects remediation. |
| Change implemented by one or more workers | Dispatch a reviewer distinct from every implementation worker. |
| Security/authentication, destructive migration or credible data-loss risk, or changed public API compatibility | Dispatch independent Standards and Spec reviewers. |
| Incomplete reviewer return | Attempt one focused retry through the same reviewer; fall back only if that dispatch cannot obtain capacity, not merely because either return is incomplete. |
| Completed reviewer dispatch returns failure or remains incomplete after retry | Block review; never substitute local review while dispatch capacity was obtained. |
| Harness without sub-agent support | Review locally and report both the fallback and lost independence. |
| Initial or retry dispatch cannot obtain capacity | Record the dispatch attempt, review locally, and report both the fallback and lost independence. |
