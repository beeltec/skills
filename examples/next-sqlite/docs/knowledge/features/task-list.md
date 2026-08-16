---
{
  "type": "Feature",
  "title": "Task list",
  "description": "The main page creates and completes locally stored tasks.",
  "tags": [
    "tasks",
    "ui"
  ],
  "sources": [
    {
      "resource": "urn:project-work:TASK-4",
      "title": "TASK-4 Manage tasks from the main page"
    },
    {
      "resource": "docs/knowledge/sources/frameworks/nextjs-mutating-data.md",
      "title": "Next.js mutating data"
    }
  ],
  "status": "stable",
  "generated": {
    "by": "agent/project-flow",
    "at": "2026-08-16T13:40:05.644Z"
  },
  "verified": [
    {
      "by": "process:project-flow",
      "at": "2026-08-16T13:40:16.997Z"
    }
  ]
}
---

# Current state

The `/` route renders the complete task workflow as a dynamic Node.js page.
Users can create a task and toggle its completion without a separate API.

Server Actions in `src/app/actions.ts` validate form values, call the typed
[task store](/architecture/task-storage.md), and revalidate `/` after writes.

The page reports open and total task counts. Completed tasks remain visible and
use a checked control with struck-through text.

Official framework context is recorded in the
[Next.js mutation note](/sources/frameworks/nextjs-mutating-data.md).
