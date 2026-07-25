---
name: wiki
description: Manage the complete lifecycle of accepted project knowledge in a setup-project OKF wiki — discovery, creation, correction, organization, evidence, deprecation, deletion, audits, validation, and commits. Use for any read or mutation involving docs/wiki.
---

# Wiki

`docs/wiki` is the canonical record of durable accepted current state on the primary branch; `docs/backlog` is the system of record for desired deltas, proposal evidence, and execution history. Agreement, work-branch implementation, or approval of a target specification does not make that target current.

Stay on the user's current Git branch — never create, switch, merge, or delete branches, even off the primary branch. Read [the bundled OKF 0.1 specification](references/okf-spec.md) completely before mutating a wiki. Apply stricter project-local maintenance rules when they do not conflict with it.

## Authority

The project owner controls accepted project meaning. Before changing accepted knowledge: inspect the evidence and existing knowledge; present the exact proposed meaning, canonical wording, owning concepts, conflicts, deletions, and affected pages; obtain explicit owner approval for that complete semantic transaction.

A direct request is intent, not approval of the final transaction. Approval covers only the exact proposal shown — never infer it from discussion, backlog or implementation approval, silence, or earlier wording. Derived index, link, metadata, and log changes needed to apply an approved transaction need no separate approval.

Strictly non-semantic maintenance the user requested (formatting, metadata normalization, broken-link repair, meaning-preserving index coverage) may proceed after reporting the issue and intended repair. Ask when a structural operation could materially change ownership, emphasis, interpretation, or discoverability.

## Preflight

Before a mutation:

1. Resolve the project root; read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, contributing guidance, and documentation standards.
2. Require the complete `$setup-project` scaffold: `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/log.md`, `docs/wiki/architecture/decisions/index.md`, `docs/wiki/domains/ubiquitous-language.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, all four backlog templates, and `scripts/validate-project.mjs`. If any is missing, stop and direct the user to `$setup-project`; never improvise a wiki-only setup.
3. Run `node scripts/validate-project.mjs`. On an invalid baseline, report and stop unless the user explicitly changes the request to repairing that state.
4. Read the root index, maintenance rules, log, ubiquitous language, nearest relevant indexes, related concepts, and every page needed to detect duplicate ownership and inbound links.
5. Read relevant active and archived backlog records when they establish proposal state, acceptance, implementation history, research provenance, or references affected by a move or deletion.
6. Inspect repository code, tests, manifests, configuration, version evidence, branches, and worktree state needed to verify the candidate claims. Preserve unrelated changes; never stage them.

Read-only discovery, explanation, and audits may inspect an incomplete or invalid setup — report its limits, mutate nothing, and recommend `$setup-project` when the scaffold is absent.

## Knowledge Eligibility

Classify every candidate statement before proposing a transaction:

- Include only durable facts, behavior, rules, decisions, runbooks, and guidance already describing owner-accepted current state on the primary branch.
- Reject proposed features, target architecture, planned migrations, unimplemented acceptance criteria, work-branch-only behavior, active execution state, and proposal-specific research — route them to `$backlog` even when approved.
- Reject unresolved questions, temporary observations, active checklists, implementation steps, session state, and claims whose current acceptance cannot be established. Rejected alternatives are admissible: the reasoning behind a decision already in force is durable knowledge, and an ADR records it under `## Alternatives considered`.
- Verify discoverable facts rather than asking the owner. Surface contradictions and uncertainty before approval; owner approval is acceptance, not proof that a future claim is current.

During gate-backed implementation reconciliation, the skill may inspect a reviewed work-branch outcome and prepare an exact conditional transaction for owner approval. Label it pending primary-branch acceptance, mutate nothing, and re-verify every claim after acceptance before applying the unchanged approved wording; if evidence requires different meaning, obtain revised approval.

Current-state corrections need no backlog record. Link an archived record only when it adds useful history, label it history rather than authority, and never copy its desired delta, criteria, research, or execution narrative into the wiki.

## Discovery And Ownership

For reads, traverse progressively from `docs/wiki/index.md` through the nearest indexes and canonical concepts. Answer from wiki and repository evidence, distinguish accepted statements from inference, and report stale, conflicting, duplicated, or missing knowledge found.

For mutations, update the existing canonical concept when it owns the subject; otherwise create the narrowest cohesive concept under its durable responsibility:

- `architecture/` — system-wide design, security, delivery, technology, and compatibility decisions.
- `architecture/decisions/` — ADRs, one per architecturally significant decision. Never fold an ADR into a broader concept page, and never restate a decision's rationale outside its ADR.
- `engineering/` — application-specific coding, testing, and review guidance.
- `engineering/technologies/` — accepted version-applicable guidance for languages, frameworks, runtimes, libraries, major tools.
- `domains/` — product behavior, policies, contracts, controls, agreed terminology.
- `operations/` — repeatable operational and verification runbooks.
- `research/` — compiled external evidence other than accepted technology guidance; durable conclusions stay in their owning concept.

Organize by durable responsibility, never by conversation, task, branch, feature request, or agent. Keep one canonical statement per fact or rule; replace duplicate prose with links.

## Evidence And Sources

For version-sensitive or externally verifiable claims, inspect exact repository versions and research current sources before proposing wording. Prefer version-matched official documentation, specifications, and repositories, then maintainer guidance, then reputable secondary sources. Open every source used — snippets are not evidence.

Distinguish requirements, recommendations, and optional conventions. Keep useful citations beside their claims and record review metadata when valuable. Proposal-specific recommendations and uncertainty stay in the backlog; research here supports knowledge that is already current and accepted.

## Concept Lifecycle

- Every concept has non-empty `type`, `title`, `description`, ISO 8601 `timestamp`, and `status` frontmatter. Preserve unknown metadata; add `tags`, `confidence`, `last_reviewed`, `resource`, `sources` only when useful.
- `draft` — incomplete documentation whose statements are all accepted current state; never a holder for speculative claims. `active` — sufficiently complete. `deprecated` — only while the subject remains part of current state and consumers need compatibility or migration guidance.
- Promote or retire when repository evidence supports it; changing accepted meaning still requires exact owner approval.
- Delete replaced, erroneous, duplicate, and valueless concepts cleanly after approval instead of creating `superseded` pages — Git and archived backlog records preserve history. ADRs are the sole exception and are never deleted for being replaced.

## Architecture Decision Records

An ADR is a `type: Decision` concept under `architecture/decisions/`. Follow the project's `docs/wiki/maintenance.md` for the significance test, required frontmatter and sections, and index placement. Beyond the general lifecycle:

- Allocate `id` at publication, never at draft time: scan every existing ADR and take the next unused `ADR-NNN`. IDs are immutable and never reused. The filename is `adr-NNN-short-slug.md`.
- Publish a decision only once it is accepted current state — after primary-branch acceptance of the work that made it, or after inspection establishes it was already in force. A proposed decision stays on its backlog record under `decisions:` and `## Decisions`.
- Supersede in place: set the replaced ADR to `status: superseded` with `superseded_by`, set the replacement's `supersedes`, move neither file, and update `decisions/index.md` so the replaced entry leaves the in-force section. Both directions are required, and superseding is one semantic transaction requiring its own explicit owner approval — it changes which decision governs.
- Never rewrite a superseded ADR's Context, Decision, Alternatives considered, or Consequences. Correct a factual error in an `active` ADR; record a change of mind as a new ADR.
- Record ADR creation and supersession in `log.md`.
- `status: superseded` is valid for no other concept type.

Before a move or deletion, find every inbound wiki and backlog reference; repair wiki links and indexes in the same transaction. If an active backlog record references the affected path, stop and require a separately approved `$backlog` transaction first. Archived records may keep missing historical `wiki_refs`; validation reports those as warnings.

## Maintenance Operations

Audit and repair organization, frontmatter, canonical ownership, duplicates, length, indexes, links, citations, and log structure under project-local rules. Split or merge concepts when ownership, audience, lifecycle, source set, or reusable subject requires it. Never alter meaning under the label of maintenance.

Every affected nearest `index.md` lists each immediate concept and child directory with a one-sentence description. Prefer bundle-relative `/path.md` links inside the wiki. Add useful connections without manufacturing relationships.

Add a concise newest-first `docs/wiki/log.md` entry for concept creation, accepted correction, deprecation, deletion, and meaningful reorganization — describing the knowledge change, not the editing session. Omit formatting, metadata, and link-repair noise.

## Durable Transaction

For each approved semantic mutation or authorized non-semantic repair:

1. Restate the authority basis and exact transaction; keep separately approved semantic changes distinct unless they form one coherent update.
2. Edit all affected concepts, indexes, links, metadata, and log entries as one logical transaction. Do not mutate backlog records or include unrelated cleanup.
3. Run `node scripts/validate-project.mjs`; fix all errors and review every warning. If validation cannot pass, do not commit.
4. Inspect `git diff`, `git diff --cached`, and `git status`. Stage only the intended `docs/wiki` paths; verify no unrelated changes, secrets, notes, or backlog content.
5. One concise Conventional Commit: `docs(wiki): <transaction outcome>`.
6. Report the commit hash, authority/approval, changed and deleted concepts, structural effects, evidence and sources, warnings, and validation result. End with `Next step:` — one exact command the transaction implies (e.g. rejected desired-change content → `/to-backlog` naming it); recommend only, omit when none follows. The command must be the report's last line — nothing after it; if several must run in order, end with them as a numbered list in run order.

If approval is denied or revised, update the proposal in conversation without mutating files. If unrelated changes overlap an affected wiki file and a safe narrow transaction is not possible, stop and ask.
