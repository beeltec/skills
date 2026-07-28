---
name: code-review
description: Review changes since a fixed point on Standards and Spec axes with risk-tiered agents. Use for backlog-backed branches, PRs, work in progress, or Epic closure.
---

# Code Review

Review the diff from a user-supplied fixed point against:

- **Standards** — accepted engineering/architecture guidance and repository standards.
- **Spec** — the selected backlog item's desired delta and acceptance criteria within Epic context.

Use one combined reviewer by default. Use independent parallel Standards and Spec reviewers only for security/authentication, destructive migration or credible data-loss risk, or public API compatibility. The wiki is accepted current state; the backlog is desired change.

When split review applies, invoke `$parallel-execution` with two read-only judgement units. This context owns authority resolution, synthesis, findings, and the handoff. A combined review uses one reviewer without loading the shared scheduler.

Under a depth-one provisional worker, never spawn: execute the selected brief or briefs locally, sequence split axes, and report the missing parallel capacity.

## Process

### 1. Pin the fixed point

Use whatever the user gave (SHA, branch, tag, `main`, `HEAD~5`); ask if unspecified. Resolve before authority discovery with `git rev-parse --verify <fixed-point>^{commit}` and `git merge-base <fixed-point> HEAD`; stop with an actionable error if either fails. Capture once:

- diff: `git diff <fixed-point>...HEAD` (three-dot, against the merge-base);
- commits: `git log <fixed-point>..HEAD --oneline`;
- changed paths: `git diff --name-only <fixed-point>...HEAD`.

If the diff is empty, report that and stop. Bad refs and empty diffs are handled here, never inside parallel reviews.

### 2. Read project governance

Resolve the repository root and read all applicable `AGENTS.md`, `CLAUDE.md`, and nested instructions. When the setup-project scaffold exists, also read `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, and the nearest relevant wiki and backlog indexes. Use project-local maintenance rules when stricter. Do not mutate the wiki, backlog, claims, or statuses during review.

### 3. Select the backlog work item

When the caller requests an **Epic-scope review**, the Epic is primary Spec authority and every child is context. This is the normal comprehensive review boundary.

Otherwise select one `WORK-NNN`:

1. A supplied ID, path, or complete record wins. A provisional child inside an active Epic acceptance unit is invalid and returns control to the caller; review the composed Epic once instead. A `WORK-NNN` invoked as its own acceptance unit receives its one standalone review.
2. Otherwise inspect active records for exactly one live claim or exact branch/commit link. Ignore terminal records and expired claims; ask when none or several qualify.
3. A standalone item is its own comprehensive review boundary. An Epic child remains provisional and never gains acceptance from this review.

With no backlog item, require explicit confirmation that no Spec exists, then review Standards only.

### 4. Build the authority packet

When an invoking workflow supplies resolved packet paths and roles, accept them as the packet; do not rediscover authorities from directory indexes, and do not re-read a path whose content that caller already read in this invocation chain under its freshness rule. Discover and read only what it did not supply.

Have every authority read — by the caller or here — before starting either sub-agent:

- the selected work item: outcome/delta, acceptance criteria, relationships, wiki references, Research, Decisions, Execution, subtasks;
- its complete parent Epic when `parent` is not `none`: outcome, criteria, scope, exclusions, constraints, wiki references, research, execution context;
- on Epic-scope review: the Epic plus every child record — each delta and criteria labelled child context;
- every linked current-state wiki concept relevant to the change (via `wiki_refs` or the Epic) plus the nearest indexes needed for ownership;
- proposal-specific research in the item or Epic and directly linked local evidence;
- accepted guidance under `docs/wiki/engineering/` and `docs/wiki/architecture/`, and repository standard sources (instructions, `CONTRIBUTING.md`, `CODING_STANDARDS.md`);
- every applicable guidance page under `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` — one per technology and cross-cutting standard the diff touches, resolved from those directory indexes and the changed paths.

Record each source path and role. Current-state wiki facts describe the baseline and constraints; they cannot satisfy or erase a missing desired delta. The child item's delta, criteria, and exclusions are primary Spec authority; Epic context never expands or replaces child scope. On an Epic-scope review the Epic's own outcome and criteria are primary Spec authority and child scope is context; no child's scope expands the Epic's. Backlog scope never waives a repository or accepted wiki standard.
### 5. Select review mode

Use two parallel reviewers only when the reviewed delta involves security/authentication, destructive migration or credible data-loss risk, or public API compatibility. Compatibility requires a changed or removed existing contract or another plausible consumer break; a purely additive export does not trigger it. Privacy wording, ordinary persistence, concurrency, build/release infrastructure, and ADR significance alone do not trigger split review. Otherwise use one combined reviewer. Record the concrete trigger or `combined default`.

### 6. Prepare the Standards authority

Use all applicable accepted engineering/architecture wiki guidance and repository standards from step 4. Product current-state concepts and backlog requirements are context, not Standards rules.

The applicable guidance pages are hard Standards authority at the strength each rule carries per `docs/wiki/maintenance.md § Adopted guidance`: a violated `Requirements` rule is a documented-standard violation citing the page path and rule; a `Recommendations` departure is a judgement call; `Conventions` bind as documented practice. A recorded `Deviations` entry overrides the upstream guidance it departs from; new code inside a `Known gaps` area still violates the rule. A page whose recorded installed version no longer matches the manifest is unreliable: report the staleness as a finding rather than enforcing its version-specific rules.

Standards also carries the **ADR check** when the wiki defines the significance test. Read the ADR index at `docs/wiki/architecture/decisions/index.md`, the significance test in `docs/wiki/maintenance.md`, and the work item's `decisions` field and `## Decisions` section; open an individual in-force ADR only when its subject intersects the changed paths or the drafted decisions. Report a finding when the diff makes a decision meeting that test and the record carries neither a drafted ADR covering it nor a recorded `none` explaining why none qualifies, and when the diff contradicts an in-force ADR without drafting its supersession. The significance test is a judgement call — label it as one, and never treat a missing ADR as a code defect.

On top of documented rules, Standards carries the **smell baseline** in [references/smell-baseline.md](references/smell-baseline.md). The reviewer reads it in step 7; the parent does not.

### 7. Spawn reviewer(s)

Read [references/sub-agent-briefs.md](references/sub-agent-briefs.md). Default: spawn one combined reviewer. Narrow high risk: give `$parallel-execution` one Standards and one Spec unit as the same comprehensive review. With no Spec, run Standards only. Include Epic add-ons when applicable.

### 8. Aggregate

State `Review mode:` and its reason. Present `## Standards` and `## Spec`: each axis's finding counts and actionable findings with citations, never verbatim agent reports. Keep axis labels and counts independent. A combined reviewer still reports both axes separately.

Add `Next step:` — actionable findings → fix them once, inspect the remediation directly, rerun only affected checks, then continue the acceptance unit's representative-suite gate without another review; pass inside `$implement` → continue that gate; Epic pass → continue atomic closure; standalone pass → continue single-item acceptance.
