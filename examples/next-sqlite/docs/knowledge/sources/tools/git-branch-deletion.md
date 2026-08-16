---
{
  "type": "OfficialSource",
  "title": "Git branch documentation",
  "description": "Safe local cleanup after a ticket branch has merged.",
  "tags": [
    "official-source",
    "git",
    "branch"
  ],
  "sources": [
    {
      "resource": "https://git-scm.com/docs/git-branch",
      "title": "Git branch documentation",
      "publisher": "The Git project",
      "version": "Current manual; last changed in Git 2.51",
      "retrievedAt": "2026-08-16T15:47:13.082Z"
    }
  ],
  "status": "stable",
  "generated": {
    "by": "agent/source",
    "at": "2026-08-16T15:47:13.082Z"
  },
  "verified": [
    {
      "by": "agent/source",
      "at": "2026-08-16T15:47:13.082Z"
    }
  ]
}
---

# Applicability

Safe local cleanup after a ticket branch has merged.

# Verified claims

- git branch -d deletes only a branch that is fully merged into its upstream or current HEAD.
- git branch -D is the force-delete form and can discard unmerged work.

# Refresh rule

Open the canonical URL before relying on these claims in a new work session.
