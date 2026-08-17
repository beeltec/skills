# Focused testing

Use the smallest test that gives reliable confidence in required current
behavior. Treat every test as code that the project must understand and
maintain.

## Choose the test level

- Use a unit test for focused logic, decisions, transformations, and edge cases.
- Keep unit tests fast, deterministic, self-checking, and isolated from external systems.
- Use an integration test for one real boundary, such as SQLite, files, serialization, or an owned service contract.
- Use an end-to-end test only when a critical user journey needs the integrated system.
- Keep end-to-end tests few because they are slower and more costly to maintain.
- Use the lowest level that can prove the behavior with adequate confidence.
- Do not repeat the same assertions at several test levels without added confidence.

## Keep each test focused

- Test observable behavior and stable contracts, not private implementation details.
- Give each test one clear reason to fail.
- Use a name that states the behavior and relevant condition.
- Keep setup small and make the important input and expected result visible.
- Cover meaningful boundaries, error paths, and risks named by the work item.
- Control time, randomness, concurrency, environment, and network dependencies.
- Prefer real values and small fakes over deep mock graphs.
- Assert the relevant result, not every incidental field or call.
- Use snapshots only when the full stable output is the intended contract.
- Keep test helpers simpler than the behavior they support.

## Avoid test slop

- Do not add tests only to raise coverage or increase a test count.
- Do not test language, framework, or library behavior that the project does not own.
- Do not create broad combinations without a named risk or distinct behavior.
- Do not keep a higher-level test when it adds no confidence beyond a lower level.
- Delete obsolete tests when their behavior or contract is intentionally removed.
- Do not add a regression test only to prove that deleted internal code stays deleted.
- Test a removed feature's absence only when that absence is a current contract or security requirement.
- For a defect, add the smallest durable test that fails before the fix and proves the current contract.
- Repair a flaky test's cause. Remove it only when it has no distinct current value.
- Do not hide failures with retries or weaker assertions.

## Review the value

Before adding or keeping a test, identify the failure it can detect. Do not add
the test when that failure is irrelevant, impossible, or already caught more
clearly elsewhere.
