---
name: implement
description: Use this skill when a user wants to implement, fix, or continue one or more ready tickets from `docs/work/`, including review fixes. Create one Conventional Branch and `.worktrees/KEY/` worktree per dependency-ready ticket, run independent tickets in parallel agents, enforce Conventional Commits, verify acceptance, and return review fixes until no P0-P2 findings remain. Do not implement blocked tickets, merge branches, promote knowledge, or close items.
---

# Implement

Deliver dependency-ready work in isolated ticket worktrees. Keep `main` clean
for coordination and serial integration.

## Procedure

1. Read [references/delivery-contract.md](references/delivery-contract.md).
2. Read [references/git-worktrees.md](references/git-worktrees.md).
3. Read [references/delegation.md](references/delegation.md).
4. Keep the coordinator in a clean target-branch worktree.
5. Select requested `ready` tickets or review repairs already in progress.
6. Run `show <KEY>` for every selected ticket.
7. Reject epics and tickets with any open `blocked-by` link.
8. Group only dependency-independent tickets without likely write overlap in non-generated files.
9. Read the brief, gates, knowledge, source notes, code, and `docs/knowledge/ubiquitous-language.md` as the Ubiquitous Language.
10. Use `$source` to verify relevant APIs against current official docs.
11. Run `worktree-add <KEY>` once for each new ticket.
12. Assign one implementation agent to each ticket worktree.
13. Pin the target commit and apply the session-fit gate per ticket agent.
14. If a ticket will not fit, use implementation subagents for bounded packets.
15. Transition each ticket to `in-progress` inside its own worktree.
16. During repair loops, address every valid P0, P1, and P2 finding.
17. Use canonical project terms in code, tests, and interfaces when they describe the same concept.
18. If code exposes a meaning conflict, stop and use `$language`. Use `$discuss` when behavior or scope changes.
19. Implement the smallest complete ticket change and focused tests.
20. Run `verify <KEY>` and record concrete acceptance evidence.
21. Collect evidence for every declared quality gate and record it with `gate`.
22. Add the instrumentation required by the ticket when the plan includes it.
23. Commit cohesive changes with Conventional Commit messages.
24. Report each branch, worktree, fixed point, sources, changes, checks, and quality gates.
25. Hand each unchanged ticket branch to `review`.

## Review fixes

Treat every valid P0, P1, and P2 finding as required work. A P3 suggestion is
optional and must not expand the ticket without a clear benefit.

Keep the original review fixed point. If a finding is invalid or outside the
ticket, return concrete evidence to `review`; do not silently ignore it. After
fixing blocking findings, rerun the whole ticket's checks and return to
`review`. Continue until `review` reports zero P0, P1, and P2 findings.

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

## Review handoff

Give `review` the item key, absolute worktree path, branch, and resolved target
commit. Ticket worktrees require an existing commit, so never use `initial tree`.

## Boundaries

- Do not stage or promote knowledge content.
- Do not close the item.
- Do not implement product code in the target-branch worktree.
- Do not create a worktree for an epic or blocked ticket.
- Do not base a dependent ticket on its unfinished blocker branch.
- Do not run overlapping ticket writes in parallel.
- Do not merge or delete ticket branches or worktrees.
- Do not mark acceptance passed without evidence.
- Do not mark a quality gate passed without applicable evidence.
- Do not record the final review.
- Do not approve or dismiss your own review fixes.
- Do not choose an external API from model memory alone.
- Do not redefine project vocabulary in a ticket worktree.
- Do not delegate small work that fits safely in the current session.
- Do not let within-ticket subagents change workflow state or review the item.
- Stop with verified work in `in-progress`.
