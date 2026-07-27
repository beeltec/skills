# Sub-agent briefs

Prompt payloads for step 6. Read this file only when spawning the sub-agents.

## Standards sub-agent prompt

The diff command and commit list; the Standards sources with paths and roles, naming each applicable guidance page and the rule-strength rules from step 5; the absolute path of `references/smell-baseline.md` beside this skill's `SKILL.md`, instructing the sub-agent to read that file first and treat it as its smell authority; the ADR check inputs when present — the significance test text, the in-force ADRs, and the item's `decisions` field and `## Decisions` section, all pasted in; and the brief: "Read the smell-baseline file at the path given above before reviewing; if it cannot be read, say so in your report rather than reviewing without it. Review only the diff. Report every documented-standard violation by severity and file/hunk, citing the source path and exact rule. Separately report possible baseline smells by name, quoting the hunk. Separately report any unrecorded architecturally significant decision or contradicted in-force ADR, labelled as a judgement call and citing the significance test. Documented rules are hard authority; smells and the ADR check are judgement-call heuristics that an explicit documented rule overrides. Do not use backlog scope to waive a standard. Skip checks tooling already enforces. Under 400 words."

## Spec sub-agent prompt

The diff command and commit list; the complete work item as primary authority, complete parent Epic as context, linked wiki concepts, and relevant proposal research, each labelled by role; and the brief: "Review only the diff. Report by severity: (a) missing or partial desired behavior or acceptance requirements; (b) incorrect implemented behavior; (c) scope creep. Cite the work-item path and exact requirement for every finding. Cite Epic constraints when relevant, but never expand or replace child scope with Epic scope. Use linked wiki facts only as baseline and constraints; never let existing behavior mask a missing delta. Do not treat a backlog request as permission to violate repository standards; leave that conflict visible for the Standards axis. Under 400 words."

## Delta-review add-on (both briefs)

Add the prior findings verbatim, the delta diff command, and: "State for each prior finding whether it is resolved, citing the hunk that resolves it. Report only new findings introduced by this delta; do not re-derive findings outside it."

## Epic-scope add-ons

To the Spec brief: "The Epic outcome and criteria are primary authority; each child's already-passed review is context. Report by severity: (a) Epic criteria or outcome no child satisfies; (b) contradictions or gaps at the seams between children; (c) scope creep beyond the Epic. Cite the Epic path and exact criterion. Do not re-derive findings already reported and resolved per-child."

To the Standards brief: "Every hunk already passed a per-item Standards review. Prioritize violations and smells that appear only once the children are composed — duplication across children, divergent patterns for one concern, epic-wide drift. Re-report a per-item finding only when it is still live in the composed result."
