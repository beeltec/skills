# Harness adapter: maps one fixed prompt to the installed CLI's headless mode.
# run_harness <harness> <project-dir> <prompt-file> <report-file>
# stdout (the final agent message) goes to <report-file>; progress/errors to <report-file>.stderr.
# Flags below track each CLI's documented headless interface; verify against your installed
# version when a harness misbehaves (pi and omp print-mode flags vary between releases).

run_harness() {
  local harness="$1" project="$2" prompt_file="$3" report="$4"
  local prompt
  prompt="$(cat "$prompt_file")"
  case "$harness" in
    claude)
      (cd "$project" && claude -p --dangerously-skip-permissions "$prompt") > "$report" 2> "$report.stderr"
      ;;
    codex)
      (cd "$project" && codex exec --dangerously-bypass-approvals-and-sandbox "$prompt") > "$report" 2> "$report.stderr"
      ;;
    opencode)
      (cd "$project" && opencode run ${OPENCODE_MODEL:+--model "$OPENCODE_MODEL"} "$prompt") > "$report" 2> "$report.stderr"
      ;;
    pi)
      (cd "$project" && pi -p "$prompt") > "$report" 2> "$report.stderr"
      ;;
    omp)
      (cd "$project" && omp --mode text -p "$prompt") > "$report" 2> "$report.stderr"
      ;;
    *)
      echo "unknown harness: $harness (supported: claude codex opencode pi omp)" >&2
      return 2
      ;;
  esac
}
