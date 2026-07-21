---
name: to-wiki
description: Turn confirmed conclusions from a conversation or specification into durable, canonical project knowledge in an existing Open Knowledge Format wiki. Use when the user explicitly invokes $to-wiki or asks to preserve an agreed understanding, decision, constraint, policy, or researched conclusion in docs/wiki.
---

# To Wiki

Convert agreed conclusions into maintainable project knowledge. Preserve the
meaning of the source while integrating it with the wiki's existing concepts.
Read [the bundled OKF 0.1 specification](references/okf-spec.md) completely
before editing a wiki. Treat it as the format authority and apply stricter
project-local maintenance rules when they do not conflict with the specification.
The bundled copy comes from the [GoogleCloudPlatform knowledge-catalog source](https://raw.githubusercontent.com/GoogleCloudPlatform/knowledge-catalog/refs/heads/main/okf/SPEC.md).

## Workflow

1. Resolve the project root and read applicable agent instructions.
2. Require `docs/wiki/index.md` and `docs/wiki/maintenance.md`. If either is
   missing, stop and direct the user to run `$setup-wiki` first.
3. Read the source material, the wiki root index, maintenance rules, log, the
   nearest relevant indexes, and related concept pages before editing.
4. Extract only conclusions that are confirmed, durable, and useful beyond the
   current task. Exclude discussion history, rejected alternatives, temporary
   observations, active checklists, implementation steps, and session state.
5. Choose the canonical owner for each conclusion:
   - `architecture/` for system-wide design, security, delivery, technology,
     and compatibility decisions.
   - `engineering/` for application-specific coding, testing, and review rules.
   - `domains/` for product behavior, policies, contracts, and domain rules.
   - `operations/` for repeatable operational and verification runbooks.
   - `research/` for compiled external evidence; place the durable conclusion
     in its owning concept and link back to the evidence.
6. Update an existing concept when it already owns the subject. Otherwise,
   create a focused concept under the narrowest durable responsibility. Never
   organize pages by conversation, task, branch, feature request, or agent.
7. Keep one canonical statement of each fact or rule. Replace duplicate prose
   elsewhere with links. If a confirmed conclusion conflicts with existing
   knowledge, do not silently erase the conflict: update the canonical page,
   mark replaced concepts `superseded` when appropriate, and connect both pages.
8. Give new concept pages valid frontmatter with non-empty `type`, `title`,
   `description`, ISO 8601 `timestamp`, and `status`. Add `tags`, `confidence`,
   `last_reviewed`, and bundle-relative `sources` only when they add value.
9. Update every affected nearest `index.md` with links and one-sentence
   descriptions. Repair inbound links and add useful `Connections` links on
   concept pages.
10. Add a concise, newest-first entry to `docs/wiki/log.md` under today's
    `YYYY-MM-DD` heading. Describe the knowledge changed, not the editing session.
11. Run `node scripts/validate-wiki.mjs` or the repository's documented wiki
    check. Fix all errors, review warnings, inspect the final diff, and report
    the pages created or updated plus the validation result.

## Writing Rules

- State the current conclusion directly; do not narrate how the discussion
  arrived there unless the rationale remains necessary for future decisions.
- Preserve uncertainty honestly. Do not convert an unresolved question or
  inference into an accepted rule.
- Use concise headings, standard Markdown links, and bundle-relative `/path.md`
  links inside the wiki.
- Follow the wiki's local maintenance and length rules. Split concepts before
  they mix different owners, audiences, lifecycles, or reusable subjects.
- Do not create tasks, commits, or implementation artifacts. Wiki output is the
  durable specification that `$to-tasks` can reference next.
