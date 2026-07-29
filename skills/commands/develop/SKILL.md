---
name: develop
description: Route an explicitly invoked development request through the lightest suitable procedure, from discussion and direct changes through governed planning, implementation, review, releases, guidance, or autonomous delivery. Use only when the user invokes `$develop`, `/develop`, or the harness-equivalent explicit command; never activate for an ordinary development request.
disable-model-invocation: true
---

# Develop

`develop` is the development gateway: the sole public workflow skill. It classifies the request, loads only the required internal procedures, and owns continuation through the user's requested outcome.

Invocation authorizes routing and the requested work, not unrelated scope, destructive actions, deployment, remote publication, or owner-proxy autonomy. Explicit autonomous intent delegates only the PRD-required decisions and destructive gates defined in `autonomous.md`. Repository instructions remain authoritative.

## Workflow

1. Read [references/routing.md](references/routing.md). For explicit `help`, load [references/help.md](references/help.md) and stop before repository resolution or inspection. Otherwise resolve the objective first; when absent, ask without repository inspection. Then resolve the project root and applicable instructions. Inspect only enough repository, git, wiki, and backlog state to classify the request; preserve unrelated changes.
2. Honor an explicit mode when compatible with the request. Otherwise select the least burdensome lane. State the lane in one short sentence and start it without route approval. Ask only for a missing objective, a genuine product decision, destructive action, deployment, or unresolved ambiguity.
3. Build one authority packet containing the objective, scope, exclusions, branch policy, approvals, relevant records and knowledge, fixed point, and verification expectations. Pass it between procedures; re-read an authority only after compaction, branch change, external commit, mutation, failed validation, expired claim, or changed fixed point.
4. Load only the applicable procedure files:
   - explicit `help` -> [references/help.md](references/help.md)
   - shaping or decision interview -> [references/discussion.md](references/discussion.md)
   - desired-state planning, backlog records, or research -> [references/planning.md](references/planning.md)
   - wiki/backlog lifecycle or accepted knowledge -> [references/project-state.md](references/project-state.md)
   - governance initialization or upgrade -> [references/setup.md](references/setup.md)
   - technology or standards evidence and adopted guidance -> [references/evidence-guidance.md](references/evidence-guidance.md)
   - code, deployment, branching, governed acceptance, or worker implementation -> [references/execution.md](references/execution.md)
   - review or acceptance verification -> [references/review.md](references/review.md)
   - at least two independent read-only units or requested implementation workers -> [references/delegation.md](references/delegation.md)
   - version bump or release preparation -> [references/release.md](references/release.md)
   - explicit `product`, `unattended`, `autonomous`, or `owner-proxy` intent -> [references/autonomous.md](references/autonomous.md)
5. Compose procedures only when the outcome needs them. Keep mutations and owner decisions serial. Continue internally when the original request includes execution; stop at discussion, planning, review, or publication when that is the requested outcome.
6. Run proportionate verification. Remove temporary verification artifacts. Inspect status and diffs; never overwrite or stage unrelated work. Commit, merge, push, open a PR/MR, release, or deploy only when the request or selected procedure authorizes it.
7. Report the selected lane, changes, decisions, branches, commits, checks, records, blockers, and remaining risk. For a follow-up, form one exact `$develop ...` request with real arguments. When the harness provides an ask-user-question tool, offer that request as the recommended option plus a stop option; continue only when selected, treating selection as a new explicit request with no broader authority. Otherwise end with `Next step: $develop ...`. Never emit both. Omit the handoff when no follow-up exists.

## Modes

Mode words are optional disambiguators, not separate skills:

```text
$develop help [goal]
$develop discuss <idea>
$develop plan <outcome>
$develop setup
$develop knowledge <accepted fact>
$develop guidance <subjects>
$develop implement <request or EPIC-NNN/WORK-NNN>
$develop review <fixed-point>
$develop release [patch|minor|major]
$develop product <PRD path or prose>
```

An unknown mode is ordinary request text. Never require users to learn the mode vocabulary.

## Boundaries

- **Always:** choose the lightest safe lane, keep scope explicit, use current project evidence, preserve unrelated work, and verify the result.
- **Ask first:** destructive state changes, deployments, remote publication, material scope changes, and product decisions, except PRD-required gates delegated by explicit autonomous intent.
- **Never:** activate without explicit invocation, infer owner-proxy authority, invent project facts or deploy commands, mutate `docs/tasks`, hide uncertainty, or invoke removed legacy workflow skills.
