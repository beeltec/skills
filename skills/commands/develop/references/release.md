# Release

Load for version bumps or release preparation. A release commit is authorized only when the request asks to bump/release or repository procedure explicitly includes it. Publishing remains a separate confirmed action.

## Procedure

1. Read repository release/version instructions. Discover every version-bearing file: package/lock manifests, dedicated version files, language/build metadata, app manifests, and version constants. Record format and update method without creating harness-specific rules files.
2. Read commits and diff since the latest release/version commit or tag.
3. Honor explicit `patch`, `minor`, or `major`. Without one, choose patch for fixes/docs/internal refactors with no user-facing delta and minor for new/changed functionality or APIs. Never infer major: report breaking changes and ask.
4. Calculate the version, preserving prefix and monorepo/package relationships. Update every authoritative version location consistently.
5. Update `CHANGELOG.md`; create it only when release scope requires one. Add `## [X.Y.Z] - YYYY-MM-DD` and concise Added, Fixed, Changed, Documentation, and Performance entries from relevant commits.
6. Run focused version/package checks and the complete supported release matrix required by repository policy. Inspect all changed versions and generated artifacts.
7. Stage only version/changelog paths and create the repository-conventional release commit, default `chore: bump version to X.Y.Z`, when authorized.
8. Report old/new versions, bump rationale, files, changelog, checks, commit, and any separate publish/tag/deploy action requiring confirmation.
