# File and Folder structure

## Backlog

docs/
└── backlog/
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

## OKF Wiki (Example)

docs/
└── wiki/
    ├── index.md
    ├── log.md
    │
    ├── data/
    │   ├── index.md
    │   ├── datasets/
    │   │   ├── index.md
    │   │   ├── sales.md
    │   │   └── finance.md
    │   │
    │   └── tables/
    │       ├── index.md
    │       ├── customers.md
    │       ├── orders.md
    │       └── recognized-revenue.md
    │
    ├── metrics/
    │   ├── index.md
    │   ├── revenue.md
    │   ├── gross-profit.md
    │   └── conversion-rate.md
    │
    ├── computations/
    │   ├── index.md
    │   ├── revenue.md
    │   └── gross-profit.md
    │
    ├── dashboards/
    │   ├── index.md
    │   ├── executive-revenue.md
    │   └── sales-performance.md
    │
    ├── playbooks/
    │   ├── index.md
    │   ├── data-freshness-incident.md
    │   └── revenue-discrepancy.md
    │
    └── references/
        ├── index.md
        ├── policies/
        │   ├── revenue-recognition.md
        │   └── cost-allocation.md
        ├── computations/
        │   └── revenue.sql
        ├── skills/
        │   ├── run-on-bq.md
        │   └── run-dbt.md
        └── attesters/
            ├── sql-equality.py
            └── dbt-binding.py
