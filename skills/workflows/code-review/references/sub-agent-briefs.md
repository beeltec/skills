# Sub-agent briefs

Prompt payloads for step 7. Read only when spawning reviewers.

Sub-agents share the filesystem: pass authorities as paths with roles, never pasted contents; require every named path before review and report unreadable paths. Inline only the significance-test text and `decisions` value. Never demand feature TDD, coverage targets, duplicate layers, or extra tests when existing evidence proves the required observable contract; when durable proof is missing, prefer one acceptance-critical E2E, then boundary integration/contract coverage, and unit coverage only for otherwise impractical isolated edge cases or invariants.

## Combined reviewer prompt

Provide both authority sets, the smell baseline, ADR inputs, diff command, and commits. Brief: "Review only the diff. Report separate `## Standards` and `## Spec` findings using the rules below; never let one axis replace the other. Cite every finding. Apply the minimal-testing rule above. Do not edit files or spawn agents."

## Standards sub-agent prompt

The diff command and commit list; Standards paths and roles; rule-strength rules; the absolute smell-baseline path; ADR inputs when present; and: "Read every named path and the smell baseline. Review only the diff. Report documented violations by severity with file/hunk and exact rule citation; report possible smells separately as judgement calls. Apply the minimal-testing rule above. Do not edit files or spawn agents."

## Spec sub-agent prompt

The diff command and commit list; work item as primary authority; parent Epic, wiki concepts, and research as labelled context; and: "Read every named path and the work item completely. Review only the diff. Report by severity: missing/partial required behavior, incorrect behavior, and scope creep. Cite the exact requirement. Epic context never expands child scope; wiki facts are baseline only. Apply the minimal-testing rule: never infer a test shape when cheaper evidence proves an observable criterion; an explicitly owner-approved test artifact remains required. Do not edit files or spawn agents."

## Epic-scope add-ons

To the Spec brief: "The Epic outcome and criteria are primary. Review the composed diff for unsatisfied Epic criteria, child gaps or contradictions, incorrect child behavior, and scope creep. Cite exact Epic or child requirements."

To the Standards brief: "Review all child hunks and composition-wide concerns; prioritize duplication, divergent patterns, and drift across children."

The combined reviewer receives both axis add-ons.
