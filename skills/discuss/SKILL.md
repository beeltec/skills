---
name: discuss
description: Use this skill when a user wants to explore, clarify, challenge, or stress-test a product idea, feature, architecture choice, or implementation proposal before planning. Verify external facts from current official documentation, separate product evidence from assumptions, interview the user through dependency-ordered decision rounds, and persist a confirmed brief with success measures. Do not create tickets or code.
---

# Discuss

Turn an unclear request into a shared, explicit understanding. Keep discussion
separate from planning and implementation.

## Method

1. Restate the outcome in one sentence.
2. Read `docs/knowledge/index.md`, `docs/knowledge/sources/index.md`, and `docs/work/briefs/index.md`.
3. Build a private decision graph.
4. Separate repository facts, external facts, product evidence, assumptions, and user choices.
5. Use `$source` to verify every material external fact before relying on it.
6. Find the current frontier: unresolved choices with no unresolved prerequisite.
7. Estimate the total material questions, including likely dependent branches.
8. Ask every independent frontier question in one round.
9. Wait for the user's answers before expanding dependent branches.
10. Update the graph, revise the estimate, and repeat until no branch remains.

Do not ask the user for facts available in files, tools, or official
documentation. Treat model memory as a search lead, not evidence. Official
technical documentation cannot prove user need or product value. Use observed
behavior, research, analytics, or an explicit owner decision for product
evidence. Do not silently choose product behavior, scope, or risk.

## Question format

Use this format for each question:

```markdown
Q1 of ~6 — Short decision title

[One clear question. Add two or three concrete choices when useful.]

Recommendation: [Your preferred answer and its main reason.]
```

Number questions continuously across rounds. Use the same approximate total
for every question in one round. Recalculate it after each answer round because
new branches can appear and resolved branches can disappear.

Never reduce the estimate below the current question number. If the estimate
changes materially, state the new approximate total before the next round.
Explain each choice's material consequence. Avoid questions whose answers do
not change the result.

## Round rules

- Ask only questions that can be answered now.
- Defer a choice when another open choice controls it.
- Revisit earlier answers when a later answer creates a conflict.
- Challenge vague terms such as "simple," "fast," or "secure."
- Cover the problem evidence, current baseline, users, outcomes, scope, failure
  behavior, data, interfaces, rollout, compatibility, security, verification,
  ticket dependencies, and delivery order when relevant.
- Identify the riskiest assumptions and the cheapest useful validation.
- Consider a no-build alternative before committing to production work.
- Separate delivery acceptance from the post-release product success metric.
- Define the metric, baseline, target, observation window, and data source.
- Distinguish work that can run in parallel from work that must wait.
- Use the configured Git target and conventions unless the user requests a change.
- Discuss release versioning separately when the project publishes a versioned API.
- Keep the number of questions proportional to the decision.

## Planning handoff

When the frontier is empty, provide this brief:

```markdown
# Confirmed brief

## Problem and evidence
## Outcome
## Users and use cases
## In scope
## Out of scope
## Decisions
## Constraints
## Delivery dependencies
## Official sources
## Risks and mitigations
## Assumptions and validation
## Alternatives
## Delivery acceptance
## Product success measure
## Open questions
```

Use `None` when no open questions remain. Ask the user to confirm the brief.
Do not create work items until the user confirms it. After confirmation, run
`brief-create` with the agreed evidence and success fields, then run
`brief-confirm <BRIEF-N> --by <actor>`. Use the authenticated identity when
available. Use `human:user` when the current user directly confirms the brief.
Hand the persisted brief ID to `plan`.
