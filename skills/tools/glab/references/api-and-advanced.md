# API, Variables & Advanced — glab api / glab variable / glab snippet / glab stack / glab alias

## Raw API Access — glab api

Make authenticated HTTP requests to the GitLab REST or GraphQL API.

### Behavior

- **Default method**: GET when no parameters; POST when parameters are provided
- **Auto-detection**: Determines GitLab host from git remotes (falls back to gitlab.com)
- **Placeholders**: `:fullpath`, `:id`, `:repo`, `:namespace`, `:group`, `:user`, `:username`, `:branch` are auto-substituted from current project context

### Flags

| Flag | Short | Type | Description |
|------|-------|------|-------------|
| `--field` | `-F` | key=value | Add parameter with type inference (bools, ints, null auto-converted; `@file` reads from file) |
| `--raw-field` | `-f` | key=value | Add parameter as JSON string (no type conversion) |
| `--input` | — | string | Read request body from file (use `-` for stdin) |
| `--paginate` | — | bool | Fetch all pages of results |
| `--output` | — | string | Output format: `json` (default, pretty-printed) or `ndjson` (newline-delimited) |

Also: `-H/--header`, `-X/--method` (GET, POST, PUT, PATCH, DELETE), `--hostname`, `-i/--include`, `--silent`.

### REST API Examples

```bash
glab api projects/:fullpath/members --paginate -F per_page=100

# ndjson is memory-efficient for large paginated datasets
glab api projects/:fullpath/issues --paginate --output ndjson > issues.ndjson

glab api projects/:fullpath/issues -F title="New Issue" -F description="Body text"
glab api projects/:fullpath/issues/42 -X PUT -F state_event=close
glab api projects/:fullpath/pipeline_schedules/15 -X DELETE

# --input - reads the body from stdin
echo '{"title":"New Issue"}' | glab api projects/:fullpath/issues -X POST --input -
```

### GraphQL API Examples

```bash
glab api graphql -f query='{ currentUser { username } }'

# --paginate follows pageInfo when the query declares an $endCursor variable
glab api graphql --paginate -f query='
  query($endCursor: String) {
    project(fullPath: "my-group/my-project") {
      issues(first: 100, after: $endCursor) {
        edges { node { title state } }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
'

# Query variables are passed as fields
glab api graphql -f query='
  query($path: ID!) {
    project(fullPath: $path) { name description }
  }
' -F path="my-group/my-project"
```

### Field Type Conversion (--field / -F)

| Input | Converted To |
|-------|-------------|
| `"true"` / `"false"` | JSON boolean |
| `"null"` | JSON null |
| Integer strings (`"42"`) | JSON number |
| `@filename` | File contents as string |
| Everything else | JSON string |

Use `--raw-field` / `-f` to force string type (no conversion).

## CI/CD Variables — glab variable

Project-level by default; `--group` targets the group instead.

| Subcommand | Description |
|------------|-------------|
| `variable list` | List all CI/CD variables |
| `variable get` | Get a variable's value |
| `variable set` | Create or update a variable |
| `variable update` | Update an existing variable |
| `variable delete` | Delete a variable |
| `variable export` | Export variables |

### Examples

```bash
glab variable get MY_SECRET
glab variable set MY_SECRET "value" --masked --protected --scope production
glab variable update MY_SECRET "new_value"
glab variable delete MY_SECRET
glab variable export > variables.env
```

### Variable Flags

| Flag | Description |
|------|-------------|
| `--masked` | Mask the variable in job logs |
| `--protected` | Only expose to protected branches/tags |
| `--scope` | Environment scope (e.g., `production`, `*`) |
| `--type` | Variable type: `env_var` (default) or `file` |

## Snippets — glab snippet

| Subcommand | Description |
|------------|-------------|
| `snippet create` | Create a new snippet |
| `snippet list` | List snippets |
| `snippet view` | View snippet details |
| `snippet delete` | Delete a snippet |

```bash
# Runs interactively when no file is given
glab snippet create
glab snippet create -t "My Config" -f config.yml --visibility private
```

## Stacked Diffs — glab stack (Experimental)

Stacked merge requests. Experimental — behavior and flags may change.

| Subcommand | Description |
|------------|-------------|
| `stack create` | Create a new stack |
| `stack list` | List stacks |
| `stack save` | Save changes with a commit message |
| `stack amend` | Modify the current diff |
| `stack sync` | Push, rebase, and clean up merged branches |
| `stack first` | Navigate to first diff in stack |
| `stack last` | Navigate to last diff in stack |
| `stack next` | Move to next diff |
| `stack prev` | Move to previous diff |
| `stack move` | Move a diff within the stack |
| `stack reorder` | Reorder diffs in the stack |

### Workflow

```bash
glab stack create my-feature

# Each save creates the next MR in the stack
glab stack save -m "Part 1: Add data model"
glab stack save -m "Part 2: Add API endpoint"

# Fold further edits into the current diff instead
glab stack amend

# Pushes changes, rebases the stack, cleans up merged branches
glab stack sync

# Navigate: glab stack first / next / prev / last
glab stack list
```

## Labels — glab label

| Subcommand | Description |
|------------|-------------|
| `label create` | Create a new label |
| `label list` | List labels |

```bash
glab label create "priority::high" --color "#FF0000" --description "High priority items"
```

## Milestones — glab milestone

| Subcommand | Description |
|------------|-------------|
| `milestone create` | Create a new milestone |
| `milestone list` | List milestones |
| `milestone delete` | Delete a milestone |

```bash
glab milestone create --title "v2.0" --description "Major release" --due-date "2025-06-01"
glab milestone delete 5
```

## Aliases — glab alias

| Subcommand | Description |
|------------|-------------|
| `alias set` | Create or update an alias |
| `alias list` | List all aliases |
| `alias delete` | Delete an alias |

```bash
glab alias set mrc 'mr create --fill --yes'
glab alias set cis 'ci status --live'
glab alias delete mrc

glab mrc                            # Expands to: glab mr create --fill --yes
```

## Iterations — glab iteration

```bash
glab iteration list                  # List iterations
```

## Secure Files — glab securefile

```bash
glab securefile list                 # List secure files
glab securefile download 42          # Download a secure file
```

## GitLab Duo AI — glab duo

```bash
glab duo ask "How do I set up CI for a Python project?"
```

## Check for Updates

```bash
glab check-update                    # Check if newer glab version is available
```
