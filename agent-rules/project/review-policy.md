# Review policy

Review completed changes against repository standards and the requested
behavior before integration.

## Required passes

- Pin one immutable fixed point for the complete review scope.
- Run a Standards pass against applicable rules, checks, and engineering risks.
- Run a separate Spec pass against the originating ticket or specification.
- Run the two passes in separate parallel review subagents.
- Let the orchestrator only prepare scope, aggregate results, and control the loop.
- Stop when the harness cannot run review subagents. Do not review in the orchestrator.
- Inspect the complete change in both passes.
- Keep findings and severity counts separate for each pass.

## Severity gate

- Treat P0 as a critical defect requiring immediate correction.
- Treat P1 as a high-impact defect or serious risk.
- Treat P2 as a real defect, unmet requirement, or concrete maintainability risk.
- Treat P3 as a non-blocking improvement without a current failure.
- Block approval and integration while any P0, P1, or P2 remains.
- Do not classify a style preference alone as P2.
- State the concrete impact, file, and line for each finding.

## Review loop

- Treat a request to implement a ticket as authority to run its review loop.
- Do not ask whether to start review or fix valid in-scope blocking findings.
- Send every valid blocking finding back to implementation.
- Require focused tests and the complete configured check set after fixes.
- Rerun fresh Standards and Spec passes against the complete updated change.
- Use fresh review subagents for every loop iteration.
- Continue until both passes report zero P0, P1, and P2 findings.
- Do not approve only because automated checks pass.
- Do not accept a promise to fix later as a resolved finding.
- Allow documented P3 suggestions to remain.
