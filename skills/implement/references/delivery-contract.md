# Delivery contract

## Read order

1. `docs/work/board.md`
2. `docs/work/items/<KEY>.json`
3. `docs/knowledge/index.md`
4. Relevant concepts
5. Relevant source and tests

This order separates intended work from established facts.

## Check execution

`verify <KEY>` runs each declared command from the project root. It stores the
exit code, timestamp, and bounded output. Review the commands before running
them because work item files are executable project input.

If a command fails, fix the product or refine the work item. Never change the
recorded status by hand.

## Acceptance evidence

Use the shortest evidence that proves the criterion. Good evidence includes a
test case, an inspected response, or a specific file and behavior.

Avoid statements such as "implemented" or "looks good." They do not prove an
outcome.

## Review handoff

Report the resolved starting commit, item key, changed files, checks, and
acceptance evidence. Use `initial tree` when the repository had no commit.
State any overlap with pre-existing dirty files. Then hand off to `review`.
