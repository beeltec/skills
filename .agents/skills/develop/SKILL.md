---
name: develop
description: A gateway skill to route to subskills that help planning and developing features
metadata:
  author: Christian Beelte
  version "0.1"
---

Based on the prompt load the instructions for one of the following subskills from `subskills/{subskill_name}.md`:

- discuss -> When the prompt contains exact word's `discuss`, `let's talk about...` or if the prompt contains a question about a new feature or extension of an existing one

When communicating with the user always adhere to ISO 24495 at `references/iso-24495.md`. and ASD-STE100 Simplified Technical English at `references/asd-ste100.md`.
