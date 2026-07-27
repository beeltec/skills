# Assertion helpers sourced by every scenario's assert.sh.
# Contract: PROJECT (project dir), REPORT (harness final-report file) are set.

FAILURES=0
CHECKS=0

_ok() { CHECKS=$((CHECKS + 1)); printf '  \033[32mok\033[0m  %s\n' "$1"; }
_bad() { CHECKS=$((CHECKS + 1)); FAILURES=$((FAILURES + 1)); printf '  \033[31mFAIL\033[0m %s\n' "$1"; }

assert_file() { [ -e "$PROJECT/$1" ] && _ok "exists: $1" || _bad "missing: $1"; }

assert_absent() { [ ! -e "$PROJECT/$1" ] && _ok "absent: $1" || _bad "should not exist: $1"; }

assert_glob() {
  if compgen -G "$PROJECT/$1" > /dev/null; then _ok "glob matches: $1"; else _bad "no file matches: $1"; fi
}

# assert_grep <ERE> <file relative to PROJECT>
assert_grep() {
  if grep -Eqs "$1" "$PROJECT/$2"; then _ok "'$1' in $2"; else _bad "'$1' not found in $2"; fi
}

# assert_not_grep <ERE> <file relative to PROJECT>
assert_not_grep() {
  if grep -Eqs "$1" "$PROJECT/$2"; then _bad "'$1' unexpectedly present in $2"; else _ok "'$1' absent from $2"; fi
}

# assert_grep_glob <ERE> <glob relative to PROJECT> — passes when any matching file contains the pattern
assert_grep_glob() {
  local f
  for f in $PROJECT/$2; do
    if [ -e "$f" ] && grep -Eqs "$1" "$f"; then _ok "'$1' in $2"; return; fi
  done
  _bad "'$1' not found in $2"
}

# assert_not_grep_glob <ERE> <glob relative to PROJECT> — fails when any matching file contains the pattern
assert_not_grep_glob() {
  local f
  for f in $PROJECT/$2; do
    if [ -e "$f" ] && grep -Eqs "$1" "$f"; then
      _bad "'$1' unexpectedly present in $f"
      return
    fi
  done
  _ok "'$1' absent from $2"
}

assert_report() {
  if grep -Eqs "$1" "$REPORT"; then _ok "report contains '$1'"; else _bad "report lacks '$1'"; fi
}

assert_validate() {
  if [ ! -f "$PROJECT/scripts/validate-project.mjs" ]; then
    _bad "scripts/validate-project.mjs missing"
  elif (cd "$PROJECT" && node scripts/validate-project.mjs) > /dev/null 2>&1; then
    _ok "validate-project.mjs passes"
  else
    _bad "validate-project.mjs fails"
  fi
}

# assert_cmd <description> <command...> — runs in PROJECT, passes on exit 0
assert_cmd() {
  local desc="$1"
  shift
  if (cd "$PROJECT" && "$@") > /dev/null 2>&1; then _ok "$desc"; else _bad "$desc"; fi
}

# assert_branch <ERE> — current branch name matches
assert_branch() {
  local branch
  branch="$(git -C "$PROJECT" branch --show-current)"
  if printf '%s' "$branch" | grep -Eqs "$1"; then _ok "branch '$branch' matches $1"; else _bad "branch '$branch' does not match $1"; fi
}

# assert_git_log <ERE> — some commit subject matches
assert_git_log() {
  if git -C "$PROJECT" log --all --format='%s' | grep -Eqs "$1"; then _ok "commit matching '$1'"; else _bad "no commit matching '$1'"; fi
}

# assert_clean_worktree — no uncommitted or untracked changes
assert_clean_worktree() {
  if [ -z "$(git -C "$PROJECT" status --porcelain)" ]; then _ok "clean worktree"; else _bad "worktree has uncommitted changes"; fi
}

finish() {
  echo "  ($((CHECKS - FAILURES))/$CHECKS checks passed)"
  [ "$FAILURES" -eq 0 ]
}
