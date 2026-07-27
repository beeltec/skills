#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_report '## Standards'
assert_report '## Spec'
assert_report 'Review mode:'
assert_report 'combined'
assert_report 'Next step:'
# Review is read-only: no mutations, no status or claim changes.
assert_clean_worktree
assert_branch '^feat/work-001'
assert_grep_glob 'status: in-progress' 'docs/backlog/standalone/WORK-001-*.md'

finish
