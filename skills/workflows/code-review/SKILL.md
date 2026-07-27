---
name: code-review
description: Review changes since a fixed point on Standards and Spec axes with risk-tiered agents. Use for backlog-backed branches, PRs, work in progress, or Epic closure.
---

# Code Review

Review the diff from a user-supplied fixed point against:

- **Standards** — accepted engineering/architecture guidance and repository standards.
- **Spec** — the selected backlog item's desired delta and acceptance criteria within Epic context.

Use one combined reviewer by default. Use independent parallel Standards and Spec reviewers only for security/authentication, destructive migration or credible data-loss risk, or public API compatibility. The wiki is accepted current state; the backlog is desired change.

## Process

### 1. Pin the fixed point

Use whatever the user gave (SHA, branch, tag, `main`, `HEAD~5`); ask if unspecified. Resolve before authority discovery with `git rev-parse --verify <fixed-point>^{commit}` and `git merge-base <fixed-point> HEAD`; stop with an actionable error if either fails. Capture once:

- diff: `git diff <fixed-point>...HEAD` (three-dot, against the merge-base);
- commits: `git log <fixed-point>..HEAD --oneline`;
- changed paths: `git diff --name-only <fixed-point>...HEAD`.

If the diff is empty, report that and stop. Bad refs and empty diffs are handled here, never inside parallel reviews.

When the caller supplies the previous reviewed commit and findings, this is a **delta review**. Keep the fixed point and authorities, review only `git diff <previous-reviewed-commit>...HEAD`, and carry prior findings forward. Workflows invoke it only when remediation materially changes behavior, contracts, architecture, security, data handling, or reviewed scope; mechanical and documentation-only remediation is inspected directly. An empty delta ends immediately.

### 2. Read project governance

Resolve the repository root and read all applicable `AGENTS.md`, `CLAUDE.md`, and nested instructions. When the setup-project scaffold exists, also read `docs/wiki/index.md`, `docs/wiki/maintenance.md`, `docs/backlog/index.md`, `docs/backlog/maintenance.md`, and the nearest relevant wiki and backlog indexes. Use project-local maintenance rules when stricter. Do not mutate the wiki, backlog, claims, or statuses during review.

### 3. Select the backlog work item

When the caller requests an **Epic-scope review**, the Epic is primary Spec authority and every child is context. This is the normal comprehensive review boundary.

Otherwise select one `WORK-NNN`:

1. A supplied ID, path, or complete record wins. A child review must be explicitly identified as a targeted narrow-high-risk review; routine Epic-child review is invalid and returns control to the caller.
2. Otherwise inspect active records for exactly one live claim or exact branch/commit link. Ignore terminal records and expired claims; ask when none or several qualify.
3. A standalone item is its own comprehensive review boundary. An Epic child remains provisional and never gains acceptance from this review.

With no backlog item, require explicit confirmation that no Spec exists, then review Standards only.

### 4. Build the authority packet

When an invoking workflow supplies resolved packet paths and roles, accept them as the packet; do not rediscover authorities from directory indexes, and do not re-read a path whose content that caller already read in this invocation chain under its freshness rule. Discover and read only what it did not supply. On a delta review the packet is unchanged from the previous pass — reuse it.

Have every authority read — by the caller or here — before starting either sub-agent:

- the selected work item: outcome/delta, acceptance criteria, relationships, wiki references, Research, Decisions, Execution, subtasks;
- its complete parent Epic when `parent` is not `none`: outcome, criteria, scope, exclusions, constraints, wiki references, research, execution context;
- on Epic-scope review: the Epic plus every child record — each delta, criteria, and recorded review result or policy skip — labelled child context;
- every linked current-state wiki concept relevant to the change (via `wiki_refs` or the Epic) plus the nearest indexes needed for ownership;
- proposal-specific research in the item or Epic and directly linked local evidence;
- accepted guidance under `docs/wiki/engineering/` and `docs/wiki/architecture/`, and repository standard sources (instructions, `CONTRIBUTING.md`, `CODING_STANDARDS.md`);
- every applicable guidance page under `docs/wiki/engineering/technologies/` and `docs/wiki/engineering/standards/` — one per technology and cross-cutting standard the diff touches, resolved from those directory indexes and the changed paths.

Record each source path and role. Current-state wiki facts describe the baseline and constraints; they cannot satisfy or erase a missing desired delta. The child item's delta, criteria, and exclusions are primary Spec authority; Epic context never expands or replaces child scope. On an Epic-scope review the Epic's own outcome and criteria are primary Spec authority and child scope is context; no child's scope expands the Epic's. Backlog scope never waives a repository or accepted wiki standard.
### 5. Select review mode

Use two parallel reviewers only when the reviewed delta involves security/authentication, destructive migration or credible data-loss risk, or public API compatibility. Privacy wording, ordinary persistence, concurrency, build/release infrastructure, and ADR significance alone do not trigger split review. Otherwise use one combined reviewer. Record the concrete trigger or `combined default`.

### 6. Prepare the Standards authority

Use all applicable accepted engineering/architecture wiki guidance and repository standards from step 4. Product current-state concepts and backlog requirements are context, not Standards rules.

The applicable guidance pages are hard Standards authority at the strength each rule carries per `docs/wiki/maintenance.md § Adopted guidance`: a violated `Requirements` rule is a documented-standard violation citing the page path and rule; a `Recommendations` departure is a judgement call; `Conventions` bind as documented practice. A recorded `Deviations` entry overrides the upstream guidance it departs from; new code inside a `Known gaps` area still violates the rule. A page whose recorded installed version no longer matches the manifest is unreliable: report the staleness as a finding rather than enforcing its version-specific rules.

Standards also carries the **ADR check** when the wiki defines the significance test. Read the ADR index at `docs/wiki/architecture/decisions/index.md`, the significance test in `docs/wiki/maintenance.md`, and the work item's `decisions` field and `## Decisions` section; open an individual in-force ADR only when its subject intersects the changed paths or the drafted decisions. Report a finding when the diff makes a decision meeting that test and the record carries neither a drafted ADR covering it nor a recorded `none` explaining why none qualifies, and when the diff contradicts an in-force ADR without drafting its supersession. The significance test is a judgement call — label it as one, and never treat a missing ADR as a code defect.

On top of documented rules, Standards carries the **smell baseline** in [references/smell-baseline.md](references/smell-baseline.md). The reviewer reads it in step 7; the parent does not.

### 7. Spawn reviewer(s)

Read [references/sub-agent-briefs.md](references/sub-agent-briefs.md). Default: spawn one combined reviewer. Narrow high risk: spawn Standards and Spec reviewers in parallel. With no Spec, run Standards only. Include targeted-child, delta, and Epic add-ons when applicable.

### 8. Aggregate

State `Review mode:` and its reason. Present `## Standards` and `## Spec`: each axis's finding counts and actionable findings with citations, never verbatim agent reports. Keep axis labels and counts independent. A combined reviewer still reports both axes separately.

Add `Next step:` — actionable findings → fix them and rerun `$code-review` with the same fixed point only when remediation meets the substantive rule; pass inside `$implement` → continue the acceptance unit's representative-suite gate; Epic pass → continue atomic closure; standalone pass → continue single-item acceptance.
