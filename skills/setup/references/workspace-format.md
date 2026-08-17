# Workspace format

## Contents

- Two spaces
- Generated layout
- OKF v0.2 profile
- Project agent rules

## Two spaces

`docs/knowledge/` is an OKF v0.2 bundle. It describes the verified current
state.

`docs/work/` stores desired outcomes and delivery evidence. It includes
confirmed planning briefs, Jira-like tickets, releases, and product outcomes.
Briefs use Markdown with JSON-compatible YAML frontmatter. Tickets, releases,
and outcomes use JSON. Every index and board file is a generated read-only view.

Only verified current state enters `docs/knowledge/`. A completed ticket can
establish repository facts. A green release can establish deployed facts. An
observed outcome can establish product-result facts.

`docs/knowledge/ubiquitous-language.md` stores user-agreed project meaning.
The `language` skill may update it directly after explicit user confirmation.

## Generated layout

```text
.project/
├── workflow.json
└── bin/project-flow.mjs
.worktrees/                    # Ignored linked worktrees, one per ticket
docs/
├── knowledge/
│   ├── index.md
│   ├── ubiquitous-language.md # Agreed terms for users and agents
│   ├── releases/               # Green deployed or published state
│   ├── outcomes/               # Observed product results
│   └── sources/                # Concise notes from official documentation
│       └── index.md
└── work/
    ├── board.md
    ├── items/
    ├── briefs/                 # Confirmed problem and success definitions
    ├── releases/               # Planned and historical release attempts
    ├── outcomes/               # Planned and observed outcome checks
    ├── drafts/
    └── handoffs/              # Created when delegated work needs it
```

The workflow config uses `main` as `git.targetBranch` by default. It fixes the
worktree directory at `.worktrees` and the merge strategy at `no-ff`. A user may
select another target branch during setup or finalization.

## OKF v0.2 profile

Every concept except `index.md` needs frontmatter and a non-empty `type`. The
workflow creates JSON-formatted frontmatter between YAML delimiters.

Use these fields when known:

- `title` gives a display name.
- `description` gives one search-friendly sentence.
- `tags` supports cross-cutting discovery.
- `sources` records provenance.
- `generated` records the authoring actor and time.
- `verified` records independent checks.
- `status` is `draft`, `stable`, or `deprecated`.

Use `human:<id>` only for actual human authors or reviewers. Use
`process:project-flow` for the automated completion gate.

`docs/knowledge/sources/` contains `OfficialSource` concepts. The `source`
skill may update them directly after live verification. Product knowledge must
still pass through the work-item completion gate.

`docs/knowledge/ubiquitous-language.md` uses type `UbiquitousLanguage`. Its
frontmatter is canonical, and its body does not repeat the terms. Use
`language-show` for a readable view. Use only the Ubiquitous Language
principle. Do not add other DDD patterns.

Keep each value in one canonical record. Boards and indexes may repeat small
summaries because they are deterministically generated and validated. The
workflow does not maintain a separate knowledge log because Git and canonical
records already contain the history.

Source: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

## Project agent rules

Use `$rules` to install these project-profile fragments in the root
`AGENTS.md`:

- `project-evidence`
- `ubiquitous-language`
- `ticket-git-workflow`
- `code-quality`
- `comments`
- `testing`
- `review-policy`

The `agent-rules/project/` files are their canonical sources. The rules manager
embeds each fragment between named markers. Its SHA-256 digest makes manual
changes, stale copies, missing blocks, malformed markers, and duplicates
detectable.

Run the dry-run before installation. Then run the exact check:

```bash
node <rules-skill-directory>/scripts/manage-rules.mjs install \
  --scope project --root . --dry-run
node <rules-skill-directory>/scripts/manage-rules.mjs install \
  --scope project --root .
node <rules-skill-directory>/scripts/manage-rules.mjs check \
  --scope project --root .
```

Preserve all text outside managed blocks. Do not edit managed text by hand.
Update its source fragment, then rerun installation and the check.

Do not install personal defaults during project setup. The user can invoke
`$rules` explicitly to install the user profile once.

The `ticket-git-workflow` fragment is the persistent Git policy. The
`implement` and `document` skills own its task-specific commands and gates.

Official references:

- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://www.domainlanguage.com/ddd/reference/
- https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf
- https://git-scm.com/docs/git-worktree.html
- https://git-scm.com/docs/gitworkflows
- https://www.conventionalcommits.org/en/v1.0.0/
- https://conventionalbranch.org/
- https://support.atlassian.com/jira-software-cloud/docs/what-are-dependencies-in-advanced-roadmaps/
