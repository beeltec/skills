# Full workflow verification prompt

Run this verification autonomously from the root of the skill-suite repository.
Do not wait for more product decisions. This prompt states and confirms them.

## Goal

Create a disposable Next.js and SQLite project. Use every local workflow skill
to take one feature from confirmed idea to measured local release.

This is a real workflow exercise. It is not a repository test harness. Add only
the focused product tests required by the installed project rules. Do not add
skill-routing tests, broad regression suites, snapshots, or evaluation files.

## Authority and limits

- Work only inside this repository's `.verification/` directory.
- Read files elsewhere in this repository when a skill requires them.
- Create local Git commits, branches, worktrees, artifacts, and processes.
- Install npm packages and open current official documentation.
- Do not push, publish, deploy remotely, or change user-scoped agent rules.
- Use `main` as the target branch.
- Use Conventional Commits and the workflow's Conventional Branch names.
- Use the current harness's runtime context information. Do not infer it from a model name.
- Use subagents where `implement` and `review` require them.
- Stop only for a real safety, authority, tool, or environment blocker.
- Record a blocked result honestly. Do not bypass a skill boundary.

## Load the skills

Treat every named skill below as explicitly invoked at its stage. Do not load
all skill bodies at the start. Immediately before each invocation, read that
skill's `SKILL.md` completely. Then read each directly required reference.

1. `skills/setup/SKILL.md`
2. `skills/rules/SKILL.md`
3. `skills/source/SKILL.md`
4. `skills/language/SKILL.md`
5. `skills/discuss/SKILL.md`
6. `skills/plan/SKILL.md`
7. `skills/implement/SKILL.md`
8. `skills/review/SKILL.md`
9. `skills/document/SKILL.md`
10. `skills/ship/SKILL.md`
11. `skills/measure/SKILL.md`
12. `skills/next/SKILL.md`

Do not replace a skill with an improvised shortcut.

## Create the disposable project

Resolve the suite root first. Use `.verification/full-workflow-project` as the
project path.

If that path exists, require its `.skill-workflow-verification` sentinel. Move
the old directory into a new temporary backup directory. Stop if the sentinel
is missing. Never delete or replace an unrecognized directory.

Create a current empty Next.js App Router project with TypeScript, ESLint, a
`src/` directory, npm, and no Tailwind. Use the official `create-next-app`
command and disable its automatic Git initialization. Add a `typecheck` script
that runs `tsc --noEmit`. Create the sentinel.

Run `scripts/link-skills.sh` from the suite root against the new project. Confirm
that all twelve skills are linked under both `.agents/skills/` and
`.claude/skills/`.

Initialize a nested Git repository on `main`. Commit the clean generated
application as:

```text
chore: create verification baseline
```

## Confirmed product decisions

Treat every statement in this section as my explicit decision and confirmation.
Do not ask me to repeat it.

- Project key: `VFY`.
- Project name: `Small Steps Verification`.
- User: a developer evaluating this workflow.
- Problem: the developer needs direct evidence that the workflow can deliver a real local feature.
- Outcome: the developer can create and complete a task through one local web page.
- Store tasks in a local SQLite file through Node's built-in `node:sqlite` API.
- Show tasks newest first.
- Trim task titles.
- Reject an empty title with an accessible inline message.
- Limit titles to 120 characters.
- Let the user toggle a task between open and completed.
- Keep authentication, editing, deletion, teams, and remote hosting out of scope.
- Use the installed Next.js version and the active Node.js 24 release.
- Use no third-party database library.
- Use only focused product tests that prove owned behavior or a real boundary.
- Delivery checks are focused product tests, ESLint, TypeScript, a production build, workflow validation, and direct browser use.
- Local release target: a production-mode server started from the exact release artifact.
- Recovery: stop that server and restore the previous local artifact.
- No approval is required beyond this prompt for local-only release actions.
- Product metric: elapsed time to create and complete the first task.
- Baseline: no working task flow exists.
- Target: one new user completes the flow within 60 seconds without an error.
- Observation window: one browser session immediately after the local release becomes green.
- Data source: timestamped browser actions and visible page state recorded in the verification report.
- If the target is met, the product decision is `proceed`.
- If the target is missed, the product decision is `improve`.
- If evidence is unusable, the product decision is `stop` with result `inconclusive`.
- I authorize that decision rule and the actor value `human:user` for this run.
- I confirm the final brief when it contains these exact decisions and no material additions.

I also confirm these Ubiquitous Language entries:

- `Task`: A named item that a user can complete. Accepted alias: `todo`.
- `Completed task`: A task whose completion state is complete.

## Run the workflow

Keep `.verification/full-workflow-project/verification-report.md` current after
each stage. Record commands, paths, IDs, commits, review-agent identities,
severity counts, and observed results. Keep raw noisy output out of the report.

### 1. Setup, rules, sources, and language

Use `$setup` with the confirmed project key, name, and target branch. During
setup, use `$rules` for the recommended project profile only. Use `$source` to
open current official documentation and create concise local notes for:

- the Ubiquitous Language principle;
- Git worktrees, topic branches, merge, and branch deletion;
- Jira work-item dependencies;
- Conventional Commits and Conventional Branch;
- the installed Next.js version and relevant App Router mutation behavior;
- the active Node.js 24 `node:sqlite` API;
- SQLite strict tables.

Invoke `$rules` directly after setup. Run its project-scope dry run and exact
check. Do not install user-scoped rules.

Invoke `$language` and add both confirmed terms. Use `$language` again to show
the complete readable vocabulary. Confirm the terms occur only in canonical
frontmatter and are not copied into the Markdown body.

Run workflow validation. Commit all setup, source, rule, and language state as:

```text
docs: initialize verified project workflow
```

### 2. Discuss and plan

Invoke `$next` and record its recommendation.

Invoke `$discuss` with the confirmed decisions above. All material choices and
the exact brief confirmation already exist in this prompt. Do not create a fake
question round. If you discover a genuine missing decision, use the harness's
structured user-question tool as required and mark the run blocked because this
autonomous prompt was incomplete.

Persist and confirm one brief with `human:user`.

Invoke `$plan` for that brief. Apply YAGNI. Create one epic with exactly two
stories. The first story must create, list, validate, and persist tasks. The
second story must toggle completion and must be blocked by the first story.
The epic must cover the complete integrated task flow.

Include precise acceptance criteria and relevant official source-note paths.
Include dependency and accessibility risks. Add both required quality gates
and these checks to every item where they apply:

- `npm run lint`
- `npm test`
- `npm run typecheck`
- `npm run build`

Move the fully defined epic and both stories to `ready`. Run validation. Commit
the discussion and plan as:

```text
docs: plan local task workflow
```

Invoke `$next` again. It must recommend `$implement` with the epic key. It must
not recommend one story.

### 3. Implement and review

Invoke `$implement` for the epic. Let it coordinate both story worktrees and
branches in dependency order. Use the smallest typed design. Never use
TypeScript `any`.

Implement the full feature and verify it through the configured checks and
direct application use. Record concrete acceptance and quality-gate evidence.

Implementation must invoke `$review` automatically for each story. After a
story passes review, it must invoke `$document` and merge that story into
`main`. It must continue until both stories are `done`.

After both stories are `done`, implementation must create the final epic review
worktree. It must verify the integrated flow and invoke `$review` for the whole
epic. Each ticket and the epic must use one review round with two subagents in parallel:

- one Standards reviewer;
- one Spec reviewer.

The orchestrator must perform neither review axis. Record each subagent's
identity and separate P0-P3 counts for every story and epic review. Fix every
valid P0, P1, and P2 finding. Rerun the configured checks and record concrete
remediation with `review-resolve`. Do not start another review round. Leave the
epic in `in-review` after review and remediation complete.

Treat missing subagent support as a blocked verification. Never replace the two
reviewers with an orchestrator review.

### 4. Document and integrate

Invoke `$document` for the epic. Create concise established knowledge for the
integrated task behavior and storage architecture. Do not duplicate canonical
ticket or vocabulary data in generated Markdown.

Complete the epic through the CLI. Commit its documentation. Merge it into
`main` with the configured no-fast-forward merge. Confirm that the epic review
worktree and local branch are removed only after a clean green merge. Confirm
that both story worktrees and local branches were already removed after their
successful integrations.

Invoke `$next` and record its recommendation.

### 5. Ship locally

Invoke `$ship` for both completed stories in one release. Do not release the
epic. This prompt authorizes only local release actions.

Create an immutable artifact from the exact clean `main` commit. Calculate and
record a stable digest. Use a sibling path under `.verification/` as the local
destination. Run the declared preflight checks. Start the production server from
the released artifact on an available loopback port.

Use a real browser tool when the harness provides one. Otherwise use direct HTTP
requests and state that browser-only behavior could not be observed. Create and
complete one task through the running release. Record post-release evidence.

Mark the release `green` only when every declared check passes. Keep the server
available for measurement. Commit the release evidence with a Conventional
Commit. Do not push it.

### 6. Measure and finish

Invoke `$measure` for the outcome created by the green release. Use the original
brief metric, baseline, target, observation window, and data source. Record the
observed elapsed time and visible result. Apply the confirmed decision rule.
Commit the outcome evidence with a Conventional Commit.

Invoke `$next` one final time. It should report no unfinished delivery, release,
or measurement action. Stop every local server before finishing.

## Final checks

Complete `verification-report.md` first. Put `PASS` or `BLOCKED` at its top.
Commit the final report and any remaining verification records as:

```text
docs: finalize workflow verification
```

Then run these checks from the disposable project:

- `node .project/bin/project-flow.mjs validate`
- the rules manager's exact project-profile check;
- `git status --short --branch`;
- `git worktree list`;
- a list of test files with one concrete failure each test can detect;
- a search for evaluation files or repository-level skill test harnesses;
- a search for duplicated vocabulary content outside canonical frontmatter;
- a search for successful check output retained in work-item JSON.

The run passes only when:

- every one of the twelve skills has concrete evidence in the report;
- workflow validation passes;
- `main` is clean;
- the epic and both stories are `done`;
- the epic and story branches and worktrees are gone;
- one final epic Standards and Spec review round is recorded;
- every final epic P0, P1, and P2 finding has remediation evidence;
- the final epic review covers the complete integrated delivery range;
- established ticket knowledge exists;
- the release is `green`;
- the outcome is observed;
- every product test is focused and no evaluation or skill-test harness exists;
- no remote action occurred.

For `BLOCKED`, name the exact unmet condition and preserve all useful local
evidence. If a final check changes the result, update and commit the report,
then run every final check again. Do not edit files after the final clean-tree
check. End your response with the project path, report path, final Git commit,
release ID, outcome ID, and result.
