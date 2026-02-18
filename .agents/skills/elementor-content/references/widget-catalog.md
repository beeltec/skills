# Elementor Widget Catalog

All built-in Elementor widgets with their `widgetType` identifiers and key settings.

## Common Settings (All Widgets)

Every widget can have these settings in addition to its type-specific ones:

| Setting | Type | Description |
|---------|------|-------------|
| `_title` | string | Custom label shown in the navigator panel |
| `_margin` | dimension | Outer spacing |
| `_padding` | dimension | Inner spacing |
| `_z_index` | string | CSS z-index |
| `_css_classes` | string | Custom CSS classes (space-separated) |
| `_element_id` | string | Custom HTML id attribute |
| `hide_desktop` | string | `"hidden"` to hide on desktop |
| `hide_tablet` | string | `"hidden"` to hide on tablet |
| `hide_mobile` | string | `"hidden"` to hide on mobile |
| `_animation` | string | Entrance animation (e.g., `"fadeIn"`, `"slideInUp"`) |
| `_animation_delay` | string | Delay in ms (e.g., `"100"`) |

Dimension format: `{ "top": "10", "right": "10", "bottom": "10", "left": "10", "unit": "px", "isLinked": true }`

## Content Widgets

### `heading`

Heading text element (H1–H6).

```json
{
  "title": "Your Heading Here",
  "header_size": "h2",
  "align": "center",
  "title_color": "#333333",
  "typography_typography": "custom",
  "typography_font_family": "Poppins",
  "typography_font_size": { "size": 32, "unit": "px" },
  "typography_font_weight": "600",
  "link": { "url": "", "is_external": "", "nofollow": "" }
}
```

| Setting | Values |
|---------|--------|
| `header_size` | `"h1"`, `"h2"`, `"h3"`, `"h4"`, `"h5"`, `"h6"` |
| `align` | `"left"`, `"center"`, `"right"`, `"justify"` |

### `text-editor`

Rich text / WYSIWYG content block. Content is stored as HTML.

```json
{
  "editor": "<p>Your HTML content here. Supports <strong>bold</strong>, <em>italic</em>, <a href=\"#\">links</a>, and all standard HTML.</p>",
  "align": "left",
  "text_color": "#666666",
  "typography_typography": "custom",
  "typography_font_size": { "size": 16, "unit": "px" }
}
```

### `image`

Single image display.

```json
{
  "image": {
    "url": "https://example.com/photo.jpg",
    "id": "123",
    "alt": "Description of image",
    "source": "library"
  },
  "image_size": "full",
  "align": "center",
  "caption_source": "custom",
  "caption": "Optional caption text",
  "link_to": "none",
  "link": { "url": "", "is_external": "", "nofollow": "" },
  "width": { "size": 100, "unit": "%" },
  "hover_animation": "grow"
}
```

| Setting | Values |
|---------|--------|
| `image_size` | `"full"`, `"large"`, `"medium"`, `"thumbnail"`, or custom `"NxN"` |
| `link_to` | `"none"`, `"file"`, `"custom"` |
| `hover_animation` | `""`, `"grow"`, `"shrink"`, `"pulse"`, `"push"`, `"bounce-in"`, `"float"` |

### `video`

Embedded video player.

```json
{
  "video_type": "youtube",
  "youtube_url": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "vimeo_url": "",
  "dailymotion_url": "",
  "hosted_url": { "url": "", "id": "" },
  "autoplay": "yes",
  "mute": "yes",
  "loop": "yes",
  "controls": "yes",
  "aspect_ratio": "169",
  "image_overlay": { "url": "", "id": "" },
  "show_image_overlay": ""
}
```

| Setting | Values |
|---------|--------|
| `video_type` | `"youtube"`, `"vimeo"`, `"dailymotion"`, `"hosted"` |
| `aspect_ratio` | `"169"` (16:9), `"219"` (21:9), `"43"` (4:3), `"32"` (3:2), `"11"` (1:1), `"916"` (9:16) |

### `button`

Call-to-action button.

```json
{
  "text": "Click Me",
  "link": { "url": "https://example.com", "is_external": "on", "nofollow": "" },
  "align": "center",
  "size": "md",
  "button_type": "default",
  "icon": { "value": "fas fa-arrow-right", "library": "fa-solid" },
  "icon_align": "right",
  "icon_indent": { "size": 8, "unit": "px" },
  "button_text_color": "#FFFFFF",
  "background_color": "#0073AA",
  "border_border": "none",
  "border_radius": { "top": "4", "right": "4", "bottom": "4", "left": "4", "unit": "px", "isLinked": true },
  "text_padding": { "top": "12", "right": "24", "bottom": "12", "left": "24", "unit": "px", "isLinked": false },
  "hover_color": "#FFFFFF",
  "button_background_hover_color": "#005A87",
  "hover_animation": ""
}
```

| Setting | Values |
|---------|--------|
| `size` | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `button_type` | `"default"`, `"info"`, `"success"`, `"warning"`, `"danger"` |
| `icon_align` | `"left"`, `"right"` |

### `divider`

Horizontal rule / separator.

```json
{
  "style": "solid",
  "weight": { "size": 2, "unit": "px" },
  "width": { "size": 100, "unit": "%" },
  "align": "center",
  "gap": { "size": 15, "unit": "px" },
  "color": "#DDDDDD",
  "look": "line",
  "text": "",
  "icon": { "value": "", "library": "" }
}
```

| Setting | Values |
|---------|--------|
| `style` | `"solid"`, `"double"`, `"dotted"`, `"dashed"` |
| `look` | `"line"`, `"line_text"`, `"line_icon"` |

### `spacer`

Vertical whitespace.

```json
{
  "space": { "size": 50, "unit": "px" }
}
```

### `read-more`

"Read More" link for post excerpts.

```json
{
  "link_text": "Read More \u00bb"
}
```

## Image & Gallery Widgets

### `image-box`

Image with heading and description below/beside it.

```json
{
  "image": { "url": "https://example.com/icon.png", "id": "" },
  "image_size": "thumbnail",
  "title_text": "Feature Title",
  "description_text": "Short description of the feature.",
  "link": { "url": "", "is_external": "", "nofollow": "" },
  "position": "top"
}
```

| Setting | Values |
|---------|--------|
| `position` | `"top"`, `"left"`, `"right"` |

### `image-carousel`

Sliding image carousel.

```json
{
  "carousel": [
    { "_id": "a1b2c3d4", "url": "https://example.com/slide1.jpg", "id": "" },
    { "_id": "e5f6a7b8", "url": "https://example.com/slide2.jpg", "id": "" }
  ],
  "image_size": "full",
  "slides_to_show": "3",
  "slides_to_scroll": "1",
  "navigation": "both",
  "autoplay": "yes",
  "autoplay_speed": 5000,
  "infinite": "yes",
  "pause_on_hover": "yes",
  "link_to": "none",
  "caption_type": ""
}
```

| Setting | Values |
|---------|--------|
| `navigation` | `"both"`, `"arrows"`, `"dots"`, `"none"` |
| `link_to` | `"none"`, `"file"`, `"custom"` |

### `image-gallery`

Grid/masonry image gallery.

```json
{
  "gallery": [
    { "_id": "a1b2c3d4", "url": "https://example.com/img1.jpg", "id": "" },
    { "_id": "e5f6a7b8", "url": "https://example.com/img2.jpg", "id": "" }
  ],
  "image_size": "medium",
  "gallery_columns": 3,
  "gallery_link": "file",
  "gallery_rand": ""
}
```

| Setting | Values |
|---------|--------|
| `gallery_link` | `"file"`, `"none"` |
| `gallery_rand` | `""` (ordered), `"rand"` (randomized) |

## Icon Widgets

### Icon Object Format

Icons are used across many widgets:

```json
{
  "value": "fas fa-home",
  "library": "fa-solid"
}
```

| Library | Prefix | Example |
|---------|--------|---------|
| `fa-solid` | `fas fa-` | `"fas fa-check"` |
| `fa-regular` | `far fa-` | `"far fa-heart"` |
| `fa-brands` | `fab fa-` | `"fab fa-twitter"` |
| `svg` | (custom) | SVG upload |

### `icon`

Standalone icon display.

```json
{
  "selected_icon": { "value": "fas fa-star", "library": "fa-solid" },
  "view": "default",
  "shape": "circle",
  "align": "center",
  "link": { "url": "", "is_external": "", "nofollow": "" },
  "primary_color": "#0073AA",
  "size": { "size": 50, "unit": "px" }
}
```

| Setting | Values |
|---------|--------|
| `view` | `"default"` (icon only), `"stacked"` (filled bg), `"framed"` (border) |
| `shape` | `"circle"`, `"square"` |

### `icon-box`

Icon with heading and description.

```json
{
  "selected_icon": { "value": "fas fa-cog", "library": "fa-solid" },
  "title_text": "Feature Name",
  "description_text": "Feature description here.",
  "link": { "url": "", "is_external": "", "nofollow": "" },
  "position": "top",
  "title_size": "h3",
  "view": "default"
}
```

### `icon-list`

Vertical list with icons per item.

```json
{
  "icon_list": [
    {
      "_id": "a1b2c3d4",
      "text": "List item one",
      "selected_icon": { "value": "fas fa-check", "library": "fa-solid" },
      "link": { "url": "", "is_external": "", "nofollow": "" }
    },
    {
      "_id": "e5f6a7b8",
      "text": "List item two",
      "selected_icon": { "value": "fas fa-check", "library": "fa-solid" },
      "link": { "url": "", "is_external": "", "nofollow": "" }
    }
  ],
  "space_between": { "size": 10, "unit": "px" },
  "icon_color": "#0073AA",
  "icon_size": { "size": 14, "unit": "px" },
  "text_indent": { "size": 8, "unit": "px" }
}
```

### `social-icons`

Row of social media icon links.

```json
{
  "social_icon_list": [
    {
      "_id": "a1b2c3d4",
      "social_icon": { "value": "fab fa-facebook", "library": "fa-brands" },
      "link": { "url": "https://facebook.com/example", "is_external": "on", "nofollow": "" }
    },
    {
      "_id": "e5f6a7b8",
      "social_icon": { "value": "fab fa-twitter", "library": "fa-brands" },
      "link": { "url": "https://twitter.com/example", "is_external": "on", "nofollow": "" }
    }
  ],
  "shape": "rounded",
  "align": "center",
  "columns": 0,
  "icon_color": "custom",
  "icon_primary_color": "#FFFFFF",
  "icon_secondary_color": "#333333"
}
```

| Setting | Values |
|---------|--------|
| `shape` | `"rounded"`, `"square"`, `"circle"` |

### `star-rating`

Star rating display.

```json
{
  "rating_scale": 5,
  "rating": 4.5,
  "star_style": "star_fontawesome",
  "title": "Excellent Service",
  "align": "center",
  "icon_size": { "size": 20, "unit": "px" },
  "icon_color": "#FFC107",
  "icon_unmarked_color": "#CCCCCC"
}
```

## Interactive Widgets

### `counter`

Animated number counter.

```json
{
  "starting_number": 0,
  "ending_number": 250,
  "prefix": "$",
  "suffix": "K+",
  "duration": 2000,
  "thousand_separator": "yes",
  "thousand_separator_char": ",",
  "title": "Revenue Generated",
  "align": "center",
  "number_color": "#0073AA",
  "title_color": "#333333"
}
```

### `progress`

Progress bar with percentage.

```json
{
  "title": "Web Development",
  "progress_type": "",
  "percent": { "size": 85, "unit": "%" },
  "display_percentage": "show",
  "inner_text": "",
  "bar_color": "#0073AA",
  "bar_bg_color": "#EEEEEE",
  "title_color": "#333333"
}
```

### `testimonial`

Customer testimonial quote.

```json
{
  "testimonial_content": "This product completely transformed our workflow. Highly recommended!",
  "testimonial_image": { "url": "https://example.com/avatar.jpg", "id": "" },
  "testimonial_name": "Jane Smith",
  "testimonial_job": "CEO, Example Corp",
  "testimonial_image_position": "aside",
  "alignment": "center",
  "content_content_color": "#666666",
  "name_text_color": "#333333"
}
```

| Setting | Values |
|---------|--------|
| `testimonial_image_position` | `"aside"`, `"top"` |

### `alert`

Dismissible alert/notice box.

```json
{
  "alert_type": "info",
  "alert_title": "Notice",
  "alert_description": "This is an informational message.",
  "show_dismiss": "show",
  "dismiss_icon": { "value": "fas fa-times", "library": "fa-solid" }
}
```

| Setting | Values |
|---------|--------|
| `alert_type` | `"info"`, `"success"`, `"warning"`, `"danger"` |
| `show_dismiss` | `"show"`, `"hide"` |

## Tab & Accordion Widgets

### `tabs`

Horizontal tabbed content.

```json
{
  "tabs": [
    { "_id": "a1b2c3d4", "tab_title": "Tab 1", "tab_content": "<p>Content for first tab.</p>" },
    { "_id": "e5f6a7b8", "tab_title": "Tab 2", "tab_content": "<p>Content for second tab.</p>" }
  ],
  "type": "horizontal",
  "border_width": { "top": "1", "right": "1", "bottom": "1", "left": "1", "unit": "px", "isLinked": true },
  "border_color": "#DDDDDD",
  "tab_text_color": "#333333",
  "tab_active_color": "#0073AA"
}
```

| Setting | Values |
|---------|--------|
| `type` | `"horizontal"`, `"vertical"` |

### `accordion`

Collapsible accordion (one open at a time).

```json
{
  "tabs": [
    { "_id": "a1b2c3d4", "tab_title": "Question 1?", "tab_content": "<p>Answer to question 1.</p>" },
    { "_id": "e5f6a7b8", "tab_title": "Question 2?", "tab_content": "<p>Answer to question 2.</p>" }
  ],
  "selected_icon": { "value": "fas fa-plus", "library": "fa-solid" },
  "selected_active_icon": { "value": "fas fa-minus", "library": "fa-solid" },
  "title_color": "#333333",
  "title_background": "#F5F5F5",
  "title_active_color": "#0073AA",
  "content_color": "#666666"
}
```

### `toggle`

Toggle panels (multiple can be open simultaneously). Same settings structure as `accordion`.

```json
{
  "tabs": [
    { "_id": "a1b2c3d4", "tab_title": "Toggle Section 1", "tab_content": "<p>Toggle content here.</p>" },
    { "_id": "e5f6a7b8", "tab_title": "Toggle Section 2", "tab_content": "<p>More toggle content.</p>" }
  ],
  "selected_icon": { "value": "fas fa-caret-right", "library": "fa-solid" },
  "selected_active_icon": { "value": "fas fa-caret-down", "library": "fa-solid" }
}
```

## Embed & Code Widgets

### `html`

Custom HTML block.

```json
{
  "html": "<div class=\"custom-widget\">\n  <p>Raw HTML content here</p>\n</div>"
}
```

### `shortcode`

WordPress shortcode execution.

```json
{
  "shortcode": "[contact-form-7 id=\"123\" title=\"Contact Form\"]"
}
```

### `google_maps`

Embedded Google Map.

```json
{
  "address": "1600 Amphitheatre Parkway, Mountain View, CA",
  "zoom": { "size": 14, "unit": "px" },
  "height": { "size": 400, "unit": "px" }
}
```

Note: `widgetType` is `"google_maps"` (underscore, not hyphen).

### `menu-anchor`

Invisible anchor point for one-page navigation.

```json
{
  "anchor": "services",
  "anchor_description": ""
}
```

Use with links like `#services` to scroll to this point.

### `sidebar`

Displays a WordPress widget area/sidebar.

```json
{
  "sidebar": "sidebar-1"
}
```

The value is the registered sidebar ID from the theme.

### `audio`

Audio player.

```json
{
  "audio_type": "hosted",
  "hosted_url": { "url": "https://example.com/audio.mp3", "id": "" },
  "external_url": { "url": "" },
  "autoplay": "",
  "loop": ""
}
```

| Setting | Values |
|---------|--------|
| `audio_type` | `"hosted"`, `"external"` |

## Other Widgets

### `rating`

Interactive star rating display (distinct from `star-rating` — this is the newer Pro-like variant available in free Elementor).

```json
{
  "rating_scale": 5,
  "rating_value": 4,
  "star_style": "star_fontawesome",
  "title": "Rating Title",
  "alignment": "center"
}
```

## Repeater Item Format

Many widgets use repeater arrays. Each item follows this pattern:

```json
{
  "_id": "a1b2c3d4",
  "field_name": "value",
  "another_field": "value"
}
```

- `_id` is required — unique 8-char hex string
- Field names are widget-specific
- Items are rendered in array order
