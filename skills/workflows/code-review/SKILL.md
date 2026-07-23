---
name: code-review
description: Review changes since a fixed point on two independent axes — Standards (accepted wiki and repository rules) and Spec (the selected backlog work item's desired delta and acceptance criteria) — via parallel sub-agents reported separately. Use for backlog-backed branch, PR, or work-in-progress reviews.
---

# Code Review

Review the diff between `HEAD` and a user-supplied fixed point against two authorities, run as **parallel sub-agents** so they do not pollute each other's context, and report them separately:

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

### 2. Read project governance

Resolve the repository root and read all applicable `AGENTS.md`, `CLAUDE.md`, and nested instructions. When the setup-project scaffold exists, also read `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/wiki/domains/ubiquitous-language.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, and the nearest relevant wiki and backlog indexes. Use project-local maintenance rules when stricter. Do not mutate the wiki, backlog, claims, or statuses during review.

### 3. Select the backlog work item

Select one executable `WORK-NNN` record as the Spec authority. Never infer desired behavior from a feature-named wiki page.

1. A user-supplied `WORK-NNN`, backlog path, or complete work-item contents wins over every discovered candidate. If an explicit Epic has several executable children, ask which one.
2. Otherwise inspect active records under `docs/backlog/epics/` and `docs/backlog/standalone/` (excluding templates, archived, and terminal records). Candidates need a live unexpired execution claim or an explicit branch link — the branch name or reviewed commit messages name the work ID, or the item's Execution/Provenance section names the exact current branch.
3. Use a discovered item only when the evidence identifies exactly one candidate; ignore expired claims. With several, list each with its evidence and ask. With none, ask for the ID or path — never guess from similar titles, changed paths, or wiki pages.

If no backlog item exists for the change, ask the user to confirm no specification is available; only after that explicit confirmation skip the Spec sub-agent and report `no spec available`. Missing or ambiguous work-item context is a visible review outcome, not a reason to pick a likely candidate.

### 4. Build the authority packet

Read every authority completely before starting either sub-agent:

- the selected work item: outcome/delta, acceptance criteria, relationships, wiki references, Research, Execution, subtasks;
- its complete parent Epic when `parent` is not `none`: outcome, criteria, scope, exclusions, constraints, wiki references, research, execution context;
- every linked current-state wiki concept relevant to the change (via `wiki_refs` or the Epic) plus the nearest indexes needed for ownership;
- proposal-specific research in the item or Epic and directly linked local evidence;
- accepted guidance under `docs/wiki/engineering/` and `docs/wiki/architecture/`, and repository standard sources (instructions, `CONTRIBUTING.md`, `CODING_STANDARDS.md`).

Record each source path and role. Current-state wiki facts describe the baseline and constraints; they cannot satisfy or erase a missing desired delta. The child item's delta, criteria, and exclusions are primary Spec authority; Epic context never expands or replaces child scope. Backlog scope never waives a repository or accepted wiki standard.

### 5. Prepare the Standards authority

Use all applicable accepted engineering/architecture wiki guidance and repository standards from step 4. Product current-state concepts and backlog requirements are context, not Standards rules.

On top of documented rules, Standards always carries this **smell baseline** — a fixed set of Fowler code smells (_Refactoring_, ch.3) applying even when the repo documents nothing. Two binding rules: **a documented repo standard always overrides** (suppress a smell it endorses), and **every smell is a labelled judgement-call heuristic** ("possible Feature Envy"), never a hard violation; skip anything tooling already enforces.

- **Mysterious Name** — name doesn't reveal purpose → rename; if no honest name comes, the design's murky.
- **Duplicated Code** — same logic shape in multiple hunks/files → extract and share.
- **Feature Envy** — method uses another object's data more than its own → move it to that data.
- **Data Clumps** — the same fields/params travel together → bundle into one type.
- **Primitive Obsession** — primitive standing in for a domain concept → give it a small type.
- **Repeated Switches** — same `switch`/`if`-cascade on the same type recurs → polymorphism or one shared map.
- **Shotgun Surgery** — one logical change scattered across many files → gather into one module.
- **Divergent Change** — one module edited for unrelated reasons → split per reason.
- **Speculative Generality** — abstraction for needs the spec doesn't have → delete/inline until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation → hide behind one method on the first object.
- **Middle Man** — mostly delegates onward → cut it, call the target directly.
- **Refused Bequest** — implementer ignores most of what it inherits → composition over inheritance.

### 6. Spawn both sub-agents in parallel

Send one message with two `Agent` calls, both `general-purpose`.

**Standards sub-agent prompt:** the diff command and commit list; the Standards sources with paths and roles; the full smell baseline pasted in (the sub-agent has no other access to it); and the brief: "Review only the diff. Report every documented-standard violation by severity and file/hunk, citing the source path and exact rule. Separately report possible baseline smells by name, quoting the hunk. Documented rules are hard authority; smells are judgement-call heuristics that an explicit documented rule overrides. Do not use backlog scope to waive a standard. Skip checks tooling already enforces. Under 400 words."

**Spec sub-agent prompt:** the diff command and commit list; the complete work item as primary authority, complete parent Epic as context, linked wiki concepts, and relevant proposal research, each labelled by role; and the brief: "Review only the diff. Report by severity: (a) missing or partial desired behavior or acceptance requirements; (b) incorrect implemented behavior; (c) scope creep. Cite the work-item path and exact requirement for every finding. Cite Epic constraints when relevant, but never expand or replace child scope with Epic scope. Use linked wiki facts only as baseline and constraints; never let existing behavior mask a missing delta. Do not treat a backlog request as permission to violate repository standards; leave that conflict visible for the Standards axis. Under 400 words."

If the user explicitly confirmed no specification exists, skip the Spec sub-agent and note it in the report. Otherwise missing or ambiguous context stops the review for user input before any sub-agent starts.

### 7. Aggregate

Present the two reports under `## Standards` and `## Spec`, verbatim or lightly cleaned. Keep severity labels and counts independent; never merge or rerank findings across axes. End with a one-line summary of each axis's total, severity breakdown, and worst issue. Do not pick a single winner.

## Why two axes

Code can follow every standard yet implement the wrong delta (Standards pass, Spec fail), or implement the item exactly while breaking a convention (Spec pass, Standards fail). Separate reporting stops one axis from masking the other.
