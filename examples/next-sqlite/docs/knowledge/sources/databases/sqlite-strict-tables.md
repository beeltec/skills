---
{
  "type": "OfficialSource",
  "title": "SQLite STRICT tables",
  "description": "The example's STRICT tasks table and its column constraints.",
  "tags": [
    "official-source",
    "sqlite",
    "schema"
  ],
  "sources": [
    {
      "resource": "https://www.sqlite.org/stricttables.html",
      "publisher": "SQLite",
      "version": "SQLite 3.37.0 or newer",
      "retrievedAt": "2026-08-16T15:09:49.502Z"
    }
  ],
  "status": "stable",
  "generated": {
    "by": "agent/source",
    "at": "2026-08-16T15:09:49.502Z"
  },
  "verified": [
    {
      "by": "agent/source",
      "at": "2026-08-16T15:09:49.502Z"
    }
  ]
}
---

# Verified claims

- STRICT applies per table when the keyword follows the closing parenthesis.
- Every STRICT column declares one of the allowed datatypes.
- Values that cannot be losslessly converted to the declared type raise a datatype constraint error.
- CHECK and NOT NULL constraints retain their normal behavior in STRICT tables.

# Refresh rule

Open the canonical URL before relying on these claims in a new work session.
