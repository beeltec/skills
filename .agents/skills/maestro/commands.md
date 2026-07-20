# Maestro Commands Reference

Complete reference for all Maestro YAML commands.

## App Lifecycle

```yaml
# Launch app (with optional state clearing)
- launchApp
- launchApp:
    clearState: true           # Clear app data before launch
    clearKeychain: true        # Clear keychain (iOS)
    stopApp: false             # Don't stop app if already running
    permissions:               # Grant permissions on launch
      notifications: allow
      location: allow
      camera: allow

# Stop/kill app
- stopApp
- stopApp: "com.other.app"    # Stop a different app
- killApp                     # Force kill

# Clear state without launching
- clearState
- clearKeychain
```

## Tap & Press

```yaml
# Tap by text (shorthand)
- tapOn: "Button Text"

# Tap by selector
- tapOn:
    id: "button_id"            # Accessibility ID (regex)
    text: "Button"             # Text content (regex)
    index: 0                   # 0-based index among matches
    point: 50%, 50%            # Relative screen position
    retryTapIfNoChange: true   # Retry if screen unchanged
    waitToSettleTimeoutMs: 500 # Wait for animations

# Repeated taps
- tapOn:
    text: "+"
    repeat: 5
    delay: 200                 # ms between taps (default 100)

# Long press
- longPressOn: "Element"
- longPressOn:
    id: "element_id"
    duration: 2000             # ms (default varies)

# Double tap
- doubleTapOn: "Element"
```

## Text Input

```yaml
# Input text (types into focused element)
- inputText: "Hello World"

# Input random text/numbers/email/name
- inputRandomText
- inputRandomNumber
- inputRandomEmail
- inputRandomPersonName

# Erase text from focused element
- eraseText
- eraseText:
    charactersToErase: 5

# iOS eraseText workaround (more reliable)
# - longPressOn: "<input id>"
# - tapOn: 'Select All'
# - eraseText

# Copy text from element
- copyTextFrom:
    id: "text_field"
# Use copied text: ${maestro.copiedText}

# Paste text
- pasteText
```

## Assertions

```yaml
# Assert element is visible
- assertVisible: "Welcome"
- assertVisible:
    text: "Hello.*"            # Regex match
    id: "welcome_text"
    enabled: true              # Must be enabled

# Assert element is NOT visible
- assertNotVisible: "Error"
- assertNotVisible:
    id: "error_banner"

# Assert with timeout (element may appear after delay)
- assertVisible:
    text: "Loaded"
    # Maestro waits up to default timeout for visibility
```

## Navigation & Scrolling

```yaml
# Go back
- back

# Scroll
- scroll                      # Scroll down on default element
- scrollUntilVisible:
    element: "Target Element"  # Element to find
    direction: DOWN            # UP, DOWN, LEFT, RIGHT
    timeout: 10000             # ms to keep scrolling
    speed: 40                  # Scroll speed (0-100)
    visibilityPercentage: 100  # How visible element must be

# Swipe
- swipe:
    direction: LEFT            # UP, DOWN, LEFT, RIGHT
    duration: 400              # ms
- swipe:
    start: 90%, 50%            # From point
    end: 10%, 50%              # To point
```

## Waiting & Timing

```yaml
# Wait for animations to settle
- waitForAnimationToEnd
- waitForAnimationToEnd:
    timeout: 5000              # Max wait in ms

# Explicit wait (avoid when possible - prefer assertions)
- wait:
    seconds: 2
```

## Flow Control

```yaml
# Run subflow
- runFlow: path/to/flow.yaml
- runFlow:
    file: path/to/flow.yaml
    env:
      VAR: "value"

# Run inline commands as subflow
- runFlow:
    commands:
      - tapOn: "OK"
      - assertVisible: "Done"

# Conditional execution
- runFlow:
    when:
      visible: "Login Button"
    file: login.yaml

- runFlow:
    when:
      notVisible: "Dashboard"
    file: auth-flow.yaml

- runFlow:
    when:
      true: ${maestro.platform == 'ios'}
    file: ios-only.yaml

# Repeat commands
- repeat:
    times: 3
    commands:
      - tapOn: "Next"

# Repeat while element visible
- repeat:
    whileVisible: "Loading..."
    maxPasses: 10
    commands:
      - wait:
          seconds: 1

# Repeat while element is true (JS condition)
- repeat:
    whileTrue: ${counter < 5}
    commands:
      - evalScript: ${counter = (counter || 0) + 1}
      - tapOn: "Next"
```

## JavaScript Integration

```yaml
# Run inline JavaScript
- evalScript: ${output.myVar = 'hello'}

# Run external script
- runScript: scripts/setup.js
- runScript:
    file: scripts/compute.js
    env:
      INPUT: "data"
    condition:
      visible: "Ready"

# Use JS output in later commands
- inputText: ${output.myVar}
```

## Screenshots & Media

```yaml
# Take screenshot
- takeScreenshot: "descriptive-name"

# Start/stop video recording
- startRecording: "test-recording"
- stopRecording

# Add media to device (photos/videos)
- addMedia:
    - path/to/image.png
    - path/to/video.mp4
```

## Device Interactions

```yaml
# Press hardware keys
- pressKey: Home
- pressKey: Back                # Android
- pressKey: Volume Up
- pressKey: Volume Down
- pressKey: Lock

# Hide keyboard
- hideKeyboard

# Set device location
- setLocation:
    latitude: 47.3769
    longitude: 8.5417

# Open deep link / URL
- openLink: "myapp://screen/detail?id=123"
- openLink: "https://example.com"

# Toggle airplane mode (Android only)
- toggleAirplaneMode
```

## Notifications & Permissions

```yaml
# Permissions are set in launchApp config
- launchApp:
    permissions:
      notifications: allow     # allow | deny | unset
      location: allow
      camera: allow
      photos: allow
      contacts: allow
      microphone: allow
```

## Variables & Data

```yaml
# Environment variables (in header)
env:
  USERNAME: ${USERNAME || "default"}
  API_URL: "https://api.test.com"

# Use in commands
- inputText: ${USERNAME}
- openLink: ${API_URL}/login

# Built-in variables
# ${maestro.platform}     - "ios" or "android"
# ${maestro.copiedText}   - Last copied text
```
