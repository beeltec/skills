---
name: implement
description: Execute one ready backlog work item or Epic through claim, implementation, review, acceptance, and archival. Use with an explicit WORK-NNN, EPIC-NNN, backlog path, or unambiguous conversational selection.
---

# Implement

Execute approved work from a `setup-project` backlog without changing its desired scope or priority. Accept one explicit `WORK-NNN`, `EPIC-NNN`, record path, or exactly one selection already established by the conversation. A work-item invocation handles only that item; an Epic invocation handles every required child, one at a time, through the same per-item gates.

Use one conventional work branch per invocation — for an Epic, reuse it across per-item integrations; never a branch per child.

## Authority And Approval

The item's outcome, acceptance criteria, exclusions, and approved relationships define implementation scope. Its parent Epic supplies coordination context but never expands child scope. The accepted wiki and repository instructions define the current-state baseline and engineering constraints.

The invocation is a gate-backed execution workflow: it authorizes temporary claims, checklist evidence, and normal execution status transitions for the selected approved scope — not changes to outcome or acceptance wording, rank, parentage, relationships, cancellation, child scope, or accepted wiki knowledge. Preserve proposed cancellation and out-of-scope decisions in the backlog and stop for owner approval. Obtain explicit approval for the exact durable wiki update unless already explicitly approved.

Under an active autonomous run, `$to-product`'s autonomous contract supplies every owner approval this workflow requires — the durable wiki update, a significant decision first made during implementation, primary-branch acceptance, and Epic closure. It never supplies approval for cancellation or for scope the record does not carry: file that as a `proposed` record and continue.

## Authority Packet Freshness

An authority — record, index, wiki concept, ADR, guidance page, or source file — read completely during this invocation stays read; re-reading it is waste. A skill invoked from here accepts the packet paths and roles this invocation already resolved instead of rediscovering them. Freshness is per-invocation: never inherit it across invocations, and never assume a subagent holds it.

An already-read authority is void and must be re-read when any of these holds:

- context was summarized or compacted since the read;
- the branch changed, or a merge landed;
- a commit not made by this invocation touched the path;
- any transaction mutated the record;
- the claim expired or was renewed;
- `node scripts/validate-project.mjs` failed since the read;
- the fixed point changed.

Before every selection and terminal transition, probe `git log -- docs/backlog` since the last read: re-read global rank, claims, statuses, and indexes only when commits this invocation did not make touched them. When freshness is uncertain, re-read.

**Verification freshness:** a passing full suite validates the tested contents of code-affecting inputs: source, tests, dependency manifests/lockfiles, runtime/build configuration, generated runtime artifacts, and relevant environment configuration. Record the tested commit and affected-path classification. Reuse the result only when those inputs still match that state; backlog, wiki, and non-executable documentation may differ. After merge, compare resulting code-affecting inputs with the tested branch state, not whole-tree hashes. Rerun when any differs or classification is uncertain.

## Preflight

Complete before creating or switching a branch or mutating a claim:

1. Resolve the repository root. Read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and contributing or coding standards.
2. Require the `$setup-project` scaffold: `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/domains/ubiquitous-language.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, all four backlog type templates, and `scripts/validate-project.mjs`. If any is missing, stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`; on an invalid baseline, report and stop unless the user explicitly asks to repair that state.
4. Inspect the current branch, primary branch, remotes, staged/unstaged changes, and recent history. Preserve unrelated changes; never stage them.
5. Resolve the selection: explicit ID or path wins; otherwise only a single unambiguous conversational selection. List candidates and ask when absent or ambiguous.
6. Read completely the selected records, the parent Epic and every child in Epic scope, the global rank, active indexes, all related records, and all records needed to calculate inward blockers. Read an archive index only at the archival step that writes it.
7. Read backlog maintenance, applicable type templates, every linked wiki concept and nearest index, wiki maintenance, relevant engineering and architecture guidance, the ADR index at `docs/wiki/architecture/decisions/index.md`, the record's drafted `## Decisions`, proposal research and local evidence, and the affected repository code and tests. Open an individual in-force ADR only when its subject intersects the item's delta or drafted decisions.
8. Read every applicable guidance page under `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` — one per technology and cross-cutting standard this item's delta touches, resolved from its own directory indexes, not the whole set. Rule strength follows `docs/wiki/maintenance.md § Adopted guidance`; a listed `Known gap` is existing non-compliance to work around, never licence to add more. A touched subject with no page or a stale one is a reportable gap: implement against the item's research and repository evidence and name it for the post-acceptance `$guidance` offer and the final report — never block on it, and never write guidance into `docs/wiki` here.
9. Determine the invocation's primary-branch fixed point; retain it for review and integration evidence. For an Epic it is also the immutable **epic fixed point** for the final Epic review; no per-item fixed point replaces it.

Reject before branch creation:

- an explicit item that is `proposed`, `done`, or `cancelled`;
- an item that is not `ready`, unless `in-progress` with a live claim belonging to this exact executor/session and branch and the invocation is resuming it;
- a ready item missing any Definition of Ready field, objective criterion, approved execution approach, verification command, rank entry, resolved parent/relationship, completed/not-needed research, or resolved `decisions`;
- a ready item whose `## Subtasks` are too coarse to execute as checkable increments — any subtask missing its scope or its verification — unless the section is exactly `No subtasks.`;
- a ready item with an unresolved inward `blocks` relationship;
- a malformed record, invalid project, expired claim, or claim/status mismatch;
- any live claim owned by another executor — never overwrite it;
- an Epic that is not `ready` (unless resuming that `in-progress` Epic) or that has no approved children;
- Epic scope containing a required nonterminal child claimed by another executor.

Report every blocking record, conflicting claim and expiry, malformed field, or owner decision. Do not use a separate blocked status; do not create a branch after rejection.

## Epic Mode

When the invocation resolved to an `EPIC-NNN`, read [references/epic-mode.md](references/epic-mode.md) after preflight and before selecting the first child — it owns child selection order and Epic completion and cleanup. A `WORK-NNN` invocation never reads it.

## Branch And Claim

After preflight passes:

1. If resuming, verify the current conventional branch exactly matches the item's live claim and recorded branch/session reference.
2. Otherwise invoke `$create-conventional-branch` once, named for the selected item or Epic. No additional branch for an Epic child.
3. Record a claim identifying the human or agent, unique session, and exact branch. Set a future ISO 8601 `claim_expires` covering the next gate and record the same branch/session reference in `## Execution` without changing approved scope.
4. In one backlog transaction, move the item `ready -> in-progress`; when the first Epic child starts, also move the ready Epic to `in-progress`.
5. Run `node scripts/validate-project.mjs`, inspect all diffs, stage only affected backlog paths, verify the staged list and diff, and create a concise Conventional Commit for the claim transaction.

Renew the claim in a separately validated transaction before expiry; never continue on an expired lease. If work must stop unfinished, return it to `ready`, clear both claim fields, validate, and commit the release. Never release another executor's claim.

## Per-Item Execution

1. Capture the primary branch's current commit as this item's fixed point, leaving the epic fixed point unchanged. After a preceding Epic child's integration, re-read the paths in that merge commit's diff plus global rank, claims, statuses, and indexes; the rest of the packet stays read under Authority Packet Freshness.
2. Follow the approved approach and `## Subtasks`. Implement and smoke-test the real changed path first; for a bug, capture a failing-before reproduction by the cheapest reliable method. Commit coherent, independently green increments.
3. Reuse existing coverage. Unless the owner-approved criterion requires a specific artifact, add one test only when a new observable contract lacks durable proof: prefer acceptance-critical E2E for user-visible behavior, integration/contract coverage for a boundary, and unit coverage only for isolated edges or invariants impractical to prove higher. Never duplicate layers, chase coverage targets, require feature TDD, or add excessive E2E.
4. Run focused tests, typechecks, linters, and listed verification during implementation. Defer the full applicable suite until after review.
5. After implementation and focused checks pass, check all supported subtasks and record their concrete evidence in one validated backlog transaction, staging only backlog paths.
6. Pin a dependency or toolchain version not already resolved in `## Research` only from a live registry call — `npm view <pkg> version`, the crates.io API, `gh release list`, or the ecosystem equivalent — never from memory. Record source and date in `## Execution`.
7. Never broaden scope to fix an adjacent problem; record it and ask for an approved backlog transaction when it blocks the outcome.
8. Inspect the worktree before every commit. Stage explicit intended paths only, verify `git diff --cached`, and use concise Conventional Commits. Never include unrelated changes, secrets, caches, or working notes.

## Review And Final Suite

Classify risk with `$code-review`'s triggers. A standalone item always receives end-of-item review: one combined Spec+Standards reviewer when low risk, two parallel reviewers when high risk. An Epic child receives item review only when high risk; otherwise record the policy skip. Epic closure owns the composed review.

After implementation and focused checks are green, invoke `$code-review` when required with the item, fixed point, and resolved packet. Address every actionable finding in scope and rerun affected focused checks. Invoke delta review only when remediation changes behavior, a public contract, architecture, security, data handling, standards compliance, or reviewed scope; otherwise inspect the remediation diff directly. Repeat required review until it passes.

Then run the full applicable suite once on the final code state. Any later code-affecting change invalidates that result and triggers the applicable review rule plus a new final suite run. An unresolved finding, unavailable authority, scope decision, or failed check blocks completion; keep the item `in-progress` with a renewed claim or release it safely.

## Wiki Reconciliation And Validation

Before primary-branch integration, compare the reviewed implementation with every linked wiki concept and research conclusion:

- No durable knowledge changed → record `wiki reconciliation: no update required` with the reason in `## Execution`.
- Knowledge will change after acceptance → invoke `$wiki` in proposal-only mode to inspect evidence and draft the exact canonical transaction. Approval of the item's delta and drafted decisions is standing approval for a transaction stating only that same knowledge as now-accepted; record in `## Execution` that it applied. Stop for explicit owner approval when the transaction asserts durable knowledge the record never carried, changes a concept outside `wiki_refs`, or contradicts an in-force ADR. Summarize only durable guidance in the owning concepts; keep temporary detail and proposal-specific history in the backlog.
- The item's `## Decisions` drafts become ADRs in that same transaction. Include for each: its full ADR body, and the `ADR-NNN` it would supersede where the decision replaces one already in force. Do not allocate the ADR ID yet — allocation happens at publication.
- Apply the ADR significance test to what was actually built. A significant decision first made during implementation and absent from `## Decisions` requires an approved backlog transaction adding the draft before completion; never publish a decision the record never carried.
- Never edit `docs/wiki` on the work branch to describe the implementation. Record the exact approved transaction in `## Execution` for application after primary-branch acceptance.
- Apply the review rule after any later implementation change; preserve the passing suite only under Verification Freshness.

When reconciliation passes, verify every acceptance criterion with concrete evidence, check only supported criteria and subtasks, run `node scripts/validate-project.mjs`, cite the fresh review outcome or policy skip and final-suite evidence, and commit completion evidence while leaving `status: in-progress` and the live claim intact. No item may be `done` on the work branch.

## Primary-Branch Acceptance And Completion

Integration is a per-work-item gate, including during an Epic invocation:

1. Confirm: live claim, all criteria and subtasks checked, required review passed or policy-skipped, reconciliation unnecessary or exactly approved, validator and final suite pass, no unintended staged changes.
2. Merge the work branch into the primary branch with a merge commit — never squash or fast-forward. Resolve no unexpected conflict by changing scope; stop safely instead.
3. On primary, rerun `node scripts/validate-project.mjs`. Reuse the final-suite result when the merge preserves Verification Freshness; otherwise rerun the suite. Record the evidence and merge commit establishing primary-branch acceptance.
4. If durable knowledge changed, invoke `$wiki` on the primary branch: re-verify the approved wording describes the now-accepted state, apply that exact semantic transaction with required indexes, links, metadata, and log changes, validate, and commit only its wiki paths. Publish each approved drafted decision as an ADR here — `$wiki` allocates the next unused `ADR-NNN` at this point and supersedes any replaced ADR in place, in both directions. If the evidence requires different meaning, stop for revised owner approval. For each subject step 8 reported with no guidance page or a stale one, offer `$guidance` here — this is the only point in this workflow where guidance may be published, and the implemented code is the evidence the page needs. Under an autonomous run the contract's auto-approval means run `$guidance` for each such subject; reporting the gap without running it violates this gate. Outside a run, put the offer to the owner and record the answer — never answer it silently.
5. Apply one validated backlog completion transaction: clear `claim` and `claim_expires`, set `done`, replace `decisions: draft` with the ADR IDs just published (or `none` where the significance test recorded no qualifying decision), remove from global rank, preserve all verified evidence. Move a standalone item to `archive/standalone/` and update indexes immediately; leave a done Epic child in its active Epic directory until the Epic closes.
6. Stage only the completion transaction's backlog paths, validate the staged diff, and create a concise Conventional Commit on primary. Never mark done before steps 1-4 succeed.
7. For unfinished Epic scope, switch back to the same work branch and merge primary into it so completion, rank, dependency, and wiki state are present. Validate, then select the next child. No new work branch.

If integration is unauthorized, primary is unavailable, merge or post-merge checks fail, or acceptance is declined, stop before `done`; report the blocker and preserve or safely release the claim. Never claim primary-branch acceptance from a review, PR, unmerged branch, or passing branch-local tests alone.

## Completion And Report

Remain on primary and delete the local work branch only after every item is integrated, its completion committed, the Epic archive committed when applicable, all checks green, and no authorized scope remains; otherwise retain the branch and report the exact blocker. Report selected scope, claims, changed paths, commits and merge commits, review mode and result or policy skip, suite evidence and freshness basis, acceptance, reconciliation including published and superseded ADRs, validation, archive destinations, guidance gaps, and remaining concerns.

End the report with `Next step:` — one copy-pasteable command: blocked → the exact command that resumes this scope after the blocker; otherwise `$implement` with the next highest-ranked actionable `WORK-NNN`, or `$discuss` naming the next open outcome when no ready work remains.
