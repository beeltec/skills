---
name: document
description: Use this skill after implementation and code review to create or update established project knowledge. Turn the completed behavior into draft OKF concepts under `docs/work/drafts/`, verify the drafts against code and evidence, promote them into `docs/knowledge/`, and close the green work item.
---

# Document

Capture only facts that the reviewed implementation now proves. Complete the
work item through the knowledge promotion gate.

## Procedure

1. Read [references/completion-gate.md](references/completion-gate.md).
2. Run `show <KEY>`.
3. Confirm the item is `in-review` with both review axes passing.
4. Review acceptance evidence and the latest check results.
5. Read the implemented source and relevant established concepts.
6. Identify durable facts that future work needs.
7. Create one small draft per stable concept.
8. Edit each draft to describe current behavior, not the original plan.
9. Compare every draft with the code and tests.
10. Run `complete <KEY>`.
11. Fix any rejected gate and repeat.
12. Run `validate` and report promoted paths and resolution.

## Create a draft

```bash
node .project/bin/project-flow.mjs knowledge-template APP-2 \
  --target architecture/task-storage.md \
  --action create \
  --type Architecture \
  --title "Task storage" \
  --description "Tasks persist in a local SQLite database."
```

The command returns a path under `docs/work/drafts/<KEY>/`. Edit that file
before completion.

Use `update` when the knowledge target exists. Preserve every still-valid fact and
unknown OKF field.

## Complete and promote

```bash
node .project/bin/project-flow.mjs complete APP-2
node .project/bin/project-flow.mjs validate
node .project/bin/project-flow.mjs status
```

Completion moves valid drafts into `docs/knowledge/`, records their digests,
sets a resolution, and refreshes the knowledge indexes, log, and work board.

## Knowledge rules

- Document current architecture, behavior, interfaces, data, and operations.
- Omit temporary implementation detail with no future value.
- Keep rejected approaches in work history.
- Leave user wishes and future behavior in `docs/work/`.
- Never claim human review without an actual human reviewer.
