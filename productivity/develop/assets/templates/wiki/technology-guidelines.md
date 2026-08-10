---
type: Code Guidelines
title: "<Technology> Guidelines"
description: "Rules contributors must follow when writing <technology> code."
tags: [guidelines, <technology>]
technology: <technology>
version: "<version or version range>"
status: stable
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
---

# Scope

State what this document covers and where it applies in the repository.

For `general/guidelines.md`, state that these rules apply to all code and that
technology directories may add to them but not contradict them.

For a technology directory, state that these rules add to
[the general guidelines](/technology/general/guidelines.md).

# Rules

Each rule is stated as an imperative a reviewer can check.

## <Rule area, e.g. Naming>

* **MUST** <requirement>.
* **MUST NOT** <prohibition>.
* **SHOULD** <recommendation>.

### Rationale

<Why this rule exists. Link to an ADR when the rule follows from a decision.>

### Example

```<language>
// Correct
<code>
```

```<language>
// Incorrect
<code>
```

## <Rule area>

* **MUST** <requirement>.
* **SHOULD NOT** <discouraged practice>.

# Enforcement

| Rule area | Enforced by | Automated |
|-----------|-------------|-----------|
| <area> | `<linter, formatter, or CI check>` | yes / no |
| <area> | Code review | no |

# Exceptions

* <Situation where a rule may be broken>, provided <condition>. Record the
  exception in the code with a comment naming this document.

# Related

* [General Guidelines](/technology/general/guidelines.md)
* [<Technology> Best Practices](/technology/<technology>/best-practices.md)
* [<Technology> Examples](/technology/<technology>/examples.md)
* [Architecture](/architecture.md)
