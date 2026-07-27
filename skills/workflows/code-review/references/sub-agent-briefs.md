# Sub-agent briefs

Prompt payloads for step 6. Read this file only when spawning the sub-agents.

Sub-agents share the filesystem: pass every authority as a **path with its role**, never pasted contents, and instruct each sub-agent to read its named paths before reviewing and to report any path it cannot read instead of reviewing without it.

## Standards sub-agent prompt

The diff command and commit list; the Standards source paths with roles, naming each applicable guidance page path and the rule-strength rules from step 5; the absolute path of `references/smell-baseline.md` beside this skill's `SKILL.md` as its smell authority; the ADR check inputs when present — the significance test text, the path of `docs/wiki/architecture/decisions/index.md` plus the paths of the in-force ADRs step 5 found relevant, and the item's `decisions` field and `## Decisions` section; and the brief: "Read the named paths first, the smell-baseline file before reviewing. Review only the diff. Report every documented-standard violation by severity and file/hunk, citing the source path and exact rule. Separately report possible baseline smells by name, quoting the hunk. Separately report any unrecorded architecturally significant decision or contradicted in-force ADR, labelled as a judgement call and citing the significance test. Documented rules are hard authority; smells and the ADR check are judgement-call heuristics that an explicit documented rule overrides. Do not use backlog scope to waive a standard. Skip checks tooling already enforces. Under 400 words."

## Spec sub-agent prompt

The diff command and commit list; the work item path as primary authority, the parent Epic path as context, linked wiki concept paths, and relevant proposal research paths, each labelled by role; and the brief: "Read the named paths first — the work item completely. Review only the diff. Report by severity: (a) missing or partial desired behavior or acceptance requirements; (b) incorrect implemented behavior; (c) scope creep. Cite the work-item path and exact requirement for every finding. Cite Epic constraints when relevant, but never expand or replace child scope with Epic scope. Use linked wiki facts only as baseline and constraints; never let existing behavior mask a missing delta. Do not treat a backlog request as permission to violate repository standards; leave that conflict visible for the Standards axis. Under 400 words."

## Delta-review add-on (both briefs)

Add the prior findings verbatim, the delta diff command, and: "State for each prior finding whether it is resolved, citing the hunk that resolves it. Report only new findings introduced by this delta; do not re-derive findings outside it."

## Epic-scope add-ons

To the Spec brief: "The Epic outcome and criteria are primary authority; each child's already-passed review is context. Report by severity: (a) Epic criteria or outcome no child satisfies; (b) contradictions or gaps at the seams between children; (c) scope creep beyond the Epic. Cite the Epic path and exact criterion. Do not re-derive findings already reported and resolved per-child."

To the Standards brief: "Every hunk already passed a per-item Standards review. Prioritize violations and smells that appear only once the children are composed — duplication across children, divergent patterns for one concern, epic-wide drift. Re-report a per-item finding only when it is still live in the composed result."
