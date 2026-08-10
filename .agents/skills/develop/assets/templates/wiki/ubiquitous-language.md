---
type: Ubiquitous Language
title: "Ubiquitous Language"
description: "Canonical domain and project terminology used across code, data, APIs, and documentation."
tags: [domain, terminology]
status: stable
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
---

# Purpose

This document defines the canonical vocabulary of the project.

The same terms MUST be used consistently in:

* source code (types, functions, modules);
* database schemas and migrations;
* API contracts and payloads;
* events and message names;
* user interface copy;
* tests;
* documentation.

When a term here conflicts with existing code, this document is the target
state. Record the reasoning for a term in an [ADR](/adrs/) when it is
contested.

# Terms

## <Term>

**Definition:** <One or two sentences defining the concept in domain language.>

**Use for:** <What this term covers.>

**Do not use for:** <Nearby concept this term must not be applied to, with a
link to the correct term.>

**Avoid:** <Synonym or legacy name> - use `<Term>` instead.

**In code:** `<TypeOrIdentifier>`

**Related:** [<Architecture document>](/architecture/<document>.md),
[<Pattern>](/patterns/<pattern>.md)

## <Term>

**Definition:** <Definition>

**Use for:** <Scope>

**In code:** `<TypeOrIdentifier>`

# Discouraged terms

| Do not use | Use instead | Reason |
|------------|-------------|--------|
| `<term>`   | `<Term>`    | <Why the alternative is preferred> |

# Naming conventions

* <Convention for entities, events, or identifiers that follows from the terms above>
* <Convention for plural, abbreviation, or casing choices>

See [coding guidelines](/guidelines/coding.md) for language-level naming rules.
