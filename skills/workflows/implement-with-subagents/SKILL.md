---
name: implement-with-subagents
description: Orchestrate a ready Epic or work-item set through isolated implementation subagents with serialized integration. Use only on explicit invocation with an EPIC-NNN, WORK-NNN set, or unambiguous scope.
---

# Implement with Subagents

Orchestrate approved `setup-project` backlog work: own authority discovery, selection, sequencing, verification, recovery, and Epic closure; delegate each item to exactly one fresh subagent running `$implement`. Never implement work-item scope in the orchestrator or keep a master task document.

Under an active autonomous run, `$to-product`'s autonomous contract supplies every owner approval this workflow and its subagents require, and its blocker rule governs: retry an item three times, then release its claim, return it to `ready` with the blocker recorded, and continue with the next actionable item instead of stopping. State the contract in every subagent brief.

**Serialized integration:** run at most three dependency-free, scope-disjoint items concurrently in isolated worktrees; admit one to primary at a time. A later item merges primary, reruns affected focused checks, applies risk-gated review when required, and runs its one final suite on that integrated code state.

Delegation depth:

```text
orchestrator (depth 0)
└─ item subagent running `$implement` (depth 1)
   ├─ combined reviewer (depth 2, low risk)
   └─ Standards + Spec reviewers (depth 2, high risk)
```

Only reviewer roles may run at depth 2; they never spawn agents.

## Inputs

Require one explicit authorized scope: an active `EPIC-NNN`/path (authorizing all approved children and Epic closure) or a non-empty set of `WORK-NNN` IDs/paths. An unambiguous scope already established by the conversation counts; otherwise list candidates and ask — never infer a set from similar titles, changed paths, or rank adjacency. A set never authorizes siblings, parents, outside dependencies, or Epic closure; an Epic supplies coordination context but never expands a child's approved outcome.

Optional `model` and `reasoning effort` settings pass unchanged to every fresh subagent spawn. If an interface cannot apply a setting, say so once and use its default — never claim it was applied. Recovery resumes the existing subagent; never spawn a replacement with different settings.

## Preflight

Before any spawn or backlog mutation:

1. Resolve the repository root; read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, and coding standards.
2. Require the setup-project scaffold (wiki and backlog indexes and maintenance, ubiquitous language, four templates, `scripts/validate-project.mjs`); otherwise direct the user to `$setup-project`.
3. Run `node scripts/validate-project.mjs`; stop on any invalid baseline — never delegate against one.
4. Read completely: the scoped records (all children for an Epic), global rank, active and archive indexes, related and relationship-connected records, `wiki_refs` and nearest wiki indexes, the `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` indexes so each item's applicable guidance pages can be resolved by path, maintenance rules, research, and affected code and tests.
5. Inspect current and primary branches, remotes, staged/unstaged changes, and recent history; preserve unrelated and shared-workspace changes between delegations. Pin the primary-branch commit as the immutable epic fixed point for closure review.
6. Build the immutable authorized ID set with each member's status, rank position, inward blockers, claim details, parent, and archive location. Never add work or rerank during execution.

Reject: a proposed item, malformed Definition of Ready, missing rank entry for active unfinished work, expired or inconsistent claim, live claim owned by another executor, or an unresolved blocker outside the authorized set. Terminal records establish prior disposition but get no subagent. An inward blocker inside the set is a valid dependency chain while at least one member is actionable; if required work remains and nothing is actionable, report the complete deadlocked frontier and stop. Never cancel, reparent, alter relationships, change scope, or rerank autonomously — preserve such proposals for owner approval.

## Selection And Delegation

Loop over authorized incomplete work:

1. Before selection and admission, verify backlog state invariants and probe `git log -- docs/backlog` since the last read; reload rank, claims, statuses, indexes, and merged paths only when changed. Reuse the remaining fresh authority packet. Resume this run's live item; otherwise select the first authorized ready, unclaimed, unblocked item in global rank.
2. Spawn one fresh subagent dedicated to that `WORK-NNN`; record the item-to-agent/session mapping. Never assign it another item.
3. Give it a self-contained prompt to run `$implement` for only that item with the repository, record/parent paths, authorized scope, blockers, relationships, wiki references, constraints, user instructions, applicable guidance paths and gaps, and delegation-depth limit. Require every applicable gate, including risk-gated review or its policy skip, one final suite, reconciliation, primary acceptance, completion, archival, and concise evidence. Preserve unrelated work and scope; resolve new versions only from live registries.
   Any executable created only to verify the change is temporary, regardless of extension: use the system temporary directory when writable; otherwise delete the workspace fallback before final verification and handoff. Keep it only when it protects an observable contract, lives in a conventional test or test-helper location, and runs through an established or clearly documented test command; a new obscure alias alone does not qualify. With no test structure, add no permanent test infrastructure unless approved scope requires automated coverage.
4. Pass supported model/effort settings. Select again immediately while a concurrency slot is free; otherwise wait for a subagent to return.

No umbrella branch: each subagent's `$implement` invocation uses exactly one fresh conventional branch; never reuse an earlier item's branch.

## Verification And Recovery

After each response, verify invariants: commits and merge ancestry; record, parent, rank, claim, index, and archive state; review result or valid policy skip; suite freshness; reconciliation; and acceptance evidence. Trust fresh cited evidence. Read full diffs or rerun validators, suites, or focused checks only when evidence is missing, stale, contradictory, or integration changed code-affecting inputs.

Require:

- criteria complete without scope creep and focused checks plus one fresh final suite;
- required combined/parallel review passed, or an ordinary Epic child recorded its policy skip;
- approved wiki reconciliation applied or recorded unnecessary, with decisions resolved;
- merge evidence establishes primary acceptance before `done`;
- claim, rank, status, indexes, archive, and branch cleanup are correct.

On failure, send one focused follow-up to the same subagent. Never replace it, admit unresolved work, or alter another executor's claim. After success, finish it, reload changed state, and recalculate actionability.

## Epic Closure

Only explicit Epic input authorizes closure. After all approved children are terminal, verify dispositions, evidence, criteria, reconciliation, review skips/results, validator evidence, and the latest suite's freshness.

Invoke `$code-review` on primary for the mandatory Epic-scope review. Delegate in-scope remediation to one fresh branch subagent; require affected focused checks, substantive-only delta review, and a new full suite only when code-affecting inputs changed. Verify its evidence and admit it serially. Out-of-scope findings block closure.

Then apply `$implement`'s atomic Epic completion transaction on primary: criteria, `done`, archive, indexes, validation, explicit staging, commit.

## Invocation Examples

```text
Use $implement-with-subagents with EPIC-012.
Use $implement-with-subagents for WORK-014, WORK-019, and docs/backlog/standalone/WORK-023-fix-export.md.
Use $implement-with-subagents with EPIC-012 using model gpt-5.6-sol and reasoning effort high.
```

## Final Report

Report scope and order; subagents and branches; changed paths and commits; invariant evidence; review modes, skips, and results; suite freshness; acceptance and reconciliation; final statuses, claims, rank and archives; Epic review/remediation and closure; unsupported settings; blockers.

End the report with `Next step:` — one copy-pasteable command: blocked → the exact command that resumes this scope after the blocker; otherwise `$implement-with-subagents` or `$implement` with the next highest-ranked actionable scope, or `$discuss` naming the next open outcome when no ready work remains.
