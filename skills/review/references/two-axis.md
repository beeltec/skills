# Two-axis code review

Review the completed change against one fixed scope. Run two independent
passes. Keep their findings separate.

## Contents

- Establish the review scope
- Agent separation and packets
- Severity scale
- Standards pass
- Spec pass
- Review result and remediation
- Result format

## Establish the review scope

Run workflow reviews inside the named work item worktree. Resolve the configured
or explicit alternate target branch to an immutable full commit hash. Confirm
that the review branch contains that commit and follows the work item branch
convention. Record the same target branch with the review.

For a non-epic ticket, use that target commit as both `review.fixedPoint` and
the review scope base.

For an epic, require every descendant to be `done`. Load `review.scopeBase`, recorded
before its first child started. Use the current target commit as
`review.fixedPoint`. Review the complete range from `review.scopeBase` through
the epic review branch. Child review results do not replace this review.

Use the epic handoff to identify child merge commits. The scope-base diff can
include unrelated target commits. Do not attribute those changes to the epic.
Still inspect current interactions across every epic-owned change.

For a legacy scope derived from an `initial tree` review, inspect the full diff
from Git's empty tree to `HEAD`. Also inspect every current file relevant to the
epic and descendant specifications. Use `git log HEAD` because a tree is not a
commit range endpoint.

For work outside this workflow, use the fixed point supplied by the user. Ask
for it when none exists. Use it as the scope base unless the user supplies a
separate earlier scope base.

When `docs/work/handoffs/<KEY>.md` exists, use it to locate delegated packets
and their claimed paths. Verify those claims against the complete Git diff.
Never reduce review scope to the packet list.

Validate each supplied reference before using it:

```bash
git rev-parse --verify <fixed-point>^{commit}
git merge-base --is-ancestor <fixed-point> HEAD
git rev-parse --verify <scope-base>^{commit}
git merge-base --is-ancestor <scope-base> <fixed-point>
```

For the controlled legacy empty-tree scope, use these commands instead:

```bash
git rev-parse --verify <scope-base>^{tree}
git diff <scope-base> HEAD
git log HEAD --oneline
git log HEAD --format=%s
```

Do not run `merge-base` or a three-dot range with a tree object.

For committed branch work, inspect these views with the scope base:

```bash
git diff <scope-base>...HEAD
git log <scope-base>..HEAD --oneline
git log <scope-base>..HEAD --format=%s
```

Also inspect staged, unstaged, and untracked changes:

```bash
git diff HEAD
git status --short
```

Review new untracked files in full. Workflow worktrees require existing
commits. Never store the literal `initial tree` as a new fixed point or scope
base. The controlled legacy command converts it to Git's empty-tree object.

Do not attribute pre-existing dirty files to the item. If work overlaps those
files, state that limitation in the review evidence.

Stop if the final scope contains no relevant change.

## Agent separation and packets

The orchestrating agent owns scope discovery, delegation, aggregation, and
workflow recording. It must not conduct either review axis.

Start these two subagents in parallel:

- The Standards subagent reviews only repository rules, external constraints,
  maintainability, correctness, security, and quality gates.
- The Spec subagent reviews only the work item, brief, acceptance criteria, and
  requested scope.

Give both subagents:

- the absolute worktree path;
- the immutable target fixed point and review scope base;
- the complete diff, log, dirty-state, and untracked-file commands;
- the severity scale and required report format;
- a read-only instruction.

Give the Standards subagent the applicable `AGENTS.md`, `CONTRIBUTING.md`,
coding guides, source notes, Ubiquitous Language, Git conventions, risk profile,
and quality gates. Tell it to cite the rule or heuristic and file line for every
finding. Tell it to skip failures already enforced by configured checks.

Give the Spec subagent the work item, linked brief, parent context, acceptance
criteria, and any user-supplied specification. For an epic, include every descendant
item and its acceptance evidence. Tell it to report missing, partial, incorrect,
and unrequested behavior. Require the relevant criterion and file line for
every finding.

Do not give either subagent the other axis or its report. Do not let one
subagent review both axes. If a subagent fails, discard that result and start a
fresh subagent for that axis. If the harness cannot provide subagents, stop the
review instead of running either pass in the orchestrator.

For workflow items, both subagents are mandatory. For other work, skip the Spec
subagent only after the user confirms that no specification exists.

## Severity scale

Assign exactly one severity to every finding:

- **P0 — critical:** The change can cause catastrophic data loss, broad outage,
  or direct security compromise. Stop normal work and fix it immediately.
- **P1 — high:** The change breaks a critical or common path, creates a serious
  security or reliability risk, or has no reasonable workaround.
- **P2 — medium:** The change contains a real defect, unmet requirement, or
  concrete maintainability risk that should be fixed before approval.
- **P3 — low:** The change has a minor improvement or optional cleanup with no
  current correctness, security, or specification failure.

P0, P1, and P2 are blocking. P3 is non-blocking. Do not raise a P2 for style
preference alone. State the concrete impact that makes a finding actionable.

## Standards pass

Read the applicable `AGENTS.md` files first. Also inspect `CONTRIBUTING.md`,
coding guides, and relevant tool configuration.

Check the branch against Conventional Branch 1.1.0. Check every ticket commit
subject against Conventional Commits 1.0.0.

Read the relevant notes under `docs/knowledge/sources/`. Re-open each canonical
URL through `source` before enforcing an external API or vendor rule. Cite the
note and official URL in the finding. Never use model memory as review evidence.

Read `docs/knowledge/ubiquitous-language.md`. Check that behavior, domain-facing
names, tests, and documentation use the same agreed meaning. Do not report
exact vendor identifiers or framework names as vocabulary drift.

Check the change against documented rules. Repository rules take priority.
Do not repeat failures already reported by configured checks.

Then look for maintainability risks. Treat these as judgement calls:

- unclear names or responsibilities;
- names that conflict with an active canonical project term;
- duplicated logic or repeated branching;
- related values that need one typed model;
- domain concepts represented by unsafe primitives;
- one change scattered across unrelated modules;
- one module changed for unrelated reasons;
- abstractions or extension points that the ticket does not need;
- long navigation chains or wrappers that only delegate.

Always inspect correctness, security, error paths, data handling, and type
safety. Treat material risks as findings even when no local rule names them.

Report each finding with its rule or heuristic, severity, file, and line.

## Spec pass

For workflow work, use `docs/work/items/<KEY>.json` as the specification. Read
its description, acceptance criteria, parent context, linked brief, risk
profile, declared checks, and quality gates. For an epic, also read every descendant
item and verify their integrated behavior against the epic outcome.

Otherwise, use a specification path supplied by the user. Then check commit
messages for an issue reference or find a matching specification under
`docs/`. Ask when no source is clear. If the user confirms none exists, report
that the Spec pass was skipped. Never approve a workflow item without its work
item specification.

Inspect the same change again. Look only for:

- missing or partly implemented requirements;
- behavior outside the requested scope;
- implemented requirements whose behavior is incorrect.

The brief's product success metric is not a ticket requirement. Confirm only
that instrumentation or release preparation named by the ticket exists.

Quote or identify the relevant criterion. Name the file and line that caused
the finding.

## Review result and remediation

Use the target fixed point and scope base for the one review round. Inspect the
complete change, not only selected files or delegated packets.

If the target branch advances before review, return to `implement` to
synchronize and rerun every check. Start the review only after synchronization.
If it advances after review, stop. Another round requires explicit user
authority. Keep the epic's original `review.scopeBase`.

When either axis finds a P0, P1, or P2:

1. Record `changes-requested` with both axis reports.
2. Send every blocking finding to `implement`.
3. Require focused tests and the whole item's configured checks after fixes.
4. Require a repair commit and concrete `review-resolve` evidence.
5. Do not start another review round.

The remediation record does not change, remove, or rerank the original
findings. It records how implementation addressed them and which checks passed.
Run another review only when the user explicitly asks for it. Record that user
authority with the new round.

P3 findings may remain. Record them as non-blocking suggestions. If a blocking
finding cannot be resolved, keep `changes-requested` and ask for the missing
decision or authority.

## Result format

Keep the reports separate:

```markdown
## Standards

- [P3] Optional name cleanup — src/example.ts:12 ...

## Spec

- [P2] AC-2 is partial — src/example.ts:24 ...

Summary: Standards P0:0 P1:0 P2:0 P3:1. Spec P0:0 P1:0 P2:1 P3:0.
Blocking total: 1. Review round: changes requested; remediation required.
```

The orchestrator may lightly clean formatting. Do not merge, remove, rerank, or
rewrite findings across axes. Keep separate severity counts for each pass. Any
P0, P1, or P2 on either axis blocks approval.

For a round with no blockers, state `Blocking total: 0. Review round complete.`
Record the target fixed point, scope base, and severity counts. For a round with
blockers, preserve those counts and add remediation separately.

Source: https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md
