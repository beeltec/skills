#!/usr/bin/env bash

set -euo pipefail

program_name=${0##*/}

usage() {
  cat <<EOF
Usage: $program_name [--dry-run] [--force] [PROJECT_DIR]

Link this repository's skills into both project skill directories:
  PROJECT_DIR/.agents/skills
  PROJECT_DIR/.claude/skills
PROJECT_DIR defaults to the current directory.

Options:
  --dry-run  Show the planned links without changing the project.
  --force    Replace conflicting symlinks. Never replace real files or directories.
  -h, --help Show this help.
EOF
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

script_source=${BASH_SOURCE[0]}
while [[ -L "$script_source" ]]; do
  source_directory=$(cd -P "$(dirname "$script_source")" >/dev/null 2>&1 && pwd)
  link_target=$(readlink "$script_source")
  if [[ "$link_target" == /* ]]; then
    script_source=$link_target
  else
    script_source=$source_directory/$link_target
  fi
done

script_directory=$(cd -P "$(dirname "$script_source")" >/dev/null 2>&1 && pwd)
repository_root=$(cd -P "$script_directory/.." >/dev/null 2>&1 && pwd)
skills_root=$repository_root/skills

dry_run=false
force=false
project_argument=

while (($# > 0)); do
  case "$1" in
    --dry-run)
      dry_run=true
      ;;
    --force)
      force=true
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    --)
      shift
      if (($# > 1)); then
        fail "Provide only one project directory."
      fi
      project_argument=${1:-}
      break
      ;;
    -*)
      fail "Unknown option: $1"
      ;;
    *)
      if [[ -n "$project_argument" ]]; then
        fail "Provide only one project directory."
      fi
      project_argument=$1
      ;;
  esac
  shift
done

if [[ ! -d "$skills_root" ]]; then
  fail "Cannot find the source skills directory at $skills_root."
fi

if [[ -z "$project_argument" ]]; then
  project_argument=$PWD
fi
if [[ ! -d "$project_argument" ]]; then
  fail "Project directory does not exist: $project_argument"
fi

project_root=$(cd -P "$project_argument" >/dev/null 2>&1 && pwd)
namespace_roots=("$project_root/.agents" "$project_root/.claude")
destination_roots=("$project_root/.agents/skills" "$project_root/.claude/skills")

for namespace_root in "${namespace_roots[@]}"; do
  if [[ -L "$namespace_root" ]]; then
    fail "Refusing to write through symlinked directory: $namespace_root"
  fi
  if [[ -e "$namespace_root" && ! -d "$namespace_root" ]]; then
    fail "Expected a directory at $namespace_root."
  fi
done

for destination_root in "${destination_roots[@]}"; do
  if [[ -L "$destination_root" ]]; then
    fail "Refusing to write through symlinked directory: $destination_root"
  fi
  if [[ -e "$destination_root" && ! -d "$destination_root" ]]; then
    fail "Expected a directory at $destination_root."
  fi
done

skill_sources=()
for skill_source in "$skills_root"/*; do
  if [[ -d "$skill_source" && -f "$skill_source/SKILL.md" ]]; then
    skill_sources+=("$skill_source")
  fi
done
if ((${#skill_sources[@]} == 0)); then
  fail "No skill directories were found in $skills_root."
fi

create_sources=()
create_destinations=()
replace_sources=()
replace_destinations=()
unchanged_destinations=()
conflicts=()

for destination_root in "${destination_roots[@]}"; do
  for skill_source in "${skill_sources[@]}"; do
    skill_name=${skill_source##*/}
    destination=$destination_root/$skill_name

    if [[ -L "$destination" ]]; then
      if [[ -d "$destination" ]]; then
        resolved_destination=$(cd -P "$destination" >/dev/null 2>&1 && pwd)
        resolved_source=$(cd -P "$skill_source" >/dev/null 2>&1 && pwd)
        if [[ "$resolved_destination" == "$resolved_source" ]]; then
          unchanged_destinations+=("$destination")
          continue
        fi
      fi

      if [[ "$force" == true ]]; then
        replace_sources+=("$skill_source")
        replace_destinations+=("$destination")
      else
        conflicts+=("$destination is already a different symlink")
      fi
      continue
    fi

    if [[ -e "$destination" ]]; then
      conflicts+=("$destination is not a symlink")
      continue
    fi

    create_sources+=("$skill_source")
    create_destinations+=("$destination")
  done
done

if ((${#conflicts[@]} > 0)); then
  printf 'Refusing to change conflicting skill paths:\n' >&2
  for conflict in "${conflicts[@]}"; do
    printf '  - %s\n' "$conflict" >&2
  done
  printf 'Use --force only to replace conflicting symlinks.\n' >&2
  exit 1
fi

if [[ "$dry_run" == true ]]; then
  for destination in "${unchanged_destinations[@]}"; do
    printf 'Unchanged: %s\n' "$destination"
  done
  for index in "${!replace_sources[@]}"; do
    printf 'Would replace: %s -> %s\n' "${replace_destinations[$index]}" "${replace_sources[$index]}"
  done
  for index in "${!create_sources[@]}"; do
    printf 'Would link: %s -> %s\n' "${create_destinations[$index]}" "${create_sources[$index]}"
  done
  printf 'Destinations:\n'
  for destination_root in "${destination_roots[@]}"; do
    printf '  - %s\n' "$destination_root"
  done
  exit 0
fi

for destination_root in "${destination_roots[@]}"; do
  mkdir -p "$destination_root"
done

for index in "${!replace_sources[@]}"; do
  unlink "${replace_destinations[$index]}"
  ln -s "${replace_sources[$index]}" "${replace_destinations[$index]}"
  printf 'Replaced: %s -> %s\n' "${replace_destinations[$index]}" "${replace_sources[$index]}"
done

for index in "${!create_sources[@]}"; do
  ln -s "${create_sources[$index]}" "${create_destinations[$index]}"
  printf 'Linked: %s -> %s\n' "${create_destinations[$index]}" "${create_sources[$index]}"
done

printf 'Skills ready in:\n'
for destination_root in "${destination_roots[@]}"; do
  printf '  - %s\n' "$destination_root"
done
printf 'Linked: %d. Replaced: %d. Unchanged: %d.\n' \
  "${#create_sources[@]}" \
  "${#replace_sources[@]}" \
  "${#unchanged_destinations[@]}"
