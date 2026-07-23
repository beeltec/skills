---
name: maestro-e2e-testing
description: Write, run, and debug Maestro E2E tests for mobile apps. Use for end-to-end testing, UI automation, test flows, smoke or regression tests, Maestro project setup, or Expo EAS Workflow integration.
---

# Maestro E2E Testing

Maestro is a YAML-based UI testing framework for mobile (iOS/Android) and web with built-in tolerance for flakiness. Tests are declarative flow files describing user journeys.

## Setup

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
maestro --version
```

Prerequisites: Java 11+, iOS Simulator (Xcode) or Android Emulator (Android SDK).

Layout: feature flows in `.maestro/*.yaml`, reusable subflows in `.maestro/subflows/`, optional workspace config in `.maestro/config.yaml`:

```yaml
flows:
  - "*.yaml"
  - "!subflows/**"        # exclude subflows from direct execution
executionOrder:
  continueOnFailure: false
  flowsOrder: [login.yaml, home.yaml]
```

## Flow Anatomy

Header above `---`, commands below:

```yaml
appId: com.example.app          # required: bundle ID / package name
name: Login Flow
tags: [smoke, auth]
env:
  EMAIL: ${EMAIL || "test@example.com"}
onFlowStart:
  - runFlow: subflows/setup.yaml
onFlowComplete:
  - takeScreenshot: final-state
---
- launchApp:
    clearState: true            # test isolation
- tapOn: "Sign In"
- inputText: ${EMAIL}
- assertVisible: "Dashboard"
```

Core commands: `launchApp`, `tapOn` (text or `id:`), `inputText`, `eraseText`, `hideKeyboard`, `assertVisible`/`assertNotVisible`, `scrollUntilVisible`, `swipe`, `back`, `waitForAnimationToEnd`, `takeScreenshot`, `runFlow`, `runScript`, `repeat`. Full reference: [commands.md](commands.md) and [selectors.md](selectors.md).

## Running

```bash
maestro test .maestro/login.yaml            # one flow
maestro test .maestro/                      # all flows
maestro test --include-tags=smoke .maestro/ # by tag
maestro studio                              # visual builder
```

## Patterns

**Subflows** — extract shared sequences and pass env:

```yaml
- runFlow:
    file: subflows/login.yaml
    env:
      EMAIL: ${EMAIL}
      PASSWORD: ${PASSWORD}
```

**Platform-specific steps:**

```yaml
- runFlow:
    when:
      true: ${maestro.platform == 'ios'}
    file: ios-specific.yaml
```

**Env vars** — pass at runtime (`EMAIL=a@b.com maestro test ...`) or default in the header with `${EMAIL || "default"}`.

**Timing** — use `waitForAnimationToEnd` before asserting after navigation, and `retryTapIfNoChange: true` on flaky taps. Never hardcode sleeps.

## Expo EAS Integration

`eas.json` build profile:

```json
{ "build": { "e2e-test": {
  "withoutCredentials": true,
  "ios": { "simulator": true },
  "android": { "buildType": "apk" } } } }
```

`.eas/workflows/e2e-test.yml`:

```yaml
name: e2e-tests
on:
  pull_request:
    branches: ['*']
jobs:
  build_for_e2e:
    type: build
    params: { platform: android, profile: e2e-test }
  maestro_test:
    needs: [build_for_e2e]
    type: maestro
    params:
      build_id: ${{ needs.build_for_e2e.outputs.build_id }}
      flow_path: ['.maestro/login.yaml', '.maestro/home.yaml']
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoded waits | `waitForAnimationToEnd` or assertion timeouts |
| No `clearState` on launch | Add it for test isolation |
| Brittle text selectors | Prefer `id`; regex for dynamic text (`"Welcome.*"`) |
| Monolithic flows | Split into focused flows + subflows |
| Missing `hideKeyboard` | Dismiss keyboard before tapping elements below it |
| iOS `eraseText` flakiness | `longPressOn` + `tapOn: 'Select All'` + `eraseText` |
| Subflows run directly | Exclude with `!subflows/**` in config |
| No tags | Tag flows (`smoke`, `regression`) for selective CI runs |

## Flow Checklist

- [ ] `appId` matches the bundle identifier; descriptive `name` and `tags`
- [ ] Starts with `launchApp:` + `clearState: true`
- [ ] `id` selectors preferred; regex text as fallback
- [ ] Repeated sequences extracted into subflows
- [ ] `waitForAnimationToEnd` before post-navigation assertions
- [ ] `hideKeyboard` after text input
- [ ] Platform differences via conditional `runFlow`
- [ ] Test data via env vars with defaults
- [ ] `takeScreenshot` at key checkpoints
