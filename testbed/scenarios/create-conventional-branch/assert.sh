#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_branch '^(feature|feat|bugfix|fix|hotfix|release|chore)/[a-z0-9]+(-[a-z0-9]+)*$'
assert_branch 'work-001'
# Branch creation only: nothing implemented, nothing committed.
assert_clean_worktree
assert_absent src/percent.ts

finish
