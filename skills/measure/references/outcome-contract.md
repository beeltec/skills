# Outcome contract

## Evidence roles

- Official documentation proves external rules and tool behavior.
- Code and tests prove repository behavior.
- Release checks prove the deployed artifact and target.
- Analytics, observed usage, and user research prove product outcomes.
- A named human or authorized process owns the product decision.

Never substitute one evidence role for another.

Use active terms from `docs/knowledge/ubiquitous-language.md` when describing
the observation and decision. A vocabulary change cannot change the brief's
original metric, baseline, target, cohort, or observation window.

## Result scale

- `met`: The declared evidence meets the original target.
- `missed`: Reliable evidence does not meet the target.
- `inconclusive`: The data, sample, instrumentation, or window cannot support a result.

## Decision scale

- `proceed`: Keep the release and continue the current direction.
- `improve`: Keep the release and plan a targeted improvement.
- `revert`: Remove or disable the released behavior and plan the corrective work.
- `stop`: End further investment in this outcome.

An `improve` or `revert` decision requires at least one follow-up ticket before
the outcome can become established knowledge.

## Decision actor

Use the authenticated human identity when it is available. Use `human:user`
when the current user directly supplies the decision or an explicit decision
rule. Use a process actor only when project policy grants that process decision
authority. Never invent a person or present an agent choice as a human choice.

## Measurement checks

Confirm the observation uses the brief's original cohort and data source. State
material exclusions. Report broken instrumentation, small samples, delayed data,
and qualitative evidence that conflicts with the metric.

Delivery performance metrics can improve the workflow. They do not replace the
product metric. Use DORA measures only when repeated releases make trends useful.

If no external analytics or experiment rule applies, use the declared local
evidence without inventing an official source note. After recording the result,
validate and commit the outcome record, generated indexes, knowledge log, and
established outcome concept. Do not push without user authority.

## Official sources

- https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works
- https://www.gov.uk/service-manual/service-standard/point-10-define-success-publish-performance-data
- https://sre.google/sre-book/service-level-objectives/
- https://dora.dev/guides/dora-metrics/
