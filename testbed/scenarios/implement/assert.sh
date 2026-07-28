#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

# Requires network when the workflow pins versions from live registries.
assert_grep 'percent' src/index.ts
assert_glob 'src/percent*.ts'
assert_cmd 'npm test passes' npm test
assert_cmd 'typecheck passes' npm run typecheck
assert_cmd 'lint passes' npm run lint
assert_glob 'docs/backlog/archive/standalone/WORK-001-*.md'
assert_grep_glob 'status: done' 'docs/backlog/archive/standalone/WORK-001-*.md'
assert_grep_glob 'claim: none' 'docs/backlog/archive/standalone/WORK-001-*.md'
assert_validate
assert_report '[Rr]eview( mode)?:.*combined'
assert_report 'suite'
assert_report 'Next step:'

finish
