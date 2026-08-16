# Context-aware delegation

Apply this gate before changing product code. Use subagents only when one
session is unlikely to finish the implementation safely.

Parallel tickets use separate ticket agents and separate worktrees. This file
also governs further decomposition inside one large ticket. Keep within-ticket
write packets sequential unless their paths are fully disjoint.

## Resolve capacity

Resolve capacity separately for the coordinator and every proposed subagent.
Assume Codex with ChatGPT subscription access unless project instructions or
the user explicitly select API-key access.

1. Read the model identity, total context, and remaining context from runtime
   metadata.
2. Treat the current host or session limit as authoritative.
3. For GPT-5.6 under Codex subscription access, use 256,000 tokens when runtime
   metadata is unavailable.
4. For another model, use an explicit host, user, or project value.
5. If no verified limit exists, mark capacity unknown.
6. Record the model, access mode, limit, remaining capacity, and value source.

Never infer capacity from a model name alone. Combine the exact model with its
access mode and host. Do not use GPT-5.6's 1.05M API limit for a Codex
subscription session.

Apply this rule separately to every subagent. A Claude Opus 5 host that reports
1M can receive a larger packet than a Codex subscription GPT-5.6 session. Do
not replace both with one fixed threshold.

## Apply the session-fit gate

Estimate the context needed for the complete implementation. Include:

- the ticket and relevant established knowledge;
- source and tests that must remain active;
- expected exploration and tool output;
- code edits and focused tests;
- failed checks and likely correction loops;
- integration, final verification, and the review handoff.

Use a runtime token counter when available. Otherwise, make a conservative
estimate from the relevant file sizes and expected diagnostic output.

Reserve at least 25 percent of the model's total window for correction,
integration, verification, and handoff. Increase the reserve for noisy tools
or uncertain work.

The safe implementation budget is the remaining context minus that reserve.
Delegate when estimated demand exceeds the safe budget. Also delegate when
uncertainty makes a safe single-session finish unlikely.

If the safe budget is zero or negative, write the handoff and continue with a
fresh coordinator session. Do not start another packet in the exhausted
session.

If capacity is unknown, use the task shape. Delegate when the item contains
several sizeable, separable implementation tracks. Keep a small, coherent
change with the coordinator.

For direct work, include a one-line fit assessment in the implementation
report. Do not create a handoff only to record a small task.

## Create a durable handoff

For delegated work, create `docs/work/handoffs/<KEY>.md` before spawning an
implementation subagent. Keep it concise and update it after every packet.

Use this structure:

```markdown
# <KEY> implementation handoff

- Fixed point: <resolved target commit>
- Branch: <conventional ticket branch>
- Worktree: <absolute .woktrees path>
- Target branch: <main or explicit override>
- Coordinator model: <exact runtime model>
- Access mode: <Codex subscription, API key, or other host>
- Capacity source: <runtime, user, project, or unknown>
- Total context: <tokens or unknown>
- Remaining context: <tokens or unknown>
- Completion reserve: <tokens or qualitative reserve>
- Safe implementation budget: <tokens or unknown>
- Estimated demand: <tokens or concise basis>
- Decision: delegated

## Scope

<Ticket outcome and excluded scope>

## Packet queue

| Packet | Status | Model | Safe budget | Owned paths | Depends on |
| --- | --- | --- | --- | --- | --- |
| P1 | pending | <model> | <tokens or unknown> | <paths> | - |

## Integration log

<Decisions, changed paths, checks, risks, and remaining work>

## Next action

<One concrete action>
```

The handoff is temporary implementation state. It is not established
knowledge. Keep it after completion only when it helps future maintenance.

## Split implementation packets

Give each packet one coherent technical outcome and exclusive path ownership.
Repeat the capacity calculation for the exact model assigned to that packet.
Split a packet again when it does not fit that subagent's safe budget.

If a subagent discovers a smaller runtime limit, it must stop before editing.
It must return a smaller packet proposal to the coordinator.

Run write packets sequentially by default. Run packets in parallel only when
their behavior and owned paths are independent. Never give two live agents
overlapping write access.

Use the fewest subagents that cover the required packets. Reuse a subagent only
when its retained context remains useful and within its safe budget.

Keep product decisions and acceptance criteria with the coordinator. Return to
`plan` when decomposition changes scope, dependencies, or acceptance criteria.

## Subagent assignment

Include these fields in every implementation assignment:

- work item key and fixed point;
- absolute ticket worktree and branch;
- exact outcome and acceptance criteria covered;
- owned paths and excluded paths;
- relevant project knowledge and official source-note paths;
- the ubiquitous language path and relevant canonical terms;
- the live-verification time for every external rule in the packet;
- focused checks to run;
- assigned model's safe context budget;
- a warning that this worktree belongs only to the named ticket;
- the required return format below.

Require this short return:

```text
Outcome:
Changed paths:
Checks:
Decisions:
Risks:
Remaining work:
```

Tell within-ticket subagents not to transition the item, record acceptance,
create knowledge, run the final review, or commit unless assigned a complete
packet. Require Conventional Commits for assigned commits. Tell them not to
substitute model memory for supplied official sources. Do not use subagents
only to verify the coordinator's work.

Tell subagents not to add or redefine project terms. They must report a
language conflict to the ticket agent.

## Coordinate and integrate

The ticket agent owns its branch, fixed point, packet queue, and final evidence.
The main coordinator owns cross-ticket scheduling and serial integration. Read
concise returns first. Inspect focused diffs instead of raw transcripts.

After all packets finish, run the whole item's configured checks. Record
acceptance evidence only after integrated behavior passes.

Reapply the session-fit gate before every new packet. If the coordinator enters
its completion reserve, update the handoff and continue in a fresh session.

If subagents are unavailable, write the handoff and stop. Report that delegated
implementation has not started. Continue from the handoff in a capable session.
