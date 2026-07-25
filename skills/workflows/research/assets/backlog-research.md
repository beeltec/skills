# Proposal-specific technical research

Use this structure inside the proposed Epic or work item's `## Research` section. Replace every instruction with project evidence.

### Affected delta

Identify the proposed behavior or project-state delta this research informs and the affected technologies.

### Repository and version evidence

One row per technology. `Installed` is the exact version or constraint with the repository path that establishes it, or `new` when this delta introduces it. `Latest stable` comes from a live registry or release-feed call — never from documentation, a tutorial, or memory. Give a reason whenever the target is not the latest stable.

| Technology | Installed (path) | Latest stable | Resolved via / on | Target | Reason |
|---|---|---|---|---|---|
| example | 1.2.3 (`package.json`) | 2.0.1 | `npm view example version` / YYYY-MM-DD | 1.2.3 | guidance matches running code; upgrade is separate work |

### Findings and recommendations

Summarize project-relevant conclusions. Distinguish requirements, recommendations, and optional conventions.

### Best practices and coding guidelines

Record applicable version-matched best practices and recommended coding guidelines — official style guides, idiomatic usage and configuration patterns, security recommendations. State each rule or pattern concretely enough to implement from without reopening sources. State `Not applicable` only when inspected evidence shows the delta touches nothing these guidelines would govern.

### Concepts and guidelines

Record each cross-cutting standard the delta implicates — security, privacy, accessibility, protocol, regulatory — naming the standard and version and stating its applicable rules concretely enough to implement from. State `Not applicable` only after inventorying the delta's subjects.

### Uncertainty and readiness

State `complete`, `not-needed`, or `pending` and explain why. List every unresolved version-specific, source-authority, compatibility, or security-sensitive question; do not use `complete` while any applicable question remains unresolved.

### Project deviations

Record relevant differences between external guidance and accepted project conventions with known rationale. State `None known` only after comparison.

### Sources

- [Source title](https://example.com) - official, maintainer, or secondary; applies to version <version>; reviewed <YYYY-MM-DD>; supports <finding>.
