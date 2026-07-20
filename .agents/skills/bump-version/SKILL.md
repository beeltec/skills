---
name: bump-version
description: Use when bumping a project version, choosing patch/minor/major increments, updating version files, generating changelog entries, and creating release commits.
---

# Bump Version

Bump the project version and create a release commit.

## Execution Profile

- allowed-tools: Read, Edit, Write, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Skill, Task
- model: sonnet

## Arguments

`$ARGUMENTS`

- No argument: Automatically determine version bump type based on changes (see Analysis step)
- `patch`: Bump patch version (e.g., 0.1.9 -> 0.1.10)
- `minor`: Bump minor version (e.g., 0.9.8 -> 0.10.0)
- `major`: Bump major version (e.g., 9.1.8 -> 10.0.0)

## Instructions

### 1. Discover Project Versioning Configuration

First, check if `.claude/rules/versioning.md` exists in the project root.

**If versioning.md exists:**
- Read it to understand:
  - Which files contain version numbers
  - How to update each file (format, syntax)
  - Any special instructions for this project
- Skip to step 3 (Get Recent Changes)
- **IMPORTANT: Never modify or update an existing versioning.md file**

**If versioning.md does NOT exist:**
- Proceed to step 2 to analyze and create it
- This is the ONLY scenario where versioning.md should be created

### 2. Analyze Project Structure (only if no versioning.md exists)

**Skip this entire step if `.claude/rules/versioning.md` already exists.**

Spawn 2-3 code-explorer agents in parallel to discover where versions are stored:

- **Agent 1: Package Manager Files** - Look for version fields in:
  - `package.json`, `package-lock.json` (Node.js/npm)
  - `Cargo.toml` (Rust)
  - `pyproject.toml`, `setup.py`, `setup.cfg` (Python)
  - `go.mod` (Go)
  - `pom.xml`, `build.gradle` (Java)
  - `*.gemspec`, `version.rb` (Ruby)
  - `pubspec.yaml` (Dart/Flutter)
  - `composer.json` (PHP)

- **Agent 2: Version Files** - Look for dedicated version files:
  - `VERSION`, `VERSION.txt`, `.version`
  - `version.py`, `version.ts`, `version.go`, etc.
  - `_version.py`, `__version__.py`
  - Files containing `__version__` or `VERSION` constants

- **Agent 3: Config/Build Files** - Look for versions in:
  - `*.csproj`, `AssemblyInfo.cs` (.NET)
  - `Info.plist` (iOS/macOS)
  - `build.gradle`, `gradle.properties` (Android)
  - `CMakeLists.txt` (C/C++)
  - Any `config.*` or `settings.*` files with version info

After analysis, create `.claude/rules/versioning.md` with the discovered information:

```markdown
# Project Versioning Configuration

## Version Locations

List each file that contains a version number and how to update it:

| File | Format | Update Method |
|------|--------|---------------|
| path/to/file | description | how to edit |

## Examples

- `package.json`: JSON field `"version": "X.Y.Z"`
- `VERSION`: Plain text, just the version number
- `pyproject.toml`: TOML field `version = "X.Y.Z"` under `[project]`
- `Cargo.toml`: TOML field `version = "X.Y.Z"` under `[package]`

## Special Instructions

Any project-specific notes about versioning (e.g., monorepo considerations,
version prefixes like 'v', additional files to update, etc.)
```

### 3. Get Recent Changes

- Run `git log --oneline` to see recent commits since the last version bump
- Look for commits since the last "chore: bump version" or "release:" commit
- These will be used for the changelog entry and for analysis

### 4. Analyze Changes (if no argument provided)

- If an explicit argument (`patch`, `minor`, or `major`) was provided, skip this step
- Spawn 3-4 code-explorer agents in parallel to analyze the changes since the last release:
  - Agent 1: Analyze commit messages and their prefixes (feat:, fix:, refactor:, etc.)
  - Agent 2: Review the actual code changes (git diff) for new features or API changes
  - Agent 3: Check for new files, removed files, or significant structural changes
  - Agent 4 (optional): Look for breaking changes or deprecations
- Based on the combined analysis, determine the version bump type:
  - **Patch**: Only bug fixes, documentation updates, or minor internal refactors with no user-facing changes
  - **Minor**: Any new features, new functionality, modified user-facing behavior, new API endpoints, or significant refactors
- **IMPORTANT**: Never automatically increment the major version. If breaking changes are detected, recommend `minor` and note the breaking changes for the user to decide.

### 5. Calculate New Version

- Based on arguments or analysis result:
  - `major`: Increment major, reset minor and patch to 0
  - `minor`: Increment minor, reset patch to 0
  - `patch`: Increment patch
- Follow any prefix conventions noted in versioning.md (e.g., some projects use `v` prefix)

### 6. Update Version Files

Using the information from versioning.md (or newly discovered locations):
- Update each file that contains a version number
- Use the appropriate format for each file type
- Preserve any existing formatting/style

### 7. Update CHANGELOG.md

- If the file doesn't exist, create it with the header:
  ```markdown
  # Changelog

  All notable changes to this project will be documented in this file.

  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
  ```
- Add a new entry at the top (after the header) with:
  - The version number and today's date: `## [X.Y.Z] - YYYY-MM-DD`
  - Group changes by type based on commit prefixes:
    - `feat:` -> ### Added
    - `fix:` -> ### Fixed
    - `chore:` -> ### Changed (only include notable ones, skip "bump version" commits)
    - `refactor:` -> ### Changed
    - `docs:` -> ### Documentation
    - `perf:` -> ### Performance
  - List each change as a bullet point with the commit message (without the prefix)

### 8. Stage and Commit

- Stage all modified files (version files + CHANGELOG.md)
- Use the /commit command to create the commit
- The commit message should be: `chore: bump version to X.Y.Z`

## Example Output

```
Checking for versioning configuration...

No .claude/rules/versioning.md found. Analyzing project structure...

Spawning code-explorer agents:
- Agent 1: Scanning package manager files...
- Agent 2: Looking for version files...
- Agent 3: Checking config/build files...

Discovered version locations:
- Cargo.toml: version = "0.9.8" under [package]
- src/lib.rs: const VERSION: &str = "0.9.8"

Created .claude/rules/versioning.md with project configuration.

Analyzing changes since last release...
- Found 2 feat: commits (new features)
- Found 1 fix: commit (bug fixes)
- No breaking changes detected

Recommendation: MINOR bump (new features detected)

Bumping version: 0.9.8 -> 0.10.0 (minor)

Updated files:
- Cargo.toml
- src/lib.rs
- CHANGELOG.md

Changelog entry:
## [0.10.0] - 2024-01-15

### Added
- User authentication flow
- Dark mode support

### Fixed
- Login redirect issue

Creating commit...
```
