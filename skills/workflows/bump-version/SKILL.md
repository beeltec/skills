---
name: bump-version
description: Bump a project version, choosing patch/minor/major increments, updating version files, generating changelog entries, and creating a release commit.
---

# Bump Version

Bump the project version and create a release commit.

## Execution Profile

- allowed-tools: Read, Edit, Write, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Skill, Task
- model: sonnet

## Arguments

`$ARGUMENTS` — `patch`, `minor`, or `major`. With no argument, determine the bump type from the changes (step 4).

## Instructions

### 1. Discover versioning configuration

If `.claude/rules/versioning.md` exists, read it (version file locations, update formats, special instructions) and skip to step 3. **Never modify an existing versioning.md.** Only when it does not exist, continue to step 2 — the only scenario where it is created.

### 2. Analyze project structure (only without versioning.md)

Spawn 2-4 code-explorer agents in parallel, on the cheapest available tier, to find version locations:

- **Package manager files:** `package.json`/`package-lock.json`, `Cargo.toml`, `pyproject.toml`/`setup.py`/`setup.cfg`, `go.mod`, `pom.xml`/`build.gradle`, gemspecs, `pubspec.yaml`, `composer.json`
- **Dedicated version files:** `VERSION`, `VERSION.txt`, `.version`, `version.*`, `_version.py`, `__version__`/`VERSION` constants
- **Config/build files:** `*.csproj`/`AssemblyInfo.cs`, `Info.plist`, `gradle.properties`, `CMakeLists.txt`, `config.*`/`settings.*`

Re-run an explorer on a stronger tier only when it returns nothing usable.

Then create `.claude/rules/versioning.md` containing: a table of each version-bearing file with its format and update method, and any special instructions (monorepo notes, `v` prefixes, extra files).

### 3. Get recent changes

Run `git log --oneline` and collect commits since the last "chore: bump version" or "release:" commit — used for analysis and the changelog.

### 4. Analyze changes (only without an explicit argument)

Spawn 3-4 code-explorer agents in parallel, on the cheapest available tier: commit-message prefixes; the actual diff for features or API changes; added/removed files and structural changes; optionally breaking changes and deprecations. Decide:

- **Patch:** only bug fixes, docs, or internal refactors with no user-facing changes.
- **Minor:** any new feature or functionality, modified user-facing behavior, new API endpoints, or significant refactors.
- **Never auto-bump major.** If breaking changes are detected, recommend `minor` and list the breaking changes for the user to decide.

### 5. Calculate new version

`major`: increment major, reset minor and patch. `minor`: increment minor, reset patch. `patch`: increment patch. Follow any prefix convention noted in versioning.md.

### 6. Update version files

Update every version-bearing file per versioning.md, preserving each file's format and style.

### 7. Update CHANGELOG.md

If missing, create it with the standard Keep a Changelog / Semantic Versioning header. Add a new top entry `## [X.Y.Z] - YYYY-MM-DD` grouping commit messages (prefix stripped) by type: `feat:` → Added; `fix:` → Fixed; `chore:`/`refactor:` → Changed (notable only; skip bump-version commits); `docs:` → Documentation; `perf:` → Performance.

### 8. Stage and commit

Stage the version files and CHANGELOG.md, then use the /commit command with message `chore: bump version to X.Y.Z`.
