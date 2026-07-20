# Elementor Element Structure

## Template File Format

Exported `.json` template files have this top-level structure:

```json
{
  "title": "My Page Template",
  "type": "page",
  "version": "0.4",
  "page_settings": {},
  "content": [ /* array of top-level elements */ ]
}
```

### Valid `type` Values

| Type | Description |
|------|-------------|
| `page` | Standard page content |
| `header` | Theme header template |
| `footer` | Theme footer template |
| `single` | Single post/page template |
| `single-page` | Single page template |
| `single-post` | Single post template |
| `archive` | Archive listing template |
| `search-results` | Search results template |
| `error-404` | 404 error page template |
| `popup` | Popup template |
| `loop-item` | Loop grid/carousel item template |
| `product` | WooCommerce product template |
| `product-archive` | WooCommerce shop/archive template |

### `page_settings`

Optional object for page-level overrides:

```json
{
  "page_settings": {
    "background_background": "classic",
    "background_color": "#FFFFFF",
    "padding": { "top": "0", "right": "0", "bottom": "0", "left": "0", "unit": "px", "isLinked": true },
    "custom_css": ""
  }
}
```

### Database Storage

In the WordPress database, only the `content` array is stored — no wrapper object. The `_elementor_data` meta value is a JSON string of the element array:

```
wp_postmeta.meta_value = '[{"id":"abc12345","elType":"container",...}]'
```

## Element Object Structure

Every element in Elementor follows this schema:

```json
{
  "id": "3f2a1b7c",
  "elType": "container",
  "isInner": false,
  "settings": { /* type-specific settings */ },
  "elements": [ /* child elements */ ]
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique 8-character lowercase hex identifier |
| `elType` | string | Element type: `"container"`, `"widget"`, `"section"`, or `"column"` |
| `settings` | object | Configuration key-value pairs |
| `elements` | array | Child elements (empty `[]` for widgets) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `isInner` | boolean | `true` for nested containers inside another container. Default `false` for top-level containers. |
| `widgetType` | string | **Required when `elType` is `"widget"`**. The widget type identifier (e.g., `"heading"`, `"image"`, `"button"`) |

## Element Hierarchy

### Modern Layout (Containers) — Elementor 3.6+

Containers use flexbox/grid and support unlimited nesting:

```
root array
  └── container (elType: "container", isInner: false)
        ├── container (elType: "container", isInner: true)
        │     ├── widget (elType: "widget", widgetType: "heading")
        │     └── widget (elType: "widget", widgetType: "text-editor")
        └── container (elType: "container", isInner: true)
              └── widget (elType: "widget", widgetType: "image")
```

- Top-level containers have `isInner: false`
- Nested containers have `isInner: true`
- Containers can hold other containers or widgets
- No depth limit

### Legacy Layout (Sections/Columns)

Older content uses a fixed 3-level hierarchy:

```
root array
  └── section (elType: "section")
        ├── column (elType: "column")
        │     ├── widget
        │     └── widget
        └── column (elType: "column")
              └── widget
```

- Sections hold only columns
- Columns hold only widgets (or inner sections)
- Widgets cannot hold children

## Settings Value Patterns

### Simple Values

```json
{
  "title": "Hello World",
  "header_size": "h2",
  "align": "center"
}
```

### Dimension with Unit

Used for padding, margin, width, height, border-radius, etc.:

```json
{
  "padding": {
    "top": "20",
    "right": "30",
    "bottom": "20",
    "left": "30",
    "unit": "px",
    "isLinked": false
  }
}
```

When `isLinked` is `true`, all four sides use the same value (typically `top`). Valid units: `px`, `em`, `rem`, `%`, `vw`, `vh`, `custom`.

### URL Object

Used for links (buttons, images, etc.):

```json
{
  "link": {
    "url": "https://example.com",
    "is_external": "on",
    "nofollow": "",
    "custom_attributes": ""
  }
}
```

- `is_external`: `"on"` opens in new tab, `""` for same tab
- `nofollow`: `"on"` adds `rel="nofollow"`, `""` for follow

### Media Object

Used for images, videos, and other media:

```json
{
  "image": {
    "url": "https://example.com/image.jpg",
    "id": "",
    "alt": "",
    "source": "library"
  }
}
```

- `id`: WordPress attachment ID (empty string if external URL)
- `source`: `"library"` for media library, `"external"` for URL

### Color Values

Simple hex strings or CSS color values:

```json
{
  "title_color": "#FF5733",
  "background_color": "rgba(0,0,0,0.5)"
}
```

### Typography Group

Typography settings are individual keys with a shared prefix:

```json
{
  "typography_typography": "custom",
  "typography_font_family": "Roboto",
  "typography_font_size": { "size": 24, "unit": "px" },
  "typography_font_weight": "600",
  "typography_line_height": { "size": 1.5, "unit": "em" },
  "typography_letter_spacing": { "size": 0.5, "unit": "px" }
}
```

The `_typography` suffix key must be `"custom"` to enable the individual settings.

### Repeater

Used for lists of items (icon lists, social icons, tabs, accordion items, etc.):

```json
{
  "tabs": [
    {
      "_id": "a1b2c3d4",
      "tab_title": "Tab 1",
      "tab_content": "<p>Content here</p>"
    },
    {
      "_id": "e5f6a7b8",
      "tab_title": "Tab 2",
      "tab_content": "<p>More content</p>"
    }
  ]
}
```

Each repeater item has a unique `_id` (8-char hex, same format as element `id`).

### Background Settings

Background uses a prefix pattern — the type key enables the settings:

```json
{
  "background_background": "classic",
  "background_color": "#F5F5F5",
  "background_image": {
    "url": "https://example.com/bg.jpg",
    "id": ""
  },
  "background_position": "center center",
  "background_size": "cover"
}
```

`background_background` values: `"classic"` (color/image), `"gradient"`, `"video"`, `"slideshow"`, `""` (none).

### Border Settings

```json
{
  "border_border": "solid",
  "border_width": { "top": "1", "right": "1", "bottom": "1", "left": "1", "unit": "px", "isLinked": true },
  "border_color": "#DDDDDD",
  "border_radius": { "top": "8", "right": "8", "bottom": "8", "left": "8", "unit": "px", "isLinked": true }
}
```

`border_border` values: `"solid"`, `"dashed"`, `"dotted"`, `"double"`, `"groove"`, `"ridge"`, `"none"`, `""`.

## Responsive Settings

Responsive overrides use suffixes on any settings key:

| Suffix | Breakpoint |
|--------|-----------|
| *(none)* | Desktop (default) |
| `_tablet` | Tablet |
| `_mobile` | Mobile |

Example — different alignment per device:

```json
{
  "align": "center",
  "align_tablet": "left",
  "align_mobile": "left"
}
```

If a responsive suffix is absent, the device inherits from the next larger breakpoint.

## Container-Specific Settings

Key settings for container elements:

```json
{
  "flex_direction": "row",
  "flex_wrap": "wrap",
  "content_width": "boxed",
  "width": { "size": 1140, "unit": "px" },
  "min_height": { "size": 400, "unit": "px" },
  "gap": { "size": 20, "unit": "px" },
  "padding": { "top": "40", "right": "20", "bottom": "40", "left": "20", "unit": "px", "isLinked": false },
  "justify_content": "center",
  "align_items": "stretch",
  "background_background": "classic",
  "background_color": "#FFFFFF",
  "border_border": "none",
  "border_radius": { "top": "0", "right": "0", "bottom": "0", "left": "0", "unit": "px", "isLinked": true },
  "box_shadow_box_shadow_type": "",
  "overflow": "hidden"
}
```

| Setting | Values |
|---------|--------|
| `flex_direction` | `"row"`, `"column"`, `"row-reverse"`, `"column-reverse"` |
| `content_width` | `"boxed"` (max-width constrained), `"full"` (100% width) |
| `justify_content` | `"flex-start"`, `"center"`, `"flex-end"`, `"space-between"`, `"space-around"`, `"space-evenly"` |
| `align_items` | `"flex-start"`, `"center"`, `"flex-end"`, `"stretch"` |
| `overflow` | `"hidden"`, `""` (visible) |

## Complete Page Example

A realistic page with a hero section and two-column content:

```json
[
  {
    "id": "7a3b9c1d",
    "elType": "container",
    "isInner": false,
    "settings": {
      "content_width": "full",
      "min_height": { "size": 500, "unit": "px" },
      "flex_direction": "column",
      "justify_content": "center",
      "align_items": "center",
      "background_background": "classic",
      "background_color": "#1A1A2E",
      "padding": { "top": "80", "right": "20", "bottom": "80", "left": "20", "unit": "px", "isLinked": false }
    },
    "elements": [
      {
        "id": "2e4f6a8b",
        "elType": "widget",
        "widgetType": "heading",
        "settings": {
          "title": "Welcome to Our Site",
          "header_size": "h1",
          "align": "center",
          "title_color": "#FFFFFF",
          "typography_typography": "custom",
          "typography_font_size": { "size": 48, "unit": "px" },
          "typography_font_weight": "700"
        },
        "elements": []
      },
      {
        "id": "9c1d3e5f",
        "elType": "widget",
        "widgetType": "text-editor",
        "settings": {
          "editor": "<p>Discover what we have to offer. Built with care, designed for you.</p>",
          "align": "center",
          "text_color": "#CCCCCC"
        },
        "elements": []
      },
      {
        "id": "4b6d8f0a",
        "elType": "widget",
        "widgetType": "button",
        "settings": {
          "text": "Get Started",
          "link": { "url": "#services", "is_external": "", "nofollow": "" },
          "align": "center",
          "size": "lg",
          "button_type": "default",
          "background_color": "#E94560",
          "border_radius": { "top": "4", "right": "4", "bottom": "4", "left": "4", "unit": "px", "isLinked": true }
        },
        "elements": []
      }
    ]
  },
  {
    "id": "1f3a5c7e",
    "elType": "container",
    "isInner": false,
    "settings": {
      "content_width": "boxed",
      "flex_direction": "row",
      "gap": { "size": 30, "unit": "px" },
      "padding": { "top": "60", "right": "20", "bottom": "60", "left": "20", "unit": "px", "isLinked": false },
      "flex_wrap": "wrap"
    },
    "elements": [
      {
        "id": "8b0c2d4e",
        "elType": "container",
        "isInner": true,
        "settings": {
          "flex_direction": "column",
          "width": { "size": 50, "unit": "%" }
        },
        "elements": [
          {
            "id": "5e7f9a1b",
            "elType": "widget",
            "widgetType": "heading",
            "settings": {
              "title": "Our Services",
              "header_size": "h2",
              "title_color": "#333333"
            },
            "elements": []
          },
          {
            "id": "3a5c7e9f",
            "elType": "widget",
            "widgetType": "text-editor",
            "settings": {
              "editor": "<p>We provide top-quality solutions tailored to your needs. Our team of experts is ready to help you succeed.</p>"
            },
            "elements": []
          }
        ]
      },
      {
        "id": "6f0a2b4c",
        "elType": "container",
        "isInner": true,
        "settings": {
          "flex_direction": "column",
          "width": { "size": 50, "unit": "%" }
        },
        "elements": [
          {
            "id": "d1e3f5a7",
            "elType": "widget",
            "widgetType": "image",
            "settings": {
              "image": {
                "url": "https://example.com/services.jpg",
                "id": "",
                "alt": "Our services illustration",
                "source": "library"
              },
              "image_size": "full"
            },
            "elements": []
          }
        ]
      }
    ]
  }
]
```
