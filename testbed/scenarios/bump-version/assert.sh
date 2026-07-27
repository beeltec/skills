#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_grep '"version": "0\.1\.1"' package.json
assert_file CHANGELOG.md
assert_grep '\[0\.1\.1\]' CHANGELOG.md
assert_git_log 'bump version to 0\.1\.1'
assert_clean_worktree

finish
