#!/usr/bin/env bash
set -u
. "$(cd "$(dirname "$0")/../.." && pwd)/lib/assert.sh"

assert_grep 'seed metric' docs/wiki/domains/ubiquitous-language.md
assert_grep_glob 'ESM' 'docs/wiki/*/*.md'
assert_grep '2026' docs/wiki/log.md
assert_git_log '^docs\(wiki\)'
assert_validate
assert_clean_worktree

finish
