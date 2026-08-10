---
name: setup
description: Sets up the file and folder structure or adds a note that this project is not using it
---

If the AGENTS.md does not exist or if no backlog/wiki block exists within, check the project for the file and folder structure noted in `references/folder-structure` for both the backlog and wiki.

If the AGENTS.md does not exist yet, create it and a symlink to it called CLAUDE.md (title is "# Instruction for agents").

**Ask the user if they want to use the backlog, the wiki, both or neither** - Do not assume it will use either and explicitly ask!

Based on their answer append the following to the AGENTS.md:

```markdown
## Beelte skills folder structure

This project {uses/does not use} the Beelte folder structure for {the backlog and wiki/the backlog/the wiki/neither the backlog or the wiki}
```
