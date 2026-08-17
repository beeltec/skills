---
{
  "type": "OfficialSource",
  "title": "Git worktree documentation",
  "description": "Ticket branches checked out under .worktrees for isolated implementation.",
  "tags": [
    "official-source",
    "git",
    "worktree"
  ],
  "sources": [
    {
      "resource": "https://git-scm.com/docs/git-worktree.html",
      "publisher": "The Git project",
      "version": "Current Git documentation",
      "retrievedAt": "2026-08-16T15:43:36.952Z"
    }
  ],
  "status": "stable",
  "generated": {
    "by": "agent/source",
    "at": "2026-08-16T15:43:36.952Z"
  },
  "verified": [
    {
      "by": "agent/source",
      "at": "2026-08-16T15:43:36.952Z"
    }
  ]
}
---

# Verified claims

- A repository can have one main worktree and multiple linked worktrees.
- Linked worktrees have separate HEAD and index state while sharing repository data.
- worktree add with -b creates and checks out a new branch from the selected base.
- worktree remove refuses an unclean worktree unless force is used.

# Refresh rule

Open the canonical URL before relying on these claims in a new work session.
