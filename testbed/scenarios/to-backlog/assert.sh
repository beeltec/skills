#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_glob 'docs/backlog/standalone/WORK-*.md'
assert_grep_glob 'status: ready' 'docs/backlog/standalone/WORK-*.md'
# Definition of Ready: research and decisions resolved, never left pending.
assert_not_grep_glob '^research: pending' 'docs/backlog/standalone/WORK-*.md'
assert_not_grep_glob '^decisions: pending' 'docs/backlog/standalone/WORK-*.md'
assert_grep_glob '## Research' 'docs/backlog/standalone/WORK-*.md'
# Two-half evidence decision: guidance/standard subjects named or none-applies recorded.
assert_grep_glob '[Ss]tandard|[Gg]uidance|none applies' 'docs/backlog/standalone/WORK-*.md'
assert_grep 'WORK-' docs/backlog/index.md
assert_git_log '^docs\(backlog\)'
assert_validate
assert_report 'Next step:'

finish
