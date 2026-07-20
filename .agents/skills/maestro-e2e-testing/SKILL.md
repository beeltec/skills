---
name: maestro-e2e-testing
description: Use when writing, running, or debugging Maestro E2E tests for mobile apps. Triggers on tasks involving end-to-end testing, UI automation, test flows, smoke tests, regression tests, or when user mentions Maestro, E2E, or automated mobile testing. Also use when setting up Maestro in a project or integrating with Expo EAS Workflows.
---

# Maestro E2E Testing

Maestro is a YAML-based UI testing framework for mobile (iOS/Android) and web with built-in tolerance for flakiness and delays. Tests are declarative flow files that describe user journeys.

## When to Use

- Writing or modifying E2E test flows (`.maestro/` directory)
- Setting up Maestro in a new or existing project
- Debugging flaky or failing E2E tests
- Integrating E2E tests into CI/CD (EAS Workflows, GitHub Actions)
- Converting manual QA scripts into automated flows

## Project Setup

### Installation

```bash
# macOS/Linux
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Verify
maestro --version
```

**Prerequisites:** Java 11+, iOS Simulator (Xcode) or Android Emulator (Android SDK).

### Directory Structure

```
project-root/
├── .maestro/
│   ├── config.yaml          # Workspace config (optional)
│   ├── subflows/            # Reusable subflows
│   │   ├── login.yaml
│   │   └── setup.yaml
│   ├── home.yaml            # Feature flows
│   ├── login.yaml
│   └── settings.yaml
└── eas.json                 # EAS build profiles (Expo)
```

### Workspace Config

```yaml
# .maestro/config.yaml
flows:
  - "*.yaml"
  - "!subflows/**"           # Exclude subflows from direct execution
executionOrder:
  continueOnFailure: false
  flowsOrder:
    - login.yaml
    - home.yaml
    - settings.yaml
```

## Quick Reference

### Flow File Anatomy

```yaml
# --- Header (above ---) ---
appId: com.markveys.idplus     # Required: bundle ID / package name
name: Login Flow               # Optional: display name
tags:
  - smoke                      # Optional: for selective runs
  - auth
env:
  USERNAME: ${USERNAME || "test@example.com"}
onFlowStart:
  - runFlow: subflows/setup.yaml
onFlowComplete:
  - takeScreenshot: final-state
---
# --- Commands (below ---) ---
- launchApp:
    clearState: true

- assertVisible: "Welcome"
- tapOn: "Sign In"
- inputText: "user@example.com"
- tapOn: "Login"
- assertVisible: "Dashboard"
```

### Essential Commands

| Command | Usage | Example |
|---------|-------|---------|
| `launchApp` | Start app | `- launchApp:` with `clearState: true` |
| `tapOn` | Tap element | `- tapOn: "Button"` or `- tapOn:` with `id: "btn_id"` |
| `inputText` | Type text | `- inputText: "hello"` |
| `assertVisible` | Assert shown | `- assertVisible: "Welcome"` |
| `assertNotVisible` | Assert hidden | `- assertNotVisible: "Error"` |
| `scrollUntilVisible` | Scroll to find | See commands reference |
| `swipe` | Swipe gesture | `- swipe:` with direction |
| `back` | Navigate back | `- back` |
| `hideKeyboard` | Dismiss keyboard | `- hideKeyboard` |
| `eraseText` | Clear text field | `- eraseText` |
| `waitForAnimationToEnd` | Wait for settle | `- waitForAnimationToEnd` |
| `takeScreenshot` | Capture screen | `- takeScreenshot: "name"` |
| `runFlow` | Execute subflow | `- runFlow: subflows/login.yaml` |
| `runScript` | Run JavaScript | `- runScript: script.js` |

**Full command reference:** See [commands.md](commands.md)
**Full selector reference:** See [selectors.md](selectors.md)

### Running Tests

```bash
# Run single flow
maestro test .maestro/login.yaml

# Run all flows in directory
maestro test .maestro/

# Run flows by tag
maestro test --include-tags=smoke .maestro/

# Launch Maestro Studio (visual test builder)
maestro studio
```

## Core Patterns

### 1. Subflows for Reuse

Extract common sequences (login, navigation) into `subflows/`:

```yaml
# .maestro/subflows/login.yaml
appId: com.markveys.idplus
---
- tapOn: "Sign In"
- tapOn:
    id: "email_field"
- inputText: ${EMAIL}
- tapOn:
    id: "password_field"
- inputText: ${PASSWORD}
- tapOn: "Login"
- assertVisible: "Dashboard"
```

```yaml
# .maestro/home.yaml - uses the subflow
appId: com.markveys.idplus
env:
  EMAIL: "test@example.com"
  PASSWORD: "test123"
---
- launchApp:
    clearState: true
- runFlow:
    file: subflows/login.yaml
    env:
      EMAIL: ${EMAIL}
      PASSWORD: ${PASSWORD}
- assertVisible: "Home"
```

### 2. Conditional Platform Logic

```yaml
- runFlow:
    when:
      true: ${maestro.platform == 'ios'}
    file: ios-specific.yaml

- runFlow:
    when:
      true: ${maestro.platform == 'android'}
    file: android-specific.yaml
```

### 3. Environment Variables

```bash
# Pass at runtime
EMAIL=admin@test.com maestro test .maestro/login.yaml

# Or define defaults in flow header
env:
  EMAIL: ${EMAIL || "default@test.com"}
```

### 4. Handling Animations and Timing

```yaml
# Wait for animations to complete before asserting
- waitForAnimationToEnd

# Custom timeout on assertions
- assertVisible:
    text: "Loaded"
    enabled: true

# Retry tap if screen doesn't change
- tapOn:
    id: "submit_button"
    retryTapIfNoChange: true
```

### 5. Repeat Actions

```yaml
- repeat:
    times: 3
    commands:
      - tapOn: "Next"
      - assertVisible: "Step .*"
```

## Expo EAS Integration

### Build Profile

Add to `eas.json`:

```json
{
  "build": {
    "e2e-test": {
      "withoutCredentials": true,
      "ios": { "simulator": true },
      "android": { "buildType": "apk" }
    }
  }
}
```

### EAS Workflow

```yaml
# .eas/workflows/e2e-test.yml
name: e2e-tests
on:
  pull_request:
    branches: ['*']

jobs:
  build_for_e2e:
    type: build
    params:
      platform: android
      profile: e2e-test

  maestro_test:
    needs: [build_for_e2e]
    type: maestro
    params:
      build_id: ${{ needs.build_for_e2e.outputs.build_id }}
      flow_path:
        - '.maestro/login.yaml'
        - '.maestro/home.yaml'
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoded waits (`sleep: 5000`) | Use `waitForAnimationToEnd` or `assertVisible` with timeout |
| No `clearState` on launch | Add `clearState: true` to `launchApp` for test isolation |
| Brittle text selectors | Prefer `id` selectors; use regex for dynamic text (`"Welcome.*"`) |
| Giant monolithic flows | Split into focused flows + subflows |
| Missing `hideKeyboard` | Always dismiss keyboard before tapping elements below it |
| iOS `eraseText` flakiness | Use `longPressOn` + `tapOn: 'Select All'` + `eraseText` workaround |
| Subflows in `config.yaml` flows list | Exclude with `!subflows/**` glob pattern |
| No tags | Tag flows (`smoke`, `regression`, `feature`) for selective CI runs |

## Flow Writing Checklist

- [ ] Set `appId` matching your app's bundle identifier
- [ ] Add descriptive `name` and relevant `tags`
- [ ] Start with `launchApp:` (with `clearState: true` for isolation)
- [ ] Use `id` selectors where possible, regex text selectors as fallback
- [ ] Extract repeated sequences into subflows
- [ ] Use `waitForAnimationToEnd` before assertions after navigation
- [ ] Add `hideKeyboard` after text input before tapping other elements
- [ ] Handle platform differences with conditional `runFlow`
- [ ] Use env vars for test data, with sensible defaults
- [ ] Add `takeScreenshot` at key checkpoints for debugging
