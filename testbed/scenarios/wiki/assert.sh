#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_grep_glob 'index\.ts|barrel' 'docs/wiki/*/*.md'
assert_grep_glob 'status: active' 'docs/wiki/*/*.md'
assert_grep '2026' docs/wiki/log.md
assert_git_log '^docs\(wiki\)'
assert_validate
assert_clean_worktree

finish
