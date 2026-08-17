# Review policy

Review completed changes against repository standards and the requested
behavior before integration.

## Required passes

- Pin one immutable scope base for the complete review change.
- Pin the current target commit as the branch integration fixed point.
- Run a Standards pass against applicable rules, checks, and engineering risks.
- Run a separate Spec pass against the originating ticket or specification.
- Run the two passes in separate parallel review subagents.
- Let the orchestrator only prepare scope and aggregate results.
- Stop when the harness cannot run review subagents. Do not review in the orchestrator.
- Inspect the complete change in both passes.
- Once every epic descendant ticket is done, review the complete integrated epic.
- Keep the pre-child epic scope base fixed through the epic review.
- Keep findings and severity counts separate for each pass.

## Severity gate

- Treat P0 as a critical defect requiring immediate correction.
- Treat P1 as a high-impact defect or serious risk.
- Treat P2 as a real defect, unmet requirement, or concrete maintainability risk.
- Treat P3 as a non-blocking improvement without a current failure.
- Block approval and integration while any P0, P1, or P2 lacks remediation evidence.
- Do not classify a style preference alone as P2.
- State the concrete impact, file, and line for each finding.

## Single review round

- Treat a request to implement a ticket or epic as authority for one review round.
- Run exactly one Standards pass and one Spec pass for that round.
- Do not ask whether to start review or fix valid in-scope blocking findings.
- Send every valid blocking finding back to implementation.
- Require focused tests and the complete configured check set after fixes.
- Record concrete remediation evidence after fixes without starting another review.
- Run another review round only when the user explicitly requests it.
- Do not infer re-review authority from an implementation or repair request.
- Do not substitute passing child reviews for the final integrated epic review.
- Do not approve only because automated checks pass.
- Do not accept a promise to fix later as a resolved finding.
- Allow documented P3 suggestions to remain.
