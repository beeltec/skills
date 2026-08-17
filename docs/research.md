# Research and design basis

Research was last updated on 2026-08-17. Primary specifications take priority over
secondary guides.

## Open Knowledge Format

Google Cloud's current specification is OKF v0.2. A bundle is a directory of
Markdown concepts with YAML frontmatter. Only `type` is always required.
`index.md` and `log.md` are reserved files.

OKF v0.2 adds provenance, trust, and lifecycle fields. This workflow uses
`generated`, `verified`, `status`, and `sources` during promotion. It writes
frontmatter as JSON, which is valid YAML 1.2 and can be parsed without a
runtime dependency.

Sources:

- [Open Knowledge Format v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- [Google Cloud introduction](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
- [Google Cloud v0.2 trust update](https://cloud.google.com/blog/products/data-analytics/okf-v0-2-adds-trust-signals/)

## Jira-like work model

Jira's default hierarchy has three levels. Epic is level 1. Story, task, and
bug are level 0. Subtask is level -1.

This repository keeps that model. It uses a small workflow: `backlog`,
`ready`, `in-progress`, `in-review`, and `done`. The completion command sets
a resolution because Jira treats resolution as the open or closed signal.

The folder names describe their full lifetime. `docs/knowledge/` holds current
facts. `docs/work/` remains accurate after an item leaves the backlog.

Acceptance criteria describe item-specific success. The definition of done
describes the shared quality gate. This workflow checks both before closure.

A planning brief now precedes epics and stories. It records user evidence,
the problem, alternatives, assumptions, delivery acceptance, and one measurable
product outcome. This avoids treating completed output as proof of user value.

Sources:

- [Jira work types and default hierarchy](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/)
- [Jira workflow transitions](https://support.atlassian.com/jira-cloud-administration/docs/create-workflow-transitions/)
- [Jira status, priority, and resolution](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/)
- [Atlassian user stories](https://www.atlassian.com/agile/project-management/user-stories)
- [Atlassian definition of done](https://www.atlassian.com/agile/project-management/definition-of-done)
- [GOV.UK discovery guidance](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works)
- [GOV.UK alpha guidance](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works)
- [GOV.UK defining success](https://www.gov.uk/service-manual/service-standard/point-10-define-success-publish-performance-data)

## Risk-driven quality gates

One universal checklist is either too weak for risky changes or too heavy for
small changes. Tickets therefore declare concrete risk factors. Each factor
requires only its applicable security, privacy, dependency, migration,
accessibility, reliability, performance, or compatibility evidence.

The shared review loop still checks every change. Risk gates add focused proof
for changes with sensitive data, authentication, public exposure, migrations,
user interfaces, availability targets, or other named risks.

Sources:

- [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)
- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

## Agent Skill design

The suite follows
`setup → discuss → plan → implement ⇄ review → document → ship → measure`.
The `source` skill acts as an evidence gate before every substantive stage.
The `language` skill acts as a vocabulary gate when project meaning changes.
The `rules` setup helper installs and verifies reusable instructions.
The read-only `next` helper locates the current stage from repository state.
Each skill has a narrow job and composes with the other skills. Instructions
stay short. Detailed contracts live in direct references. Repeated and fragile
operations use one tested script.

The `discuss` skill adapts the grilling skill's strongest mechanism: order
questions by decision dependencies, ask the currently unblocked choices, and
recompute after every answer. It adds a confirmed brief as the explicit handoff
to planning.

A harness-provided structured question tool is mandatory for discussion rounds
when available. Claude Code therefore uses `AskUserQuestion`. A round can keep
several independent questions, within the tool's supported limit. Dependent
questions remain in later rounds.

The `review` skill adapts the code-review skill's two-axis model. Standards and
Spec get independent passes, so one cannot hide failure in the other. The
ticket is the fixed specification source. Reviews cover the whole ticket branch
and any remaining uncommitted work.

Matt Pocock's current skill assigns those axes to two parallel subagents. The
orchestrator only prepares the scope and aggregates their independent reports.
This suite makes that separation mandatory and blocks instead of reviewing in
the orchestrator when a harness cannot create subagents.

Every finding receives a P0-P3 severity. P0, P1, and P2 block approval. P3 is
non-blocking. After blocking findings are fixed, both axes inspect the complete
change again from the original fixed point. The loop ends only when both axes
report zero P0, P1, and P2 findings.

Descriptions state user intent because agents use them for activation. The
skills use checklists, explicit validation loops, and concrete commands.
The full verification prompt creates a disposable Next.js and SQLite project
under `.verification/`. Run it through a real target harness instead of testing
instruction text.

## Canonical workflow records

OKF v0.2 requires Markdown with YAML frontmatter. Only `type` is always
required. The body has no mandatory sections. Indexes and logs are optional,
and an index may be synthesized. The workflow therefore keeps structured data
canonical and generates only small, validated navigation views.

The Ubiquitous Language file stores terms and history only in frontmatter. Its
body points to `language-show`, which renders a readable view on demand.
Official source applicability stays in `description`. Outcomes refer to the
confirmed brief instead of copying its success definition. Passing checks keep
only time and exit status; failed checks retain bounded diagnostics. The
workflow removes its generated knowledge log because Git and canonical records
already preserve the relevant history.

OKF distinguishes `generated` authorship metadata from `verified` checking
metadata. The language record keeps both meanings instead of merging them.

Sources:

- [OpenAI skill authoring](https://learn.chatgpt.com/docs/build-skills)
- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code user-input guidance](https://code.claude.com/docs/en/agent-sdk/user-input)
- [Claude Code interviewing best practice](https://code.claude.com/docs/en/best-practices#let-claude-interview-you)
- [Anthropic Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills specification](https://agentskills.io/specification)
- [Skill creator best practices](https://agentskills.io/skill-creation/best-practices)
- [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills)
- [Optimizing skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
- [Using scripts in skills](https://agentskills.io/skill-creation/using-scripts)
- [Matt Pocock's grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)
- [Matt Pocock's code-review skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)
- [Open Knowledge Format v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)

## Agent rule design

Persistent working agreements belong in `AGENTS.md`. Task-triggered procedures
belong in skills. This repository stores personal fragments under
`agent-rules/user/` and shared repository fragments under
`agent-rules/project/`. Codex does not discover those directories directly.

OpenAI documents layered instruction scopes. Reusable personal defaults belong
in the Codex home directory. Repository-wide rules belong at the project root.
Specialized rules belong near the files they govern. More specific instructions
override broader instructions.

The combined project instruction chain has a default 32 KiB limit. Rule files
therefore stay concise and cover one topic. Each rule states the required
behavior and any safe path or exception. Automated formatting and lint checks
remain in CI or repository tools.

The user profile contains plain English communication and official-source
preferences. These expectations should follow the user across repositories.
The project profile contains evidence, vocabulary, Git, code, comments, tests,
and review policy. These rules depend on shared paths or delivery gates.

The `rules` skill installs each source between named markers. The start marker
contains a SHA-256 digest of the embedded content. Its script detects missing,
duplicate, malformed, stale, or manually changed blocks. It leaves all other
instructions intact. The `setup` skill installs only the project profile.
Research links remain in this document instead of installed fragments. They
provide provenance without consuming the active `AGENTS.md` instruction limit.

The code-quality rule treats DRY as one authoritative representation for each
piece of knowledge. It does not require one abstraction for unrelated code that
only looks similar. YAGNI rejects presumed future capabilities and speculative
extension points. It does not reject refactoring, tests, or other practices
that keep current code safe and easy to change.

The testing rule chooses the lowest layer that proves current behavior. It
keeps end-to-end tests for a few critical journeys and prevents repeated
assertions across layers. Tests for intentionally removed behavior are deleted.
A new absence test needs a current contract, security need, or named risk.

The comments rule prefers clear code and short, useful context. Function
comments state non-obvious purpose and use. Implementation comments preserve
intent, constraints, and tradeoffs instead of narrating statements. Longer
contract detail remains allowed when a caller needs it.

Sources:

- [OpenAI custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenAI skill authoring](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI web-search guidance](https://learn.chatgpt.com/docs/web-search)
- [OpenAI prompting guidance](https://learn.chatgpt.com/docs/prompting)
- [The Pragmatic Programmer DRY principle](https://pragprog.com/tips/)
- [Martin Fowler on YAGNI](https://martinfowler.com/bliki/Yagni.html)
- [Microsoft unit testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Testing Library guiding principles](https://testing-library.com/docs/)
- [Google C++ comments guidance](https://google.github.io/styleguide/cppguide#Comments)
- [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)
- [Linux kernel commenting guidance](https://cdn.kernel.org/doc/html/latest/process/coding-style.html#commenting)
- [PEP 8 comments guidance](https://peps.python.org/pep-0008/#comments)
- [ISO 24495-1:2023 catalogue and scope](https://www.iso.org/standard/78907.html)
- [Government of Canada summary of the four ISO principles](https://our-languages.canada.ca/en/blogue-blog/iso-langage-simple-plain-language-eng)
- [ISO guidance for plain standards writing](https://www.iso.org/files/live/sites/isoorg/files/developing_standards/docs/en/how-to-write-standards.pdf)
- [ASD-STE100 official overview](https://www.asd-ste100.org/about_STE.html)
- [ASD-STE100 Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf)
- [ASD-STE100 official FAQ](https://www.asd-ste100.org/STE_faq.html)

## Shared ubiquitous language

Eric Evans defines Ubiquitous Language as shared language that connects team
communication with software. His reference says teams should use the same
language in speech, writing, diagrams, and code. It also treats a language
change as a model change that needs deliberate resolution.

This workflow adopts only that principle. It keeps one project-wide,
user-agreed vocabulary at `docs/knowledge/ubiquitous-language.md`. It does not
add bounded contexts, aggregates, entities, repositories, or other DDD patterns.
Agents recognize accepted aliases but use canonical terms. They never infer a
new meaning without explicit user agreement.

Sources:

- [Eric Evans' DDD Reference page](https://www.domainlanguage.com/ddd/reference/)
- [Eric Evans' DDD Reference PDF](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)
- [Microsoft domain analysis guidance](https://learn.microsoft.com/en-nz/azure/architecture/microservices/model/domain-analysis)

## Local skill linking

Codex scans `.agents/skills` from the current directory through the repository
root. OpenAI states that Codex follows symlinked skill directories. Claude Code
uses `.claude/skills` for project skills and also follows directory symlinks.

The linker creates one absolute symlink per workflow skill in both locations.
Individual links preserve unrelated project-specific skills in each directory.
The script resolves its repository from its own file path, so the caller's
working directory does not affect the source paths.

The script performs a full conflict check across both locations before writing.
It never replaces a real file or directory. `--force` replaces only a
conflicting symlink.

Source:

- [OpenAI local skill locations](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)
- [Claude Code project skills](https://code.claude.com/docs/en/skills#where-skills-live)

## Official documentation cache

External technical facts come from current official documentation. Model
memory, search snippets, and third-party explanations only help find a primary
source. The agent must open the official page before relying on it.

The `source` skill records concise, paraphrased claims under
`docs/knowledge/sources/`. Each OKF note stores one canonical URL, publisher,
version, applicability, and retrieval time. Later stages read the source index
and re-open relevant URLs once per work session. The live page wins when it
conflicts with the local note.

This design keeps source context discoverable without copying full manuals.
It also follows OpenAI's progressive-disclosure model: load the index first,
then only the references needed for the task.

The disposable verification project records Next.js, Node.js, and SQLite facts
from their owners. These notes support external API constraints. Source code
and direct application use remain the authority for implemented behavior.

Sources:

- [Next.js mutating data](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Node.js 24 SQLite API](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html)
- [SQLite STRICT tables](https://www.sqlite.org/stricttables.html)

## Git ticket delivery

Git's own workflow guide recommends one short-lived topic branch for each
feature or bug fix. Git worktrees provide separate working trees with their own
`HEAD` and index while sharing repository references. This makes one branch and
one linked worktree per ticket a small, native model for parallel agents.

The workflow keeps the integration worktree on `main` by default. Every
non-epic ticket uses `.worktrees/<ticket-key>/`. Branches follow Conventional
Branch 1.1.0 as `<type>/<ticket-key>-<description>`. Stories default to `feat`,
bugs to `fix`, and tasks or subtasks to `chore`.

Every ticket commit follows Conventional Commits 1.0.0. The ticket key is the
scope when one ticket owns the commit. Conventional Commits can later support
Semantic Versioning. The workflow records releases, but it does not infer
version bumps or tags. A version policy needs its own project decision.

Jira treats dependencies as ordering constraints: the blocking item ends before
the dependent item begins. The workflow therefore refuses a worktree for any
ticket with an open blocker. It does not create stacked branches from unfinished
blocker branches. Planning and discussion may still continue.

Independent ticket implementation may run in parallel. Worktrees do not remove
semantic dependencies or merge conflicts, so likely non-generated file overlap also
blocks parallel execution. Generated board conflicts are resolved by rerunning
`sync` after integrating the latest target. Final integration runs serially.

Before final review, the ticket branch must contain the latest target commit.
The review records that full commit hash. A green ticket is completed and
committed inside its worktree. Finalization creates a conventional `--no-ff`
merge commit on the target branch, removes the clean worktree, and deletes the
fully merged local branch with `git branch -d`. It never forces cleanup.

Remote pushes, pull requests, and remote branch deletion remain outside the
default local workflow because they change external state.

Sources:

- [Git worktree documentation](https://git-scm.com/docs/git-worktree.html)
- [Git topic-branch workflow](https://git-scm.com/docs/gitworkflows)
- [Git feature branch workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow/)
- [Git merge documentation](https://git-scm.com/docs/git-merge)
- [Git branch deletion](https://git-scm.com/docs/git-branch)
- [Jira dependencies](https://support.atlassian.com/jira-software-cloud/docs/what-are-dependencies-in-advanced-roadmaps/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Conventional Branch 1.1.0](https://conventionalbranch.org/)
- [Semantic Versioning 2.0.0](https://semver.org/)

## Release and product outcome

Jira versions track groups of completed work through release states. That
state is distinct from ticket resolution. This workflow makes the distinction
explicit: `done` means merged repository state, while `green` means a verified
deployment or publication.

A planned release records its tickets, target, provider, migration, rollout,
recovery, approvals, and official source notes. Release start records one
immutable commit and artifact digest. Green requires passing live checks.
Failed and rolled-back attempts remain in work history and never become current
release knowledge.

An outcome record links to the confirmed brief instead of copying its success
definition. A later measurement records the observed result and a decision to
proceed, improve, revert, or stop. This closes the loop without rewriting the
original success definition.

Sources:

- [Jira releases and versions](https://support.atlassian.com/jira-software-cloud/docs/enable-releases-and-versions/)
- [GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [Google SRE release engineering](https://sre.google/sre-book/release-engineering/)
- [Google SRE canarying releases](https://sre.google/workbook/canarying-releases/)
- [Google SRE service level objectives](https://sre.google/sre-book/service-level-objectives/)
- [DORA metrics](https://dora.dev/guides/dora-metrics/)

## Context-aware implementation

This workflow assumes Codex with ChatGPT subscription access. OpenAI documents
ChatGPT sign-in and API-key authentication as separate Codex access modes. The
public API catalog lists a 1.05M GPT-5.6 context window, but that API value does
not define the subscription session.

OpenAI's public Codex model page does not publish the subscription context
window. Local verification used Codex CLI 0.147.0 while signed in through
ChatGPT. Its service-provided model catalog reported 272,000 raw tokens and a
95 percent effective limit for every GPT-5.6 variant. That produces 258,400
effective tokens.

The workflow rounds this down to a conservative 256,000-token fallback. A
runtime-reported subscription limit still takes priority because Codex can
change its limits. The 1.05M limit is used only when a project explicitly runs
through API-key access.

Anthropic lists a 1M context window for Claude Opus 5. That value applies only
when its actual host or runtime provides it. It does not change the default
Codex subscription profile.

The session-fit gate reserves context for correction, integration, tests, and
handoff. It delegates only when the complete implementation is unlikely to fit
the safe remainder. Each subagent packet is sized against that subagent's own
model and session, not the coordinator's capacity.

Subagents receive bounded outcomes and exclusive path ownership. Write packets
run sequentially unless both behavior and paths are independent. The
coordinator owns integration and final verification. This reduces context
pollution and shared-worktree conflicts without adding delegation to small
tasks.

Sources:

- [OpenAI Codex models and access modes](https://learn.chatgpt.com/docs/models)
- [OpenAI API model comparison](https://developers.openai.com/api/docs/models/compare)
- [OpenAI Codex subagents](https://developers.openai.com/codex/agent-configuration/subagents)
- [OpenAI multi-agent guidance](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- [Anthropic context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Anthropic Claude Opus 5 prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)
