# Completion gate

## Why closure is a command

Jira separates workflow status from resolution. This workflow also treats
closure as a controlled transition. Editing JSON cannot promote knowledge or
produce a trustworthy audit record.

Source: https://support.atlassian.com/jira-cloud-administration/docs/configure-resolutions-in-a-jira-workflow/

## Review checklist

- Compare each acceptance criterion with its evidence.
- Check the last check run time against the relevant source changes.
- Confirm Standards and Spec both report zero P0, P1, and P2 findings.
- Inspect every child and blocker.
- Compare each staged concept with the implemented code and tests.
- Confirm update candidates retain still-valid prior knowledge.
- Confirm sources use valid actor names and useful provenance.

## Failure handling

If acceptance or checks fail, transition the item to `in-progress`.

If any P0, P1, or P2 remains, use `implement` to fix it. Run both review passes
again against the same fixed point. Repeat until the blocking counts reach zero.

P3 suggestions do not block completion.

If a knowledge candidate is incomplete, edit the draft and keep the item in
review.

If a child or blocker remains open, complete that work first.

If a target existence check fails, correct `create` versus `update`. Never
overwrite an unrelated concept.

## Trust result

Promotion adds machine confirmation through `process:project-flow`. It does not
add `human:<id>`. Add human review only after a real person confirms the
concept.
