# Releases — glab release

Reference for GitLab releases from the CLI.

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `release create` | Create a new release (or update an existing one) |
| `release list` | List releases |
| `release view` | View release details |
| `release delete` | Delete a release |
| `release download` | Download release assets |
| `release upload` | Upload assets to an existing release |

## glab release create

Updates the release if the tag already has one. Requires at least Developer role.

### Syntax

```bash
glab release create <tag> [<files>...] [flags]
```

### Flags

| Flag | Short | Type | Description |
|------|-------|------|-------------|
| `--notes-file` | `-F` | string | Read notes from file (use `-` for stdin) |
| `--ref` | `-r` | string | Commit SHA, tag, or branch to release from (if tag doesn't exist) |
| `--released-at` | `-D` | string | Release date in ISO 8601 format |
| `--tag-message` | `-T` | string | Message for a new annotated tag |
| `--assets-links` | `-a` | string | JSON representation of asset links |
| `--use-package-registry` | — | bool | Upload assets to generic package registry |
| `--no-close-milestone` | — | bool | Don't close milestones after creating release |
| `--no-update` | — | bool | Don't update if release already exists |
| `--publish-to-catalog` | — | bool | Publish to CI/CD catalog (experimental) |

Also: `-n/--name`, `-N/--notes` (Markdown), `-m/--milestone` (comma-separated or repeated).

### Examples

```bash
glab release create v1.0.1 -F CHANGELOG.md -n "Version 1.0.1" -m "v1.0.1"

# Files become assets; globs expand
glab release create v1.0.1 ./dist/app-linux.tar.gz ./dist/app-mac.tar.gz
glab release create v1.0.1 ./dist/*

# Display name (append #), then link type (append # again)
glab release create v1.0.1 './dist/app-linux.tar.gz#Linux Build'
glab release create v1.0.1 './dist/app.tar.gz#App Package#package'

# External URLs as assets
glab release create v1.0.1 --assets-links='[
  {"name": "Docs", "url": "https://docs.example.com/v1.0.1", "link_type": "other"},
  {"name": "Docker Image", "url": "https://registry.example.com/app:v1.0.1", "link_type": "image"}
]'

# --ref creates the tag when it doesn't exist; -T annotates it
glab release create v1.0.1 --ref release/1.0 -T "Release v1.0.1"
glab release create v1.2.0 ./build/artifacts/* --ref $CI_COMMIT_SHA

# Package registry instead of generic storage
glab release create v1.0.1 ./dist/*.tar.gz --use-package-registry

glab release create v1.0.1 -D "2025-01-15T10:00:00Z"
```

### Asset Link Types

For `--assets-links` JSON and the `#type` suffix:

| Type | Description |
|------|-------------|
| `other` | Generic link (default) |
| `package` | Package file |
| `image` | Container image |
| `runbook` | Runbook link |

## glab release list

```bash
glab release list -F json --per-page 10
```

## glab release view

```bash
glab release view v1.0.1
```

## glab release delete

```bash
glab release delete v1.0.1                     # Keeps the tag
glab release delete v1.0.1 --with-tag --yes    # Also delete tag; skip confirmation
```

## glab release download

```bash
glab release download v1.0.1                   # All assets
glab release download v1.0.1 -n "app.tar.gz" -D ./downloads
```

## glab release upload

```bash
glab release upload v1.0.1 './dist/app.tar.gz#Linux Build#package'
glab release upload v1.0.1 --assets-links='[{"name":"Docs","url":"https://example.com"}]'
```

## Changelog — glab changelog

```bash
glab changelog generate --version v1.0.1
```
