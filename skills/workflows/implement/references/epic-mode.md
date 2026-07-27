# Epic mode

Applies only when the invocation resolved to an `EPIC-NNN`. Every child still passes the per-item gates in `SKILL.md`; this file owns child selection order and Epic completion.

## Epic Selection

First resume this invocation's own live in-progress child. Otherwise scan the authoritative global executable-work rank top to bottom and select the highest-ranked Epic child that is `ready` with no unresolved inward blocker. Rank chooses among actionable children; dependencies determine actionability.

Never skip a higher-ranked actionable child for convenience or treat proposed/cancelled children as executable. If no child is actionable but required children remain, stop and report their statuses, blockers, and claims. After each child's primary-branch completion, reload and validate all records before selecting again.

## Epic Completion And Cleanup

After every required child is `done` or explicitly owner-cancelled, and before verifying Epic criteria, invoke `$code-review` on the primary branch as an Epic-scope review with the `EPIC-NNN`, the epic fixed point, and the resolved packet. Skip it only when the epic diff adds nothing to a single child diff already reviewed; report the skip. Then loop:

1. Switch back to the retained work branch and fix every actionable finding falling inside the Epic's approved outcome, criteria, and children — never by broadening scope. Rerun affected focused checks and the full applicable suite.
2. Merge that branch into primary with a merge commit; rerun `node scripts/validate-project.mjs` and the full suite on primary.
3. Invoke `$code-review` again from the same epic fixed point as a delta review, passing the previous pass's reviewed commit and its findings.
4. Repeat until both axes pass.

A finding needing scope the Epic never carried is not fixable here: record it, keep the Epic `in-progress` with a renewed claim, and stop for an owner-approved backlog transaction. Never close an Epic over an unresolved finding.

Then verify the Epic outcome and each criterion with concrete primary-branch evidence, reconcile remaining Epic-level durable knowledge and any Epic-level drafted decision through `$wiki`, then run the validator and full suite. Resolve the Epic's `decisions` to the published IDs or `none` in the final transaction.

In one final primary-branch backlog transaction: check supported Epic criteria, set the Epic `done`, move its whole directory to `archive/epics/`, and update active and archive indexes. The final child's completion may share this transaction only when all child and Epic gates already pass. Commit the archive atomically; never split it.
