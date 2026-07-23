---
name: discuss
description: Stress-test a plan, decision, or idea one question at a time, using accepted project knowledge when available and routing confirmed desired changes to the backlog. Use when the user wants to discuss or challenge their thinking.
disable-model-invocation: true
---

# Discuss

Before interviewing, resolve the project root and read applicable repository instructions. When `docs/wiki` exists, read its root index, maintenance rules, ubiquitous language, nearest relevant indexes, and related concepts so accepted current state informs the discussion. When `docs/backlog` exists, also read its root index and any records related to the topic — read-only — so existing proposed work, relationships, and rank inform the questioning and the handoff can refine an existing record instead of proposing a duplicate. Without a wiki, continue without inventing project facts and recommend `$setup-project` if the user wants to persist project state.

Stay on the user's current Git branch — never create, switch, merge, or delete branches, even when inspecting the repository.

Interview the user relentlessly about every aspect until shared understanding is reached, walking each branch of the decision tree and resolving dependencies between decisions one by one. Provide a recommended answer for each question.

Ask exactly one question at a time and wait for the answer. Format every question exactly as:

```text
Question X / ~Y:
Question
```

Start `X` at 1 and increment; `Y` is the estimated total including the current question, revised as the discussion evolves. Use no other count format.

If available, use the ask_user_question tool with multiple-choice answers; the first option is always your recommendation, ending with "(recommended)". If available, use web search to research the tools and frameworks in question and their best practices before asking.

Look up any *fact* discoverable from the environment (filesystem, tools) instead of asking. *Decisions* belong to the user — put each one to them and wait.

Track terminology. When the user uses a domain term absent from the ubiquitous language, an existing term with a different meaning, or several words for one concept, raise a numbered question: confirm the meaning, propose a definition, and ask whether to add or correct it in the ubiquitous language. Collect confirmed terms for the handoff; without a wiki, note them for `$setup-project`.

Discuss is fully advisory: it reads and asks but never invokes a mutating skill or edits project records. After the user confirms shared understanding, classify each conclusion and recommend the matching user-invoked standing-approval command:

- A coordinated outcome that should form an Epic — multiple coherent, independently valuable work items serving one goal — routes to `/to-epic`, which plans it end-to-end (Epic intake, research decision, child intake, refinement to ready) without further approval pauses.
- Other unimplemented desired state (new capability, behavior change, fix, migration) routes to `/to-backlog`, which intakes the confirmed standalone items and refines each to ready — including refining an existing `proposed` record found during preflight instead of proposing a duplicate. Never recommend publishing a target specification to the wiki.
- A correction, clarification, or durable conclusion already describing accepted current primary-branch state routes to `/to-wiki` — never merely because a proposal is well specified or agreed as desirable.
- Confirmed new or corrected terminology also routes to `/to-wiki`, even when the term arose from an unimplemented proposal — its meaning is durable project language regardless of whether the proposal ships.
- A conversation may contain several: route the desired delta to `/to-epic` or `/to-backlog` and only independently current, durable facts to `/to-wiki`, without duplicating the proposal.
- Unresolved decisions stay in the conversation or the proposed backlog record — never presented as accepted wiki knowledge or as ready work.

Ask one final handoff question in the same numbered format, then end the turn by naming the exact `/to-epic`, `/to-backlog`, or `/to-wiki` command(s) the user accepted — never invoke them or fall back to invoking `$backlog` or `$wiki` yourself.
