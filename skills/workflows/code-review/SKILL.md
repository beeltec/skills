---
name: code-review
description: Review changes since a fixed point on independent Standards and Spec axes via parallel sub-agents. Use for backlog-backed branch, PR, work-in-progress, or Epic-closure reviews.
---

# Code Review

Review the diff between `HEAD` and a user-supplied fixed point against two authorities, run as **parallel sub-agents**, and report them separately:

- **Standards** — conformance to accepted wiki engineering/architecture guidance and repository standards.
- **Spec** — implementation of the selected backlog work item's desired delta and acceptance criteria within its Epic context.

The wiki is accepted current state; the backlog is desired change and execution state. Neither authority replaces the other.

## Process

### 1. Pin the fixed point

Use whatever the user gave (SHA, branch, tag, `main`, `HEAD~5`); ask if unspecified. Resolve before authority discovery with `git rev-parse --verify <fixed-point>^{commit}` and `git merge-base <fixed-point> HEAD`; stop with an actionable error if either fails. Capture once:

- diff: `git diff <fixed-point>...HEAD` (three-dot, against the merge-base);
- commits: `git log <fixed-point>..HEAD --oneline`;
- changed paths: `git diff --name-only <fixed-point>...HEAD`.

If the diff is empty, report that and stop. Bad refs and empty diffs are handled here, never inside parallel reviews.

When the caller supplies the previous pass's reviewed commit and its findings, this invocation is a **delta review**: keep the same fixed point and the same authorities, capture `git diff <previous-reviewed-commit>...HEAD` as the reviewed diff, and carry the prior findings forward. An empty delta diff means nothing changed since that pass — report it and stop.

### 2. Read project governance

Resolve the repository root and read all applicable `AGENTS.md`, `CLAUDE.md`, and nested instructions. When the setup-project scaffold exists, also read `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/domains/ubiquitous-language.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, and the nearest relevant wiki and backlog indexes. Use project-local maintenance rules when stricter. Do not mutate the wiki, backlog, claims, or statuses during review.

### 3. Select the backlog work item

When the caller supplies an `EPIC-NNN` and explicitly requests an **Epic-scope review**, that Epic record is the Spec authority — outcome, criteria, scope, exclusions, constraints — and every child is context. Skip the rest of this step.

Otherwise select one executable `WORK-NNN` record as the Spec authority. Never infer desired behavior from a feature-named wiki page.

1. A user-supplied `WORK-NNN`, backlog path, or complete work-item contents wins over every discovered candidate. If an explicit Epic has several executable children and no Epic-scope review was requested, ask which one.
2. Otherwise inspect active records under `docs/backlog/epics/` and `docs/backlog/standalone/` (excluding templates, archived, and terminal records). Candidates need a live unexpired execution claim or an explicit branch link — the branch name or reviewed commit messages name the work ID, or the item's Execution/Provenance section names the exact current branch.
3. Use a discovered item only when the evidence identifies exactly one candidate; ignore expired claims. With several, list each with its evidence and ask. With none, ask for the ID or path — never guess from similar titles, changed paths, or wiki pages.

If no backlog item exists for the change, ask the user to confirm no specification is available; only after that explicit confirmation skip the Spec sub-agent and report `no spec available`. Missing or ambiguous work-item context is a visible review outcome, not a reason to pick a likely candidate.

### 4. Build the authority packet

When an invoking workflow supplies resolved packet paths and roles, accept them as the packet and read each named path; do not rediscover authorities from directory indexes. Discover only what it did not supply. On a delta review the packet is unchanged from the previous pass — reuse it.

Read every authority completely before starting either sub-agent:

- the selected work item: outcome/delta, acceptance criteria, relationships, wiki references, Research, Decisions, Execution, subtasks;
- its complete parent Epic when `parent` is not `none`: outcome, criteria, scope, exclusions, constraints, wiki references, research, execution context;
- on an Epic-scope review: the Epic record plus every child record in scope — each child's delta, criteria, and recorded review evidence — labelled already-reviewed context;
- every linked current-state wiki concept relevant to the change (via `wiki_refs` or the Epic) plus the nearest indexes needed for ownership;
- proposal-specific research in the item or Epic and directly linked local evidence;
- accepted guidance under `docs/wiki/engineering/` and `docs/wiki/architecture/`, and repository standard sources (instructions, `CONTRIBUTING.md`, `CODING_STANDARDS.md`);
- every applicable guidance page under `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` — one per technology and cross-cutting standard the diff touches, resolved from those directory indexes and the changed paths.

Record each source path and role. Current-state wiki facts describe the baseline and constraints; they cannot satisfy or erase a missing desired delta. The child item's delta, criteria, and exclusions are primary Spec authority; Epic context never expands or replaces child scope. On an Epic-scope review the Epic's own outcome and criteria are primary Spec authority and child scope is context; no child's scope expands the Epic's. Backlog scope never waives a repository or accepted wiki standard.

### 5. Prepare the Standards authority

Use all applicable accepted engineering/architecture wiki guidance and repository standards from step 4. Product current-state concepts and backlog requirements are context, not Standards rules.

The applicable guidance pages are hard Standards authority, at the strength each rule carries: a violated `Requirements` rule is a documented-standard violation citing the page path and the rule; a departure from `Recommendations` is a judgement call; `Conventions` bind as documented repository practice. A recorded `Deviations` entry overrides the upstream guidance it departs from, and a page's `Known gaps` entry means pre-existing non-compliance the diff need not fix — but new code inside a known gap still violates the rule. A page whose recorded installed version no longer matches the manifest is unreliable: report that staleness as a finding rather than enforcing its version-specific rules.

Standards also carries the **ADR check** when the wiki defines the significance test. Read the in-force ADRs under `docs/wiki/architecture/decisions/`, the significance test in `docs/wiki/maintenance.md`, and the work item's `decisions` field and `## Decisions` section. Report a finding when the diff makes a decision meeting that test and the record carries neither a drafted ADR covering it nor a recorded `none` explaining why none qualifies, and when the diff contradicts an in-force ADR without drafting its supersession. The significance test is a judgement call — label it as one, and never treat a missing ADR as a code defect.

On top of documented rules, Standards always carries the **smell baseline** in [references/smell-baseline.md](references/smell-baseline.md) — a fixed set of Fowler code smells, with its own binding rules, applying even when the repo documents nothing. Never load that file here: the Standards sub-agent reads it itself in step 6.

### 6. Spawn both sub-agents in parallel

Send one message with two `Agent` calls, both `general-purpose`.

**Standards sub-agent prompt:** the diff command and commit list; the Standards sources with paths and roles, naming each applicable guidance page and the rule-strength rules from step 5; the absolute path of `references/smell-baseline.md` beside this `SKILL.md`, instructing the sub-agent to read that file first and treat it as its smell authority; the ADR check inputs when present — the significance test text, the in-force ADRs, and the item's `decisions` field and `## Decisions` section, all pasted in; and the brief: "Read the smell-baseline file at the path given above before reviewing; if it cannot be read, say so in your report rather than reviewing without it. Review only the diff. Report every documented-standard violation by severity and file/hunk, citing the source path and exact rule. Separately report possible baseline smells by name, quoting the hunk. Separately report any unrecorded architecturally significant decision or contradicted in-force ADR, labelled as a judgement call and citing the significance test. Documented rules are hard authority; smells and the ADR check are judgement-call heuristics that an explicit documented rule overrides. Do not use backlog scope to waive a standard. Skip checks tooling already enforces. Under 400 words."

**Spec sub-agent prompt:** the diff command and commit list; the complete work item as primary authority, complete parent Epic as context, linked wiki concepts, and relevant proposal research, each labelled by role; and the brief: "Review only the diff. Report by severity: (a) missing or partial desired behavior or acceptance requirements; (b) incorrect implemented behavior; (c) scope creep. Cite the work-item path and exact requirement for every finding. Cite Epic constraints when relevant, but never expand or replace child scope with Epic scope. Use linked wiki facts only as baseline and constraints; never let existing behavior mask a missing delta. Do not treat a backlog request as permission to violate repository standards; leave that conflict visible for the Standards axis. Under 400 words."

For a delta review, add to both briefs the prior findings verbatim, the delta diff command, and: "State for each prior finding whether it is resolved, citing the hunk that resolves it. Report only new findings introduced by this delta; do not re-derive findings outside it."

For an Epic-scope review, add to the Spec brief: "The Epic outcome and criteria are primary authority; each child's already-passed review is context. Report by severity: (a) Epic criteria or outcome no child satisfies; (b) contradictions or gaps at the seams between children; (c) scope creep beyond the Epic. Cite the Epic path and exact criterion. Do not re-derive findings already reported and resolved per-child." And to the Standards brief: "Every hunk already passed a per-item Standards review. Prioritize violations and smells that appear only once the children are composed — duplication across children, divergent patterns for one concern, epic-wide drift. Re-report a per-item finding only when it is still live in the composed result."

If the user explicitly confirmed no specification exists, skip the Spec sub-agent and note it in the report. Otherwise missing or ambiguous context stops the review for user input before any sub-agent starts.

### 7. Aggregate

Present the two reports under `## Standards` and `## Spec`, verbatim or lightly cleaned. Keep severity labels and counts independent; never merge or rerank findings across axes. End with a one-line summary of each axis's total, severity breakdown, and worst issue. Do not pick a single winner.

Then add `Next step:` — one copy-pasteable command: actionable findings → fix them and rerun `/code-review` with the same fixed point and `WORK-NNN`; both axes pass inside an `$implement` run → continue its acceptance gate; both axes pass inside an Epic closure → continue its Epic archive transaction; both axes pass standalone → `/implement WORK-NNN` to proceed toward acceptance. Recommend only — never invoke it; make it the last line, or a numbered list in run order if several apply.
