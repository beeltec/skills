# Review And Acceptance

Load for explicit diff review or final implementation acceptance.

## Fixed Point And Authority

Resolve a supplied SHA/branch/tag with `git rev-parse --verify <fixed-point>^{commit}` and `git merge-base <fixed-point> HEAD`. Ask when an explicit review has no fixed point. Capture `git diff <fixed-point>...HEAD`, commits, and changed paths; stop on bad ref or empty diff.

Read repository instructions and standards. When relevant, read the selected record/Epic, accepted wiki concepts, proposal research, applicable technology/standard guidance, ADR index/decisions, and changed code/tests. Current wiki is Standards/baseline authority. A selected record's desired delta/criteria are Spec authority; otherwise the gateway authority packet's confirmed objective, scope, exclusions, and criteria are Spec authority. Use Standards-only review only when an explicit review has neither and the user confirms no Spec exists. Neither axis replaces the other.

## Mode

Use one combined reviewer by default. Split independent Standards and Spec reviewers only for security/authentication, destructive migration or credible data-loss risk, or changed public API compatibility. Privacy wording, ordinary persistence/concurrency, release infrastructure, or ADR significance alone do not trigger a split. If delegation is unavailable, perform the same axes locally.

Read [smell-baseline.md](smell-baseline.md) and, when dispatching reviewers, [review-briefs.md](review-briefs.md). Review only the fixed-point diff.

## Findings

Report findings first, ordered by severity, with file/hunk and authority citations:

- `Standards`: violated documented requirements/conventions, unreliable stale guidance, ADR conflicts/missing significant-decision draft, then labelled judgement-call smells.
- `Spec`: missing/partial/incorrect required behavior and scope creep against the selected acceptance unit.

Keep axis counts separate even for one combined reviewer. If no findings exist, say so and state residual risks/testing gaps.

## Terminal Review

When review is the requested terminal outcome, never edit code, mutate records, reconcile, merge, or accept. Report findings and one exact `$develop implement ...` follow-up when remediation is wanted.

## Remediation And Verification

Only inside an implementation or acceptance run, fix each in-scope finding once, inspect the remediation diff directly, and rerun only invalidated focused checks. Never add a second review. Stop when remediation requires unauthorized scope.

For direct work, run focused checks covering touched behavior and report unavailable coverage. For governed acceptance, after remediation run one representative full suite on one supported target. Expand only for changed platform behavior, adaptive layout, compatibility, packaging, migration, or another matrix-sensitive contract; a release runs the complete supported matrix. Record rationale.

A passing suite validates code-affecting source, tests, manifests/lockfiles, runtime/build configuration, generated runtime artifacts, and relevant environment configuration at the tested commit. Reuse after merge only when those inputs match; documentation, wiki, backlog, and transcripts do not invalidate it.

For an Epic implementation, review once from the immutable Epic fixed point with the Epic outcome/criteria primary and every child as context. Verify every child and Epic criterion from the composed result, then return to `execution.md` for one reconciliation, merge, and atomic completion transaction. An explicit terminal Epic review stops after reporting.
