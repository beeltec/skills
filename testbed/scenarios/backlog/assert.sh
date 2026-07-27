#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_glob 'docs/backlog/standalone/WORK-*.md'
assert_grep_glob 'status: proposed' 'docs/backlog/standalone/WORK-*.md'
assert_grep_glob 'type: task' 'docs/backlog/standalone/WORK-*.md'
assert_grep_glob 'parent: none' 'docs/backlog/standalone/WORK-*.md'
assert_grep 'WORK-' docs/backlog/index.md
assert_git_log '^docs\(backlog\)'
assert_validate
assert_clean_worktree

finish
