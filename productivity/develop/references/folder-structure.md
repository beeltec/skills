# File and Folder structure

## Backlog

docs/
└── backlog/
    ├── index.md    
    ├── epics/
    │   ├── EPIC-001-authentication.md
    │   └── EPIC-002-billing.md
    │
    ├── stories/
    │   ├── STORY-001-user-login.md
    │   ├── STORY-002-password-reset.md
    │   └── STORY-003-checkout.md
    │
    └── bugs/
        ├── BUG-001-login-redirect-loop.md
        └── BUG-002-checkout-rounding.md

## OKF Wiki

docs/
└── wiki/
    ├── index.md                        # Bundle root index; carries okf_version
    ├── log.md                          # Chronological change history
    ├── ubiquitous-language.md          # Canonical domain terminology
    ├── architecture.md                 # Structure, boundaries, dependency rules
    │
    ├── technology/
    │   ├── index.md
    │   ├── general/                    # Applies to all technologies
    │   │   ├── guidelines.md
    │   │   ├── best-practices.md
    │   │   ├── examples.md
    │   │   └── api.md
    │   ├── typescript/                 # One directory per technology
    │   │   ├── guidelines.md
    │   │   ├── best-practices.md
    │   │   ├── examples.md
    │   │   └── api.md
    │   └── postgres/
    │       ├── guidelines.md
    │       ├── best-practices.md
    │       ├── examples.md
    │       └── api.md
    │
    ├── external-systems/
    │   ├── index.md
    │   ├── stripe.md
    │   └── auth0.md
    │
    ├── adrs/
    │   ├── index.md
    │   ├── adr-001-use-postgres.md
    │   └── adr-002-event-driven-billing.md
    │
    └── references/                     # Optional; mirrored specs and source material
        └── typescript/
            └── openapi.yaml
