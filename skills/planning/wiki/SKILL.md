---
name: wiki
description: Manage the complete lifecycle of accepted project knowledge in a setup-project OKF wiki, including discovery, creation, correction, organization, evidence, deprecation, deletion, audits, validation, and commits. Use for any read or mutation involving docs/wiki.
---

# Wiki

Manage `docs/wiki` as the canonical record of durable accepted current state on the primary branch. Treat `docs/backlog` as the system of record for desired deltas, proposal evidence, and execution history. Agreement, implementation on a work branch, or approval of a target specification does not make that target current.

Stay on the user's current Git branch. Never create, switch, merge, or delete branches as part of wiki management, including when the current branch is not the primary branch. Read [the bundled OKF 0.1 specification](references/okf-spec.md) completely before mutating a wiki. Apply stricter project-local maintenance rules when they do not conflict with the specification.

## Authority

The project owner controls accepted project meaning. Before adding, correcting, deprecating, deleting, or otherwise changing accepted knowledge:

1. Inspect the available evidence and existing knowledge.
2. Present the exact proposed meaning, canonical wording, owning concepts, conflicts, deletions, and affected pages.
3. Obtain explicit owner approval for that complete semantic transaction.

Treat a direct request as intent, not approval of the final transaction. Approval applies only to the exact proposal shown; do not infer it from a discussion, backlog approval, implementation approval, silence, or an earlier wording. Derived index, link, metadata, and log changes required to apply an approved semantic transaction do not need separate approval.

Strictly non-semantic maintenance requested by the user may proceed without a second approval gate after reporting the issue and intended repair. This includes formatting, metadata normalization, broken-link repair, and index coverage that preserve meaning. Ask when a structural operation could change ownership, emphasis, interpretation, or discoverability materially.

## Preflight

Before a mutation:

1. Resolve the project root and read all applicable `AGENTS.md`, `CLAUDE.md`, nested instructions, contributing guidance, and documentation standards.
2. Require the complete `$setup-project` scaffold: `.setup-project.json`, `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/log.md`, `docs/wiki/domains/ubiquitous-language.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, all four backlog templates, and `scripts/validate-project.mjs`. If any are missing, stop and direct the user to `$setup-project`; never improvise a wiki-only setup.
3. Run `node scripts/validate-project.mjs`. If the baseline is invalid, report it and stop unless the user explicitly changes the request to repairing that existing state.
4. Read the root index, maintenance rules, log, ubiquitous language, nearest relevant indexes, related concepts, and every page needed to detect duplicate ownership and inbound links.
5. Read relevant active and archived backlog records when they establish proposal state, acceptance, implementation history, research provenance, or references affected by a move or deletion.
6. Inspect repository code, tests, manifests, configuration, version evidence, current branch, primary branch, and worktree state needed to verify the candidate claims. Preserve unrelated changes and never stage them.

Read-only discovery, explanation, and audit requests may inspect an incomplete or invalid setup, but report its limits and do not mutate it. Recommend `$setup-project` when the governed scaffold is absent.

## Knowledge Eligibility

Classify every candidate statement before proposing a transaction:

- Include only durable facts, behavior, rules, decisions, runbooks, and guidance that already describe owner-accepted current state on the primary branch.
- Reject proposed features, target architecture, planned migrations, unimplemented acceptance criteria, work-branch-only behavior, active execution state, and proposal-specific research. Route those desired deltas and their evidence to `$backlog` even when their specification or implementation is approved.
- Reject unresolved questions, rejected alternatives, temporary observations, active checklists, implementation steps, session state, and claims whose current acceptance cannot be established.
- Verify discoverable facts rather than asking the owner to supply them. Surface contradictions and uncertainty before approval. Owner approval is the final acceptance decision, not proof that a future claim is current.

During gate-backed implementation reconciliation, the skill may inspect a reviewed work-branch outcome and prepare an exact conditional transaction for owner approval. Label it as pending primary-branch acceptance, do not mutate the wiki, and re-verify every claim after acceptance before applying the unchanged approved wording. If the accepted evidence requires different meaning, obtain revised approval.

Do not require every current-state correction to have a backlog record. Link an archived completed or cancelled record only when it adds useful implementation or decision history, label it as history rather than authority, and never copy its desired delta, acceptance criteria, proposal research, or execution narrative into the wiki.

## Discovery And Ownership

For read requests, traverse progressively from `docs/wiki/index.md` through the nearest indexes and canonical concepts. Answer from the wiki and repository evidence, distinguish accepted statements from inference, and report stale, conflicting, duplicated, or missing knowledge found during the read.

For mutations, update the existing canonical concept when it owns the subject. Otherwise create the narrowest cohesive concept under its durable responsibility:

- `architecture/` owns system-wide design, security, delivery, technology, and compatibility decisions.
- `engineering/` owns application-specific coding, testing, and review guidance.
- `engineering/technologies/` owns accepted version-applicable guidance for languages, frameworks, runtimes, libraries, and major tools.
- `domains/` owns product behavior, policies, contracts, controls, and agreed terminology.
- `operations/` owns repeatable operational and verification runbooks.
- `research/` owns compiled external evidence other than accepted technology guidance; durable conclusions remain in their owning concept.

Organize by durable responsibility, not conversation, task, branch, feature request, or agent. Keep one canonical statement of each fact or rule and replace duplicate prose with links.

## Evidence And Sources

For version-sensitive technology guidance or other externally verifiable claims, inspect exact repository versions and research current sources before proposing wording. Prefer version-matched official documentation, specifications, and repositories, then maintainer guidance, then reputable secondary sources. Open every source used; search-result snippets are not evidence.

Distinguish requirements, recommendations, and optional conventions. Preserve useful citations beside the claims they support and record review metadata when it adds value. Keep proposal-specific recommendations and uncertainty in the backlog; research here supports knowledge that is already current and accepted.

## Concept Lifecycle

- Give every concept non-empty `type`, `title`, `description`, ISO 8601 `timestamp`, and `status` frontmatter. Preserve unknown metadata. Add `tags`, `confidence`, `last_reviewed`, `resource`, and `sources` only when useful.
- Use `draft` only for incomplete documentation whose included statements are all accepted current state. Never use it to hold speculative or proposed claims.
- Use `active` for sufficiently complete current concepts.
- Use `deprecated` only while the deprecated subject remains part of current state and consumers need compatibility or migration guidance.
- Promote a draft or retire a deprecation when repository evidence supports the transition; changing accepted meaning still requires exact owner approval.
- Delete replaced concepts instead of creating new `superseded` pages. Git and archived backlog records preserve history. Delete erroneous, duplicate, and valueless content cleanly after approval.

Before a move or deletion, find every inbound wiki and backlog reference. Repair wiki links and indexes in the same transaction. If an active backlog record references the affected path, stop and require a separately approved `$backlog` transaction first. Archived backlog records may retain missing historical `wiki_refs`; validation reports those as warnings rather than rewriting history.

## Maintenance Operations

Audit and repair organization, frontmatter, canonical ownership, duplicate statements, length, indexes, links, citations, and log structure under project-local rules. Split or merge concepts when ownership, audience, lifecycle, source set, or reusable subject requires it. Never alter meaning under the label of maintenance.

Every affected nearest `index.md` must list each immediate concept and child directory with a one-sentence description. Prefer bundle-relative `/path.md` links within the wiki. Add useful contextual connections without manufacturing relationships.

Add a concise newest-first `docs/wiki/log.md` entry for concept creation, accepted correction, deprecation, deletion, and meaningful reorganization. Describe the knowledge change, not the editing session. Omit trivial formatting, metadata normalization, and link-repair noise.

## Durable Transaction

For each approved semantic mutation or authorized non-semantic repair:

1. Restate the authority basis and exact transaction. Keep separately approved semantic changes distinct when they do not form one coherent knowledge update.
2. Edit all affected concepts, indexes, links, metadata, and log entries as one logical transaction. Do not mutate backlog records or include unrelated cleanup.
3. Run `node scripts/validate-project.mjs`. Fix all errors and review every wiki and backlog warning. If validation cannot pass, do not commit the transaction.
4. Inspect `git diff`, `git diff --cached`, and `git status`. Stage only the intended `docs/wiki` paths and verify the staged path list and diff contain no unrelated changes, secrets, working notes, or backlog content.
5. Create one concise Conventional Commit: `docs(wiki): <transaction outcome>`.
6. Report the commit hash, authority or approval, changed and deleted concepts, structural effects, evidence and sources, warnings, and validation result.

If approval is denied or revised, update the proposal in conversation without mutating files. If unrelated changes overlap an affected wiki file and a safe narrow transaction is not possible, stop and ask how to proceed.
