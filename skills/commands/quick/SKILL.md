---
name: quick
description: Execute one user-declared small task — a tiny change or a deployment — directly, skipping the backlog/implement flow. User-invoked only; not for backlog work items or multi-file features — use `implement`.
disable-model-invocation: true
---

# Quick

Execute the task given as arguments in one pass. Invocation is the authorization: the user declared it small — apply no eligibility checklist. Runs in any repository, with or without the `$setup-project` scaffold.

## Workflow

1. Read applicable repository instructions (`AGENTS.md`, `CLAUDE.md`, nested instruction files).
2. Stay on the current branch — never create, switch, merge, or delete branches.
3. Make the change. If the work grows beyond small mid-run, finish it anyway and report the overrun in the final report — never abandon it for that reason alone.
4. Run only focused verification covering the touched code — the relevant tests, typecheck, lint, or build — plus `node scripts/validate-project.mjs` where that file exists. No review loop, no full suite. When no focused verification covers the touched code, say so in the report instead of inventing checks.
   Any executable created only to verify the change is temporary, regardless of extension: use the system temporary directory when writable; otherwise delete the workspace fallback before final verification and handoff. Keep it only when it protects an observable contract, lives in a conventional test or test-helper location, and runs through an established or clearly documented test command; a new obscure alias alone does not qualify. With no test structure, add no permanent test infrastructure unless approved scope requires automated coverage.
5. Commit directly on the current branch: stage only intended paths, concise Conventional Commit.
6. Leave no backlog or wiki trace: never edit `docs/backlog` or `docs/wiki` from this skill.

## Deployments

- Always: use only the deploy mechanism the repository already defines — script, Makefile target, CI trigger, or project skill.
- Ask first: before executing any deploy, in every environment, no exceptions. If confirmation cannot be obtained, stop and put the exact prepared command in the report.
- Never: invent ad-hoc deploy commands, or edit infrastructure or configuration to force a deploy through.

## Report

Report the change, commits, and verification results. When the work grew beyond small, state what exceeded the declaration. End with `Next step:` only when a follow-up exists: overrun in a governed repo → `$to-backlog` with the follow-up scope; overrun elsewhere → the concrete command or edit that addresses it.
