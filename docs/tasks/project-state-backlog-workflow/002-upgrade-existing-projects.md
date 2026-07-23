# 002 — Upgrade existing project setups safely

**Plan:** [000 — Project-state backlog workflow](000-overview.md)

**What to build:** Make `setup-project` safely upgrade projects previously
initialized by `setup-wiki`, adding the backlog and consolidated validation
without overwriting project knowledge, customized integrations, or legacy task
plans.

**Blocked by:** [001 — Initialize fresh projects with wiki and backlog governance](001-initialize-project-governance.md).

**Status:** completed

## Subtasks

- [x] Identify installer-owned legacy instruction markers, validator content, and exact package-script values that can be upgraded safely.
- [x] Replace legacy `setup-wiki` managed instruction blocks in place with exactly one canonical `setup-project` block while preserving surrounding user content.
- [x] Install or update the canonical project validator before removing an exact installer-owned legacy validator.
- [x] Preserve customized legacy validators and report the collision instead of deleting or overwriting them.
- [x] Replace an exact installer-owned `wiki:check` package script with the canonical project check while preserving custom old or new script values.
- [x] Preserve every existing wiki page and project-specific modification; add only missing scaffold content and report conventions that require manual reconciliation.
- [x] Add missing backlog assets without treating existing project-owned files as disposable templates.
- [x] Leave every file, link, ignore rule, and directory under legacy `docs/tasks` unchanged and exclude it from project validation.
- [x] Add validation to an existing compatible CI system using a standalone managed integration that does not rewrite unrelated jobs or arbitrary YAML.
- [x] Support compatible GitHub Actions directly and only narrowly recognized GitLab include shapes; report unsupported or conflicting CI configurations without mutation.
- [x] Track installer ownership or version information needed for safe future upgrades of managed assets.
- [x] Add fixture tests for legacy markers, duplicate markers, exact generated assets, customized collisions, package-script variants, instruction-file selection, existing CI, and `docs/tasks` sentinels.
- [x] Verify that both a migrated generated project and a project with preserved customizations pass the appropriate validation or report precise manual actions.
- [x] Verify that a second upgrade run is a no-op.

## Acceptance criteria

- [x] An unmodified legacy setup is upgraded to one `setup-project` instruction block, one canonical validator command, and the new backlog scaffold without losing wiki knowledge.
- [x] Customized files and package or CI commands are preserved and clearly reported rather than silently overwritten.
- [x] Existing `docs/tasks` content remains byte-for-byte unchanged and does not affect validation.
- [x] Compatible existing CI runs `node scripts/validate-project.mjs`; unsupported CI is left untouched with actionable output.
- [x] Upgrade fixtures cover destructive boundaries and repeated setup is idempotent.
