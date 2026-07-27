#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_file docs/wiki/index.md
assert_file docs/wiki/maintenance.md
assert_file docs/wiki/domains/ubiquitous-language.md
assert_file docs/wiki/architecture/decisions/index.md
assert_file docs/backlog/index.md
assert_file docs/backlog/maintenance.md
assert_file docs/backlog/templates/story.md
assert_file scripts/validate-project.mjs
assert_absent docs/wiki/research
assert_glob 'docs/wiki/engineering/technologies/typescript*.md'
assert_grep_glob 'status: draft' 'docs/wiki/engineering/technologies/*.md'
assert_grep 'setup-project' AGENTS.md
assert_validate
assert_report 'Next step:'

finish
