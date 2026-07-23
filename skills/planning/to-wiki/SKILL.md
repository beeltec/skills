---
name: to-wiki
description: Preserve durable conclusions that already describe accepted current project state in a setup-project Open Knowledge Format wiki. Use when the user explicitly invokes $to-wiki or asks to correct or document accepted knowledge, not proposed or unimplemented desired state.
---

# To Wiki

Convert accepted current-state conclusions into maintainable project knowledge. Agreement that a change is desirable does not make its unimplemented target state current. Preserve the meaning of eligible source material while integrating it with the wiki's existing concepts. Read [the bundled OKF 0.1 specification](references/okf-spec.md) completely before editing a wiki. Treat it as the format authority and apply stricter project-local maintenance rules when they do not conflict with the specification.

Stay on the user's current Git branch. Never create, switch, merge, or delete branches for wiki updates, including when the current branch is not the primary branch.

## Workflow

1. Resolve the project root and read applicable agent instructions.
2. Require the complete relevant `$setup-project` scaffold: `.setup-project.json`, `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, and `scripts/validate-project.mjs`. If any are missing, stop and direct the user to run `$setup-project`; do not improvise a wiki-only setup.
3. Run `node scripts/validate-project.mjs` before editing. If the baseline is invalid, report it and stop unless the user explicitly asks to repair that existing project state.
4. Read the source material, wiki root index, maintenance rules, log, ubiquitous language, nearest relevant indexes, and related concept pages. Read relevant active or archived backlog records when they establish whether a conclusion is proposed, implemented, accepted, superseded, or historically traceable.
5. Classify every candidate conclusion before editing:
   - Include only facts, rules, decisions, and guidance that already describe accepted current state on the primary branch and remain useful beyond the current task.
   - Reject proposed features, planned migrations, target architecture, unimplemented acceptance criteria, active execution state, and proposal-specific research. Direct those desired deltas to `$backlog`, even when the owner approved the proposal or the specification is complete.
   - Reject unresolved questions and conclusions whose implementation or acceptance cannot be established. Preserve them in the relevant backlog record instead of converting uncertainty into accepted knowledge.
6. Extract only eligible durable conclusions. Exclude discussion history, rejected alternatives, temporary observations, active checklists, implementation steps, and session state.
7. Choose the canonical owner for each conclusion:
   - `architecture/` for system-wide design, security, delivery, technology, and compatibility decisions.
   - `engineering/` for application-specific coding, testing, and review rules. Store curated web-fetched language, framework, runtime, library, and tool guidance by technology under `engineering/technologies/`.
   - `domains/` for product behavior, policies, contracts, and domain rules.
   - `operations/` for repeatable operational and verification runbooks.
   - `research/` for compiled external evidence other than technology guidance; place the durable conclusion in its owning concept and link back to the evidence.
8. Update an existing concept when it already owns the subject. Otherwise, create a focused concept under the narrowest durable responsibility. Never organize pages by conversation, task, branch, feature request, or agent.
9. Keep one canonical statement of each fact or rule. Replace duplicate prose elsewhere with links. If an accepted conclusion conflicts with existing knowledge, do not silently erase the conflict: update the canonical page, mark replaced concepts `superseded` when appropriate, and connect both pages.
10. Give new concept pages valid frontmatter with non-empty `type`, `title`, `description`, ISO 8601 `timestamp`, and `status`. Add `tags`, `confidence`, `last_reviewed`, and bundle-relative `sources` only when they add value.
11. Link accepted knowledge to a relevant backlog record only when the record provides useful implementation or decision history. Prefer a completed or cancelled archived record, label the link as history rather than authority, and do not copy its desired delta, acceptance criteria, research, or execution narrative into the wiki. Omit the link when the canonical statement is sufficient by itself.
12. Update every affected nearest `index.md` with links and one-sentence descriptions. Repair inbound links and add useful `Connections` links on concept pages.
13. Add a concise, newest-first entry to `docs/wiki/log.md` under today's `YYYY-MM-DD` heading. Describe the knowledge changed, not the editing session.
14. Run `node scripts/validate-project.mjs`. Fix all errors, review warnings from both wiki and backlog validation, and inspect the final diff.
15. After validation, stage only this workflow's intended wiki changes and create a Conventional Commit: `docs(wiki): <concise summary>`. Report its hash, the changed pages, and the validation result. Do not stage backlog records read for context.

## Writing Rules

- State the current conclusion directly; do not narrate how the discussion arrived there unless the rationale remains necessary for future decisions.
- Preserve uncertainty honestly. Do not convert an unresolved question, desired target, or inference into an accepted rule.
- Use concise headings, standard Markdown links, and bundle-relative `/path.md` links inside the wiki.
- Follow the wiki's local maintenance and length rules. Split concepts before they mix different owners, audiences, lifecycles, or reusable subjects.
- Do not create backlog or implementation artifacts. The wiki records accepted current state; `$backlog` owns proposed desired changes and their evidence.
