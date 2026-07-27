#!/usr/bin/env bash
# Regenerate checked-in checkpoint fixtures by running the upstream skills headlessly.
# Run after an upstream skill changes its output shape, then commit the checkpoint diff.
#
# Usage: bin/regen.sh [governed|ready-item|changed-branch|all]   (default: all)
#   governed        seed -> $setup-project run -> checkpoints/governed
#   ready-item      governed -> $to-backlog (WORK-001 ready) + $backlog intake (WORK-002
#                   proposed) -> checkpoints/ready-item
#   changed-branch  ready-item tree copied to checkpoints/changed-branch; the branch,
#                   claim, and code change are recreated per run by _setup.sh
#
# Order matters: each stage consumes the previous stage's checkpoint.

set -euo pipefail

TESTBED="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(cd "$TESTBED/.." && pwd)"
RUNS_DIR="${TESTBED_RUNS_DIR:-${TMPDIR:-/tmp}/skills-testbed}"
HARNESS="${HARNESS:-claude}"
TARGET="${1:-all}"

# shellcheck source=../lib/harness.sh
. "$TESTBED/lib/harness.sh"
# shellcheck source=../lib/project.sh
. "$TESTBED/lib/project.sh"

# regen_run <checkpoint> <label> <prompt-file...> — prepare from <checkpoint>, run each
# prompt in sequence, and echo the resulting project dir.
regen_run() {
  local checkpoint="$1" label="$2"
  shift 2
  local out="$RUNS_DIR/regen-$label-$(date +%Y%m%d-%H%M%S)"
  local project="$out/project"
  prepare_project "$(checkpoint_src "$checkpoint")" "$project" >&2
  local prompt_file
  for prompt_file in "$@"; do
    echo "regen[$label]: running $(basename "$prompt_file") via $HARNESS" >&2
    run_harness "$HARNESS" "$project" "$prompt_file" "$out/report-$(basename "$prompt_file" .md).txt" \
      || echo "regen[$label]: harness exited non-zero — inspect $out before committing" >&2
  done
  echo "$project"
}

regen_governed() {
  local project
  project="$(regen_run seed governed "$TESTBED/scenarios/setup-project/prompt.md")"
  snapshot_project "$project" "$TESTBED/checkpoints/governed"
  echo "regen: checkpoints/governed refreshed from $project"
}

regen_ready_item() {
  local project
  project="$(regen_run governed ready-item \
    "$TESTBED/scenarios/to-backlog/prompt.md" \
    "$TESTBED/regen/work-002-intake-prompt.md")"
  snapshot_project "$project" "$TESTBED/checkpoints/ready-item"
  echo "regen: checkpoints/ready-item refreshed from $project"
}

regen_changed_branch() {
  # Deterministic: same tree as ready-item; _setup.sh (checked in, preserved by the
  # snapshot filter) recreates the branch, claim, and code change at run time.
  rsync -a --delete --exclude .git --exclude node_modules --filter 'P _*' \
    "$TESTBED/checkpoints/ready-item/" "$TESTBED/checkpoints/changed-branch/"
  [ -f "$TESTBED/checkpoints/changed-branch/_setup.sh" ] \
    || { echo "regen: checkpoints/changed-branch/_setup.sh is missing — restore it from git" >&2; exit 1; }
  echo "regen: checkpoints/changed-branch refreshed from ready-item"
}

mkdir -p "$RUNS_DIR"
case "$TARGET" in
  governed) regen_governed ;;
  ready-item) regen_ready_item ;;
  changed-branch) regen_changed_branch ;;
  all) regen_governed && regen_ready_item && regen_changed_branch ;;
  *) echo "unknown target: $TARGET" >&2; exit 2 ;;
esac
echo "regen: review the checkpoint diff, run the downstream scenarios, then commit."
