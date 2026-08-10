# Architecture Decisions

Why significant technical decisions were made. An ADR is written after a
decision exists, so there is no proposed state.

# Decisions

| ID | Decision | Status | Notes |
|----|----------|--------|-------|
| [0001](0001-<decision>.md) | <Decision title> | accepted | |
| [0002](0002-<decision>.md) | <Decision title> | superseded | Superseded by [0012](0012-<decision>.md) |

# Conventions

* Filenames are `NNNN-<short-decision-title>.md` with a monotonically
  increasing number.
* The number is a stable identifier and never changes, even if the title does.
* `decision_status` is `accepted` or `superseded`. The lifecycle is
  `accepted → superseded`.
* A superseded ADR keeps its content and adds
  `superseded_by: /adrs/NNNN-<decision>.md`.
* Rejected options are documented under **Alternatives considered** inside the
  accepted ADR rather than as separate records.
* The OKF `status` field describes the document (normally `stable`) and is
  independent of `decision_status`.
