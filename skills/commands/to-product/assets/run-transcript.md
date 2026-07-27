# Autonomous run — <slug>

- **PRD**: `<path>` at commit `<sha>`
- **Started**: `<YYYY-MM-DD>`
- **Execution**: `$implement-with-subagents`<, model X, effort Y>
- **Resumes**: `<prior transcript path>` or `none`

## Outcome map

| # | Outcome | Route | Depends on | Record | Status |
|---|---|---|---|---|---|
| 1 | | `$to-epic` | — | `EPIC-NNN` | done |
| 2 | | `$to-backlog` | 1 | `WORK-NNN` | parked |

## Discussions

### Opening — whole PRD

| # | Question | Answer | Source |
|---|---|---|---|
| 1 | | | PRD §N / repo path / wiki path / ASSUMPTION |

### Outcome 1 — <name>

| # | Question | Answer | Source |
|---|---|---|---|

## Assumption register

| # | Assumption | Question it answered | Record | Why unsourced |
|---|---|---|---|---|
| 1 | | | `EPIC-NNN` | PRD silent on ... |

## Gates auto-approved

| Gate | Skill | Decision | Source |
|---|---|---|---|

### Destructive

| Gate | What was overturned | Record that forced it |
|---|---|---|

## Delivery

| Record | Type | Commits | Merge commit | ADRs | Guidance pages |
|---|---|---|---|---|---|

## Out-of-PRD scope filed

| Record | Observation | Where it surfaced |
|---|---|---|

## Parked

| Record | Blocker | Attempts | Resume |
|---|---|---|---|
| `WORK-NNN` | | 3/3 | `$implement WORK-NNN` |

## Result

- Outcomes shipped: `N/M`
- Validator: `pass` / `fail`
- Terminated because: <all outcomes done | everything left parked>
