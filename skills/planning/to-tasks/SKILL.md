---
name: to-tasks
description: Break a plan, specification, issue, or the current conversation into local tracer-bullet task documents with explicit blocking dependencies. Use when the user explicitly invokes $to-tasks or asks to turn agreed work into an implementation backlog under docs/tasks.
---

# To Tasks

Break agreed work into independently actionable tasks. Make each task a narrow,
complete vertical slice and record the tasks that block it.

## Workflow

### 1. Gather context

1. Work from the conversation and any supplied plan or wiki article.
2. If the user supplies a file, issue, URL or wiki article, read its complete body and relevant
   comments before drafting tasks.
3. Read applicable agent instructions and project planning conventions.

### 2. Explore the project when useful

Inspect the relevant code, tests, architecture decisions, and domain vocabulary
unless the current context already establishes them. Use project terminology in
task titles and descriptions. Look for prefactoring that would make later changes
easy; schedule genuinely necessary prefactoring before the work it enables.

If `docs/wiki` contains an internal OKF wiki, read the indexes and concepts
relevant to the work. Link each task to the canonical wiki entries that constrain
or explain it. Do not invent wiki references when no relevant entry exists.

### 3. Draft tracer-bullet tasks

Split the work according to these rules:

- Make each task a narrow but complete path through every necessary layer, such
  as storage, API, UI, and tests. Do not create separate horizontal tasks for
  layers that cannot deliver useful behavior alone.
- Make every completed task independently demoable or verifiable.
- Size each task to fit comfortably in one fresh context window.
- Give every task explicit blocking edges. A task with no blockers can start
  immediately.
- Give every task a comprehensive Markdown checklist of all subtasks required
  to complete it. Make each checklist item concrete and independently
  checkable so an implementing agent can track progress without reconstructing
  the plan.
- Add prefactoring tasks only when they reduce implementation risk or unblock a
  vertical slice.
- Avoid implementation snippets and volatile file paths. Include a compact
  prototype-derived state machine, schema, reducer, or type shape only when it
  captures a decision more precisely than prose, and identify it as coming from
  the prototype.

Treat wide mechanical refactors as the exception. Use an expand-contract
sequence when one atomic rename or shared-type change would break too many call
sites to land green:

1. Expand by adding the new form beside the old form.
2. Migrate call sites in independently green batches sized by blast radius.
3. Contract by removing the old form after every migration task is complete.

Make each migration depend on the expansion, and make the contraction depend on
all migrations. If migration batches cannot remain green independently, state
that they share an integration branch and add a final integrate-and-verify task
blocked by every batch.

### 4. Get approval

Before creating files, present the proposed breakdown as a numbered list. For
each task show:

- **Title:** a short, descriptive name.
- **Blocked by:** the numbered tasks that genuinely gate it, or none.
- **What it delivers:** the end-to-end behavior made usable or verifiable.

Ask whether the granularity is right, whether the blocking edges are accurate,
and whether any tasks should be merged or split. Revise the breakdown until the
user approves it. Do not publish an unapproved breakdown.

### 5. Publish local task documents

1. Derive a shell-safe feature slug from the current branch or the agreed work.
2. Create `docs/tasks/<feature-slug>/` if needed. If `docs/tasks` is newly
   created, add `/docs/tasks/` to the project `.gitignore` unless project-local
   instructions require task documents to be tracked.
3. Write one Markdown file per approved task. Never combine the tasks into a
   master document.
4. Number files from `001` in dependency order, with blockers before blocked
   tasks: `docs/tasks/<feature-slug>/<NNN>-<task-slug>.md`.
5. Record blocking edges using task numbers, titles, and relative links. A task
   may only reference a lower-numbered blocker.
6. Set every newly published task to `ready-for-agent`. The actionable frontier
   is the set of tasks whose blockers are complete.
7. Review the files and dependency graph for incomplete subtask checklists,
   missing acceptance criteria, cycles, stale references, and accidental
   horizontal slices.

Do not close or modify a source or parent issue.

## Task Template

```markdown
# <NNN> — <Task title>

**What to build:** <The end-to-end behavior this task makes work from the
user's perspective.>

**Blocked by:** <Relative links with task numbers and titles, or "None — can
start immediately".>

**Status:** ready-for-agent

## Subtasks

- [ ] <Concrete implementation subtask>
- [ ] <Concrete implementation subtask>

## Acceptance criteria

- [ ] <Observable or verifiable criterion>
- [ ] <Observable or verifiable criterion>

## Knowledge references

- <Links to relevant canonical OKF wiki entries; omit this section when none
  apply.>
```

Make the subtask checklist comprehensive enough to guide and track the full
implementation. Keep acceptance criteria outcome-focused and sufficient to
prove the slice is complete; do not use them as a substitute for the subtask
checklist.
