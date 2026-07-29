# Discussion

Load for shaping, challenging, or deciding an idea. Discussion is advisory unless the original request explicitly names a later procedure or outcome.

## Preflight

Read applicable instructions. When present, read the wiki root and maintenance rules, ubiquitous language, ADR index, nearest relevant indexes, and related concepts. Read the backlog root and related active/archive records read-only to avoid duplicate proposals. Without those systems, use repository evidence and user statements without inventing project facts.

Fan out fact-finding only when at least two independent concerns qualify under `delegation.md`. Keep synthesis, terminology, significant-decision tracking, and every user decision in this context.

## Discussion Map

Build a provisional map before interviewing. Consider product behavior, architecture and technology, data, security and privacy, testing, local development, deployment and operations, migration, observability, performance, accessibility, and maintenance. Add domain-specific areas. Include an unstated area only when it can change the outcome, design, implementation, verification, operation, cost, or risk.

Show the relevant areas, exclusions with reasons, and provisional question estimate. Let the user correct the map through the first numbered question. Keep a ledger marking each area `open`, `resolved`, `deferred`, or `excluded`; add newly material areas as answers expose dependencies, explain why, and revise the estimate.

## Interview

1. Discover environmental facts instead of asking for them. Research external factual claims before asking a decision that depends on them.
2. Ask exactly one decision question at a time and wait. Walk dependencies in order and provide a recommended first answer.
3. For each material area, resolve the desired outcome, constraints, alternatives, recommendation, edge and failure cases, verification, and consequences. Ask as many questions as its separate decisions require; never collapse decisions to shorten the interview. Skip an inapplicable facet only with a ledger reason.
4. Use this exact format, starting at 1 and revising the estimate as the map changes:

```text
Question X / ~Y:
Question
```

5. Use multiple choice when available. Put the recommendation first and end its label with `(recommended)`.
6. Do not close because the original question is answered or implementation seems possible. After the initial map is resolved, challenge the result for contradictions, hidden assumptions, missing stakeholders, operational burden, irreversible choices, and simpler alternatives. Reopen affected areas and repeat the challenge after resolving them.

## Decisions And Terms

Apply the project's ADR significance test. Without one, a decision qualifies when it changes structure, adopts or drops technology, sets a cross-cutting quality rule, or is costly to reverse, and rejects a real alternative. Confirm each qualifying decision in a numbered question that states the choice, rejected alternatives and reasons, and accepted consequences. A proposed decision stays with desired work; publish an ADR only when already in force or after acceptance.

When a domain term is absent, conflicting, or used under several names, ask a numbered question confirming one name and definition. Current accepted terminology may be published; proposal-specific meaning remains planning context until accepted.

## Close

Close only when every mapped area is `resolved`, `deferred`, or `excluded`. Present the ledger and complete shared understanding, then ask what is missing.

Classify conclusions:

- coordinated desired outcome -> Epic planning;
- standalone desired change or fix -> standalone planning or direct implementation, based on requested durability and scope;
- accepted current fact, correction, terminology, or decision already in force -> knowledge publication;
- adopted technology or standards rule -> guidance;
- unresolved decision -> conversation or proposed record, never accepted knowledge.

Ask one final numbered handoff question. When discussion was terminal and a follow-up exists, make that question the gateway's ask-user-question handoff when the tool is available; otherwise use its `Next step:` fallback after acceptance. If the original request also named planning, publication, guidance, execution, release, or autonomy, continue internally after recording the confirmed decisions.
