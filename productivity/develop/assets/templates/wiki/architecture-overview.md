---
type: Architecture Guide
title: "Architecture Overview"
description: "Current high-level structure of the system and how its parts fit together."
tags: [architecture]
status: stable
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
---

# Purpose

Describe what is true about the system **now**. Do not record intentions,
plans, or the reasoning behind decisions; the reasoning belongs in
[ADRs](/adrs/).

# System summary

<Two or three sentences: what the system does, for whom, and the dominant
architectural style, for example layered, hexagonal, modular monolith, or
event-driven.>

# Components

| Component | Responsibility | Location |
|-----------|----------------|----------|
| <Name>    | <What it owns> | `<path>` |
| <Name>    | <What it owns> | `<path>` |

# Structure

```text
<Diagram or tree showing the main components and the direction of
dependencies between them.>
```

# Runtime flow

Describe the primary path a request or event takes through the system.

1. <Entry point> receives <input>.
2. <Component> performs <responsibility>.
3. <Component> persists or publishes <output>.

# Cross-cutting concerns

| Concern | How it is handled | Reference |
|---------|-------------------|-----------|
| Configuration | <Approach> | <link> |
| Authentication | <Approach> | <link> |
| Persistence | <Approach> | <link> |
| Observability | <Approach> | [Logging](/guidelines/logging.md) |

# External dependencies

* <Service or system> - <what it is used for and how it is accessed>

# Related

* [Boundaries](/architecture/boundaries.md)
* [Dependency rules](/architecture/dependency-rules.md)
* [Architecture decisions](/adrs/)
