---
name: discuss
description: Discuss with the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'discuss' trigger phrases.
---

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

Always use the ask_user_question tool so the user can select an answer from a list of multiple choices. Make sure the first answer is always the one recommended by you and has "(recommended)" as the end of the answer.

If available, always use the context7 mcp to research documentation about tools, frameworks, etc. in question. Also use the web search to find best practices and recommendations on them.

If a *fact* can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The *decisions*, though, are mine — put each one to me and wait for my answer.

Use /wiki to Update the wiki whenever you and the user decide on something or relevant information for the scope of the project come to light. 

Do not act on it until I confirm we have reached a shared understanding.
