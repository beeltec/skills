---
name: implement
description: Execute one ready backlog work item or all actionable children of a ready Epic through claim, implementation, review, primary-branch acceptance, completion, and archival. Use with an explicit WORK-NNN, EPIC-NNN, backlog path, or an unambiguous selection established by the conversation.
---

# Implement

Execute approved work from a `setup-project` backlog without changing its desired scope or priority. Accept one explicit `WORK-NNN`, `EPIC-NNN`, record path, or exactly one selection already established by the conversation. A work-item invocation handles only that item; an Epic invocation handles every required child, one at a time, through the same per-item gates.

Use one conventional work branch per invocation — for an Epic, reuse it across per-item integrations; never a branch per child. Never create, inspect, migrate, or depend on `docs/tasks`.

## Authority And Approval

The item's outcome, acceptance criteria, exclusions, and approved relationships define implementation scope. Its parent Epic supplies coordination context but never expands child scope. The accepted wiki and repository instructions define the current-state baseline and engineering constraints.

The invocation is a gate-backed execution workflow: it authorizes temporary claims, checklist evidence, and normal execution status transitions for the selected approved scope — not changes to outcome or acceptance wording, rank, parentage, relationships, cancellation, child scope, or accepted wiki knowledge. Preserve proposed cancellation and out-of-scope decisions in the backlog and stop for owner approval. Obtain explicit approval for the exact durable wiki update unless already explicitly approved.

## Preflight

Complete before creating or switching a branch or mutating a claim:

1. Resolve the repository root. Read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and contributing or coding standards.
2. Require the `$setup-project` scaffold: `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/domains/ubiquitous-language.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, all four backlog type templates, and `scripts/validate-project.mjs`. If any is missing, stop and direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`; on an invalid baseline, report and stop unless the user explicitly asks to repair that state.
4. Inspect the current branch, primary branch, remotes, staged/unstaged changes, and recent history. Preserve unrelated changes; never stage them.
5. Resolve the selection: explicit ID or path wins; otherwise only a single unambiguous conversational selection. List candidates and ask when absent or ambiguous.
6. Read completely the selected records, the parent Epic and every child in Epic scope, the global rank, active and archive indexes, all related records, and all records needed to calculate inward blockers.
7. Read backlog maintenance, applicable type templates, every linked wiki concept and nearest index, wiki maintenance and log, relevant engineering and architecture guidance, every in-force ADR under `docs/wiki/architecture/decisions/`, the record's drafted `## Decisions`, proposal research and local evidence, and the affected repository code and tests.
8. Determine the invocation's primary-branch fixed point; retain it for review and integration evidence.

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

## Epic Selection

First resume this invocation's own live in-progress child. Otherwise scan the authoritative global executable-work rank top to bottom and select the highest-ranked Epic child that is `ready` with no unresolved inward blocker. Rank chooses among actionable children; dependencies determine actionability.

Never skip a higher-ranked actionable child for convenience or treat proposed/cancelled children as executable. If no child is actionable but required children remain, stop and report their statuses, blockers, and claims. After each child's primary-branch completion, reload and validate all records before selecting again.

## Branch And Claim

After preflight passes:

1. If resuming, verify the current conventional branch exactly matches the item's live claim and recorded branch/session reference.
2. Otherwise invoke `$create-conventional-branch` once, named for the selected item or Epic. No additional branch for an Epic child.
3. Record a claim identifying the human or agent, unique session, and exact branch. Set a future ISO 8601 `claim_expires` covering the next gate and record the same branch/session reference in `## Execution` without changing approved scope.
4. In one backlog transaction, move the item `ready -> in-progress`; when the first Epic child starts, also move the ready Epic to `in-progress`.
5. Run `node scripts/validate-project.mjs`, inspect all diffs, stage only affected backlog paths, verify the staged list and diff, and create a concise Conventional Commit for the claim transaction.

Renew the claim in a separately validated transaction before expiry; never continue on an expired lease. If work must stop unfinished, return it to `ready`, clear both claim fields, validate, and commit the release. Never release another executor's claim.

## Per-Item Execution

1. Capture the primary branch's current commit as this item's fixed point. Re-read the authority packet and repository evidence after any preceding Epic child integration.
2. Follow the approved approach and `## Subtasks`. Commit implementation and tests as coherent, independently green increments. Immediately after each green increment, check every subtask it completes, with evidence, in one separate validated backlog transaction staging only its backlog paths — keep bookkeeping out of code commits. Do not start the next subtask while an earlier completed subtask is unchecked; check-off is a per-increment gate, never a batch at the end of the item.
3. Never broaden scope to fix an adjacent problem; record the observation and ask for an approved backlog transaction when it blocks the outcome.
4. Run focused tests, typechecks, linters, and other listed verification throughout. Add or update tests that objectively exercise the desired delta. Run the full applicable suite at the end of the item.
5. Check a subtask or criterion only with concrete evidence (command and result, test, artifact, or direct inspection); record concise evidence in `## Execution` when not self-evident from committed tests. Validate and verify the narrow staged diff after each such backlog mutation.
6. Inspect the worktree before every commit. Stage explicit intended paths only, verify `git diff --cached`, use concise Conventional Commits. Never include unrelated changes, secrets, caches, or working notes.

## Review Loop

After implementation and the full applicable suite are green, invoke `$code-review` with the `WORK-NNN` and this item's captured fixed point (backlog-aware Standards and Spec axes). Then loop:

1. Address every actionable finding without changing approved scope.
2. Rerun affected focused checks and the full applicable suite.
3. Invoke `$code-review` again against the same fixed point.
4. Repeat until both axes pass.

Any unresolved finding, unavailable authority, required scope decision, or failed check is a blocker: keep the item `in-progress` with a renewed claim, or release it safely; never prepare completion.

## Wiki Reconciliation And Validation

Before primary-branch integration, compare the reviewed implementation with every linked wiki concept and research conclusion:

- No durable knowledge changed → record `wiki reconciliation: no update required` with the reason in `## Execution`.
- Knowledge will change after acceptance → invoke `$wiki` in proposal-only mode to inspect evidence, draft the exact canonical transaction, and obtain owner approval unless already granted for those exact edits. Summarize only durable guidance in the owning concepts; keep temporary detail and proposal-specific history in the backlog.
- The item's `## Decisions` drafts become ADRs in that same transaction. Include for each: its full ADR body, and the `ADR-NNN` it would supersede where the decision replaces one already in force. Do not allocate the ADR ID yet — allocation happens at publication.
- Apply the ADR significance test to what was actually built. A significant decision first made during implementation and absent from `## Decisions` requires an approved backlog transaction adding the draft before completion; never publish a decision the record never carried.
- Never edit `docs/wiki` on the work branch to describe the implementation. Record the exact approved transaction in `## Execution` for application after primary-branch acceptance.
- Re-run review after any implementation change made after the last passing review.

When review and reconciliation pass, verify every acceptance criterion with concrete evidence, check only supported criteria and subtasks, run `node scripts/validate-project.mjs` and the full applicable suite, and commit the completion evidence while leaving `status: in-progress` and the live claim intact. No item may be `done` on the work branch.

## Primary-Branch Acceptance And Completion

Integration is a per-work-item gate, including during an Epic invocation:

1. Confirm: live claim, all criteria and subtasks checked, both review axes pass, reconciliation unnecessary or exactly approved, validator and full suite pass, no unintended staged changes.
2. Merge the work branch into the primary branch with a merge commit — never squash or fast-forward. Resolve no unexpected conflict by changing scope; stop safely instead.
3. On the primary branch, rerun `node scripts/validate-project.mjs` and the full suite. The merge commit plus post-merge checks establish primary-branch acceptance.
4. If durable knowledge changed, invoke `$wiki` on the primary branch: re-verify the approved wording describes the now-accepted state, apply that exact semantic transaction with required indexes, links, metadata, and log changes, validate, and commit only its wiki paths. Publish each approved drafted decision as an ADR here — `$wiki` allocates the next unused `ADR-NNN` at this point and supersedes any replaced ADR in place, in both directions. If the evidence requires different meaning, stop for revised owner approval.
5. Apply one validated backlog completion transaction: clear `claim` and `claim_expires`, set `done`, replace `decisions: pending` with the ADR IDs just published (or `none` where the significance test recorded no qualifying decision), remove from global rank, preserve all verified evidence. Move a standalone item to `archive/standalone/` and update indexes immediately; leave a done Epic child in its active Epic directory until the Epic closes.
6. Stage only the completion transaction's backlog paths, validate the staged diff, and create a concise Conventional Commit on primary. Never mark done before steps 1-4 succeed.
7. For unfinished Epic scope, switch back to the same work branch and merge primary into it so completion, rank, dependency, and wiki state are present. Validate, then select the next child. No new work branch.

If integration is unauthorized, primary is unavailable, merge or post-merge checks fail, or acceptance is declined, stop before `done`; report the blocker and preserve or safely release the claim. Never claim primary-branch acceptance from a review, PR, unmerged branch, or passing branch-local tests alone.

## Epic Completion And Cleanup

After every required child is `done` or explicitly owner-cancelled, verify the Epic outcome and each criterion with concrete primary-branch evidence, reconcile remaining Epic-level durable knowledge and any Epic-level drafted decision through `$wiki`, then run the validator and full suite. Resolve the Epic's `decisions` to the published IDs or `none` in the final transaction.

In one final primary-branch backlog transaction: check supported Epic criteria, set the Epic `done`, move its whole directory to `archive/epics/`, and update active and archive indexes. The final child's completion may share this transaction only when all child and Epic gates already pass. Commit the archive atomically; never split it.

Remain on primary and delete the local work branch only after every item is integrated, its completion committed, the Epic archive committed when applicable, all checks green, and no authorized scope remains; otherwise retain the branch and report the exact blocker. Report selected scope, claims, changed paths, commits and merge commits, review results, acceptance evidence, reconciliation including every published `ADR-NNN` and each ADR superseded, validation, archive destinations, and remaining concerns.

End the report with `Next step:` — one copy-pasteable command: blocked → the exact command that resumes this scope after the blocker; otherwise `/implement` with the next highest-ranked actionable `WORK-NNN`, or `/discuss` naming the next open outcome when no ready work remains. Recommend only — never invoke it. It is the report's last line; if several must run, end with a numbered list in run order.
