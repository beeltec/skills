# Release contract

## Read order

1. `docs/work/releases/index.md`
2. `docs/work/releases/<REL-N>.json`, when it exists
3. `docs/work/board.md` and every included ticket
4. `docs/knowledge/index.md`
5. `docs/knowledge/ubiquitous-language.md`
6. `docs/knowledge/sources/index.md` and relevant source notes
7. Project build, migration, deployment, and recovery configuration

## State model

Use this path:

```text
planned → deploying → green | failed | rolled-back
```

A release attempt is immutable after a terminal result. Create a new record for
another attempt. A green result means the selected artifact reached the named
target and every recorded post-release check passed.

Ticket `done` means reviewed code is merged and documented. It does not mean the
ticket reached an environment or package registry.

Release only leaf tickets. When a leaf belongs to an epic, require the parent
epic to be `done`. This proves the final integrated epic review passed.

Create and update release and outcome records only on the configured target
branch. The release commit must contain every named ticket as completed.

## Evidence

Record concise evidence that another agent can verify:

- the full current target-branch commit;
- immutable artifact identity and digest;
- build, test, package, migration, and security preflights;
- actual provider and environment;
- rollout observation and user-facing smoke checks;
- approvals from real actors when required;
- the applied recovery action after failure.

Do not place secrets, complete provider logs, or transient tokens in records.
Build and release that exact target commit. Do not attach current tickets to an
older artifact.

Use active canonical project terms in release records and communication. Keep
exact provider, environment, artifact, and API identifiers unchanged.

Use a provider-built artifact, CI job, `git archive`, or clean detached checkout.
Never let uncommitted release records change the artifact. Prefer a provider
digest. Otherwise use `sha256:<hex>` for a file or deterministic directory tree.
Use `git:<full-object-id>` only when the Git object is the complete artifact
identity.

When no external provider or tool rule applies, report that fact. Do not create
a fake official source note.

After a terminal result, validate and commit the release record, generated
indexes, and concise established knowledge. Keep detailed checks and recovery
evidence in the release record. Include each planned outcome created by the
release. Use a Conventional Commit such as
`docs(rel-1): record verified release`. Do not push without user authority.

## Deployment variants

For a service, treat the Git commit or built image as the immutable artifact.
Use staged or canary rollout when the risk justifies it.

For a library or CLI, use the exact package archive and registry digest. A new
corrective version can be the recovery plan when a registry cannot roll back.

For a local product, name the installed artifact and destination. Do not claim a
remote production deployment.

## Failure handling

Stop rollout when a declared check fails. Protect users first. Roll back or
disable the change when the recovery plan is safe. Record what happened. Then
route the defect through `discuss`, `plan`, `implement`, and `review`.

## Official sources

- https://support.atlassian.com/jira-software-cloud/docs/enable-releases-and-versions/
- https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- https://sre.google/sre-book/release-engineering/
- https://sre.google/workbook/canarying-releases/
