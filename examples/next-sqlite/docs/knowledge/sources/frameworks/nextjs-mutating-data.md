---
{
  "type": "OfficialSource",
  "title": "Next.js mutating data",
  "description": "Server Functions used by the example's task forms.",
  "tags": [
    "official-source",
    "nextjs",
    "server-functions"
  ],
  "sources": [
    {
      "resource": "https://nextjs.org/docs/app/getting-started/mutating-data",
      "publisher": "Vercel",
      "version": "Next.js 16.3.1 App Router",
      "retrievedAt": "2026-08-16T15:09:49.409Z"
    }
  ],
  "status": "stable",
  "generated": {
    "by": "agent/source",
    "at": "2026-08-16T15:09:49.409Z"
  },
  "verified": [
    {
      "by": "agent/source",
      "at": "2026-08-16T15:09:49.409Z"
    }
  ]
}
---

# Verified claims

- Server Functions used for mutations are asynchronous.
- A form action passes FormData to its Server Function.
- Server Functions are reachable through direct POST requests, so authorization belongs inside each function when users or permissions exist.
- revalidatePath can refresh affected cached data after a mutation.

# Refresh rule

Open the canonical URL before relying on these claims in a new work session.
