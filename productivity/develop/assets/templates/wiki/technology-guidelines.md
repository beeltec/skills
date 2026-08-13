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

For `general/guidelines.md`, state which technologies and code areas these
rules cover.

For a technology directory, identify the shared documents that apply. Do not
link a document from `general/` unless its scope includes this technology.

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

Include only documents that exist and apply.

* [<Applicable shared document>](/technology/general/<document>.md)
* [<Related technology document>](/technology/<technology>/<document>.md)
* [Architecture](/architecture.md)
