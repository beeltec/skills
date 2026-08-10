# Project Backlog

This document tracks the current state of project work.

Detailed requirements, acceptance criteria, implementation notes, and subtasks live in the individual ticket files.

## In Progress

### Epics

* [ ] [EPIC-001 — Authentication](epics/EPIC-001-authentication.md)

### Stories

* [ ] [STORY-001 — User login](stories/STORY-001-user-login.md)

### Bugs

* [ ] [BUG-003 — Session expires unexpectedly](bugs/BUG-003-session-expiry.md)

## Todo

### Epics

* [ ] [EPIC-002 — Billing](epics/EPIC-002-billing.md)
* [ ] [EPIC-003 — Notifications](epics/EPIC-003-notifications.md)

### Stories

* [ ] [STORY-002 — Password reset](stories/STORY-002-password-reset.md)
* [ ] [STORY-003 — User logout](stories/STORY-003-user-logout.md)
* [ ] [STORY-004 — Checkout flow](stories/STORY-004-checkout.md)

### Bugs

* [ ] [BUG-001 — Login redirect loop](bugs/BUG-001-login-redirect-loop.md)
* [ ] [BUG-002 — Checkout rounding error](bugs/BUG-002-checkout-rounding.md)

## Blocked

### Stories

* [ ] [STORY-005 — Social login](stories/STORY-005-social-login.md)

  * Blocked by: OAuth provider credentials

### Bugs

None.

## Done

### Epics

* [x] [EPIC-000 — Initial project setup](epics/EPIC-000-project-setup.md)

### Stories

* [x] [STORY-000 — Application skeleton](stories/STORY-000-application-skeleton.md)

### Bugs

* [x] [BUG-000 — Development server startup failure](bugs/BUG-000-dev-server-startup.md)

## Backlog Rules

1. Every piece of work should have an epic, story, or bug ticket.
2. Subtasks live inside their parent story or bug ticket.
3. Ticket files are not moved when their status changes.
4. Open work uses `- [ ]`.
5. Completed work uses `- [x]`.
6. Move ticket links between the `Todo`, `In Progress`, `Blocked`, and `Done` sections as their state changes.
7. The individual ticket file remains the source of truth for requirements and implementation details.
8. Completed tickets remain in the repository for project history.
