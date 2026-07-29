# Evidence And Guidance

Load for external technology/standards evidence, proposal research, or publishing adopted engineering rules. Read `project-state.md` before wiki/backlog mutation.

## Subjects

A subject is a technology (language, framework, runtime, library, major tool) or a cross-cutting standard (security, privacy, accessibility, protocol, regulatory). Inventory only subjects touched by the request. Common triggers:

- auth, sessions, tokens, secrets -> OWASP ASVS, Top 10, applicable Cheat Sheets;
- personal/sensitive data, retention, logging -> applicable privacy guidance;
- user interface -> the project's WCAG target;
- public/cross-service API, wire format, protocol -> governing specification;
- payments, health, regulated data -> applicable standard.

Drop a subject only with inspected evidence that the delta touches nothing it governs.

## Evidence

1. Resolve installed versions from manifests, lockfiles, runtime files, imports, build/deploy configuration, and tests; record the establishing path.
2. Resolve latest stable/LTS/prerelease through a live registry, release feed, or tagged releases. Record command/URL and date. Never use memory or snippets.
3. Research at the installed version. Prefer opened version-matched official docs/specs/repos, then maintainer guidance, then reputable secondary sources. Every cited source needs URL, authority, applicable version, and review date.
4. Reuse a matching guidance page reviewed within 30 days for fast-moving evidence or 90 days for stable evidence; recheck security-sensitive guidance every run and after relevant releases/deviations.
5. Separate normative requirements, recommendations, optional conventions, deviations, unresolved questions, and known gaps. Source authority resolves conflicts; unsupported claims remain uncertainty.

Use bounded parallel read-only research only for at least two independent units. Keep version resolution and synthesis in the manager.

## Adopted Guidance

Publish one canonical page per used subject under `docs/wiki/engineering/technologies/` or `standards/`, following the installed template:

- `Requirements`: owner-adopted rules binding new code;
- `Recommendations`: preferred approaches and rationale;
- `Conventions`: verified project choices;
- `Deviations`: deliberate departures, especially those required by an ADR;
- `Known gaps`: existing paths contradicting a Requirement, linked to work when available.

Create or refresh only under explicit subject approval or an authority packet carrying it. Never infer adoption from research, publish unused subjects, mutate backlog in the same transaction, or absorb an upgrade. Reversing, weakening, or removing an adopted Requirement/Convention requires a separate approval outside explicit autonomy.

Re-resolve versions and security-sensitive claims on refresh. Change only meaning affected by evidence, preserve deliberate deviations, update review metadata, indexes, and log, then validate and commit the coherent wiki transaction when authorized.

## Research Persistence

Proposal evidence stays on its backlog record using `assets/backlog-research.md`. Accepted reusable rules belong on guidance pages after adoption. Summarize rather than copy proposal history. Report unresolved questions and upgrades as separate desired work.
