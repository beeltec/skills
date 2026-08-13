---
name: review
description: Do an adversarial code review on the changes since a fixed point on two axes
---

## Pin the fix point

Do a git diff of the fixed point (commit, branch name, tag, etc.) and HEAD (`git diff <fixed-point>...HEAD`) and note the list of commits (`git log <fixed-point>..HEAD --oneline`)

## Find the spec source

Find the originating ticket (Story, Bug Ticket or Plan file)

## Identify the standards sources

Search the wiki for the data of the used technologies and see them as standards.

On top of whatever the repo documents, the Standards axis always carries the smell baseline below — a fixed set of Fowler code smells (Refactoring, ch.3) that applies even when a repo documents nothing. Two rules bind it:

The repo overrides. A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
Always a judgement call. Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.
Each smell reads what it is → how to fix; match it against the diff:

- Mysterious Name — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- Duplicated Code — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- Feature Envy — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- Data Clumps — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- Primitive Obsession — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- Repeated Switches — the same switch/if-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- Shotgun Surgery — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- Divergent Change — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- Speculative Generality — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- Message Chains — long a.b().c().d() navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- Middle Man — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- Refused Bequest — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

## Findings classification

When reporting your findings use priority levels

| Priority | Urgency    | Impact     | Example                                                              | Response                                                   |
| -------- | ---------- | ---------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| P0       | Critical   | Extensive  | System outage                                                        | Immediate                                                  |
| P1       | High       | Large      | Major feature malfunctioning                                         | Urgent but not out of BAU schedule                         |
| P2       | Moderate   | Moderate   | Minor feature malfunctioning                                         | Important but needs to be prioritized against other issues |
| P3       | Low        | Minor      | Functionality or feature prevents a few users from using the product | Part of routine work                                       |
| P4       | Negligible | Negligible | Minor issue that doesn’t affect user base                            | Should be placed on backlog                                |

## Spawn subagents in parallel

Create two subagents (see `references/models`)
1. Standards reviewer: does the code conform to this repo's documented coding standards?
2. Specs reviewer: does the code faithfully implement the originating ticket?

## Aggregate

Present the two reports under ## Standards and ## Spec headings, verbatim or lightly cleaned. Do not merge or rerank findings — the two axes are deliberately separate (see Why two axes).
End with a one-line summary: total findings per axis, and the worst issue within each axis (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

## Why two axes?

A change can pass one axis and fail the other:

Code that follows every standard but implements the wrong thing → Standards pass, Spec fail.
Code that does exactly what the issue asked but breaks the project's conventions → Spec pass, Standards fail.
Reporting them separately stops one axis from masking the other.
