---
name: code-review
description: Review changes since a fixed point against accepted wiki and repository standards plus the active backlog work item's desired delta and acceptance criteria. Runs independent Standards and Spec reviews in parallel and reports them separately. Use for backlog-backed branch, PR, or work-in-progress reviews.
---

Review the diff between `HEAD` and a user-supplied fixed point against two distinct authorities:

- **Standards** — does the change conform to accepted wiki engineering and architecture guidance plus repository standards?
- **Spec** — does the change implement the selected backlog work item's desired delta and acceptance criteria within its Epic context?

Run both axes as **parallel sub-agents** so they do not pollute each other's context, then aggregate without merging their findings. The wiki remains accepted current state; the backlog remains desired change and execution state. Neither authority replaces the other.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they did not specify one, ask for it.

Resolve it before doing any authority discovery. Use `git rev-parse --verify <fixed-point>^{commit}` and `git merge-base <fixed-point> HEAD`; stop with an actionable error if either fails. Capture the review inputs once:

- diff: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base);
- commits: `git log <fixed-point>..HEAD --oneline`;
- changed paths: `git diff --name-only <fixed-point>...HEAD`.

Confirm the diff is non-empty. If it is empty, report that there are no changes to review and stop before starting sub-agents. A bad ref or empty diff must be handled here, not inside parallel reviews.

### 2. Read project governance

Resolve the repository root and read all applicable `AGENTS.md`, `CLAUDE.md`, and nested instructions. When the setup-project scaffold exists, read these files before selecting authority:

- `docs/wiki/index.md` and `docs/wiki/maintenance.md`;
- `docs/wiki/domains/ubiquitous-language.md`;
- `docs/backlog/index.md` and `docs/backlog/maintenance.md`;
- the nearest relevant wiki and backlog indexes.

Use project-local maintenance rules when they are stricter. Do not mutate the wiki, backlog, claims, or statuses during review.

### 3. Select the backlog work item

Select one executable `WORK-NNN` record as the Spec authority. Never infer desired behavior from a feature-named wiki page.

1. If the user supplied a `WORK-NNN`, backlog path, or complete work-item contents, resolve and use that item. Explicit selection wins over every discovered candidate. If an explicit Epic has several executable children, ask which child is being reviewed.
2. Otherwise inspect active work records under `docs/backlog/epics/` and `docs/backlog/standalone/`; exclude templates, archived records, and terminal records. Collect candidates supported by either a live, unexpired execution claim or an explicit branch link. A branch link exists when the current branch name or reviewed commit messages name the work ID, or the work item's Execution or Provenance section names the exact current branch.
3. Select a discovered item only when the combined evidence identifies exactly one candidate. Ignore expired claims. If several candidates remain, list each candidate and its claim/branch evidence and ask the user to choose. If none remain, ask for the work-item ID or path rather than guessing from similar titles, changed paths, or wiki pages.

If the project has no backlog work item for the change, ask the user to confirm that no specification is available. Only after that explicit confirmation skip the Spec sub-agent and report `no spec available`. Missing or ambiguous work-item context is a visible review outcome, not a reason to choose a likely candidate.

### 4. Build the authority packet

Read every authority completely before starting either sub-agent:

- the selected work item, including its Outcome / delta, Acceptance criteria, relationships, wiki references, Research, Execution, and subtasks;
- its complete parent Epic when `parent` is not `none`, including Epic outcome, acceptance criteria, scope, exclusions, constraints, wiki references, research, and execution context;
- every linked current-state wiki concept relevant to the change, reached through `wiki_refs` or the Epic, plus the nearest indexes needed to understand ownership;
- proposal-specific research in the work item or Epic and any directly linked local research evidence;
- applicable accepted guidance under `docs/wiki/engineering/` and `docs/wiki/architecture/`, and repository standard sources such as instructions, `CONTRIBUTING.md`, or `CODING_STANDARDS.md`.

Record each source path and its authority role. Do not require or search for a wiki page named after the feature. Current-state wiki facts describe the baseline and constraints; they cannot satisfy or erase a missing desired delta. The selected child work item's desired delta, acceptance criteria, and explicit exclusions are primary Spec authority. Epic outcomes and constraints provide context but do not expand or replace child scope. Backlog scope never waives an explicit repository or accepted wiki standard.

### 5. Prepare the Standards authority

Use all applicable accepted engineering and architecture wiki guidance and repository standards found in step 4. Product current-state concepts and backlog requirements are context, not Standards rules.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 6. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The accepted wiki and repository Standards sources from the authority packet, with their paths and roles, **plus the smell baseline from step 5** pasted in full — the sub-agent has no other access to it.
- The brief: "Review only the diff. Report every documented-standard violation by severity and file/hunk, citing the accepted wiki or repository source path and exact rule. Separately report possible baseline smells by name and quote the hunk. Documented rules are hard authority; baseline smells are judgement-call heuristics, and an explicit repository or accepted wiki rule overrides a heuristic. Do not use backlog scope to waive a standard. Skip checks tooling already enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The complete selected work item as primary authority, complete parent Epic as context when present, linked current-state wiki concepts, and relevant proposal research from the authority packet. Label each source's role.
- The brief: "Review only the diff. Report by severity: (a) desired behavior or acceptance requirements that are missing or partial; (b) implemented behavior that is incorrect; and (c) scope creep. Cite the work-item path and exact requirement for every finding. Cite relevant Epic constraints when they affect a finding, but do not replace or expand child scope with Epic scope. Use linked wiki facts only as the current-state baseline and constraints; never let existing behavior mask a missing desired delta. Do not treat a backlog request as permission to violate repository standards; leave that conflict visible for the separate Standards axis. Under 400 words."

If the user explicitly confirmed that no work-item specification exists, skip the Spec sub-agent and note this in the final report. Otherwise missing or ambiguous context must stop the review for user input before any sub-agent starts.

### 7. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Keep severity labels and finding counts independent. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary containing each axis's total, severity breakdown, and worst issue within that axis, if any. Do not pick a single winner across axes.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong delta → **Standards pass, Spec fail.**
- Code that exactly implements the work item but breaks an accepted convention → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
