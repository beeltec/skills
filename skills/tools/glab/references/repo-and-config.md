# Repository, Auth & Configuration — glab repo / glab auth / glab config

## Repository — glab repo

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `repo clone` | Clone a repository |
| `repo create` | Create a new repository |
| `repo fork` | Fork a repository |
| `repo list` | List repositories |
| `repo view` | View repository details |
| `repo search` | Search repositories |
| `repo archive` | Download repository archive |
| `repo delete` | Delete a repository |
| `repo transfer` | Transfer to another namespace |
| `repo mirror` | Configure repository mirroring |
| `repo members` | Manage repository members |
| `repo contributors` | View contributors |
| `repo publish` | Make a repository public |
| `repo update` | Modify repository settings |

### glab repo clone

```bash
# A numeric project ID works in place of owner/repo
glab repo clone owner/repo ./my-dir

# Arguments after -- are passed through to git clone
glab repo clone owner/repo -- --branch develop

# Clone every repo in a group, paginated
glab repo clone -g my-group --per-page 100 --page 1
```

Cloning preserves fork relationships — the upstream remote is added automatically.

### glab repo create

```bash
# Runs interactively with no arguments; uses the current directory name if the name is omitted
glab repo create my-project --description "My project" --visibility private
glab repo create -g my-group my-project
```

### glab repo fork

```bash
# Forks the current repo when no path is given
glab repo fork --clone
glab repo fork owner/repo --name my-fork --path my-fork-path
```

### glab repo list

```bash
glab repo list -g my-group
glab repo list --archived=false      # Exclude archived repos
glab repo list -F json --per-page 100
```

### glab repo view / search / archive

```bash
glab repo view owner/repo
glab repo view --web                 # Open in browser
glab repo search -s "keyword"
glab repo archive owner/repo --format zip
```

### glab repo delete / transfer

```bash
glab repo delete owner/repo --yes    # Destructive
glab repo transfer owner/repo --target-namespace new-group
```

## Authentication — glab auth

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `auth login` | Authenticate to a GitLab instance |
| `auth logout` | Remove authentication for a host |
| `auth status` | Display authentication status |
| `auth token` | Display or set the auth token |

### glab auth login

Use the least-privileged authentication method and scopes that support the operation. Interactive OAuth is preferred for a user session. In CI, prefer a CI job token when its endpoint permissions are sufficient, then a scoped project or group token; avoid personal access tokens where possible. Read-only operations may need only `read_api` or `read_repository`, while API mutations generally require `api`. `write_repository` grants Git-over-HTTP write access and is not a universal requirement for `glab` login.

```bash
# Interactive login (prompts for host, token, protocol)
glab auth login

glab auth login --hostname gitlab.example.com --git-protocol ssh --api-protocol https

# Non-interactive: pipe the token to --stdin
printf '%s' "$GITLAB_TOKEN" | glab auth login --hostname gitlab.example.com --stdin
```

Never place a real token directly in a command argument, URL, shell history, repository file, issue, MR, or log. Use an expiring token, store it in an approved secret manager, and rotate or revoke it when no longer needed.

glab auto-detects which authenticated host to use based on git remotes, so several instances can be logged in at once.

### glab auth status

```bash
glab auth status
# Displays: hostname, git protocol, API protocol, API endpoint, GraphQL endpoint, token status
```

### glab auth logout

```bash
glab auth logout                     # Logout from default host
glab auth logout --hostname gitlab.example.com
```

## Configuration — glab config

Configuration stored in `~/.config/glab-cli/config.yml`.

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `config set` | Set a configuration value |
| `config get` | Get a configuration value |
| `config list` | List all configuration |

```bash
# -h scopes the setting to one host; without it the value is global
glab config set -h gitlab.example.com git_protocol ssh
glab config get git_protocol
glab config list
```

### Configuration Keys

| Key | Description | Values |
|-----|-------------|--------|
| `git_protocol` | Protocol for git operations | `ssh`, `https` |
| `api_protocol` | Protocol for API calls | `http`, `https` |
| `editor` | Text editor for descriptions | Any editor command |
| `browser` | Web browser | Any browser command |
| `glamour_style` | Markdown rendering style | `dark`, `light`, `notty` |

## Key Management

Each of `ssh-key`, `gpg-key`, and `deploy-key` supports `list`, `add`, and `delete <id>`.

```bash
glab ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop"
glab gpg-key add ./my-key.gpg
glab deploy-key add ~/.ssh/deploy.pub --title "CI Server" --can-push
glab ssh-key delete 12345
```

## Shell Completion — glab completion

```bash
glab completion -s bash > /etc/bash_completion.d/glab
glab completion -s zsh > "${fpath[1]}/_glab"
```

`-s` also accepts `fish` (`~/.config/fish/completions/glab.fish`) and `powershell`.

## Tokens — glab token

Manage personal access tokens.

```bash
glab token list
glab token create --name "CI Token" --scopes api,read_repository --expires-at 2025-12-31
glab token revoke 12345
```

## Users — glab user

```bash
glab user events                     # View your recent activity
```
