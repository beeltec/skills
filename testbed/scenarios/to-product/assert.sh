#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

# Requires network (version resolution) and is the longest-running scenario.
assert_grep 'percent' src/index.ts
assert_glob 'tests/*.test.ts'
assert_cmd 'npm test passes' npm test
assert_cmd 'typecheck passes' npm run typecheck
# Delivered work is terminal and archived; wiki reconciliation logged.
assert_glob 'docs/backlog/archive/*/WORK-*.md'
assert_grep_glob 'status: done' 'docs/backlog/archive/*/WORK-*.md'
assert_grep '2026' docs/wiki/log.md
assert_validate
assert_clean_worktree

finish
