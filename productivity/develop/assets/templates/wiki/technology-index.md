---
type: Technology Guide
title: "<Technology>"
description: "How this project uses <Technology>."
tags: [stack]
status: stable
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
---

# Purpose

How **this project** uses <Technology>. This is not a tutorial; consult the
[official documentation](<url>) for the technology itself.

**Version:** <version or range>

**Configured in:** `<path>`

# Documents

* [Best practices](best-practices.md) - How we are expected to use it.
* [Patterns](patterns.md) - Recurring solutions specific to this technology.
* [Examples](examples.md) - Canonical implementations to imitate.

# What we use it for

* <Responsibility this technology carries in the system.>
* <Responsibility.>

# Features we use

| Feature | Used for | Notes |
|---------|----------|-------|
| <Feature> | <Purpose> | <Constraint or caveat> |

# Features we do not use

| Feature | Reason |
|---------|--------|
| <Feature> | <Why it is avoided, or a link to the ADR that decided it> |

# Project abstractions

Use these instead of calling the technology directly.

| Abstraction | Location | Use for |
|-------------|----------|---------|
| `<Name>` | `<path>` | <Purpose> |

# Fit with our architecture

* Which layer it lives in: <layer>, per
  [dependency rules](/architecture/dependency-rules.md).
* What must not leak out of that layer: <types or concepts>.

# Related

* [Architecture overview](/architecture/overview.md)
* [<ADR>](/adrs/<adr>.md)
* [External documentation](/references/<reference>.md)
