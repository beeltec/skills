---
type: Architecture Guide
title: "Dependency Rules"
description: "Which parts of the system may depend on which, and how the rules are enforced."
tags: [architecture, dependencies]
status: stable
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
---

# Purpose

State the dependency direction rules of the codebase in a form that a
contributor or a coding agent can apply without interpretation.

Boundary definitions live in [boundaries](/architecture/boundaries.md).

# Allowed directions

```text
<layer> → <layer> → <layer>
```

| From | May depend on | Must not depend on |
|------|---------------|--------------------|
| <Layer> | <Layers> | <Layers> |
| <Layer> | <Layers> | <Layers> |

# Rules

1. Dependencies point <direction, for example inward toward the domain>.
2. <Layer> MUST NOT import <layer or package>.
3. Framework and infrastructure types MUST NOT appear in <layer>.
4. Cycles between <units> are forbidden.
5. Cross-boundary access goes through <the declared public surface>.

# Inversion

Describe how a lower layer is used from a higher one without violating the
direction, for example ports declared in the domain and adapters supplied at
the edge.

* Port location: `<path>`
* Adapter location: `<path>`
* Wiring location: `<path>`

# Third-party dependencies

* <Rule for where third-party packages may be referenced.>
* <Rule for wrapping or isolating a third-party API.>

# Enforcement

| Rule | Enforced by |
|------|-------------|
| <Rule> | <Linter rule, build check, test, or review> |

Violations that cannot be enforced automatically are caught in review.

# Related

* [Boundaries](/architecture/boundaries.md)
* [Architecture overview](/architecture/overview.md)
* [Coding guidelines](/guidelines/coding.md)
