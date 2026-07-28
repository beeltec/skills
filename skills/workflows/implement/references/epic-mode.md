# Epic mode

Applies only to `EPIC-NNN`. The Epic and all approved children form one acceptance unit with one branch, one start transaction, and one final acceptance/archive transaction.

## Child selection

Resume this invocation's incomplete child first. Otherwise scan global rank and select the highest-ranked child whose inward blockers are provisionally complete. Dependencies determine actionability; rank chooses among actionable children.

Execute children one at a time, locally or through one internal provisional-child packet. Keep status `in-progress`, claim unchanged, rank present, checklist edits uncommitted, and evidence in the invocation ledger. A child remains provisional after focused checks pass. Do not merge to primary, reconcile wiki state, run a full suite, or mark it `done`.

Do not review children independently. Preserve high-risk child context for the one composed review. If no child is actionable while required work remains, report the full blocker frontier and stop safely.

## Composed closure

After every required child is provisionally complete:

1. Invoke `$code-review` exactly once against the immutable Epic fixed point with the Epic as Spec authority and every child as context. Use one combined reviewer unless the composed delta meets a narrow high-risk trigger.
2. Fix every in-scope finding on the Epic branch, inspect the remediation diff directly, and rerun only affected checks. Never run a remediation or delta review; stop if a fix requires unapproved scope.
3. Run the full applicable suite once on one representative target. Expand the matrix only for changed platform, adaptive-layout, compatibility, packaging, migration, or other matrix-sensitive behavior. Run every supported dimension when this Epic is the PRD's release outcome.
4. Verify every child and Epic criterion from the composed result. Draft one wiki/ADR reconciliation for the whole outcome.
5. Follow `$implement`'s single merge, accepted-state publication, and atomic final transaction. The transaction marks every child and Epic `done`, clears all claims/ranks, resolves decisions, writes accumulated evidence, archives the whole directory, updates indexes, and includes a supplied autonomous transcript.

Code-identical integration and later backlog/wiki/transcript-only commits reuse the suite. A finding outside approved Epic scope blocks closure; never expand scope or accept a partial Epic.
