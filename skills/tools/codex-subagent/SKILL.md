---
name: codex-subagent
description: For non-Codex agent harnesses such as Claude Code or OpenCode only — never invoke from Codex itself. Delegates a coding or implementation task to a nested Codex CLI agent through unattended, workspace-scoped `codex exec`. Use when the user explicitly asks to use, invoke, run, or delegate to a Codex subagent, or to implement something using Codex — not merely because a task involves code.
---

# Codex Subagent

> [!IMPORTANT]
> Do not invoke this skill from Codex. It is exclusively for external harnesses (Claude Code, OpenCode) delegating work to Codex CLI.

Delegate the requested work to a non-interactive Codex CLI process and relay its result.

## Workflow

1. Confirm the action is within the user's authorized scope. By default the nested agent can write within the selected workspace and use the network, but cannot cross that filesystem boundary. Only the orchestrator may select `danger-full-access`, and only when the user has authorized a Git-writing workflow in a trusted repository.
2. Build a self-contained prompt preserving all requirements: the concrete objective and deliverables; known repository paths/context; constraints, especially applicable `AGENTS.md` instructions; required validation or acceptance criteria; and an instruction to inspect the repository, implement completely, run proportionate checks, and summarize changes and checks in the final response. Do not invent product requirements or paste secrets; ask the user only when a missing decision would materially change the result.
3. Pipe the prompt on stdin to `scripts/run-codex-subagent.sh`. **Run it via the harness's managed background-task mode** — a foreground call gets cut off at the execution tool's fixed timeout, and `&` creates an unmanaged process. Do not poll; wait for the harness to report completion, and do not start dependent work until it finishes.

   ```bash
   printf '%s\n' "$prompt" | /absolute/path/to/codex-subagent/scripts/run-codex-subagent.sh --model gpt-5.6-sol --effort high /path/to/repository
   ```

   Defaults: model `gpt-5.6-sol`, effort `medium`, sandbox `workspace-write`. Override independently with `--model`, `--effort` (`none|minimal|low|medium|high|xhigh|max|ultra`; models may support a subset), and `--sandbox` (`workspace-write` or `danger-full-access`).

   `workspace-write` deliberately makes `.git` read-only. If the delegated workflow must branch, stage, or commit — and the user authorized that in a trusted repository — use `--sandbox danger-full-access`. It removes filesystem sandboxing for the nested process; never enable it to recover from an unrelated failure.
4. Read the entire output: progress streams on stderr, the nested agent's final message on stdout.
5. After exit, inspect relevant workspace changes and run cheap checks to verify the nested agent's claims. On failure, enumerate completed or dirty work in a corrected, self-contained retry prompt so the next run preserves it; read the composed prompt once to catch truncation or quoting damage. Always retry through the runner — never reconstruct a raw `codex exec` command (global options must precede the `exec` subcommand).
6. Report the outcome, material files changed, and verification results; clearly report a nonzero exit or partial completion.

## Permissions

The runner defaults to `--sandbox workspace-write --ask-for-approval never` with network access: Codex works autonomously inside the repository while out-of-workspace and Git metadata writes fail instead of prompting. The explicit `danger-full-access` override supports authorized Git-writing workflows but removes filesystem isolation. Never silently enable it, broaden the task, expose credentials, or perform unrelated destructive actions.
