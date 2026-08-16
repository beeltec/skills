---
name: ship
description: Use this skill when a user wants to release, deploy, publish, roll out, or verify completed project work. Build a release from done tickets, refresh official provider documentation, record preflight evidence, create an immutable artifact, obtain required authority, deploy or publish, verify the live result, recover on failure, and establish only green release knowledge. Do not implement tickets or claim production success before post-release checks pass.
---

# Ship

Move completed repository work into a verified release. Keep ticket completion
separate from deployment or publication.

## Procedure

1. Read [references/release-contract.md](references/release-contract.md).
2. Require `.project/workflow.json`. Use `setup` when it is missing.
3. Read the work board, release index, knowledge index, and source index.
4. Require a clean configured target-branch worktree.
5. Select only `done` tickets already merged into that target branch.
6. Create one release record when no suitable planned release exists.
7. If external rules apply, use `$source` to refresh the exact official guidance.
8. Otherwise, report that no external provider or tool rule applies.
9. Confirm the target, version policy, rollout, recovery plan, and required approvals.
10. Run every applicable build, test, security, migration, and packaging preflight.
11. Record each preflight with `release-check --phase pre`.
12. Resolve the current target-branch commit.
13. Build one immutable artifact from a clean checkout of that exact commit.
14. Obtain its provider digest or calculate a stable digest locally.
15. Obtain explicit authority before any remote push, publication, or deployment.
16. Run `release-start` with the resolved target commit, artifact, digest, actor, and approvals.
17. Deploy or publish with the verified project or provider command.
18. Supervise the rollout and run user-facing smoke and health checks.
19. Record every live check with `release-check --phase post`.
20. Recover first when the release harms users or fails its declared checks.
21. Record `failed` or `rolled-back`, then create a linked bug through `discuss` and `plan`.
22. Record `green` only when all checks pass. Let the command establish release knowledge.
23. Create one outcome record per confirmed brief included in the release.
24. Run `validate` and commit the release evidence with a Conventional Commit.
25. Report the release ID, commit, artifact, target, checks, result, and recovery state.

## Commands

```bash
node .project/bin/project-flow.mjs release-create \
  --title "Task workflow release" \
  --kind deploy \
  --ticket APP-2 \
  --provider "Vercel" \
  --environment production \
  --destination "tasks.example.com" \
  --migration "No data migration." \
  --rollout "Deploy to preview, then production." \
  --recovery "Restore the previous deployment."

node .project/bin/project-flow.mjs release-check REL-1 \
  --phase pre --status pass --name "Build" --evidence "npm run build passed."

node .project/bin/project-flow.mjs release-start REL-1 \
  --commit main --artifact "git:<commit>" --digest "git:<commit>" --by agent/ship

node .project/bin/project-flow.mjs release-check REL-1 \
  --phase post --status pass --name "Production smoke" \
  --evidence "Create and toggle paths passed at the production URL."

node .project/bin/project-flow.mjs release-finish REL-1 \
  --status green --by agent/ship --evidence "Production health remained green."
node .project/bin/project-flow.mjs validate
git add docs
git commit -m "docs(rel-1): record verified release"
```

## Boundaries

- Do not release an epic or an unfinished ticket.
- Do not release an older commit while naming tickets from the current target.
- Do not build a release artifact from a dirty coordinator worktree.
- Do not use model memory as provider guidance.
- Do not execute external changes without the user's authority.
- Do not expose credentials in commands, logs, records, or knowledge.
- Do not treat a successful command as proof that users can use the release.
- Do not mark a release green without passing post-release evidence.
- Do not overwrite a failed attempt. Create another release record.
- Do not change ticket `done` state during release work.
- Do not establish failed or rolled-back behavior as the current deployed state.
