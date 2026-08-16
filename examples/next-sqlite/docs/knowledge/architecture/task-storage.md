---
{
  "type": "Architecture",
  "title": "Task storage",
  "description": "Tasks persist in a strict local SQLite table through a typed store.",
  "tags": [
    "nextjs",
    "sqlite"
  ],
  "sources": [
    {
      "resource": "urn:project-work:TASK-2",
      "title": "TASK-2 Persist tasks in SQLite"
    },
    {
      "resource": "docs/knowledge/sources/runtimes/node-sqlite.md",
      "title": "Node.js SQLite API"
    },
    {
      "resource": "docs/knowledge/sources/databases/sqlite-strict-tables.md",
      "title": "SQLite STRICT tables"
    }
  ],
  "status": "stable",
  "generated": {
    "by": "agent/project-flow",
    "at": "2026-08-16T13:39:34.337Z"
  },
  "verified": [
    {
      "by": "process:project-flow",
      "at": "2026-08-16T13:39:49.597Z"
    }
  ]
}
---

# Current state

`TaskStore` owns all task persistence. It uses Node.js `DatabaseSync` from
`node:sqlite`, so the application needs Node.js 24.15 or newer.

The application stores data in `data/tasks.db` by default. Tests use an
in-memory database. Set `TASK_DATABASE_PATH` to override the application path.

# Schema

The strict `tasks` table has these columns:

| Column | SQLite type | Rule |
| --- | --- | --- |
| `id` | INTEGER | Auto-incrementing primary key. |
| `title` | TEXT | Required and limited to 1-120 characters. |
| `completed` | INTEGER | `0` or `1`; defaults to `0`. |
| `created_at` | TEXT | Defaults to SQLite's current timestamp. |

# Operations

`TaskStore.list()` returns newest IDs first. `create()` trims and validates the
title. `toggle()` changes the stored completion value.

See `src/lib/task-store.ts` for the implementation and
`src/lib/task-store.test.ts` for verified behavior.

Official API context is recorded in the [Node.js SQLite note](/sources/runtimes/node-sqlite.md)
and [SQLite STRICT note](/sources/databases/sqlite-strict-tables.md).
