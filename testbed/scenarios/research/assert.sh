#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

# Requires network: research resolves versions from live registries.
assert_glob 'docs/backlog/standalone/WORK-002-*.md'
assert_not_grep_glob '^research: pending' 'docs/backlog/standalone/WORK-002-*.md'
# Per-subject version-resolution rows: language/toolchain/runtime always subjects.
# Shape only — never pinned values.
assert_grep_glob '[Tt]ype[Ss]cript' 'docs/backlog/standalone/WORK-002-*.md'
assert_grep_glob '[Nn]ode' 'docs/backlog/standalone/WORK-002-*.md'
assert_grep_glob '[0-9]+\.[0-9]+' 'docs/backlog/standalone/WORK-002-*.md'
# Untouched by research: still proposed, no scope mutation.
assert_grep_glob 'status: proposed' 'docs/backlog/standalone/WORK-002-*.md'
assert_git_log '^docs\(backlog\)'
assert_validate

finish
