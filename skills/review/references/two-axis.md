# Two-axis code review

Review the completed change against one fixed scope. Run two independent
passes. Keep their findings separate.

## Contents

- Establish the review scope
- Standards pass
- Spec pass
- Result format

## Establish the review scope

Use the fixed point captured by `implement` or supplied by the user. Ask for it
when neither exists. For uncommitted-only work, confirm that the starting
`HEAD` still identifies the state before implementation.

Validate a supplied reference before using it:

```bash
git rev-parse --verify <fixed-point>^{commit}
```

For committed branch work, inspect these views:

```bash
git diff <fixed-point>...HEAD
git log <fixed-point>..HEAD --oneline
```

Also inspect staged, unstaged, and untracked changes:

```bash
git diff HEAD
git status --short
```

Review new untracked files in full. If the repository has no commit, review
all files changed for the item. State `initial tree` as the fixed point.

Do not attribute pre-existing dirty files to the item. If work overlaps those
files, state that limitation in the review evidence.

Stop if the final scope contains no relevant change.

## Standards pass

Read the applicable `AGENTS.md` files first. Also inspect `CONTRIBUTING.md`,
coding guides, and relevant tool configuration.

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
its description, acceptance criteria, parent context, and declared checks.

Otherwise, use a specification path supplied by the user. Then check commit
messages for an issue reference or find a matching specification under
`docs/`. Ask when no source is clear. If the user confirms none exists, report
that the Spec pass was skipped. Never approve a workflow item without its work
item specification.

Inspect the same change again. Look only for:

- missing or partly implemented requirements;
- behavior outside the requested scope;
- implemented requirements whose behavior is incorrect.

Quote or identify the relevant criterion. Name the file and line that caused
the finding.

## Result format

Keep the reports separate:

```markdown
## Standards

- Pass. No material findings.

## Spec

- [material] AC-2 is partial — src/example.ts:24 ...

Summary: Standards 0 findings. Spec 1 material finding.
```

Do not merge or rank findings across axes. One material finding on either axis
blocks approval.

After fixes, rerun affected checks. Then repeat both passes against the new
final scope. Record the fixed point and finding counts in review evidence.

Source: https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md
