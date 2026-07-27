#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_glob 'docs/backlog/epics/EPIC-*'
assert_grep_glob 'type: epic' 'docs/backlog/epics/*/EPIC-*.md'
assert_grep_glob 'status: ready' 'docs/backlog/epics/*/EPIC-*.md'
assert_grep '^- \[EPIC-[0-9]{3,}: [^]]+\]\(EPIC-[^)]*/\) - .+' docs/backlog/epics/index.md
assert_not_grep '\]\(EPIC-[^)]*/EPIC-[0-9]{3,}\.md\)' docs/backlog/epics/index.md
# At least two executable children inside the Epic directory, each parented to it.
assert_glob 'docs/backlog/epics/*/WORK-*.md'
assert_grep_glob 'parent: EPIC-' 'docs/backlog/epics/*/WORK-*.md'
assert_not_grep_glob '^research: pending' 'docs/backlog/epics/*/WORK-*.md'
assert_not_grep_glob '^decisions: pending' 'docs/backlog/epics/*/WORK-*.md'
assert_grep 'WORK-' docs/backlog/index.md
assert_git_log '^docs\(backlog\)'
assert_validate
assert_report 'Next step:'

finish
