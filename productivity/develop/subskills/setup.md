---
name: setup
description: Sets up the file and folder structure or adds a note that this project is not using it
---

## Check the project

Check the project for the file and folder structure noted in `references/folder-structure` for both the backlog and wiki.

## Create AGENTS.md

If the AGENTS.md does not exist yet, create it and a symlink to it called CLAUDE.md (title is "# Instruction for agents").

Explicitly write `AGENTS.md not found. Creating it.`

## Ask the user

**Ask the user if they want to use the backlog, the wiki, both or neither** - Do not assume it will use either and explicitly ask!

Based on their answer append the following to the AGENTS.md:

```markdown
## Beelte skills folder structure

This project {uses/does not use} the Beelte folder structure for {the backlog and wiki/the backlog/the wiki/neither the backlog or the wiki}
```

If the user decided to use the backlog, add this to the same paragraph:

```
### Backlog

Possible work items are Epics, Stories and Bug Tickets. The latter two are also uniformly also referred to as "tickets".
```

## Git conventions

Also add two additional paragraphs:

1. Git Commit Messaging: Use Conventional Commits

  `type(optional_scope): description`
  [optional body]
  [optional footer(s)]

  Possible types: feat, fix, build, chore, ci, docs, style, refactor, perf, test, merge

  Mark breaking changes with exclamation mark (`feat(optional_scope)!: breaking change`)
  
2. Conventional Branches: Use Conventional Git branch names

  `type/branch-name`

  Possible types: 
  - feat (for new features)
  - fix (for bug fixes)
  - hotfix (for urgent fixes)
  - release (for branches preparing a release)
  - chore (for non-code tasks like dependency, docs updates)

## Create the file and folder structure

If the project should use one of the structures, create their file and folder structures. 

Make also sure to create the Wiki's index.md files (root and all sub indexes), log.md, architecture.md and ubiquitous-language.md with barebone content. Use the templates from `assets/templates/wiki` for these files.

## Brownfield projects

If this is a brownfield project (there is an existing codebase) use the codebase subskill to analyze it and populate the Wiki with it using the wiki subskill.

## Versioning

Commit your work when done.
