# Writing Issues & Merge Requests — Titles, Descriptions & Best Practices

Guidelines for writing clear, scannable, and actionable issues and merge requests in GitLab.

## Project Conventions Come First

Before composing or updating content:

1. Read `CONTRIBUTING.md`, repository guidance, and the available files in `.gitlab/issue_templates/` or `.gitlab/merge_request_templates/`.
2. Inspect a few recently accepted issues or merged MRs for established title, label, and description conventions.
3. Search for duplicates and related work.
4. Preserve existing useful content when updating a description; make the smallest requested edit.

Use the project's template and title policy when they exist. The formats below are fallbacks, not universal GitLab requirements. Do not require Conventional Commits, bracketed issue types, fixed title lengths, or a standard checklist unless the project has adopted them.

## Issue Titles

Convey at a glance what the issue is about: frequency + location + problem, in sentence case, without fluff ("Issue:", "not working") — e.g. `Login button unresponsive on iOS Safari 17 (1 in 5 attempts)`, `Search results empty on /products page after v2.1.0 update`. Tasks use an imperative statement: `Refactor auth middleware to use JWT v3`. Apply labels as labels, not crammed into the title (see Labels Instead of Title Prefixes below).

Fallback prefix formats — only when project convention requires prefixes or no label system exists: `[Bug]: <Component> <symptom> <context>`, `[Feature]: <User story>`, `[Docs]: <What to update>`, `[Question]: <Specific question>`.

## Issue Descriptions

Every issue body should be structured, scannable, and actionable. Use markdown headings, checklists, and code blocks. Adapt the sections below to the issue type. GitLab-specific references: `#123`, `group/project#456`, `@username`.

### Standard Issue Body Structure

```markdown
## Summary
1-2 sentences: What and why.
User story format: "As a [user], I want [goal] so that [benefit]."

## Steps to Reproduce (bugs)
1. Go to /login
2. Enter invalid email
3. Click submit
4. Observe 500 error

**Expected**: Form shows validation error.
**Actual**: Page returns HTTP 500.

## Environment (bugs)
- OS: macOS 15
- Browser: Safari 18.2
- App version: v2.1.0
- Node: v20.10

## Additional Context
- Logs: ```paste here```
- Screenshots/GIFs: ![description](url)
- Frequency: "Crashes 3/5 times on mobile"

## Acceptance Criteria (features)
- [ ] Users can toggle dark mode from settings
- [ ] Preference persists across sessions
- [ ] Respects OS-level dark mode setting

## Suggested Fix / Next Steps (optional)
- [ ] Research alternative approach
- [ ] Draft MR

## Related Issues
Closes #123, Related #456, Depends on #789
```

### Sections by Issue Type

| Type | Key Sections | Tips |
|------|-------------|------|
| **Bug** | Repro steps, Expected/Actual, Environment, Logs/Screenshots, Frequency | Provide a minimal repro (link to sandbox, branch, or snippet); quantify: "Happens 100% on mobile" |
| **Feature** | User story, Use cases, Alternatives considered, Mockups | Include wireframes or design links; list edge cases |
| **Docs** | What to document, Current broken link/section, Proposed text | Show before/after diff |
| **Question** | What you've tried, Error messages, Goal | Consider using GitLab Discussions if exploratory |
| **Task/Epic** | Overview, Sub-tasks (checklist), Dependencies, Acceptance criteria | Link sub-issues; define "Definition of Done" |

### Content Quality Rules

**Be specific and quantify:**

| Bad | Good |
|-----|------|
| "It's broken" | "Button fails to submit on /login (Safari 18)" |
| "Sometimes crashes" | "Crashes 3/5 times when uploading files > 10MB" |
| No repro steps | Numbered steps + minimal repro link |
| Wall of text | Headings + bullets + code blocks |
| No environment info | Full specs (OS, browser, version, config) |

**Search before creating**: Check for duplicates with `glab issue list -s "keyword"`. Reference related issues: "Searched #123, #456 — this is different because..."

**Use task lists for progress tracking**: GitLab renders `- [ ]` checkboxes interactively. For large features, create sub-issues and link them.

For `glab issue create` invocations, see [issues.md](issues.md). Non-obvious idiom: `-d -` opens the editor for a structured description.

## Merge Request Titles

If the project uses Conventional Commits for MR titles, start with `<type>[optional scope]: <description>`; scope is a noun for the affected area (`(api)`, `(auth)`); use `!` after the type for breaking changes (`feat!: drop Node 18 support`). Otherwise, use a concise imperative summary matching the repository's established style.

Fallback title rules:

- **Length**: 50-72 characters max — scannable in lists and notifications.
- **Imperative mood**: "Add", "Fix", "Update" — not "Added", "Fixes", "Updated".
- Put closing issue references in the MR description so reviewers can see and verify their effect. Add one to the title only when project policy requires it.
- Good vs bad: `fix(auth): resolve null pointer in login`, not `bug fix`; `refactor(api): extract middleware utils`, not `update code`.

Individual commit messages follow the same rules at commit level: ≤72-char capitalized imperative subject with no trailing period, then a blank line and a body wrapped at 72 chars explaining what and why (the diff shows how). If a commit message needs "and", split the commit.

## Merge Request Descriptions

Structure with these sections:

```markdown
### What does this MR do?
High-level summary + why (problem solved, user story).
Link to related issues: `Closes #123`

### Changes
- Bullet list of key changes
- One change per bullet
- Group by area if touching multiple components

### How to test
1. Check out this branch
2. Run `npm install && npm run dev`
3. Navigate to /login
4. Verify button responds within 200ms

### Screenshots / GIFs (REQUIRED for UI changes)
| Before | After |
|--------|-------|
| ![before](url) | ![after](url) |

### Breaking changes (if any)
- `BREAKING CHANGE:` description
- Migration steps

### Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Passes CI pipeline
- [ ] Self-reviewed the diff
```

For `glab mr create` invocations, see [merge-requests.md](merge-requests.md).

## Draft Merge Requests

- `--draft` flag or `Draft:` title prefix marks the MR as draft; `WIP:` is deprecated but still recognized.
- Draft MRs cannot be merged until marked ready: `glab mr update <id> --ready` or remove the prefix.

## Description Templates

GitLab supports description templates that auto-populate when creating issues or MRs.

### Template Locations

```
.gitlab/
├── issue_templates/
│   ├── Default.md          # Auto-populates for all new issues
│   ├── Bug.md
│   └── Feature.md
└── merge_request_templates/
    ├── Default.md          # Auto-populates for all new MRs
    └── Hotfix.md
```

- **`Default.md`**: Automatically populates the description field for new issues/MRs.
- **Named templates**: Users select from a dropdown in the GitLab UI.

### Quick Actions in Templates

Templates can include [quick actions](https://docs.gitlab.com/ee/user/project/quick_actions.html) that execute when the issue/MR is created:

```markdown
/label ~bug ~P1
/assign @me
/milestone %v2.0
```

### Template Variables

MR templates support these variables that GitLab auto-expands:

| Variable | Expands to |
|----------|-----------|
| `%{source_branch}` | Source branch name |
| `%{target_branch}` | Target branch name |
| `%{first_commit}` | First commit message in the MR |
| `%{title}` | MR title |

### Using Templates with glab

When templates exist, `glab mr create` and `glab issue create` auto-populate from `Default.md`. To use a named template:

```bash
# Current glab versions support local MR templates by name:
glab mr create -t "fix(auth): patch token leak" --template Hotfix

# For an older installed glab version, check --help and use stdin if needed:
glab mr create -t "fix(auth): patch token leak" -d - < .gitlab/merge_request_templates/Hotfix.md
```

## Keep MRs Small and Focused

- **Single purpose**: One MR = one feature or fix.
- **Self-review first**: Run `glab mr diff` before requesting review.
- **Use stacked diffs** (`glab stack`) for large features that need multiple sequential MRs.
- **Size**: Keep the MR small enough to review confidently. Avoid universal commit-count or line-count thresholds; generated code, migrations, and repository policy can change what is practical.
- **Squash-and-merge**: For MRs with messy commit history, use squash merge to produce a clean single commit on the target branch. GitLab supports this as a merge option.

## Linking Issues and MRs

GitLab auto-closes issues when MRs merge if the MR description or commit message contains `Closes`/`Fixes`/`Resolves #123`; multiple: `Closes #123, closes #456`. With glab: `glab mr create --related-issue 123 --fill` adds the closing reference automatically.

## Labels Instead of Title Prefixes

Prefer applying labels separately for better filtering — `glab issue create -t "API returns 500 on invalid email" -l bug,P1,api` — unless the project convention requires title prefixes or no label system is in place (see the fallback prefix formats above).
