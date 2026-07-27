# Harness adapter: maps one fixed prompt to the installed CLI's headless mode.
# run_harness <harness> <project-dir> <prompt-file> <report-file>
# stdout (the final agent message) goes to <report-file>; progress/errors to <report-file>.stderr.
# Flags below track each CLI's documented headless interface; verify against your installed
# version when a harness misbehaves (pi and omp print-mode flags vary between releases).

# Detect the nearest supported parent harness; use markers when process names are unavailable.
detect_harness() {
  local pid="${PPID:-}" command
  while [ -n "$pid" ] && [ "$pid" -gt 1 ]; do
    command="$(ps -p "$pid" -o comm= 2> /dev/null || true)"
    command="${command##*/}"
    case "$command" in
      claude | codex | opencode | pi | omp) printf '%s\n' "$command"; return ;;
    esac
    pid="$(ps -p "$pid" -o ppid= 2> /dev/null | tr -d '[:space:]')"
  done

  if [ "${CLAUDECODE:-}" = 1 ]; then printf '%s\n' claude
  elif [ -n "${CODEX_THREAD_ID:-}" ]; then printf '%s\n' codex
  elif [ "${PI_CODING_AGENT:-}" = true ]; then printf '%s\n' pi
  else
    echo "cannot detect the current harness; set HARNESS or use --harness" >&2
    return 2
  fi
}

resolve_harness() {
  if [ -n "${HARNESS:-}" ]; then printf '%s\n' "$HARNESS"
  else detect_harness
  fi
}

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
