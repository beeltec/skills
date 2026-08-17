---
name: implement
description: Use this skill when a user wants to implement, fix, or continue ready work from `docs/work/`, including an entire epic or review remediation. Coordinate every descendant of a requested epic, document and merge passing tickets in dependency order, then run one final whole-epic review round in an isolated epic review worktree. For standalone tickets, create isolated Conventional Branch worktrees, verify acceptance, invoke one review round automatically, and remediate its P0-P2 findings without re-review unless the user explicitly requests another round. Do not implement blocked tickets, release work, or skip required review.
---

# Implement

Deliver dependency-ready work in isolated ticket worktrees. Keep `main` clean
for coordination and serial integration.

## Procedure

1. Read [references/delivery-contract.md](references/delivery-contract.md).
2. Read [references/git-worktrees.md](references/git-worktrees.md).
3. Read [references/delegation.md](references/delegation.md).
4. Read [references/epic-delivery.md](references/epic-delivery.md) when an epic is requested.
5. Keep the coordinator in a clean target-branch worktree.
6. Run `show <KEY>` for every selected item.
7. Resolve a selected descendant of an open epic to that parent epic.
8. When an epic is selected, follow the epic procedure and coordinate its full child set.
9. Otherwise, select requested `ready` tickets or review repairs already in progress.
10. Reject a non-epic ticket with any open `blocked-by` link.
11. Group only dependency-independent tickets without likely write overlap in non-generated files.
12. Read the brief, gates, knowledge, source notes, code, and `docs/knowledge/ubiquitous-language.md` as the Ubiquitous Language.
13. Use `$source` to verify relevant APIs against current official docs.
14. Run `worktree-add <KEY>` once for each new non-epic ticket.
15. Assign one implementation agent to each ticket worktree.
16. Pin the target commit and apply the session-fit gate per ticket agent.
17. If a ticket will not fit, use implementation subagents for bounded packets.
18. Transition each ticket to `in-progress` inside its own worktree.
19. During review remediation, address every valid P0, P1, and P2 finding.
20. Use canonical project terms in code, tests, and interfaces when they describe the same concept.
21. If code exposes a meaning conflict, stop and use `$language`. Use `$discuss` when behavior or scope changes.
22. Implement the smallest complete ticket change and focused tests.
23. Run `verify <KEY>` and record concrete acceptance evidence.
24. Collect evidence for every declared quality gate and record it with `gate`.
25. Add the instrumentation required by the ticket when the plan includes it.
26. Commit cohesive changes with Conventional Commit messages.
27. Invoke `$review` once for each ticket. Do not ask the user to start review.
28. If review finds P0, P1, or P2 issues, fix every valid in-scope finding.
29. Rerun checks, commit repairs, and record concrete evidence with `review-resolve`.
30. Do not start another review round unless the user explicitly requests it.
31. Leave a reviewed and remediated standalone ticket in `in-review` and hand it to `$document`.

## Review remediation

Treat every valid P0, P1, and P2 finding as required work. A P3 suggestion is
optional and must not expand the ticket without a clear benefit.

The user's implementation request authorizes one review round and its in-scope
repairs. It does not authorize another review round.

Keep the original review fixed point and reports. If a finding is invalid or
outside the ticket, include concrete evidence in the remediation record. After
fixing blocking findings, rerun the whole ticket's checks and use
`review-resolve`. Do not ask the review agents to inspect the fixes.

Commit every repair in the same ticket branch. Do not mix another ticket into
that branch or worktree.

## Commands

```bash
node .project/bin/project-flow.mjs worktree-add APP-2 --branch-type feat
cd .worktrees/app-2
node .project/bin/project-flow.mjs transition APP-2 in-progress
node .project/bin/project-flow.mjs verify APP-2
node .project/bin/project-flow.mjs accept APP-2 AC-1 \
  --status pass \
  --evidence "src/lib/store.test.ts proves persistence"
node .project/bin/project-flow.mjs gate APP-2 GATE-1 \
  --status pass \
  --evidence "Migration rollback test restores the previous schema."
git commit -m "feat(app-2): persist tasks"
```

## Automatic review

Give `$review` the item key, absolute worktree path, branch, target branch name,
and resolved target commit. Ticket worktrees require an existing commit, so
never use `initial tree`.
The review skill must run Standards and Spec in separate parallel subagents.
The implementation agent may coordinate the round but must not perform either
review axis.

For an epic, give `$review` both commits. `review.fixedPoint` is the target
commit used to create the final epic review worktree. `review.scopeBase` is the
target commit from before the first child started. Review the full range from
the scope base through the epic review branch once.

## Boundaries

- Do not stage or promote knowledge directly. `$document` owns that work.
- Do not close an item directly. Invoke `$document` for passing epic children.
- Do not implement product code in the target-branch worktree.
- Do not create an epic worktree before every descendant ticket is done.
- Use an epic worktree only for final integrated review, repairs, and completion.
- Do not treat a direct child request as standalone while its parent epic is open.
- Do not base a dependent ticket on its unfinished blocker branch.
- Do not run overlapping ticket writes in parallel.
- Do not merge or delete standalone ticket branches or worktrees.
- During epic coordination, invoke `$document` to merge each passing child serially.
- Do not mark acceptance passed without evidence.
- Do not mark a quality gate passed without applicable evidence.
- Record review state only through `$review` and `review-resolve`.
- Do not change or erase the original review findings during remediation.
- Do not choose an external API from model memory alone.
- Do not redefine project vocabulary in a ticket worktree.
- Do not delegate small work that fits safely in the current session.
- Do not let within-ticket subagents change workflow state or review the item.
- Stop in `in-review` only after the review round and required remediation complete.
- Do not release epic children before the parent epic passes and reaches `done`.
