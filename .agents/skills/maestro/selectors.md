# Maestro Selectors Reference

Selectors identify UI elements for commands like `tapOn`, `assertVisible`, `longPressOn`, etc. All text/id fields support regular expressions.

## Basic Selectors

```yaml
- tapOn:
    text: "Button Text"       # Match by visible text or accessibility text (regex)
    id: "button_id"           # Match by accessibility identifier (regex)
    index: 0                  # 0-based index among matching elements
    point: 50%, 50%           # Relative screen position (percentage)
    point: 200, 400           # Absolute screen coordinates (pixels)
    width: 100                # Match by element width
    height: 50                # Match by element height
    tolerance: 10             # Width/height matching tolerance
```

## State Selectors

```yaml
- tapOn:
    enabled: true             # Element must be enabled/disabled
    checked: true             # Element must be checked/unchecked
    focused: true             # Element must be focused/unfocused
    selected: true            # Element must be selected/unselected
```

## Relative Position Selectors

Find elements based on spatial relationship to other elements:

```yaml
- tapOn:
    below: "Header Text"              # Element is below "Header Text"
    above:
      id: footer_id                   # Element is above element with id
    leftOf: "Right Label"             # Element is left of "Right Label"
    rightOf: "Left Label"             # Element is right of "Left Label"
```

## Hierarchy Selectors

Find elements based on parent/child relationships:

```yaml
- tapOn:
    containsChild: "Child Text"       # Direct child has this text
    childOf:
      id: parent_container            # Element is child of this parent
    containsDescendants:              # Must contain ALL listed descendants
      - id: title_id
        text: "Title Text"
      - "Another descendant text"
```

## Trait Selectors

High-level element characteristics:

```yaml
- tapOn:
    traits: text              # Element contains text
- tapOn:
    traits: long-text         # Element contains 200+ characters
- tapOn:
    traits: square            # Width/height differ by < 3%
```

## Optional & Retry

```yaml
# Optional: don't fail if element not found
- tapOn:
    text: "Dismiss"
    optional: true            # Flow continues if element missing

# Wait for visibility before interacting
- tapOn:
    text: "Loading Complete"
    waitUntilVisible: true
```

## Selector Priority

When multiple selectors match, use this priority:

1. **`id`** - Most stable, survives text changes and i18n
2. **`text` with regex** - Good fallback, flexible matching
3. **Relative selectors** - When elements lack unique id/text
4. **`point`** - Last resort, fragile across screen sizes
5. **`index`** - Avoid if possible, breaks when list order changes

## Platform-Specific IDs

| Platform | Where to find IDs |
|----------|------------------|
| **iOS** | `accessibilityIdentifier` in Swift/ObjC, `testID` in React Native |
| **Android** | `android:contentDescription`, `testID` in React Native |
| **React Native** | `testID` prop maps to both platforms |

## Regex Examples

```yaml
# Match any text starting with "Welcome"
- assertVisible: "Welcome.*"

# Match button with ID containing "submit"
- tapOn:
    id: ".*submit.*"

# Match exact text (anchor with ^ and $)
- assertVisible: "^Exactly This$"

# Match either "Save" or "Submit"
- tapOn: "(Save|Submit)"

# Case-insensitive is NOT supported - match both cases explicitly
- tapOn: "(Login|login)"
```
