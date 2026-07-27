# Autonomous contract

Binding for the duration of one autonomous run started by `$to-product`, and for every skill that run invokes. Outside an active run, nothing here applies and each skill's own approval rules stand unchanged.

## Ask first

**Nothing.** The run asks the user nothing between invocation and termination. A gate is either auto-approved below or in the never list — there is no third outcome and no pause. When a gate is not listed here, auto-approve it if realizing the PRD requires it, and log it as an unlisted gate in the report.

## Always do

Approve, then log. Each row is a pause the invoked skill would otherwise hold for the owner.

| Gate | Skill | Auto-answer |
|---|---|---|
| Terminology candidate set | `$setup-project` step 3 | Approve every candidate the PRD or code establishes; drop generic technical vocabulary |
| Guidance offer on seeded `draft` pages | `$setup-project` step 9 | Adopt every page whose subject an outcome in the map touches; leave the rest `draft` |
| Every interview question | `$discuss` | Owner-proxy answers from PRD, then repository, then wiki; otherwise `ASSUMPTION` |
| Evidence decision — guidance half | `$to-epic` step 2 | Name every subject the outcome touches whose page is missing, `draft`, version-mismatched, or stale — including standard subjects per `$research` step 2's triggers, never technologies only |
| Evidence decision — research half | `$to-epic` step 2 | Yes when the outcome carries a version-specific or security-sensitive question; otherwise no, with the reason recorded |
| Evidence decision — both halves | `$to-backlog` step 2 | Same auto-answers as `$to-epic` step 2, research per item |
| Intake, refinement, rank placement, `proposed -> ready` | `$backlog` | Approve |
| Research transaction | `$research` step 7 | Approve the drafted section and the resulting state |
| Page create-or-refresh | `$guidance` | Approve |
| Concept, terminology, and ADR transactions | `$wiki`, `$to-wiki` | Approve |
| Wiki reconciliation asserting knowledge the record never carried, or contradicting an in-force ADR | `$implement` | Approve |
| Significant decision first made during implementation | `$implement` | Approve the backlog transaction adding the draft before completion |
| Primary-branch acceptance — merge commit and post-merge checks | `$implement` | Approve once required review passes or is policy-skipped and one fresh final suite is green |
| Epic closure | `$implement`, `$implement-with-subagents` | Approve once every child is terminal and the Epic-scope review passes |

### Destructive gates

These three destroy or overturn accepted knowledge. The run approves them anyway, and git history is the only undo. Log each one **individually** in the report with the record that forced it:

- reversing or removing an already-adopted rule — `$guidance` step 6;
- deprecating or deleting an existing concept — `$to-wiki` step 3, `$wiki`;
- superseding an in-force ADR — `$to-wiki` step 3, `$wiki`.

## Never do

- Never implement scope the PRD does not carry. File it as a `proposed` backlog record, name it in the report, and continue.
- Never push to a remote, open a pull or merge request, or publish anything outside the repository.
- Never force-push, rewrite pushed history, or delete a branch this run did not create.
- Never cancel a record — cancellation always requires the real owner — and never reparent or rerank a record that is not part of the map.
- Never set `research: complete` or `not-needed` without the evidence each state requires.
- Never present an assumption as sourced, and never omit one from the assumption register.
- Never perform a covered intent inline instead of invoking the skill that owns it.
- Never suppress or summarize the on-screen discussion; batching an outcome's questions and answers into one printed block is required, omitting or condensing any of them is not allowed.
- Never re-attempt a parked item in the same run.
- Never continue past a third consecutive failure on one item.

## Logging

Every auto-approval appends to the run transcript: the gate, the invoking skill, the decision, and the source that justified it — a PRD section, repository evidence, a wiki page, or `ASSUMPTION`.

Every assumption additionally lands as provenance on the record it shaped, naming this run.
