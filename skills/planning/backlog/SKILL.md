---
name: backlog
description: Manage approved desired work in a setup-project backlog from lightweight intake through refinement, global ranking, execution state, cancellation, and archival. Use when creating or changing Epics, Stories, Tasks, or Bugs in docs/backlog.
---

# Backlog

`docs/backlog` is the tracked system of record for desired project deltas and execution state; `docs/wiki` is accepted current state on the primary branch. Never put a proposal in the wiki or treat completed backlog work as accepted until the relevant wiki concepts are updated. Use `$wiki` for accepted-knowledge operations; never mutate wiki concepts inside a backlog transaction.

Stay on the user's current Git branch — never create, switch, merge, or delete branches. Never create, inspect, migrate, or depend on `docs/tasks`.

## Authority

The project owner controls durable intent and priority. Obtain explicit approval before: creating any record (even a lightweight proposal); changing an outcome, scope, criterion wording, work type, parent, or initial child set; changing relationship links; adding to or reordering global rank; moving work to `ready`; cancelling work (including its rationale and the disposition of unfinished children); or changing accepted wiki state.

Approval covers only the exact transaction presented — never infer it from earlier discussion, a plan, silence, or permission to inspect files. Record approval in `## Execution` when readiness requires it and preserve provenance.

An invoked gate-backed execution workflow that explicitly authorizes an agent/session for a named, already-approved work item permits only: setting, renewing, and clearing its own temporary claim; checking existing acceptance criteria and subtasks with evidence; and the normal `ready <-> in-progress` and `in-progress -> done` transitions. It never permits changing criterion wording, scope, parentage, relationships, rank, cancellation, or wiki acceptance.

## Preflight

Before proposing or applying a mutation:

1. Resolve the repository root; read all applicable `AGENTS.md`, `CLAUDE.md`, and nested instructions.
2. Require the setup-project scaffold: `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, the four type templates, and `scripts/validate-project.mjs`. If any is missing, stop and direct the user to `$setup-project`; do not improvise a partial scaffold.
3. Run `node scripts/validate-project.mjs`. On an invalid baseline, report the errors and mutate only if the user explicitly asks to repair that existing state.
4. Read the wiki root index, maintenance rules, ubiquitous language, nearest relevant indexes, and every relevant accepted-state concept.
5. Read the backlog root index, maintenance rules, relevant type templates, active and archive indexes, all records related by parent or relationship, and every record needed to determine inward links and blocking state.
6. Inspect active and archived IDs before allocation, the complete global rank, the current branch, and staged/unstaged changes. Preserve unrelated work; never stage it.

Project-local maintenance rules are authoritative. If they conflict with this skill or cannot represent the transaction, stop and explain rather than weakening validation.

## Intake

Keep intake conversational until the owner approves a proposed record and its exact rank placement. Capture provenance (request, issue URL and comment, spec path, conversation date); read any referenced issue, file, or URL completely before drafting.

A lightweight proposed record needs only:

- **Epic:** next unused immutable `EPIC-NNN`; type `epic`, a concise outcome-centered title, `status: proposed`; a specific problem, delta, or outcome; declared empty or approved relationship arrays, `cancelled_reason: none`, and provenance.
- **Executable item:** next unused immutable `WORK-NNN` from the one global sequence shared by Stories, Tasks, and Bugs; the best-supported type, a concise title, `status: proposed`; a specific problem, delta, or outcome; `parent: EPIC-NNN` or `parent: none`, all relationship fields, empty claim fields, and provenance; an explicitly approved position in the one global executable-work rank.

Allocate Epic and work sequences independently by scanning active and archived records; never reuse or renumber an ID. Use the type template as the shape, replace template instructions with known facts, and state unresolved detail plainly in the body — no placeholders in the frontmatter outcome. Add `## Provenance` when the source is not already durably clear. Standalone work is first-class: `parent: none` and `standalone/`; never manufacture a single-item Epic.

Before writing files, present the proposed type, ID, title, outcome/delta, provenance, parent, relationships, and exact rank position (plus, for an Epic, any initial child scope) and wait for explicit approval.

## Refinement

Refine against the matching installed template and accepted wiki state:

- **Story:** a stakeholder-visible behavior delta — who observes what changed behavior; criteria observable from that stakeholder boundary.
- **Task:** a bounded engineering or operational result — a concrete project-state delta with verification evidence, not a layer-only activity.
- **Bug:** an observed failure against accepted behavior — impact, reproduction conditions, the behavior to restore, a failing-before/passing-after check, and regression evidence.

Slice executable work into the smallest coherent outcome that can be implemented, verified, and accepted independently. Prefer vertical behavior or bounded operational results over horizontal layers, investigation-only fragments, or agent-sized busywork. Decompose execution into structured checklist subtasks: each subtask is one bounded step — roughly one coherent commit — that names its scope (files, components, or records touched) and its verification (command, test, or observable result). Split any step that cannot state a single verification. Subtasks are local steps with no independently valuable outcome; never create child work below a Story, Task, or Bug.

For Epics, refine a measurable coordinated outcome, objective acceptance criteria, explicit exclusions, and a useful multi-item child scope. Parentless work stays standalone when no genuine shared outcome requires an Epic.

Present every proposed scope, criterion, parent, relationship, or rank change for explicit owner approval before editing.

## Definition Of Ready

Reject `proposed -> ready` unless all hold:

- the outcome/delta is specific, bounded, and placeholder-free;
- at least one acceptance criterion is objectively checkable;
- parentage and all relationships resolve, blockers are explicit, and no blocking cycle exists;
- `wiki_refs` lists every relevant `docs/wiki/...` path, or only `none` after confirming none applies;
- research is `complete` or `not-needed` with resolved conclusions and sources or a concrete explanation — `pending` research or any unresolved version-specific or security-sensitive question blocks readiness;
- `## Execution` records an actionable approach, verification commands, and the explicit project-owner approval;
- every subtask is one bounded step naming its scope and its verification, or the section says exactly `No subtasks.`;
- the item occurs exactly once at its approved position in global rank.

A ready Epic additionally requires an approved outcome, objective acceptance criteria, a coordination approach, and at least one approved child. Show the owner the complete candidate record, rank position, and validation-relevant relationships before requesting the transition; approval to refine is not approval to become ready.

Keep proposal-specific sources, version findings, recommendations, uncertainty, and project deviations in the backlog record. Promote only durable guidance that becomes accepted current state (during implementation reconciliation) to the owning wiki concept; never copy an unimplemented target specification into the wiki.

## Relationships And Actionability

Use only the schema fields installed by setup-project. Directional links live on the outward/source record; derive inward wording while reviewing the graph:

- `A blocks: [B]` — A blocks B; B is blocked by A.
- `clones`, `duplicates`, `causes` — stored outward only.
- `relates_to` is symmetric — add or remove on both records in one transaction.
- a child's `parent` and physical placement represent membership; keep the Epic's scope and relevant indexes consistent with that child set.

Reject self-links, missing targets, duplicate links, blocking cycles, and active-to-archived links. Never invent reciprocal directional fields the schema does not define.

Actionability is calculated — never a `blocked` status or field. An item is actionable only when its status is `ready` and no nonterminal active record has an outward `blocks` link to it; otherwise report the blocking record IDs. Rank expresses owner priority, not actionability, so blocked work stays ranked until terminal.

## Ranking

The ordered links under `## Global executable-work rank` in `docs/backlog/index.md` are authoritative: every active unfinished `WORK-NNN` exactly once; Epics never appear. Any insertion, reorder, or removal other than a required terminal removal is an owner-controlled priority transaction. When proposing intake or reprioritization, show the current order and the exact resulting order or an unambiguous before/after position; apply only the approved order. Remove done or cancelled work from rank in the same transaction as its terminal transition, including a child that remains inside an active Epic directory.

## Execution Claims And Status

Before claiming, verify the item is actionable and no unexpired claim exists. A gate-backed agent sets `status: in-progress`, a non-empty claim identifying the agent/session, and a future ISO 8601 `claim_expires` in one transaction. Renew before expiry. Never overwrite another live claim.

Releasing unfinished work: set `status: ready`, `claim: none`, `claim_expires: none`. Recording completion: check only criteria and subtasks supported by evidence, apply required accepted-state wiki updates under their own approval rules, clear claim fields, set `done`, and perform rank removal and archival in the same validated transaction where maintenance requires it. Any incomplete criterion or subtask forbids `done`.

Move a ready Epic to `in-progress` when a child's execution begins. Complete an Epic only after every child is terminal, Epic acceptance is evidenced, and required wiki updates are complete.

## Cancellation

Cancellation always requires explicit owner approval and a concrete `cancelled_reason`. Present the rationale, relationship changes, rank removal, archive destination, and downstream effects together.

For duplication, point `duplicates` from the cancelled record to the survivor. For replacement or supersession, identify the replacing record with an applicable supported relationship and explain it in the cancellation rationale or Relationships section — never invent schema fields. Preserve other approved links when archival rules allow.

Before cancelling an Epic, enumerate every unfinished child and obtain an explicit disposition for each: complete it, cancel it with its own rationale, or reparent it through a separately approved parent/scope transaction. Never infer bulk child cancellation from Epic-cancellation approval.

## Archival

Archive terminal records promptly, updating all affected indexes and links in the same transaction:

- move a terminal standalone record to `archive/standalone/` immediately;
- leave a terminal child in its active Epic directory (removed from global rank) until the Epic is terminal;
- archive an Epic only by moving its entire directory to `archive/epics/` atomically after every retained child is done or cancelled;
- remove active index entries, add archive index entries, and reject any active link to the newly archived records.

Never split an Epic archive across commits or leave a terminal Epic active. Preserve IDs and historical relationships; never reuse archived IDs.

## Durable Transaction

For each approved mutation:

1. Restate the exact approved transaction and affected records. For gate-backed bookkeeping, state the gate and named work item instead of seeking repeated approval.
2. Edit all affected records, reciprocal links, indexes, and rank as one logical transaction, with no unrelated cleanup.
3. Run `node scripts/validate-project.mjs`. Fix all errors and review warnings. If it cannot pass, do not commit; report the invalid transaction.
4. Inspect `git diff`, `git diff --cached`, and `git status`. Stage only the transaction's intended `docs/backlog` paths; handle a separately approved wiki update as its own validated workflow and commit. Never use broad staging commands.
5. Verify the staged path list and diff contain no unrelated files, secrets, working notes, or `docs/tasks` content.
6. Create one concise Conventional Commit, normally `docs(backlog): <transaction outcome>`. Keep temporary claims in their own transaction when practical.
7. Report the commit hash, changed records, resulting statuses and actionability, rank effects, and validation result. End with `Next step:` — one exact command the transaction implies (e.g. a `ready` transition → `/implement WORK-NNN`); recommend only, omit when none follows.

If approval is denied or changed, revise the proposal in conversation without mutating files. If unrelated worktree changes overlap an affected file, preserve them and ask before proceeding when a safe narrow transaction is not possible.
