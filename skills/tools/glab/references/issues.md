# Issues & Incidents — glab issue / glab incident

Complete reference for managing GitLab issues and incidents from the CLI.

## Issue Subcommands

| Subcommand | Alias | Description |
|------------|-------|-------------|
| `issue create` | `issue new` | Create a new issue |
| `issue list` | `issue ls` | List issues |
| `issue view` | — | Display issue details |
| `issue update` | — | Update issue attributes |
| `issue close` | — | Close an issue |
| `issue reopen` | — | Reopen a closed issue |
| `issue delete` | `issue del` | Delete an issue |
| `issue note` | `issue comment` | Add a comment |
| `issue subscribe` | `issue sub` | Subscribe to notifications |
| `issue unsubscribe` | `issue unsub` | Unsubscribe from notifications |
| `issue todo` | — | Add to your to-do list |
| `issue board` | — | View and interact with issue boards |

## glab issue create

### Flags

| Flag | Short | Type | Description |
|------|-------|------|-------------|
| `--description` | `-d` | string | Issue description (use `-` to open editor) |
| `--confidential` | `-c` | bool | Mark as confidential (note: `-c` means `--closed` in `issue list`) |
| `--weight` | `-w` | int | Issue weight (>= 0) |
| `--due-date` | — | string | Due date in `YYYY-MM-DD` format |
| `--epic` | — | int | Epic ID to add the issue to |
| `--linked-issues` | — | ints | IIDs of issues to link (comma-separated or repeated) |
| `--linked-mr` | — | int | MR IID to resolve all issues in |
| `--link-type` | — | string | Link type: `relates_to` (default), `blocks`, `is_blocked_by` |
| `--time-estimate` | `-e` | string | Time estimate (e.g., `1h30m`, `2d`) |
| `--time-spent` | `-s` | string | Time already spent |
| `--recover` | — | bool | Save/restore options on failure (experimental) |

Also: `-t/--title`, `-a/--assignee`, `-l/--label`, `-m/--milestone`, `--no-editor`, `--web`, `-y/--yes`. Strings flags take comma-separated values or repeat.

### Examples

```bash
glab issue create -t "Fix login timeout" -l bug -m v2.1
glab issue new -t "Fix CVE-YYYY-XXXX" -l security --linked-mr 123 -c
glab issue create -t "Write docs" --due-date 2025-03-15 -w 3
glab issue create -t "Parent task" --linked-issues 10,11,12 --link-type blocks
```

## glab issue list

### Flags

| Flag | Short | Type | Description |
|------|-------|------|-------------|
| `--mine` | — | bool | Show only your issues |
| `--confidential` | — | bool | Filter by confidential status |
| `--closed` | `-c` | bool | Show only closed issues |
| `--all` | — | bool | Show all issues (all states) |
| `--group` | `-g` | string | List issues for a group |
| `--search` | `-s` | string | Search in title and description |
| `--in` | — | string | Search scope: `title`, `description`, or `title,description` |
| `--order` | `-o` | string | Order by: `created_at`, `updated_at`, `priority`, `due_date`, `relative_position`, `label_priority`, `milestone_due`, `popularity`, `weight` |
| `--sort` | — | string | Sort: `asc` or `desc` |
| `--per-page` | `-P` | int | Items per page (default 30) |
| `--page` | `-p` | int | Page number |
| `--output` | `-F` | string | Output format: `text` or `json` |

Also: `-a/--assignee`, `-A/--author`, `-l/--label`, `-m/--milestone`. Default is open issues only.

### Examples

```bash
glab issue list --mine
glab issue list -c -l bug -m v3.1
glab issue list -s "timeout" --in title
glab issue list -F json --per-page 100
glab issue list -g my-group --label "P1"
glab issue list --label "P1" --assignee "" -F json   # Unassigned: empty --assignee
```

## glab issue view

```bash
glab issue view 123
glab issue view 123 --comments      # Include comments
glab issue view 123 --system-logs   # Include system activity
```

## glab issue update

```bash
glab issue update 123 --title "New title"
glab issue update 123 --label "reviewed" --unlabel "triage"
glab issue update 123 --assignee user1,user2 --milestone "v2.0"
glab issue update 123 --due-date "2025-06-01" --weight 5
glab issue update 123 --confidential    # Make confidential
glab issue update 123 --milestone ""    # Unassign milestone (use "" or 0)
```

## glab issue close / reopen / delete

```bash
glab issue close 123
glab issue reopen 123
glab issue delete 123              # Delete permanently
glab issue delete 123 124 125      # Delete multiple
```

## glab issue note

```bash
glab issue note 123 -m "Investigated — this is caused by the timeout config"
glab issue note 123                # Opens editor for longer comment
```

## glab issue subscribe / unsubscribe / todo

```bash
glab issue subscribe 123
glab issue sub 123                 # Alias
glab issue unsubscribe 123
glab issue todo 123                # Add to your to-do list
```

## glab issue board

```bash
glab issue board view                          # Default board
glab issue board view --assignee username
glab issue board view --labels "bug,P1" --milestone "v2.0"
```

## Incidents — glab incident

Same shape as issues, scoped to operational incidents.

| Subcommand | Description |
|------------|-------------|
| `incident list` | List incidents |
| `incident view` | View incident details |
| `incident close` | Close an incident |
| `incident reopen` | Reopen an incident |
| `incident note` | Add a comment |
| `incident subscribe` | Subscribe to notifications |
| `incident unsubscribe` | Unsubscribe |
| `incident todo` | Add to to-do list |

### Examples

```bash
glab incident list                    # Open incidents
glab incident view 456 --comments
glab incident close 456
glab incident note 456 -m "Root cause identified"
```
