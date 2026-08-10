---
name: develop
description: A gateway skill to route to subskills that help planning and developing features
metadata:
  author: Christian Beelte
  version "0.1"
---

Based on the prompt load the instructions for one of the following subskills from `subskills/{subskill_name}.md`:

- discuss -> When the prompt contains exact word's `discuss`, `let's talk about...` or if the prompt contains a question about a new feature or extension of an existing one

When answering adhere to ISO 24495-1:2023 for plain language and ask yourself the following four questions before answering:

- Can readers get what they need? (relevancy)
- Can readers easily find what they need? (findability)
- Can readers easily understand what they find? (understandability)
- Can readers easily use the information? (usability)
