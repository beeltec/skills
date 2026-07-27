# Shared project preparation used by bin/run.sh and bin/regen.sh.
# Requires TESTBED and REPO to be set by the caller.

# checkpoint_src <checkpoint-name> — echoes the source tree for a checkpoint
checkpoint_src() {
  if [ "$1" = seed ]; then
    echo "$TESTBED/template/seed"
  else
    echo "$TESTBED/checkpoints/$1"
  fi
}

# prepare_project <checkpoint-src-dir> <project-dir>
# Copies the checkpoint tree (excluding _-prefixed fixture files), installs npm deps,
# initializes git with a baseline commit on main, links the repo's skills into the
# project for every harness, and runs the checkpoint's _setup.sh when present.
prepare_project() {
  local src="$1" project="$2"
  mkdir -p "$project"
  rsync -a --exclude '_*' --exclude node_modules --exclude .git "$src/" "$project/"
  if [ -f "$project/package.json" ]; then
    (cd "$project" && npm install --silent --no-audit --no-fund) > /dev/null
  fi
  git -C "$project" init -q -b main
  git -C "$project" add -A
  git -C "$project" -c user.email=testbed@local -c user.name=Testbed \
    commit -qm 'chore: checkpoint baseline'
  printf '%s\n' '.claude/' '.agents/' 'node_modules/' >> "$project/.git/info/exclude"
  mkdir -p "$project/.claude" "$project/.agents"
  ln -sfn "$REPO/.agents/skills" "$project/.claude/skills"
  ln -sfn "$REPO/.agents/skills" "$project/.agents/skills"
  if [ -f "$src/_setup.sh" ]; then
    (cd "$project" && bash "$src/_setup.sh")
  fi
}

# snapshot_project <project-dir> <checkpoint-dir>
# Persists a prepared/mutated project back into a checked-in checkpoint tree.
# Git state, installed deps, lockfile, and skill links are runtime artifacts and stay out;
# _-prefixed fixture files already in the checkpoint (e.g. _setup.sh) are preserved.
snapshot_project() {
  local project="$1" checkpoint="$2"
  mkdir -p "$checkpoint"
  rsync -a --delete \
    --exclude .git --exclude node_modules --exclude package-lock.json \
    --exclude .claude --exclude .agents \
    --filter 'P _*' \
    "$project/" "$checkpoint/"
}
