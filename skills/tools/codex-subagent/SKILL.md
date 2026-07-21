---
name: codex-subagent
description: Delegate a coding or implementation task to a nested Codex CLI agent through unattended, workspace-scoped `codex exec`. Use when the user explicitly asks to use, invoke, run, or delegate to a Codex subagent, or asks the current model to implement or change something using Codex. Also use when the model decides that a bounded implementation task should be handed to Codex CLI. Do not use merely because a task involves code; the trigger must specifically involve Codex delegation or implementation using Codex.
---

# Codex Subagent

Delegate the requested work to a non-interactive Codex CLI process and relay its result to the orchestrating agent.

## Workflow

1. Confirm that the requested action is within the user's authorized scope. The nested agent can write within the selected workspace and use the network, but cannot request broader filesystem permissions.
2. Build a self-contained prompt from the user's instruction. Preserve all requirements and include:
   - the concrete objective and expected deliverables;
   - relevant repository paths or context already known;
   - constraints, especially applicable `AGENTS.md` instructions;
   - required validation or acceptance criteria;
   - an instruction to inspect the repository, implement the task completely, run proportionate checks, and summarize changes and checks in the final response.
3. Do not invent product requirements or paste secrets into the prompt. Ask the user only when a missing decision would materially change the result.
4. Pipe the prompt on stdin to `scripts/run-codex-subagent.sh`. Optionally pass `--model MODEL`, `--effort LEVEL`, and a repository directory:

   ```bash
   printf '%s\n' "$prompt" | /absolute/path/to/codex-subagent/scripts/run-codex-subagent.sh --model gpt-5.6-sol --effort high /path/to/repository
   ```

   The defaults are `gpt-5.6-sol` with `medium` reasoning effort. Use `--model` or `--effort` to override either value independently. Accepted effort values are `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`; the selected model may support only a subset.

   Use the execution tool's longest practical yield interval, then keep polling the same process until it exits. Surface useful progress updates during long runs.
5. Read the entire command output. The script deliberately preserves `codex exec` output: progress is streamed on stderr and the nested agent's final message is printed on stdout, so both remain visible to the orchestrator.
6. After the process exits, inspect relevant workspace changes and run any cheap checks needed to verify the nested agent's claims. If it fails, use its diagnostics and the workspace state to decide whether to retry with a corrected, self-contained prompt.
7. Report the nested agent's outcome, the material files changed, and verification results. Clearly report a nonzero exit status or partial completion.

## Permissions

The runner uses `--sandbox workspace-write --ask-for-approval never` and enables network access for the workspace sandbox. Codex can work autonomously within the selected repository and access the network, while out-of-workspace writes fail and return diagnostics to the nested agent instead of prompting for approval. Do not silently broaden the requested task, expose credentials, or perform unrelated destructive actions.
