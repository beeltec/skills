#!/usr/bin/env bash

set -euo pipefail

if ! command -v codex >/dev/null 2>&1; then
  echo "error: codex CLI is not installed or not on PATH" >&2
  exit 69
fi

model="gpt-5.6-sol"
reasoning_effort="medium"
working_directory="$PWD"
working_directory_set=false

while (( $# > 0 )); do
  case "$1" in
    --model)
      if (( $# < 2 )); then
        echo "error: --model requires a value" >&2
        exit 64
      fi
      model="$2"
      shift 2
      ;;
    --effort)
      if (( $# < 2 )); then
        echo "error: --effort requires a value" >&2
        exit 64
      fi
      reasoning_effort="$2"
      shift 2
      ;;
    --help|-h)
      echo "usage: $0 [--model MODEL] [--effort LEVEL] [working-directory] < prompt.txt"
      exit 0
      ;;
    --*)
      echo "error: unknown option: $1" >&2
      exit 64
      ;;
    *)
      if [[ "$working_directory_set" == true ]]; then
        echo "error: only one working directory may be provided" >&2
        exit 64
      fi
      working_directory="$1"
      working_directory_set=true
      shift
      ;;
  esac
done

if [[ -z "$model" ]]; then
  echo "error: model must not be empty" >&2
  exit 64
fi

case "$reasoning_effort" in
  none|minimal|low|medium|high|xhigh|max|ultra) ;;
  *)
    echo "error: unsupported effort level: $reasoning_effort" >&2
    exit 64
    ;;
esac

if [[ -t 0 ]]; then
  echo "error: provide the Codex task prompt on stdin" >&2
  exit 64
fi

if [[ ! -d "$working_directory" ]]; then
  echo "error: working directory does not exist: $working_directory" >&2
  exit 66
fi

codex_options=(
  --model "$model"
  --sandbox workspace-write
  --ask-for-approval never
  --config 'sandbox_workspace_write.network_access=true'
  --cd "$working_directory"
)

codex_options+=(--config "model_reasoning_effort=\"$reasoning_effort\"")

exec codex "${codex_options[@]}" exec -
