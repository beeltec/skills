# Merge Requests — glab mr

Complete reference for managing GitLab merge requests from the CLI.

## Subcommands

| Subcommand | Alias | Description |
|------------|-------|-------------|
| `mr create` | `mr new` | Create a new merge request |
| `mr list` | `mr ls` | List merge requests |
| `mr view` | — | Display merge request details |
| `mr checkout` | — | Check out MR branch locally |
| `mr diff` | — | View MR diff |
| `mr merge` | — | Merge a merge request |
| `mr approve` | — | Approve a merge request |
| `mr revoke` | — | Revoke approval |
| `mr approvers` | — | List MR approvers |
| `mr note` | `mr comment` | Add a comment to a MR |
| `mr close` | — | Close a merge request |
| `mr reopen` | — | Reopen a closed merge request |
| `mr update` | — | Update MR attributes |
| `mr delete` | `mr del` | Delete a merge request |
| `mr rebase` | — | Rebase the MR source branch |
| `mr todo` | — | Add MR to your to-do list |
| `mr subscribe` | `mr sub` | Subscribe to MR notifications |
| `mr unsubscribe` | `mr unsub` | Unsubscribe from MR notifications |
| `mr issues` | — | List issues that will close when MR is merged |

## glab mr create

Create a new merge request from the current or specified branch.

### Flags

| Flag | Short | Type | Description |
|------|-------|------|-------------|
| `--description` | `-d` | string | MR description (use `-` to open editor) |
| `--source-branch` | `-s` | string | Source branch (default: current branch) |
| `--fill` | `-f` | bool | Auto-fill title/description from commit messages |
| `--fill-commit-body` | — | bool | Fill description with each commit body |
| `--wip` | — | bool | Mark as draft (alias for `--draft`) |
| `--push` | — | bool | Push commits before creating MR |
| `--allow-collaboration` | — | bool | Allow commits from other members |
| `--related-issue` | `-i` | string | Create MR for an issue (uses issue title if `--title` omitted) |
| `--copy-issue-labels` | — | bool | Copy labels from related issue to MR |
| `--create-source-branch` | — | bool | Create source branch if it doesn't exist |
| `--signoff` | — | bool | Append DCO sign-off to description |
| `--head` | `-H` | string | Select alternate head repository (OWNER/REPO) |
| `--recover` | — | bool | Save/restore options on failure (experimental) |

Also: `-t/--title`, `-b/--target-branch`, `-a/--assignee`, `--reviewer`, `-l/--label`, `-m/--milestone`, `--draft`, `-y/--yes`, `--squash-before-merge`, `--remove-source-branch`, `--no-editor`, `-w/--web`. Strings flags take comma-separated values or repeat.

### Examples

```bash
glab mr create -a username -t "fix annoying bug"
glab mr create -f --draft --label RFC
glab mr create --fill --fill-commit-body --yes
glab mr create --related-issue 42 --copy-issue-labels
glab mr create --fill --push --yes -b main
```

## glab mr list

List merge requests with filtering.

### Flags

| Flag | Short | Type | Description |
|------|-------|------|-------------|
| `--mine` | `-M` | bool | Filter by your MRs (shortcut for `--author=@me`) |
| `--draft` | `-d` | bool | Filter by draft status |
| `--all` | — | bool | Show all MRs (all states) |
| `--group` | `-g` | string | List MRs for a group |
| `--order` | `-o` | string | Order by: `created_at`, `updated_at`, `merged_at`, `title`, `priority`, `label_priority`, `milestone_due`, `popularity` |
| `--sort` | `-s` | string | Sort: `asc` or `desc` |
| `--per-page` | `-P` | int | Items per page (default 30) |
| `--page` | `-p` | int | Page number |
| `--output` | `-F` | string | Output format: `text` or `json` |

Also: `-a/--assignee`, `-A/--author`, `--reviewer`, `-l/--label`, `-m/--milestone`, `-c/--closed`, `--merged`. Default is open MRs only.

### Examples

```bash
glab mr list --reviewer=@me
glab mr list --merged --label "feature"
glab mr list -F json --per-page 100
glab mr list -g my-group
```

## glab mr view

```bash
glab mr view 42
glab mr view feature-branch       # By branch name
glab mr view                      # Current branch's MR
glab mr view 42 --comments        # Include comments
glab mr view 42 --system-logs     # Include system activity
```

## glab mr checkout

```bash
glab mr checkout 42
glab mr checkout 42 -b my-branch  # Custom local branch name
glab mr checkout 42 -t            # Track the remote branch
```

## glab mr diff

```bash
glab mr diff                      # Diff for current branch's MR
glab mr diff 42 --color=never     # No color (for piping)
glab mr diff 42 --raw             # Raw diff format
```

## glab mr merge

```bash
glab mr merge 42                  # Prompts for method
glab mr merge                     # Current branch's MR
glab mr merge 42 --squash
glab mr merge 42 --rebase
glab mr merge 42 --yes            # Skip confirmation
glab mr merge 42 --when-pipeline-succeeds
```

## glab mr approve / revoke

```bash
glab mr approve 42 --sha abc123   # Approve only if HEAD matches SHA
glab mr approve 42 43 44          # Approve multiple MRs
glab mr approve                   # Current branch's MR
glab mr revoke 42                 # Revoke your approval
```

## glab mr note

```bash
glab mr note 42 -m "Looks good, one nit on line 55"
glab mr note -m "LGTM"            # Current branch's MR
```

## glab mr update

```bash
glab mr update 42 --title "New title"
glab mr update 42 --label "reviewed" --unlabel "needs-review"
glab mr update 42 --milestone "v2.0"
glab mr update 42 --assignee user1,user2 --reviewer user3
glab mr update 42 --draft             # Convert to draft
glab mr update 42 --ready             # Mark as ready
```

## glab mr close / reopen / delete

```bash
glab mr close 42
glab mr reopen 42
glab mr delete 42                 # Delete permanently
glab mr delete 42 43 44           # Delete multiple
```

## glab mr rebase

```bash
glab mr rebase 42
glab mr rebase                    # Current branch's MR
```

## glab mr subscribe / unsubscribe / todo

```bash
glab mr subscribe 42
glab mr unsubscribe 42
glab mr todo 42                   # Add to your to-do list
```
