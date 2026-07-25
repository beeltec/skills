# CI/CD Pipelines & Jobs — glab ci / glab job

Reference for GitLab CI/CD pipelines and jobs. `ci trace`, `ci retry`, and `ci trigger` prompt for a job when invoked bare.

## CI Subcommands

| Subcommand | Description |
|------------|-------------|
| `ci run` | Create a new pipeline |
| `ci list` | List pipelines |
| `ci view` | Interactive pipeline viewer (run, trace, cancel jobs) |
| `ci status` | View current pipeline status |
| `ci trace` | Trace (tail) a CI job's log in real time |
| `ci retry` | Retry a failed job |
| `ci trigger` | Trigger a manual job |
| `ci run-trig` | Run a pipeline via trigger token |
| `ci cancel` | Cancel a running pipeline |
| `ci delete` | Delete a pipeline |
| `ci lint` | Validate `.gitlab-ci.yml` syntax |
| `ci get` | Get CI/CD configuration variables |
| `ci artifact` | Download job artifacts |

## glab ci run

Defaults to the current branch.

```bash
glab ci run -b main --variables key1:val1,key2:val2
glab ci run -b main --variables key1:val1 --variables key2:val2
```

## glab ci list

### Flags

| Flag | Short | Type | Description |
|------|-------|------|-------------|
| `--status` | `-s` | string | Filter by status: `running`, `pending`, `success`, `failed`, `canceled`, `skipped`, `manual` |
| `--order-by` | `-o` | string | Order by: `id`, `status`, `ref`, `updated_at`, `user_id` |
| `--output` | `-F` | string | Output format: `text` or `json` |

Also: `--sort` (`asc`/`desc`), `-P/--per-page` (default 30), `-p/--page`.

### Examples

```bash
glab ci list -s failed
glab ci list -F json
```

## glab ci view

Interactive TUI over the pipeline's stages and jobs.

```bash
glab ci view 12345                  # By pipeline ID
glab ci view -b main
```

### Interactive Controls

| Key | Action |
|-----|--------|
| Arrow keys / Tab | Navigate between jobs |
| Enter | Toggle job logs / show child pipelines |
| Ctrl+R / Ctrl+P | Run, retry, or play a job |
| Ctrl+D | Cancel a job |
| Esc / q | Close logs or exit |
| Ctrl+Q | Quit the viewer |

## glab ci status

```bash
glab ci status -b main
glab ci status --live
```

## glab ci trace

```bash
glab ci trace 224356863             # By job ID
glab ci trace lint -b feature-branch
```

## glab ci retry

Also retries canceled jobs.

```bash
glab ci retry 224356863
glab ci retry lint -b main
glab ci retry lint -p 12345         # In a specific pipeline
```

## glab ci trigger

```bash
glab ci trigger 224356863
glab ci trigger deploy -b main      # By job name, on a branch
```

## glab ci run-trig

Runs a pipeline with a trigger token instead of your credentials.

```bash
glab ci run-trig -t $CI_JOB_TOKEN -b main --variables key1:val1,key2:val2

# Cross-project
glab ci run-trig -t $TRIGGER_TOKEN -b main -R other-group/other-project

# Typed pipeline inputs
glab ci run-trig -t $CI_JOB_TOKEN -b main \
  --input "replicas:int(3)" \
  --input "debug:bool(false)" \
  --input "regions:array(us-east,eu-west)"
```

## glab ci cancel

```bash
glab ci cancel                      # Current branch's pipeline
glab ci cancel 12345
```

## glab ci delete

```bash
glab ci delete 12345
```

## glab ci lint

```bash
glab ci lint                        # .gitlab-ci.yml in current directory
glab ci lint path/to/.gitlab-ci.yml
```

## glab ci artifact

```bash
glab ci artifact 224356863          # By job ID
glab ci artifact lint               # By job name
```

## Pipeline Schedules — glab schedule

| Subcommand | Description |
|------------|-------------|
| `schedule create` | Create a new schedule |
| `schedule list` | List all schedules |
| `schedule run` | Execute a schedule manually |
| `schedule delete` | Delete a schedule |

### Examples

```bash
glab schedule create --cron "0 2 * * *" --description "Nightly build" --ref main
glab schedule list
glab schedule run 42
glab schedule delete 42
```

## Jobs — glab job

```bash
glab job list
glab job list -p 12345              # Jobs in a pipeline
```
