---
name: backlog
description: Manage approved desired work in a setup-project backlog from lightweight intake through refinement, global ranking, execution state, cancellation, and archival. Use when creating or changing Epics, Stories, Tasks, or Bugs in docs/backlog.
---

# Backlog

Manage `docs/backlog` as the tracked system of record for desired project deltas and execution state. Treat `docs/wiki` as accepted current state on the primary branch. Never put a proposal in the wiki or treat completed backlog work as accepted state until the relevant wiki concepts are updated.

Stay on the user's current Git branch. Never create, switch, merge, or delete branches as part of backlog management. Do not create, inspect, migrate, or depend on `docs/tasks`.

## Authority

The project owner controls durable intent and priority. Obtain their explicit approval before:

- creating any Epic or work record, including a lightweight proposal;
- changing an outcome, scope, acceptance-criterion wording, work type, parent, or initial child set;
- adding, removing, or changing relationship links;
- adding an executable item to global rank or changing any ranked position;
- moving proposed work to `ready`;
- cancelling work, including its rationale and the disposition of unfinished children;
- changing accepted wiki state.

Approval applies only to the exact transaction presented. Do not infer it from earlier discussion, a plan, silence, or permission to inspect files. Record approval in `## Execution` when readiness requires it and preserve relevant provenance in the record.

An agent may perform execution bookkeeping without repeated scope approval only when an invoked gate-backed execution workflow explicitly authorizes that agent/session for the named, already-approved work item. That authority permits setting, renewing, and clearing its temporary claim; recording evidence by checking existing acceptance criteria and subtasks; and making the normal `ready -> in-progress`, `in-progress -> ready`, or `in-progress -> done` transitions. It does not permit changing criterion wording, scope, parentage, relationships, rank, cancellation, or wiki acceptance. Without an explicit execution gate, use the owner-approval rules above.

## Preflight

Before proposing or applying a mutation:

1. Resolve the repository root and read all applicable `AGENTS.md`, `CLAUDE.md`, and nested repository instructions.
2. Require the setup-project scaffold: `.setup-project.json`, `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, the four type templates, and `scripts/validate-project.mjs`. If any are absent, stop and direct the user to `$setup-project`; do not improvise a partial scaffold.
3. Run `node scripts/validate-project.mjs` before mutation. If the baseline is invalid, report the errors and do not mutate the backlog unless the user explicitly asks to repair that existing invalid state.
4. Read the wiki root index, wiki maintenance rules, ubiquitous language, nearest relevant wiki indexes, and every relevant accepted-state concept.
5. Read the backlog root index and maintenance rules, the relevant type templates, active and archive indexes, all records related by parent or relationship, and every record needed to determine inward links and blocking state.
6. Inspect active and archived IDs before allocation, the complete global rank, the current branch, and staged and unstaged changes. Preserve unrelated work and never stage it.

Project-local maintenance rules are authoritative. If they conflict with this skill or cannot represent the requested transaction, stop and explain the conflict rather than weakening validation.

## Intake

Keep intake conversational until the owner approves a proposed record and exact rank placement. Capture the source as provenance, such as the user request, issue URL and comment, specification path, or conversation date. Read a referenced issue, file, URL, and relevant comments completely before drafting.

A lightweight proposed Epic needs only:

- the next unused immutable `EPIC-NNN` ID;
- type `epic`, a concise outcome-centered title, and `status: proposed`;
- a specific problem, desired delta, or outcome;
- declared empty or approved relationship arrays, `cancelled_reason: none`, and provenance.

A lightweight proposed executable item needs only:

- the next unused immutable `WORK-NNN` ID, allocated from the one global sequence shared by Stories, Tasks, and Bugs;
- the best-supported type, a concise title, and `status: proposed`;
- a specific problem, desired delta, or outcome;
- `parent: EPIC-NNN` or `parent: none`, all relationship fields, empty claim fields, and provenance;
- an explicitly approved position in the one global executable-work rank.

Allocate Epic and work sequences independently by scanning active and archived records. Never reuse or renumber an ID. Use the type template as the record shape, replace template instructions with known facts, and state unresolved detail plainly in the body without readiness placeholders in the frontmatter outcome. Add a `## Provenance` section when the source is not already durably clear.

Standalone work is first-class. Use `parent: none` and `standalone/`; never manufacture a single-item Epic.

Before writing intake files, present the proposed type, ID, title, outcome/delta, provenance, parent, relationships, and exact rank position. For an Epic, also present any approved initial child scope. Wait for explicit approval.

## Refinement

Refine work against the matching installed template and accepted wiki state:

- **Story:** a stakeholder-visible behavior delta. State who observes what changed behavior and make acceptance criteria observable from that stakeholder boundary.
- **Task:** a bounded engineering or operational result. State the concrete project-state delta and verification evidence, not a layer-only activity.
- **Bug:** an observed failure against accepted behavior. Record impact and reproduction conditions, the behavior to restore, a failing-before/passing-after check, and regression evidence.

Slice executable work into the smallest coherent outcome that can be implemented, verified, and accepted independently. Prefer vertical behavior or bounded operational results over horizontal layers, investigation-only fragments, or agent-sized busywork. Use checklist subtasks for local steps that have no independently valuable outcome. Do not create child work below a Story, Task, or Bug.

For Epics, refine a measurable coordinated outcome, objective acceptance criteria, explicit exclusions, and a useful multi-item child scope. Parentless work remains standalone when no genuine shared outcome requires an Epic.

Present every proposed scope, criterion, parent, relationship, or rank change and obtain explicit owner approval before editing.

## Definition Of Ready

Before proposing `proposed -> ready`, verify every maintenance requirement and reject the transition if any fails:

- the outcome/delta is specific, bounded, and has no unresolved placeholder;
- at least one acceptance criterion is objectively checkable;
- parentage and all relationships resolve, blockers are explicit, and no blocking cycle exists;
- `wiki_refs` contains every relevant `docs/wiki/...` path, or only `none` after confirming none applies;
- research is `complete` or `not-needed`, with resolved conclusions and sources or a concrete explanation; `pending` research and any unresolved version-specific or security-sensitive question prevent readiness;
- `## Execution` records an actionable approach, verification commands, and the explicit project-owner approval;
- subtasks are coherent checklist steps, or the section says exactly `No subtasks.`;
- the work item occurs exactly once at its approved position in global rank.

A ready Epic additionally requires an approved outcome, objective acceptance criteria, coordination approach, and at least one approved child. Show the owner the complete candidate record, rank position, and validation-relevant relationships before requesting transition approval. Approval to refine is not approval to become ready.

Keep proposal-specific sources, version findings, recommendations, uncertainty, and project deviations in the relevant backlog record. Promote only durable guidance that becomes accepted current state during implementation reconciliation to the owning wiki concept; do not copy an unimplemented target specification into the wiki.

## Relationships And Actionability

Use only the schema fields installed by setup-project. Keep directional links on the outward/source record and derive inward wording while reviewing the graph:

- `A blocks: [B]` means A blocks B; B is blocked by A.
- `A clones: [B]`, `duplicates: [B]`, or `causes: [B]` stores only that outward direction.
- `relates_to` is symmetric and must be added or removed on both records in one transaction.
- a child's `parent` and physical placement represent membership; keep the Epic's scope and relevant indexes consistent with that child set.

Reject self-links, missing targets, duplicate links, blocking cycles, and active-to-archived links. Never invent reciprocal directional fields that the schema does not define.

Calculate actionability; do not add a `blocked` status or field. An item is actionable only when its status is `ready` and no nonterminal active record has an outward `blocks` link to it. Report the blocking record IDs when it is not actionable. Rank expresses owner priority, not actionability, so blocked work remains in rank until terminal.

## Ranking

The ordered links under `## Global executable-work rank` in `docs/backlog/index.md` are authoritative. Every active, unfinished `WORK-NNN` appears exactly once; Epics never appear. Treat an insertion, removal other than a required terminal removal, or reorder as an owner-controlled priority transaction.

When proposing intake or reprioritization, show the current order and the exact resulting order or unambiguous before/after position. Apply only the approved order. Remove done or cancelled work from rank in the same transaction as its terminal transition, including a child that remains inside an active Epic directory.

## Execution Claims And Status

Before claiming work, verify that it is actionable and that no unexpired claim exists. A gate-backed agent sets `status: in-progress`, a non-empty claim identifying the agent/session, and a future ISO 8601 `claim_expires` in one transaction. Renew before expiry. Never overwrite another live claim.

When releasing unfinished work, set `status: ready`, `claim: none`, and `claim_expires: none`. When recording completion, check only criteria and subtasks supported by evidence, apply required accepted-state wiki updates under their own approval rules, clear claim fields, set `done`, and perform rank removal and archival in the same validated transaction where maintenance requires it. If any criterion or subtask remains incomplete, do not mark the item done.

Move a ready Epic to `in-progress` when execution of a child begins. Complete an Epic only after every child is terminal, Epic acceptance is evidenced, and required wiki updates are complete.

## Cancellation

Cancellation always requires explicit owner approval and a concrete `cancelled_reason`. Present the rationale, relationship changes, rank removal, archive destination, and downstream effects together.

When the reason is duplication, point `duplicates` from the cancelled record to the surviving record. When another record replaces or supersedes it, identify that record with the applicable supported relationship and explain the replacement in the cancellation rationale or Relationships section; do not invent schema fields. Preserve other approved links when archival rules allow them.

Before cancelling an Epic, enumerate every unfinished child and obtain an explicit disposition for each: complete it, cancel it with its own rationale, or reparent it through a separately approved parent/scope transaction. Do not infer bulk child cancellation from approval to cancel the Epic.

## Archival

Archive terminal records promptly and update all affected indexes and links in the same transaction:

- move a done or cancelled standalone record to `archive/standalone/` immediately;
- leave a done or cancelled child in its active Epic directory, remove it from global rank, and retain it there until the Epic is terminal;
- archive a completed or cancelled Epic only by moving its entire directory to `archive/epics/` atomically after every retained child is done or cancelled;
- remove active index entries, add archive index entries, and reject any active link to the newly archived records.

Never split an Epic archive across commits or leave a terminal Epic active. Preserve IDs and historical relationships; never reuse archived IDs.

## Durable Transaction

For each approved mutation:

1. Restate the exact approved transaction and affected records. For gate-backed bookkeeping, state the gate and named work item instead of seeking repeated approval.
2. Edit all affected records, reciprocal links, indexes, and rank as one logical transaction. Do not include unrelated cleanup.
3. Run `node scripts/validate-project.mjs` after the mutation. Fix all errors and review warnings. If it cannot pass, do not commit and report the invalid transaction.
4. Inspect `git diff`, `git diff --cached`, and `git status`. Stage only the transaction's intended `docs/backlog` paths. Handle any separately approved accepted-state wiki update as its own validated workflow and commit. Never use broad staging commands.
5. Verify the staged path list and staged diff contain no unrelated files, secrets, working notes, or `docs/tasks` content.
6. Create one concise Conventional Commit, normally `docs(backlog): <transaction outcome>`. Keep temporary claims in their own transaction when practical.
7. Report the commit hash, changed records, resulting statuses and actionability, rank effects, and validation result.

If approval is denied or changed, revise the proposal in conversation without mutating files. If unrelated worktree changes overlap an affected file, preserve them and ask before proceeding when a safe narrow transaction is not possible.
