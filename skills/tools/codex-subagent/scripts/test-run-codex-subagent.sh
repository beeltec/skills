#!/usr/bin/env bash

set -euo pipefail

script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT

cat > "$temporary_directory/codex" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$@"
printf 'stdin:'
cat
EOF
chmod +x "$temporary_directory/codex"

output="$({ printf '%s\n' 'test prompt'; } | PATH="$temporary_directory:$PATH" \
  "$script_directory/run-codex-subagent.sh" \
  --model test-model \
  --effort high \
  --sandbox danger-full-access \
  "$temporary_directory")"

expected="$(cat <<EOF
--model
test-model
--sandbox
danger-full-access
--ask-for-approval
never
--config
sandbox_workspace_write.network_access=true
--cd
$temporary_directory
--config
model_reasoning_effort="high"
exec
-
stdin:test prompt
EOF
)"

if [[ "$output" != "$expected" ]]; then
  diff <(printf '%s\n' "$expected") <(printf '%s\n' "$output")
  exit 1
fi

if printf '%s\n' 'test prompt' | PATH="$temporary_directory:$PATH" \
  "$script_directory/run-codex-subagent.sh" --sandbox read-only >/dev/null 2>&1; then
  echo "error: unsupported sandbox mode was accepted" >&2
  exit 1
fi
