---
type: API Contract
title: "<Technology> API Contracts"
description: "API contracts <technology> exposes or consumes, and the specifications that define them."
tags: [api, contract, <technology>]
technology: <technology>
version: "<version or version range>"
status: stable
resource: <URL of the served spec, e.g. https://api.example.com/openapi.json>
generated:
  by: human:<id>
  at: <ISO-8601 timestamp>
sources:
  - id: <spec-key>
    resource: /references/<technology>/openapi.yaml
    title: <Technology> OpenAPI specification
    last_modified: YYYY-MM-DD
---

# Scope

The machine-readable specification is the source of truth. This document says
where it lives, what it covers, and the conventions and rules a reader cannot
infer from the schema.

For `general/api.md`, state which APIs and technologies the shared conventions
cover.

# Specification

| Property | Value |
|----------|-------|
| Style | REST / GraphQL / gRPC / event-driven |
| Specification | [`<path or URL>`](<path or URL>) |
| Format | OpenAPI 3.1 / GraphQL SDL / Protobuf |
| Base URL | `<https://…>` |
| Generated from | <Code annotations, hand-written, or a build step> |
| Consumed by | <Clients, SDKs, or generated types> |

Regenerate clients with:

```bash
<command>
```

# Conventions

* **Versioning:** <How versions are expressed and how long each is supported.>
* **Authentication:** <Scheme and where credentials come from.>
* **Pagination:** <Strategy and parameter names.>
* **Errors:** <Error shape and the status codes in use.>
* **Idempotency:** <Which operations are idempotent and how it is guaranteed.>
* **Naming:** <Casing and resource naming rules.>[^<spec-key>]

# Endpoints

Summarise the surface; do not restate the schema.

| Operation | Method & Path | Purpose |
|-----------|---------------|---------|
| `<operationId>` | `GET /<path>` | <What it does.> |
| `<operationId>` | `POST /<path>` | <What it does.> |

# Error Shape

```json
{
  "error": {
    "code": "<machine-readable code>",
    "message": "<human-readable message>",
    "details": []
  }
}
```

| Status | Code | Meaning |
|--------|------|---------|
| 400 | `<code>` | <Meaning.> |
| 404 | `<code>` | <Meaning.> |
| 409 | `<code>` | <Meaning.> |

# Compatibility

* **Breaking changes:** <What counts as breaking and the process for making one.>
* **Additive changes:** <What may be added without a version bump.>
* **Deprecation:** <How deprecation is signalled and the notice period.>

# Related

Include only documents that exist and apply.

* [<Applicable shared document>](/technology/general/<document>.md)
* [<Related technology document>](/technology/<technology>/<document>.md)
* [External Systems](/external-systems/index.md)
* [Architecture](/architecture.md)

[^<spec-key>]: <Technology> OpenAPI specification
