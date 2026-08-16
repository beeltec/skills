---
name: measure
description: Use this skill after a green release when a user wants to evaluate whether the product solved its confirmed problem, inspect success metrics or user feedback, decide whether to proceed, improve, revert, or stop, and save the observed result as established knowledge. Use the brief's baseline, target, observation window, and data source. Do not infer product success from code completion or deployment alone.
---

# Measure

Compare a green release with the success definition agreed before planning.
Turn observed evidence into the next explicit product decision.

## Procedure

1. Read [references/outcome-contract.md](references/outcome-contract.md).
2. Require `.project/workflow.json`. Use `setup` when it is missing.
3. Require a clean configured target-branch worktree.
4. Run `sync` and `validate` before interpreting evidence.
5. Read the outcome, brief, green release, knowledge, and `docs/knowledge/ubiquitous-language.md` as the Ubiquitous Language.
6. Confirm the brief still names the metric, baseline, target, window, and data source.
7. Wait when the observation window is incomplete or the required data is unavailable.
8. Use `$source` for current official analytics, privacy, or experiment documentation.
9. Obtain the declared product data and relevant qualitative user evidence.
10. Check instrumentation quality, sample limits, exclusions, and conflicting signals.
11. Compare the observed value with the baseline and target without changing either.
12. Classify the result as `met`, `missed`, or `inconclusive`.
13. Choose `proceed`, `improve`, `revert`, or `stop` with concrete reasons.
14. For `improve` or `revert`, use `discuss` and `plan` to create follow-up tickets first.
15. Use active canonical terms when describing evidence and decisions.
16. Resolve a meaning conflict through `$language` before recording the result.
17. Run `outcome-record` with the observation, evidence, decision, actor, and follow-ups.
18. Run `validate` and commit the outcome evidence with a Conventional Commit.
19. Report the established outcome path and the next workflow action.

## Command

```bash
node .project/bin/project-flow.mjs outcome-record OUT-1 \
  --observed "Completion rate increased from 42% to 61% over 14 days." \
  --result met \
  --decision proceed \
  --evidence "Analytics report 2026-09-01, cohort n=840." \
  --by human:product-owner
node .project/bin/project-flow.mjs validate
git add docs
git commit -m "docs(out-1): record measured outcome"
```

## Boundaries

- Do not use repository tests as product outcome evidence.
- Do not use official technical documentation as proof of user need.
- Do not record an outcome before the agreed observation window is complete.
- Use `ship` recovery when a harmful release needs an earlier rollback.
- Do not silently change the baseline, target, cohort, or metric definition.
- Do not hide missing, weak, or contradictory evidence.
- Do not record `met` when the evidence is inconclusive.
- Do not create product changes without returning through `discuss` and `plan`.
- Do not record a non-human actor as a human decision maker.
- Do not push the outcome commit without user authority.
- Do not change a term's meaning to make a result appear successful.
