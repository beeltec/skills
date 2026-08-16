---
{
  "type": "Project",
  "title": "Small Steps",
  "description": "Small Steps is a Next.js task list backed by local SQLite storage.",
  "tags": [
    "nextjs",
    "sqlite"
  ],
  "sources": [
    {
      "resource": "urn:project-work:TASK-1",
      "title": "TASK-1 Provide persistent task tracking"
    }
  ],
  "status": "stable",
  "generated": {
    "by": "agent/project-flow",
    "at": "2026-08-16T13:40:25.717Z"
  },
  "verified": [
    {
      "by": "process:project-flow",
      "at": "2026-08-16T13:40:38.448Z"
    }
  ]
}
---

# Current state

Small Steps is a server-rendered Next.js 16 application. Its main page provides
a focused task list with create and completion actions.

The application uses React 19, TypeScript, and Node's built-in SQLite module.
It has no external database service.

# Main concepts

- [Task list](/features/task-list.md) describes visible behavior.
- [Task storage](/architecture/task-storage.md) describes persistence and schema.

# Verification

Run `npm test`, `npm run typecheck`, and `npm run build` from this directory.
