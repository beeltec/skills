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

Do not act until the user confirms shared understanding. After confirmation, classify it before proposing a handoff:

- Unimplemented desired state (new capability, behavior change, fix, migration) belongs in `docs/backlog`: offer `$backlog` to create or refine the proposed Epic or work item under its approval boundary. Never recommend publishing its target specification to the wiki.
- When that desired state is a coordinated outcome that should form an Epic — multiple coherent, independently valuable work items serving one goal — explicitly ask whether the user wants `$to-epic` instead, which plans it end-to-end (Epic intake, research decision, child intake, refinement to ready) without further approval pauses.
- A correction, clarification, or durable conclusion already describing accepted current primary-branch state may be offered to `$wiki` — never merely because a proposal is well specified or agreed as desirable.
- When several confirmed durable conclusions or terms should be published together, explicitly ask whether the user wants `$to-wiki` instead, which publishes the conversation's confirmed knowledge end-to-end under one standing approval, pausing only on deprecations or deletions.
- Confirmed new or corrected terminology: offer `$wiki` to update the ubiquitous language, even when the term arose from an unimplemented proposal — its meaning is durable project language regardless of whether the proposal ships.
- A conversation may contain both: route the desired delta to `$backlog` and only independently current, durable facts to `$wiki`, without duplicating the proposal.
- Unresolved decisions stay in the conversation or the proposed backlog record — never presented as accepted wiki knowledge or as ready work.

Ask one final handoff question in the same numbered format. Invoke `$backlog` or `$wiki` only when the user explicitly accepts that route. `$to-epic` and `$to-wiki` are user-invoked only — never invoke them; when accepted, end the turn by telling the user the exact `/to-epic` or `/to-wiki` command to run.
