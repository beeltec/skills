---
name: implement
description: Execute one ready backlog work item or all actionable children of a ready Epic through claim, implementation, review, primary-branch acceptance, completion, and archival. Use with an explicit WORK-NNN, EPIC-NNN, backlog path, or an unambiguous selection established by the conversation.
---

# Implement

Execute approved work from a `setup-project` backlog without changing its desired scope or priority. Accept one explicit `WORK-NNN`, one `EPIC-NNN`, a record path, or exactly one selection already established by the conversation. A work-item invocation handles only that item. An Epic invocation handles every required child, one at a time, through the same per-item gates.

Use one conventional work branch for the invocation. For an Epic, reuse that branch across per-item integrations; do not create a branch per child. Never create, inspect, migrate, or depend on `docs/tasks`.

## Authority And Approval

The selected work item's outcome, acceptance criteria, exclusions, and approved relationships define its implementation scope. Its parent Epic supplies coordination context but does not expand child scope. The accepted wiki and repository instructions define the current-state baseline and engineering constraints.

The invocation is a gate-backed execution workflow. It authorizes temporary claims, checklist evidence, and normal execution status transitions for the selected approved scope. It does not authorize changing outcome or acceptance wording, rank, parentage, relationships, cancellation, child scope, or accepted wiki knowledge. Preserve proposed cancellation and out-of-scope decisions in the backlog and stop for project-owner approval. Obtain explicit approval for the exact durable wiki update unless that update was already explicitly approved.

## Preflight

Complete preflight before creating or switching a branch or mutating a claim:

1. Resolve the repository root. Read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and contributing or coding standards.
2. Require `.setup-project.json`, `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/domains/ubiquitous-language.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, all four backlog type templates, and `scripts/validate-project.mjs`. If the scaffold is incomplete, stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`. Stop on an invalid baseline unless the user explicitly changes the assignment to repairing that state.
4. Inspect the current branch, primary branch, remotes, staged and unstaged changes, and recent history. Preserve unrelated changes and never stage them.
5. Resolve the selection. Explicit `WORK-NNN`, `EPIC-NNN`, or path wins. Otherwise use only a single item or Epic unambiguously established by the conversation; list candidates and ask when selection is absent or ambiguous.
6. Read completely the selected records, the parent Epic and every child in Epic scope, the global rank, active and archive indexes, all records connected by parent or relationship, and all records needed to calculate inward blockers.
7. Read backlog maintenance, the applicable type templates, every linked wiki concept and nearest index, wiki maintenance and log, relevant engineering and architecture guidance, proposal research and local evidence, and repository code and tests affected by the work.
8. Determine the invocation's primary-branch fixed point and retain it for review and integration evidence.

Reject before branch creation:

- an explicit work item that is `proposed`, `done`, or `cancelled`;
- a work item that is not `ready`, unless it is `in-progress` with a live claim belonging to this exact executor/session and branch and the invocation is resuming it;
- a ready item missing any Definition of Ready field, objective acceptance criterion, approved execution approach, verification command, rank entry, resolved parent or relationship, or completed/not-needed research;
- a ready item with an unresolved inward `blocks` relationship;
- a malformed record, invalid project, expired claim, or claim/status mismatch;
- any live claim owned by another executor; never overwrite it;
- an Epic that is not `ready`, unless this invocation is resuming that `in-progress` Epic, or that has no approved children;
- Epic scope containing a required nonterminal child claimed by another executor.

Report every blocking record, conflicting claim and expiry, malformed field, or owner decision. Do not use a separate blocked status and do not create a branch after rejection.

## Epic Selection

For Epic scope, first resume this invocation's own live in-progress child. Otherwise scan the authoritative global executable-work rank from top to bottom and select the highest-ranked child of the Epic whose status is `ready` and which has no unresolved inward blocker. Rank controls selection among actionable children; dependencies control actionability.

Do not skip a higher-ranked actionable child for convenience. Do not treat proposed or cancelled children as executable. If no child is actionable but required children remain, stop and report their statuses, blockers, and claims. After each child's primary-branch completion, reload and validate all records before selecting again so a newly resolved dependency can become actionable.

## Branch And Claim

After preflight passes, establish exactly one work branch for the invocation:

1. If resuming, verify the current conventional branch exactly matches the selected item's live claim and recorded branch/session reference.
2. Otherwise invoke `$create-conventional-branch` once and create a branch named for the selected work item or Epic. Do not create another branch for an Epic child.
3. Record a claim that identifies the human or agent, unique session, and exact branch. Set a future ISO 8601 `claim_expires` with enough time for the next gate and record the same branch/session reference in `## Execution` without changing approved scope.
4. In one backlog transaction, move the work item `ready -> in-progress`; when the first Epic child starts, also move its ready Epic to `in-progress`.
5. Run `node scripts/validate-project.mjs`, inspect all diffs, stage only affected backlog paths, verify the staged path list and diff, and create a concise Conventional Commit for the claim transaction.

Renew the claim in a separately validated transaction before expiry. Never continue work with an expired lease. If unfinished work must stop, return it to `ready`, clear both claim fields, validate, and commit that release; do not release another executor's claim.

## Per-Item Execution

For each selected work item:

1. Capture the primary branch's current commit as this item's fixed point. Read the complete authority packet and repository evidence again after any preceding Epic child integration.
2. Follow the approved approach and comprehensive `## Subtasks`. Commit implementation and tests as coherent, independently green increments rather than forcing one commit per checkbox. After each increment, update all checklist entries supported by that increment in one separate validated backlog transaction; stage and commit only its backlog paths. Keep checklist state current without mixing execution bookkeeping into code commits.
3. Do not broaden scope to resolve an adjacent problem. Record the observation and ask for an approved backlog transaction when it blocks the selected outcome.
4. Run focused tests, typechecks, linters, and other listed verification throughout. Add or update tests that objectively exercise the desired delta. Run the full applicable suite at the end of the item.
5. Check a subtask or acceptance criterion only after retaining concrete evidence such as a command and result, test, artifact, or direct inspection. Record concise evidence in `## Execution` when it is not self-evident from committed tests. Run `node scripts/validate-project.mjs` after each such backlog mutation and verify its narrow staged diff before committing.
6. Inspect the worktree before every commit. Stage explicit intended paths only, verify `git diff --cached`, and use concise Conventional Commits. Never include unrelated changes, secrets, caches, or working notes.

## Review Loop

After the item implementation and full applicable suite are green, invoke `$code-review` with the selected `WORK-NNN` and this item's captured primary-branch fixed point. The review must use the backlog-aware Standards and Spec axes.

- Address every actionable finding without changing approved scope.
- Rerun affected focused checks and the full applicable suite after fixes.
- Invoke `$code-review` again against the same fixed point.
- Repeat until both Standards and Spec pass.
- Any unresolved finding, unavailable authority, required scope decision, or failed check is a blocker. Keep the item `in-progress` with a renewed claim, or release it safely when execution must stop; never prepare completion.

## Wiki Reconciliation And Validation

Before primary-branch integration, compare the reviewed implementation with every linked wiki concept and proposal-research conclusion.

- If no durable current-state knowledge changed, record `wiki reconciliation: no update required` with the reason in `## Execution`.
- If knowledge will change after acceptance, invoke `$wiki` in proposal-only mode to inspect evidence, draft the exact canonical transaction, and obtain project-owner approval unless already granted for those exact edits. Summarize only durable guidance in the owning concepts; keep temporary execution detail, rejected alternatives, and proposal-specific source history in the backlog.
- Do not edit `docs/wiki` on the work branch to describe the implementation. Record the exact approved transaction in `## Execution` so it can be verified and applied after primary-branch acceptance.
- Re-run review after any implementation change made after the last passing review.

When review and the reconciliation decision pass, verify every acceptance criterion with concrete evidence, check only supported criteria and subtasks, and run `node scripts/validate-project.mjs` plus the full applicable repository suite. Commit the prepared completion evidence while leaving `status: in-progress` and the live claim intact. No item may be `done` on the work branch.

## Primary-Branch Acceptance And Completion

Primary-branch integration is a per-work-item gate, including during an Epic invocation:

1. Confirm the item still has a live claim, all criteria and subtasks are checked, both review axes pass, reconciliation is either unnecessary or exactly approved, the consolidated validator passes, the full suite passes, and the worktree contains no unintended staged changes.
2. Merge the one work branch into the primary branch with a merge commit. Do not squash or fast-forward. Resolve no unexpected conflict by changing scope; stop safely instead.
3. On the primary branch, rerun `node scripts/validate-project.mjs` and the full applicable suite. The successful merge commit and post-merge checks establish primary-branch acceptance.
4. If durable knowledge changed, invoke `$wiki` on the primary branch. Re-verify that the approved wording describes the now-accepted repository state, apply that exact semantic transaction with required indexes, links, metadata, and log changes, validate, and commit only its wiki paths. If the evidence requires different meaning, stop for revised owner approval.
5. Apply one validated backlog completion transaction: clear `claim` and `claim_expires`, set the item to `done`, remove it from global rank, and preserve all verified checklist and reconciliation evidence. Move a standalone item to `archive/standalone/` and update active/archive indexes immediately. Leave a done Epic child in its active Epic directory until the Epic closes.
6. Inspect and stage only the completion transaction's backlog paths, validate the staged diff, and create a concise Conventional Commit on primary. Never mark an item done before steps 1-4 succeed.
7. For unfinished Epic scope, switch back to the same work branch and merge the primary branch into it so the child's completion, rank, dependency, and accepted wiki state are present. Validate again, then select the next child. Do not create another work branch.

If integration is not authorized, primary is unavailable, merge or post-merge checks fail, or acceptance is declined, stop before `done`. Report the blocker and preserve or safely release the claim. Never claim primary-branch acceptance from a review, pull request, unmerged branch, or passing branch-local tests alone.

## Epic Completion And Cleanup

After every required child is `done` or explicitly owner-cancelled, verify the Epic outcome and each Epic acceptance criterion with concrete primary-branch evidence. Reconcile any remaining Epic-level durable knowledge through `$wiki` before Epic completion, then run the consolidated validator and full applicable suite.

In one final primary-branch backlog transaction, check supported Epic criteria, set the Epic to `done`, move its whole directory to `archive/epics/`, and update active and archive indexes. The final child's completion may share this transaction only when all child and Epic gates already pass. Validate and commit the atomic archive; never split it across commits.

Remain on primary and delete the local work branch only after every item in the invocation is integrated, its completion transaction is committed, the Epic archive is committed when applicable, all checks are green, and no authorized scope remains. Otherwise retain the branch and report the exact blocker. Report selected scope, claims, changed paths, commits and merge commits, review results, acceptance evidence, reconciliation, validation, archive destinations, and remaining concerns.
