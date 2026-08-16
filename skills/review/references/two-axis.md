# Two-axis code review

Review the completed change against one fixed scope. Run two independent
passes. Keep their findings separate.

## Contents

- Establish the review scope
- Severity scale
- Standards pass
- Spec pass
- Review loop
- Result format

## Establish the review scope

Run workflow reviews inside the named ticket worktree. Resolve the configured
target branch to an immutable full commit hash. Confirm that the ticket branch
contains that commit and follows the ticket branch convention.

For work outside this workflow, use the fixed point supplied by the user. Ask
for it when none exists.

When `docs/work/handoffs/<KEY>.md` exists, use it to locate delegated packets
and their claimed paths. Verify those claims against the complete Git diff.
Never reduce review scope to the packet list.

Validate a supplied reference before using it:

```bash
git rev-parse --verify <fixed-point>^{commit}
git merge-base --is-ancestor <fixed-point> HEAD
```

For committed branch work, inspect these views:

```bash
git diff <fixed-point>...HEAD
git log <fixed-point>..HEAD --oneline
git log <fixed-point>..HEAD --format=%s
```

Also inspect staged, unstaged, and untracked changes:

```bash
git diff HEAD
git status --short
```

Review new untracked files in full. Ticket worktrees require an existing
commit and must never use `initial tree` as the fixed point.

Do not attribute pre-existing dirty files to the item. If work overlaps those
files, state that limitation in the review evidence.

Stop if the final scope contains no relevant change.

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

Check the change against documented rules. Repository rules take priority.
Do not repeat failures already reported by configured checks.

Then look for maintainability risks. Treat these as judgement calls:

- unclear names or responsibilities;
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
profile, declared checks, and quality gates.

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

## Review loop

Use the original fixed point for every iteration. Review the complete updated
change, not only the latest fix or previously reported files.

If the target branch advances, stop the current loop. Return to `implement` to
synchronize the ticket branch and rerun every check. Start a new full review
cycle from the new target commit.

When either axis finds a P0, P1, or P2:

1. Record `changes-requested` with both axis reports.
2. Send every blocking finding to `implement`.
3. Require focused tests and the whole item's configured checks after fixes.
4. Run fresh Standards and Spec passes.
5. Repeat until both passes report zero P0, P1, and P2 findings.

New findings can appear after a fix. Count them in the next iteration. Do not
approve based on a claim that a finding was fixed. Inspect the updated change.

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
Blocking total: 1. Review loop: changes requested.
```

Do not merge findings across axes. Keep separate severity counts for each
pass. Any P0, P1, or P2 on either axis blocks approval.

After the loop passes, state `Blocking total: 0. Review loop complete.` Record
the fixed point and final severity counts in review evidence.

Source: https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md
