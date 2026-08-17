# Example project instructions

## Commands

- Run tests with `npm test`.
- Run type checks with `npm run typecheck`.
- Create a production build with `npm run build`.
- Use Node.js 24.15 or newer for `node:sqlite`.

<!-- agent-rule:project-evidence:start sha256=4a6ce9ae95bec54f9b3ad184d32f4b41987e6394f16a88ac4672edd749684d13 -->
## Project evidence and state

Keep established project knowledge separate from intended work. Use the correct
evidence for each kind of claim.

### Information spaces

- Treat `docs/knowledge/` as verified current project state.
- Treat `docs/work/` as desired state, delivery evidence, or work history.
- Never present a brief, ticket, draft, release plan, or outcome plan as current fact.
- Promote repository knowledge only after implementation, acceptance, checks, and review pass.
- Promote deployed facts only from a verified green release.
- Promote product-result facts only from an observed outcome.

### Evidence roles

- Use official documentation to prove external behavior and constraints.
- Use repository code and tests to prove implemented behavior.
- Use release checks to prove an artifact reached its named target.
- Use analytics, observed usage, and user research to prove product outcomes.
- Use an explicit owner decision when evidence cannot choose product intent.
- Never substitute one evidence role for another.

### Workflow gates

- Use `next` when the current workflow action is unclear.
- Require a persisted, confirmed brief before moving an epic or story to `ready`.
- Keep ticket delivery acceptance separate from the product success measure.
- Declare applicable risk factors and record each required quality gate.
- Never set a work item to `done` by editing its JSON file.
- Complete a ticket only after acceptance, checks, gates, and review pass.
- Treat ticket `done` as merged and documented repository state.
- Treat release `green` as verified deployed or published state.
- Treat `met`, `missed`, or `inconclusive` as an observed product result.
- Validate generated indexes and boards after workflow state changes.
<!-- agent-rule:project-evidence:end -->

<!-- agent-rule:ubiquitous-language:start sha256=a94bff1ca0d3642a45937e25d1bceac4283f6593423917ce58d7bc46fe52aa23 -->
## Ubiquitous language

Use one shared project vocabulary to reduce meaning conflicts between users,
agents, work records, and code.

Apply only the Ubiquitous Language principle. Do not infer other Domain-Driven
Design practices.

### Rules

- Read `docs/knowledge/ubiquitous-language.md` before interpreting project terms.
- Use one active canonical term for each project concept.
- Use canonical terms consistently in discussion, work records, code, tests, and knowledge.
- Recognize accepted aliases, but prefer the canonical term in new text.
- Let the user or responsible domain expert decide project meaning.
- Treat a changed definition as a changed meaning, not an editorial correction.
- Require explicit user agreement before adding, revising, renaming, or deprecating a term.
- Use qualified terms when one word would otherwise represent two meanings.
- Preserve deprecated terms and their replacements instead of deleting history.
- Inspect affected uses after an agreed term changes.
- Ignore text matches that describe a different concept.
- Preserve exact vendor names, commands, API identifiers, interface names, and quotations.
- Do not let external documentation choose the project's preferred vocabulary.
- Use the `language` skill for managed vocabulary changes.
- Do not edit the generated readable body by hand.
<!-- agent-rule:ubiquitous-language:end -->

<!-- agent-rule:ticket-git-workflow:start sha256=42f3016c79783b106f22053f825a8d7aa3c8dcd06a9d320e606bccd0b3f344e7 -->
## Ticket Git workflow

Keep ticket implementation isolated and integration predictable.

### Branches and worktrees

- Keep the configured integration worktree clean and on its target branch.
- Use `main` as the target branch unless project configuration names another branch.
- Do not implement ticket code in the integration worktree.
- Use one branch and `.worktrees/<lowercase-ticket-key>/` worktree for each non-epic ticket.
- Use `feat/<key>-<slug>` for stories and `fix/<key>-<slug>` for bugs.
- Use `chore/<key>-<slug>` for tasks and subtasks when no better supported type exists.
- Never reuse one ticket branch or worktree for another ticket.
- Do not create an implementation branch or worktree for an epic.

### Dependencies and parallel work

- Do not implement a ticket while any `blocked-by` ticket remains open.
- Do not base a dependent ticket on its unfinished blocker branch.
- Merge the blocker into the target branch before starting dependent implementation.
- Parallelize only ready tickets without a dependency path between them.
- Do not parallelize tickets with likely overlap in non-generated write paths.
- Assign each agent one ticket and one absolute worktree path.
- Keep final integration serial even when implementation is parallel.

### Commits and integration

- Use Conventional Branch 1.1.0 names for ticket branches.
- Use Conventional Commits 1.0.0 for ticket and merge commits.
- Use the lowercase ticket key as the commit scope for ticket-owned changes.
- Keep commits cohesive and passing when practical.
- Keep unrelated changes out of the ticket branch.
- Make the latest target commit an ancestor before final review.
- Rerun checks and review after synchronizing with an advanced target branch.
- Merge green ticket branches into the configured target branch with `--no-ff`.
- Remove only clean worktrees and fully merged local branches.
- Use `git branch -d`; never force-delete a ticket branch.
- Never bypass Git worktree safeguards with `--force`.
- Require explicit user authority for pushes, pull requests, remote deletion, publication, or deployment.
<!-- agent-rule:ticket-git-workflow:end -->

<!-- agent-rule:code-quality:start sha256=9ffff2eee5ad3d8afb53d46880da8aad2dc2c87d8cb410818c8d21901b2b5235 -->
## Code quality

Prefer the simplest implementation that makes the required behavior clear and
unsurprising.

### Rules

- Follow the repository's existing language, framework, and formatting conventions.
- Keep responsibilities clear and names precise.
- Prefer early returns over deeply nested conditions.
- Use the type system to make invalid states difficult to represent.
- Never use `any` in TypeScript.
- Use one typed model for related values that must remain consistent.
- Avoid wrappers that only delegate without adding meaning.
- Keep one change within the smallest coherent set of modules.
- Do not change one module for unrelated reasons.
- Handle relevant error paths and boundary conditions.
- Protect sensitive data and validate untrusted input.
- Add focused tests that prove changed behavior or a repaired defect.
- Do not add broad regression tests without a concrete risk.
- Keep comments concise and update them when behavior changes.

### DRY

Apply Don't Repeat Yourself (DRY) to duplicated knowledge and decisions.

- Keep each fact or rule in one unambiguous, authoritative representation.
- Derive repeated outputs from that source when practical.
- Do not treat similar-looking code as a DRY violation without shared meaning.
- Prefer small local duplication when one abstraction would couple unrelated concepts.

### YAGNI

Apply You Aren't Gonna Need It (YAGNI) to presumed future capabilities.

- Build only behavior required by accepted current work.
- Do not add speculative features, options, extension points, or general frameworks.
- Add an abstraction when current behavior needs it, not only because future work might.
- Refactor when it keeps current code healthy and easy to change.
- Do not use YAGNI to excuse weak tests, unsafe code, or known defects.

### Review focus

Check correctness, security, error handling, data handling, maintainability, and
type safety. Treat a style preference as advice unless it creates a concrete
risk or violates an explicit repository rule.
<!-- agent-rule:code-quality:end -->

<!-- agent-rule:comments:start sha256=88f6a6b905c265a65b499eca557e17b135655400203868a51eb96bf0fc55b061 -->
## Code comments

Use comments to preserve important information that clear code, names, and
types cannot express. Follow the repository's language-specific documentation
format when one exists.

### Function and API comments

- Describe a public or non-obvious function's contract directly above its declaration.
- Use one or two sentences by default.
- State purpose and correct use, not facts already clear from its name and types.
- Add necessary constraints, side effects, errors, ownership, or lifecycle details.
- Omit a comment for a simple private function when its purpose and use are obvious.
- Do not add boilerplate comments to every function only for consistency.
- At a definition, explain only non-obvious implementation choices.
- Do not repeat a declaration comment at the function definition.

### Implementation comments

- Prefer clearer code, names, types, or smaller functions over explanatory narration.
- Explain intent, constraints, tradeoffs, invariants, or surprising behavior.
- Do not translate each statement into prose.
- Place a short comment before the smallest non-obvious block it explains.
- Use inline end-of-line comments sparingly.
- Preserve exact identifiers and technical terms.
- Do not keep commented-out code. Git already stores deleted code.

### Length and maintenance

- Keep routine comments short and focused.
- Do not write a paragraph when one or two sentences preserve the needed fact.
- Keep necessary API contract details near the API, even when they need more space.
- Move long rationale or tutorials to maintained project documentation and link to it.
- Update or remove affected comments in the same change as the code.
- Treat an inaccurate comment as a defect.
<!-- agent-rule:comments:end -->

<!-- agent-rule:testing:start sha256=14b954d881516e87e480c1a5d6ca76ac2ac8e5d5fed3671e020621dc58206fea -->
## Focused testing

Use the smallest test that gives reliable confidence in required current
behavior. Treat every test as code that the project must understand and
maintain.

### Choose the test level

- Use a unit test for focused logic, decisions, transformations, and edge cases.
- Keep unit tests fast, deterministic, self-checking, and isolated from external systems.
- Use an integration test for one real boundary, such as SQLite, files, serialization, or an owned service contract.
- Use an end-to-end test only when a critical user journey needs the integrated system.
- Keep end-to-end tests few because they are slower and more costly to maintain.
- Use the lowest level that can prove the behavior with adequate confidence.
- Do not repeat the same assertions at several test levels without added confidence.

### Keep each test focused

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

### Avoid test slop

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

### Review the value

Before adding or keeping a test, identify the failure it can detect. Do not add
the test when that failure is irrelevant, impossible, or already caught more
clearly elsewhere.
<!-- agent-rule:testing:end -->

<!-- agent-rule:review-policy:start sha256=f20512c6110eaed1ac00ca2229eb38fdd17682057062a96ff354959a7ad52db0 -->
## Review policy

Review completed changes against repository standards and the requested
behavior before integration.

### Required passes

- Pin one immutable fixed point for the complete review scope.
- Run a Standards pass against applicable rules, checks, and engineering risks.
- Run a separate Spec pass against the originating ticket or specification.
- Inspect the complete change in both passes.
- Keep findings and severity counts separate for each pass.

### Severity gate

- Treat P0 as a critical defect requiring immediate correction.
- Treat P1 as a high-impact defect or serious risk.
- Treat P2 as a real defect, unmet requirement, or concrete maintainability risk.
- Treat P3 as a non-blocking improvement without a current failure.
- Block approval and integration while any P0, P1, or P2 remains.
- Do not classify a style preference alone as P2.
- State the concrete impact, file, and line for each finding.

### Review loop

- Send every valid blocking finding back to implementation.
- Require focused tests and the complete configured check set after fixes.
- Rerun fresh Standards and Spec passes against the complete updated change.
- Continue until both passes report zero P0, P1, and P2 findings.
- Do not approve only because automated checks pass.
- Do not accept a promise to fix later as a resolved finding.
- Allow documented P3 suggestions to remain.
<!-- agent-rule:review-policy:end -->
