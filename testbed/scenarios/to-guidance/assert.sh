#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

# Requires network: the guidance skill researches the subject's current docs.
assert_glob 'docs/wiki/engineering/technologies/typescript*.md'
assert_grep_glob 'status: active' 'docs/wiki/engineering/technologies/typescript*.md'
assert_not_grep_glob 'Not yet researched' 'docs/wiki/engineering/technologies/typescript*.md'
assert_grep_glob '## Sources' 'docs/wiki/engineering/technologies/typescript*.md'
# Installed-version pin present and numeric.
assert_grep_glob '5\.[0-9]+' 'docs/wiki/engineering/technologies/typescript*.md'
assert_validate
assert_clean_worktree

finish
