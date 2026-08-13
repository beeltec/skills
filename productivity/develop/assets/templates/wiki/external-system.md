---
type: External System
title: "<System name>"
description: "<One-sentence summary of what this system does for us.>"
tags: [integration, external-system]
status: stable
resource: <URL of the system, its console, or its documentation>
direction: outbound
criticality: high
owner: <team or vendor>
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
sources:
  - id: <source-key>
    resource: <URL of the vendor or internal documentation>
    title: <Human-readable source title>
    last_modified: YYYY-MM-DD
---

# Purpose

What this system does, and why we depend on it rather than doing it ourselves.

`direction` is `inbound`, `outbound`, or `bidirectional`. `criticality` is
`high`, `medium`, or `low`, judged by what breaks for users when the system is
unavailable.

# Integration

| Property | Value |
|----------|-------|
| Protocol | HTTPS / gRPC / AMQP / SFTP / webhook |
| Specification | [`<path or URL>`](<path or URL>) |
| Authentication | <Scheme and where credentials come from.> |
| Direction | <Who initiates, and when.> |
| Trigger | <User action, schedule, or event that starts an exchange.> |
| Environments | `<production>`, `<staging>`, `<sandbox>` |
| Our client code | `<path/in/repo>` |

Secrets live in <secret store>; never in the repository.

# Data Exchanged

| Data | Direction | Purpose | Sensitivity |
|------|-----------|---------|-------------|
| `<entity or field set>` | out | <Why we send it.> | PII / confidential / public |
| `<entity or field set>` | in | <What we do with it.> | <sensitivity> |

# Operations Used

| Operation | Endpoint or topic | Purpose |
|-----------|-------------------|---------|
| `<name>` | `POST /<path>` | <What we use it for.> |
| `<name>` | `<queue or topic>` | <What we use it for.> |

# Mapping to Our Domain

Their vocabulary is not ours. Translation happens at the boundary in
`<path/to/adapter>`; their terms must not leak past it.

| Their term | Our term |
|------------|----------|
| `<their field>` | [`<our term>`](/ubiquitous-language.md) |
| `<their field>` | [`<our term>`](/ubiquitous-language.md) |

# Reliability

* **Availability target:** <Their published SLA, if any.>
* **Rate limits:** <Limits and how we stay within them.>
* **Timeouts:** <Values we use.>
* **Retries:** <Policy, including backoff and which errors are retried.>
* **Idempotency:** <How we avoid duplicate effects on retry.>
* **Failure mode:** <What our system does when this one is unavailable.>

# Monitoring

* <Dashboard, alert, or log stream that shows the health of this integration.>
* <What we alert on, and who is paged.>

# Contacts

| Role | Contact |
|------|---------|
| Owner | <team or vendor contact> |
| Support | <channel, email, or portal> |
| Status page | <URL> |

# Related

* [Architecture](/architecture.md)
* [External Systems](/external-systems/index.md)
* [<Related technology document>](/technology/<technology>/<document>.md)
* [ADR-XXX — <Decision to use this system>](/adrs/adr-XXX-<slug>.md)

[^<source-key>]: <Human-readable source title>
