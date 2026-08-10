---
type: Architecture Guide
title: "Boundaries"
description: "The modules and layers of the system, what each owns, and what may cross between them."
tags: [architecture, boundaries]
status: stable
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
---

# Purpose

Define the boundaries of the system: which units of code own which
responsibilities, and what is allowed to cross a boundary.

Enforceable direction rules live in
[dependency rules](/architecture/dependency-rules.md).

# Boundaries

## <Boundary name>

**Location:** `<path>`

**Owns:**

* <Responsibility>
* <Responsibility>

**Does not own:**

* <Responsibility that belongs to another boundary, with a link>

**Public surface:** <The only entry points other boundaries may use.>

**Internal:** <What is private to this boundary and must not be imported
elsewhere.>

## <Boundary name>

**Location:** `<path>`

**Owns:**

* <Responsibility>

**Public surface:** <Entry points>

# Crossing rules

* <What may cross this boundary, for example DTOs but not domain entities.>
* <What must be translated at the boundary, and where the translation lives.>
* <What must never cross, for example ORM entities or framework types.>

# Ownership of shared concepts

| Concept | Owning boundary | Notes |
|---------|-----------------|-------|
| <Concept> | <Boundary> | <How other boundaries obtain it> |

# Related

* [Architecture overview](/architecture/overview.md)
* [Dependency rules](/architecture/dependency-rules.md)
* [Ubiquitous language](/ubiquitous-language.md)
