---
name: codex-subagent
description: For non-Codex agent harnesses such as Claude Code or OpenCode only. Never invoke this skill from Codex itself. Delegate a coding or implementation task from another harness to a nested Codex CLI agent through unattended, workspace-scoped `codex exec`. Use when the user explicitly asks a non-Codex harness to use, invoke, run, or delegate to a Codex subagent, or asks it to implement or change something using Codex. Do not use merely because a task involves code; the trigger must specifically involve Codex delegation or implementation using Codex.
---

# Codex Subagent

> [!IMPORTANT]
> Do not invoke this skill from Codex. It is exclusively for external agent harnesses, such as Claude Code or OpenCode, that delegate work to Codex CLI.

Delegate the requested work to a non-interactive Codex CLI process and relay its result to the orchestrating agent.

## Workflow

1. Confirm that the requested action is within the user's authorized scope. By default, the nested agent can write within the selected workspace and use the network but cannot cross that filesystem boundary. Only the orchestrator may select the explicit `danger-full-access` override described below, and only when the user has authorized a Git-writing workflow in a trusted repository.
2. Build a self-contained prompt from the user's instruction. Preserve all requirements and include:
   - the concrete objective and expected deliverables;
   - relevant repository paths or context already known;
   - constraints, especially applicable `AGENTS.md` instructions;
   - required validation or acceptance criteria;
   - an instruction to inspect the repository, implement the task completely, run proportionate checks, and summarize changes and checks in the final response.
3. Do not invent product requirements or paste secrets into the prompt. Ask the user only when a missing decision would materially change the result.
4. Pipe the prompt on stdin to `scripts/run-codex-subagent.sh`. **Run the command as a background task using the executing harness's managed background-task mode.** A foreground task will be cut off when the execution tool reaches its fixed timeout, which can terminate the nested Codex run before it finishes. Do not append `&` or otherwise create an unmanaged shell process; use the execution tool's background mode so it returns a task or process handle. Optionally pass `--model MODEL`, `--effort LEVEL`, `--sandbox MODE`, and a repository directory:

   ```bash
   printf '%s\n' "$prompt" | /absolute/path/to/codex-subagent/scripts/run-codex-subagent.sh --model gpt-5.6-sol --effort high /path/to/repository
   ```

   The defaults are `gpt-5.6-sol` with `medium` reasoning effort and the `workspace-write` sandbox. Use `--model`, `--effort`, or `--sandbox` to override them independently. Accepted effort values are `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`; the selected model may support only a subset. Accepted sandbox modes are `workspace-write` and `danger-full-access`.

   `workspace-write` deliberately makes `.git` read-only. If the delegated workflow must create branches, stage files, or commit, and the user has authorized that Git operation in a trusted repository, invoke the runner with `--sandbox danger-full-access`. This removes filesystem sandboxing for the nested process, so do not enable it merely to recover from an unrelated failure.

   Keep polling the same background task or process handle until it exits. Do not treat a still-running status as completion or start other work that the user required to run sequentially.
5. Read the entire command output. The script deliberately preserves `codex exec` output: progress is streamed on stderr and the nested agent's final message is printed on stdout, so both remain visible to the orchestrator.
6. After the process exits, inspect relevant workspace changes and run any cheap checks needed to verify the nested agent's claims. If it fails, verify and enumerate completed or dirty work in the corrected, self-contained retry prompt so the next run preserves it and does not redo it. Read the composed retry prompt once before launch to catch truncation or quoting damage. Always retry through the runner; do not reconstruct a raw `codex exec` command, because its global options must precede the `exec` subcommand.
7. Report the nested agent's outcome, the material files changed, and verification results. Clearly report a nonzero exit status or partial completion.

## Permissions

By default, the runner uses `--sandbox workspace-write --ask-for-approval never` and enables network access for the workspace sandbox. Codex can work autonomously within the selected repository and access the network, while out-of-workspace writes and Git metadata writes fail instead of prompting for approval. The explicit `--sandbox danger-full-access` override supports authorized Git-writing workflows but removes filesystem isolation. Do not silently enable it, broaden the requested task, expose credentials, or perform unrelated destructive actions.
