# Discussion

Load for shaping, challenging, or deciding an idea. Discussion is advisory unless the original request explicitly names a later procedure or outcome.

## Preflight

Read applicable instructions. When present, read the wiki root and maintenance rules, ubiquitous language, ADR index, nearest relevant indexes, and related concepts. Read the backlog root and related active/archive records read-only to avoid duplicate proposals. Without those systems, use repository evidence and user statements without inventing project facts.

Fan out fact-finding only when at least two independent concerns qualify under `delegation.md`. Keep synthesis, terminology, significant-decision tracking, and every user decision in this context.

## Interview

1. Discover environmental facts instead of asking for them. Research external factual claims before asking a decision that depends on them.
2. Ask exactly one decision question at a time and wait. Walk dependencies in order and provide a recommended first answer.
3. Use this exact format, starting at 1 and revising the estimate as the tree changes:

```text
Question X / ~Y:
Question
```

4. Use multiple choice when available. Put the recommendation first and end its label with `(recommended)`.
5. Continue until scope, behavior, boundaries, failure cases, rollout, verification, and consequences are mutually understood. Do not turn discoverable facts into questions.

## Decisions And Terms

Apply the project's ADR significance test. Without one, a decision qualifies when it changes structure, adopts or drops technology, sets a cross-cutting quality rule, or is costly to reverse, and rejects a real alternative. Confirm each qualifying decision in a numbered question that states the choice, rejected alternatives and reasons, and accepted consequences. A proposed decision stays with desired work; publish an ADR only when already in force or after acceptance.

When a domain term is absent, conflicting, or used under several names, ask a numbered question confirming one name and definition. Current accepted terminology may be published; proposal-specific meaning remains planning context until accepted.

## Close

Classify conclusions:

- coordinated desired outcome -> Epic planning;
- standalone desired change or fix -> standalone planning or direct implementation, based on requested durability and scope;
- accepted current fact, correction, terminology, or decision already in force -> knowledge publication;
- adopted technology or standards rule -> guidance;
- unresolved decision -> conversation or proposed record, never accepted knowledge.

Ask one final numbered handoff question. If discussion was the terminal request, return one complete `Next step: $develop ...` only when the user accepts follow-up. If the original request also named planning, publication, guidance, execution, release, or autonomy, continue internally after recording the confirmed decisions.
