---
type: Best Practices
title: "<Technology> Best Practices"
description: "Recommended approaches and known pitfalls for <technology>."
tags: [best-practices, <technology>]
technology: <technology>
version: "<version or version range>"
status: stable
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
sources:
  - id: <source-key>
    resource: <URL or path>
    title: <Human-readable source title>
    last_modified: YYYY-MM-DD
---

# Scope

Guidelines are rules; best practices are judgement. This document records the
approaches that have worked here and the mistakes that have cost us time.

For `general/best-practices.md`, state which technologies and code areas these
shared practices cover.

# Practices

## <Practice>

**Do:** <The recommended approach.>

**Instead of:** <The approach it replaces.>

**Why:** <The concrete benefit, ideally something observed in this project.>

**When it does not apply:** <Cases where the trade-off flips.>

```<language>
<code showing the recommended approach>
```

## <Practice>

**Do:** <The recommended approach.>

**Why:** <Benefit.>[^<source-key>]

# Pitfalls

## <Pitfall>

**Symptom:** <How the problem shows up — an error, a slow query, a flaky test.>

**Cause:** <What actually goes wrong.>

**Fix:** <How to resolve or avoid it.>

## <Pitfall>

**Symptom:** <Observable symptom.>

**Cause:** <Root cause.>

**Fix:** <Resolution.>

# Performance

* <Practice with a measured or expected impact.>
* <Practice with a measured or expected impact.>

# Security

* <Practice that closes a specific risk.>
* <Practice that closes a specific risk.>

# Testing

* <How code using this technology should be tested.>
* <Test doubles, fixtures, or harnesses that exist for it.>

# Related

Include only documents that exist and apply.

* [<Applicable shared document>](/technology/general/<document>.md)
* [<Related technology document>](/technology/<technology>/<document>.md)

[^<source-key>]: <Human-readable source title>
