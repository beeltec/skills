---
name: implement
description: Execute one ready backlog work item or Epic through claim, implementation, review, acceptance, and archival. Use with an explicit WORK-NNN, EPIC-NNN, backlog path, or unambiguous conversational selection.
---

# Implement

Execute approved work from a `setup-project` backlog without changing scope or priority. A standalone `WORK-NNN` is one acceptance unit. An `EPIC-NNN` and all approved children are one outcome acceptance unit: children remain provisional until the composed Epic is reviewed, verified, merged, reconciled, completed, and archived.

Use one conventional branch per acceptance unit. Epic children never integrate to primary, publish wiki state, or become `done` independently. An internal provisional-child or provisional-standalone packet from `$implement-with-subagents` may execute one isolated delta. Neither performs review, governance, integration, or acceptance gates.

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
2. Require the `$setup-project` scaffold and its current Epic acceptance-unit lifecycle: one start transaction, provisional children, batched checklist evidence, and atomic final acceptance/archive. If files are missing or project-local maintenance still requires per-child acceptance/evidence commits, stop and direct `$setup-project` to upgrade and reconcile it.
3. Run `node scripts/validate-project.mjs`; on an invalid baseline, report and stop unless the user explicitly asks to repair that state.
4. Inspect the current branch, primary branch, remotes, staged/unstaged changes, and recent history. Preserve unrelated changes; never stage them.
5. Resolve the selection: explicit ID or path wins; otherwise only a single unambiguous conversational selection. List candidates and ask when absent or ambiguous.
6. Read completely the selected records, the parent Epic and every child in Epic scope, the global rank, active indexes, all related records, and all records needed to calculate inward blockers. Read an archive index only at the archival step that writes it.
7. Read backlog maintenance, applicable type templates, every linked wiki concept and nearest index, wiki maintenance, relevant engineering and architecture guidance, the ADR index at `docs/wiki/architecture/decisions/index.md`, the record's drafted `## Decisions`, proposal research and local evidence, and the affected repository code and tests. Open an individual in-force ADR only when its subject intersects the item's delta or drafted decisions.
8. Read every applicable guidance page under `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` — one per technology and cross-cutting standard this item's delta touches, resolved from its own directory indexes, not the whole set. Rule strength follows `docs/wiki/maintenance.md § Adopted guidance`; a listed `Known gap` is existing non-compliance to work around, never licence to add more. A touched subject with no page or a stale one is a reportable gap: implement against the item's research and repository evidence and name it for the post-acceptance `$guidance` offer and the final report — never block on it, and never write guidance into `docs/wiki` here.
9. Determine the invocation's primary-branch fixed point; retain it for review and integration evidence. For an Epic it is also the immutable **epic fixed point** for the final Epic review; no per-item fixed point replaces it.

For a top-level invocation, use `$parallel-execution` when at least two read-only discovery concerns or approved, dependency-free, conflict-disjoint subtasks exist. Keep one mutating owner per conflict domain and serially admit isolated writer commits. An internal provisional worker never delegates; it executes its packet locally.

An internal provisional packet is valid only when it names the orchestrator's live execution session, acceptance unit, isolated branch, claims, fixed point, authority packet, and mode (`child` or `standalone`). The worker does not own or mutate claims.

Reject before branch creation:

- an explicit item that is `proposed`, `done`, or `cancelled`;
- an item that is not `ready`, unless it is the active acceptance unit owned by this executor/session or covered by a valid internal provisional packet;
- a ready item missing any Definition of Ready field, objective criterion, approved execution approach, verification command, rank entry, resolved parent/relationship, completed/not-needed research, or resolved `decisions`;
- a ready item whose `## Subtasks` are too coarse to execute as checkable increments — any subtask missing its scope or its verification — unless the section is exactly `No subtasks.`;
- a ready item with an unresolved inward `blocks` relationship;
- a malformed record, invalid project, expired claim, or claim/status mismatch;
- any live claim owned by another executor — never overwrite it;
- an Epic that is not `ready` (unless resuming that `in-progress` Epic) or that has no approved children;
- Epic scope containing a required nonterminal child claimed by another executor.
The internal provisional exception changes only claim ownership and branch matching; all readiness, blocker, scope, authority, and validation checks still apply.

Report every blocking record, conflicting claim and expiry, malformed field, or owner decision. Do not use a separate blocked status; do not create a branch after rejection.

## Epic Mode

When the invocation resolved to an `EPIC-NNN`, read [references/epic-mode.md](references/epic-mode.md) after preflight and before selecting the first child — it owns child selection order and Epic completion and cleanup. A `WORK-NNN` invocation never reads it.

## Branch And Claim

After preflight:

1. For an internal provisional packet, verify it and use its isolated branch without changing governance. Otherwise resume only when the current branch, session, and live claims match, or invoke `$create-conventional-branch` once for the standalone item or Epic.
2. For a normal standalone or Epic invocation, set claim expiry to cover the complete acceptance unit. Claim and move the standalone item `ready -> in-progress`, or move the Epic plus every required nonterminal child to `in-progress` and claim each child for the same session/integration branch. Epics have no claim fields.
3. For a normal invocation, record branch/session once in `## Execution`; run `node scripts/validate-project.mjs`; stage only affected backlog paths; verify the diff; commit this single start transaction. An internal provisional packet skips steps 2–3 and proceeds directly to execution.

Do not write backlog evidence during normal execution. Renewal, safe release, or blocker recovery is an exceptional validated transaction, not a routine gate. Never continue with an expired claim or alter another executor's claim.
## Execution

For a standalone item, or each actionable Epic child in the order defined by [Epic mode](references/epic-mode.md):

1. Capture the code commit at which its delta starts. Follow the approved approach and subtasks; implement and smoke-test the real changed path first. For a bug, capture the cheapest reliable failing-before reproduction.
2. Commit coherent code increments. Run focused tests, typechecks, linters, and the listed verification relevant to the changed path. Run deterministic checks as parallel processes only when their state is isolated; serialize shared caches, outputs, ports, databases, simulators, and worktrees. Do not run the full suite or broad platform matrix here.
3. Reuse existing coverage. Add one durable test only when a new observable contract lacks proof: prefer acceptance-critical E2E, then integration/contract, then unit coverage for otherwise impractical edges. Never duplicate layers, chase coverage, require feature TDD, or add excessive E2E.
4. Keep verification-only executables outside the workspace when possible; otherwise remove them before acceptance. Retain one only when it protects an observable contract in a conventional test location and established command.
5. Pin unresolved dependency or tool versions only from a live registry and retain source/date evidence.
6. Aggregate criteria, subtask, commit, focused-check, and smoke evidence in the invocation ledger, optional autonomous-run transcript, or final record edit. Do not mutate or commit backlog records per subtask or child.
7. Never broaden scope. A blocking adjacent change requires an approved backlog transaction.

An internal provisional invocation stops after these steps and returns commits and concise evidence to the orchestrator; it never touches review, primary, wiki, rank, claims, statuses, or archives.
## Review And Final Verification

Classify against `$code-review`'s narrow high-risk triggers: security or authentication, destructive migration or credible data-loss risk, and public API compatibility.

- **Epic child:** no routine review. During normal single-executor Epic work, invoke a targeted child review only when its isolated delta meets a narrow trigger; use the child-start commit and resolved packet. An orchestrated provisional child returns before review so its manager can review the admitted delta independently. Address findings and rerun affected focused checks.
- **Standalone:** run one end-of-item review, combined Standards+Spec by default and independent axes only for a narrow trigger.
- **Epic:** defer comprehensive review and full verification to [Epic mode](references/epic-mode.md).

Rerun review after remediation only when it materially changes behavior, a public contract, architecture, security, data handling, or reviewed scope. Inspect mechanical or documentation-only fixes directly.

Run the full suite once per acceptance unit on one representative supported target after review passes. Expand devices/runtimes only when the changed code touches platform-specific behavior, adaptive layout, compatibility, packaging, migration, or another matrix-sensitive contract; record why each dimension applies. A release outcome always runs the complete supported matrix. Any later code-affecting change invalidates the result; backlog, wiki, run transcript, and other non-executable documentation do not.
## Reconciliation

After the acceptance unit's review and verification pass, compare the complete implementation with linked wiki concepts, research, guidance, and drafted decisions once:

- No durable change → record `wiki reconciliation: no update required` with the reason.
- Durable change → invoke `$wiki` in proposal-only mode and draft one exact accepted-state transaction covering the standalone item or whole Epic. Include every approved child/Epic decision and any ADR supersession; allocate no ADR IDs before publication.
- Apply the ADR significance test to the composed implementation. A newly significant decision absent from approved scope requires an approved backlog draft before acceptance.
- Stop for owner approval when wording asserts knowledge outside `wiki_refs`, contradicts an in-force ADR, or was never carried by the record.

Keep the proposal and all criteria/subtask/review/suite evidence in the invocation ledger until the final transaction. Never edit accepted wiki state on the work branch and never commit completion evidence separately.
## Acceptance And Completion

For a standalone item or complete Epic:

1. Confirm live claims; supported criteria and subtasks; required targeted and comprehensive reviews; one fresh representative full suite plus justified matrix expansion; exact reconciliation; validator pass; and no unintended changes.
2. Merge the acceptance branch to primary once with a merge commit, never squash or fast-forward. Compare code-affecting inputs with the verified branch state. Reuse the suite when they match; rerun only affected focused checks or the suite when they differ or classification is uncertain.
3. Run `node scripts/validate-project.mjs` on primary. Non-executable backlog, wiki, transcript, or documentation changes never invalidate executable verification.
4. Apply the one approved wiki transaction on primary. Publish every drafted ADR, update indexes/logs, validate, and commit only wiki paths. Offer missing/stale post-acceptance guidance once. Do not rerun executable suites after wiki-only changes.
5. Apply one validated final backlog transaction. For a standalone item: write accumulated evidence, clear its claim, resolve decisions, set `done`, remove rank, and archive it. For an Epic: write accumulated Epic/child evidence, clear all claims, resolve all decisions, set every child and the Epic `done`, remove all ranks, move the whole Epic directory to `archive/epics/`, and update indexes atomically. Include an autonomous run transcript when supplied.
6. Stage only final transaction paths, validate the diff, and commit once. Never mark any Epic child done earlier.

If merge, authorization, reconciliation, or a required check fails, stop before `done`; preserve the live acceptance unit or release all its claims safely in one recovery transaction.
## Completion And Report

Remain on primary and delete the local acceptance branch only after the final transaction, validation, and all authorized scope complete. Report scope; branch and claims; child execution order; code commits; targeted review or skips; one comprehensive review; representative suite and matrix rationale; acceptance merge; reconciliation and ADRs; the two normal governance transactions; archive paths; guidance gaps; and blockers.

End with `Next step:` — blocked → exact resume command; otherwise `$implement` with the next highest-ranked standalone item or Epic, or `$discuss` naming the next open outcome.
