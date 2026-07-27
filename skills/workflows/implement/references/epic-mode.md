# Epic mode

Applies only to `EPIC-NNN`. Each child passes `$implement`'s gates, including risk-gated item review and one final suite; this file owns selection and Epic completion.

## Epic Selection

First resume this invocation's own live in-progress child. Otherwise scan the authoritative global executable-work rank top to bottom and select the highest-ranked Epic child that is `ready` with no unresolved inward blocker. Rank chooses among actionable children; dependencies determine actionability.

Never skip a higher-ranked actionable child for convenience or treat proposed/cancelled children as executable. If no child is actionable but required children remain, stop and report their statuses, blockers, and claims. After each child's primary-branch completion, reload and validate all records before selecting again.

## Epic Completion And Cleanup

After every required child is `done` or owner-cancelled, always invoke `$code-review` on primary as an Epic-scope review with the Epic, epic fixed point, and resolved packet. Its risk policy selects combined or parallel mode.

Fix every actionable in-scope finding on the retained work branch and run affected focused checks. Delta-review only substantive remediation under `$implement`'s rule; inspect mechanical fixes directly. After required review passes, run the full suite only when the latest child result is stale under Verification Freshness; otherwise reuse it. Merge fixes to primary and rerun the validator; rerun the suite only if integration changes code-affecting inputs.

A finding needing scope the Epic never carried is not fixable here: record it, keep the Epic `in-progress` with a renewed claim, and stop for an owner-approved backlog transaction. Never close an Epic over an unresolved finding.

Then verify the Epic outcome and each criterion with concrete primary evidence, reconcile Epic-level durable knowledge and drafted decisions through `$wiki`, run the validator, and cite the fresh suite result. Resolve `decisions` to published IDs or `none` in the final transaction.

In one final primary-branch backlog transaction: check supported Epic criteria, set the Epic `done`, move its whole directory to `archive/epics/`, and update active and archive indexes. The final child's completion may share this transaction only when all child and Epic gates already pass. Commit the archive atomically; never split it.
