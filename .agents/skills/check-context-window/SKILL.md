---
name: check-context-window
description: Inspect the current session's context and token usage. Use when the user asks how much context has been consumed, how much remains, or whether the conversation is approaching its context limit.
---

# Check Context Window

Use the runtime's session-status or goal-status tool when one is available. Report the measured usage, remaining budget, and any relevant limit in plain language.

Do not estimate token usage from message length. If the runtime exposes no usage data, say that an exact measurement is unavailable.
