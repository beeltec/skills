---
{
  "schemaVersion": 1,
  "id": "BRIEF-1",
  "title": "Demonstrate local task tracking",
  "status": "confirmed",
  "problem": "Workflow readers need a small reproducible application that exercises planning, implementation, review, and knowledge promotion.",
  "users": [
    "A developer evaluating the project workflow."
  ],
  "evidence": [
    "The repository requirement asks for a reproducible Next.js and SQLite example."
  ],
  "outcome": "A developer can reproduce and verify persistent task tracking locally.",
  "inScope": [
    "Create and complete tasks on one local page."
  ],
  "outOfScope": [
    "Authentication, teams, hosting, and external services."
  ],
  "assumptions": [
    "A local fixture is enough to verify the workflow mechanics."
  ],
  "alternatives": [
    "Use a command-line fixture with fewer framework concerns."
  ],
  "decisions": [
    "Use Next.js and SQLite because the requested stack is portable."
  ],
  "constraints": [],
  "dependencies": [],
  "officialSources": [],
  "risks": [],
  "deliveryAcceptance": [
    "Tests, type checks, and a production build pass from a clean install."
  ],
  "success": {
    "metric": "Successful clean reproduction",
    "baseline": "No complete workflow fixture",
    "target": "One clean install passes tests, type checks, build, and workflow validation",
    "observationWindow": "One verification run after installation",
    "dataSource": "Recorded fixture commands and workflow evidence"
  },
  "createdAt": "2026-08-16T19:10:26.663Z",
  "updatedAt": "2026-08-16T19:10:26.712Z",
  "confirmedAt": "2026-08-16T19:10:26.712Z",
  "confirmedBy": "human:user"
}
---

# Planning context

This brief records product intent. It is not established project state.
