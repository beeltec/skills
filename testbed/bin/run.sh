#!/usr/bin/env bash
# Run testbed scenarios against the working-tree skills.
#
# Usage: bin/run.sh [-H harness] [-a|--all] [--since REF] [scenario...]
#   scenario...   run exactly these scenarios (names under scenarios/)
#   -a, --all     run every scenario
#   (default)     run scenarios affected by skill changes since REF (--since, default HEAD:
#                 uncommitted changes; use e.g. --since origin/main for committed work)
#   -H, --harness claude|codex|opencode|pi|omp (default: $HARNESS or claude)
#
# Run artifacts land under $TESTBED_RUNS_DIR (default: $TMPDIR/skills-testbed).

set -euo pipefail

TESTBED="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(cd "$TESTBED/.." && pwd)"
RUNS_DIR="${TESTBED_RUNS_DIR:-${TMPDIR:-/tmp}/skills-testbed}"
HARNESS="${HARNESS:-claude}"
SINCE="HEAD"
ALL=0
SELECTED=()

while [ $# -gt 0 ]; do
  case "$1" in
    -H | --harness) HARNESS="$2"; shift 2 ;;
    -a | --all) ALL=1; shift ;;
    --since) SINCE="$2"; shift 2 ;;
    -h | --help) sed -n '2,12p' "$0"; exit 0 ;;
    -*) echo "unknown flag: $1" >&2; exit 2 ;;
    *) SELECTED+=("$1"); shift ;;
  esac
done

# shellcheck source=../lib/harness.sh
. "$TESTBED/lib/harness.sh"
# shellcheck source=../lib/project.sh
. "$TESTBED/lib/project.sh"

scenario_var() { (. "$TESTBED/scenarios/$1/scenario.sh" && eval "printf '%s' \"\${$2:-}\""); }

all_scenarios() { (cd "$TESTBED/scenarios" && ls -d */ | tr -d /); }

affected_scenarios() {
  local changed s c skills
  changed="$( (
    git -C "$REPO" diff --name-only "$SINCE" -- skills
    git -C "$REPO" ls-files --others --exclude-standard -- skills
  ) | cut -d/ -f2-3 | sort -u)"
  [ -n "$changed" ] || return 0
  for s in $(all_scenarios); do
    skills="$(scenario_var "$s" SKILLS)"
    for c in $changed; do
      case " $skills " in
        *" $c "*) echo "$s"; break ;;
      esac
    done
  done
}

run_scenario() {
  local s="$1"
  local dir="$TESTBED/scenarios/$s"
  [ -d "$dir" ] || { echo "unknown scenario: $s" >&2; return 1; }
  local checkpoint src
  checkpoint="$(scenario_var "$s" CHECKPOINT)"
  src="$(checkpoint_src "$checkpoint")"
  # A checkpoint holding only _-prefixed fixture files (e.g. _setup.sh) is not regenerated yet.
  if [ ! -d "$src" ] || [ -z "$(find "$src" -mindepth 1 -not -name '_*' -print -quit 2> /dev/null)" ]; then
    echo "FAIL $s: checkpoint '$checkpoint' is missing — run bin/regen.sh $checkpoint" >&2
    return 1
  fi
  local out="$RUNS_DIR/$s-$(date +%Y%m%d-%H%M%S)"
  local project="$out/project" report="$out/report.txt"
  echo "=== $s [harness=$HARNESS checkpoint=$checkpoint] -> $out"
  prepare_project "$src" "$project"
  local status=0
  run_harness "$HARNESS" "$project" "$dir/prompt.md" "$report" || {
    echo "  harness exited non-zero (stderr: $report.stderr)"
  }
  PROJECT="$project" REPORT="$report" REPO="$REPO" bash "$dir/assert.sh" || status=1
  return "$status"
}

if [ "${#SELECTED[@]}" -gt 0 ]; then
  SCENARIOS=("${SELECTED[@]}")
elif [ "$ALL" = 1 ]; then
  SCENARIOS=($(all_scenarios))
else
  SCENARIOS=($(affected_scenarios))
  if [ "${#SCENARIOS[@]}" -eq 0 ]; then
    echo "No scenarios affected by skill changes since '$SINCE'. Use --all or name scenarios explicitly."
    exit 0
  fi
  echo "Affected scenarios since '$SINCE': ${SCENARIOS[*]}"
fi

mkdir -p "$RUNS_DIR"
PASSED=()
FAILED=()
for s in "${SCENARIOS[@]}"; do
  if run_scenario "$s"; then PASSED+=("$s"); else FAILED+=("$s"); fi
done

echo
echo "passed: ${PASSED[*]:-none}"
echo "failed: ${FAILED[*]:-none}"
[ "${#FAILED[@]}" -eq 0 ]
