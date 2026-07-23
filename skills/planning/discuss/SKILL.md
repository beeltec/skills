---
name: discuss
description: Stress-test a plan, decision, or idea one question at a time, using accepted project knowledge when available and routing confirmed desired changes to the backlog. Use when the user wants to discuss or challenge their thinking.
---

Before interviewing, resolve the project root and read applicable repository instructions. When `docs/wiki` is present, read its root index, maintenance rules, ubiquitous language, nearest relevant indexes, and related concepts so accepted current state informs the discussion. If the wiki is absent, continue the discussion without inventing project facts; recommend `$setup-project` when the user wants to persist project state.

Stay on the user's current Git branch. Never create, switch, merge, or delete branches as part of discussion, even when inspecting the repository informs the decisions.

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

Format every question exactly as:

```text
Question X / (~Y):
Question
```

Start `X` at 1 and increment it. Use `Y` for the estimated total, including the current question; revise it as the discussion evolves. Use no other count format.

If available use the ask_user_question tool so the user can select an answer from a list of multiple choices. Make sure the first answer is always the one recommended by you and has "(recommended)" as the end of the answer.

If available use web search to research documentation about tools, frameworks, etc. in question as well as find best practices and recommendations on them before asking me.

If a *fact* can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The *decisions*, though, are mine — put each one to me and wait for my answer.

Do not act on it until I confirm we have reached a shared understanding.

After confirmation, classify the shared understanding before proposing a handoff:

- A new capability, behavior change, fix, migration, or other unimplemented desired state belongs in `docs/backlog`. Offer `$backlog` to create or refine the proposed Epic or work item, subject to that skill's explicit approval boundary. Do not recommend publishing its target specification to the wiki.
- A correction, clarification, or durable conclusion that already describes accepted current primary-branch state may be offered to `$to-wiki`. Do not use `$to-wiki` merely because a proposal is well specified or agreed as desirable.
- A conversation may contain both. Route the desired delta to `$backlog`; route only independently current, durable facts to `$to-wiki`, without duplicating the proposal.
- Unresolved decisions remain in the conversation or the proposed backlog record. Do not present them as accepted wiki knowledge or claim that the work is ready.

Ask one final handoff question in the same numbered, one-question-at-a-time format. Invoke only the route the user explicitly accepts.
