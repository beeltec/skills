# Elementor Widget Catalog

Built-in Elementor widgets with their `widgetType` identifiers and key settings. Settings shown are examples, not a stable schema — inspect same-site JSON when exact keys matter.

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

## Icon Object Format

Icons are used across many widgets:

```json
{ "value": "fas fa-home", "library": "fa-solid" }
```

Libraries: `fa-solid` (`fas fa-`), `fa-regular` (`far fa-`), `fa-brands` (`fab fa-`), `svg` (custom upload).

## Repeater Item Format

Many widgets use repeater arrays. Each item is `{ "_id": "a1b2c3d4", "field_name": "value", ... }`:

- `_id` is required and unique within its repeater; preserve the site's observed ID format
- Field names are widget-specific
- Items are rendered in array order

## Representative Examples

### `heading`

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

`header_size`: `"h1"`–`"h6"`; `align`: `"left"`, `"center"`, `"right"`, `"justify"`.

### `text-editor`

Rich text block; content is stored as HTML.

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

`image_size`: `"full"`, `"large"`, `"medium"`, `"thumbnail"`, or custom `"NxN"`; `link_to`: `"none"`, `"file"`, `"custom"`; `hover_animation`: `""`, `"grow"`, `"shrink"`, `"pulse"`, `"push"`, `"bounce-in"`, `"float"`.

### `button`

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

`size`: `"xs"`–`"xl"`; `button_type`: `"default"`, `"info"`, `"success"`, `"warning"`, `"danger"`; `icon_align`: `"left"`, `"right"`.

### `icon-list` (repeater example)

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

### `tabs` (tabbed-content example)

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

`type`: `"horizontal"`, `"vertical"`.

## All Other Widgets

| `widgetType` | Key settings | Notes / value enums |
|---|---|---|
| `video` | `video_type`, `youtube_url`/`vimeo_url`/`dailymotion_url`/`hosted_url`, `autoplay`, `mute`, `loop`, `controls`, `aspect_ratio`, `image_overlay`, `show_image_overlay` | `video_type`: `"youtube"`, `"vimeo"`, `"dailymotion"`, `"hosted"`; `aspect_ratio`: `"169"`, `"219"`, `"43"`, `"32"`, `"11"`, `"916"` |
| `divider` | `style`, `weight`, `width`, `align`, `gap`, `color`, `look`, `text`, `icon` | `style`: `"solid"`, `"double"`, `"dotted"`, `"dashed"`; `look`: `"line"`, `"line_text"`, `"line_icon"` |
| `spacer` | `space` | size object, e.g. `{ "size": 50, "unit": "px" }` |
| `read-more` | `link_text` | |
| `image-box` | `image`, `image_size`, `title_text`, `description_text`, `link`, `position` | `position`: `"top"`, `"left"`, `"right"` |
| `image-carousel` | `carousel` (repeater of images), `image_size`, `slides_to_show`, `slides_to_scroll`, `navigation`, `autoplay`, `autoplay_speed`, `infinite`, `pause_on_hover`, `link_to`, `caption_type` | `navigation`: `"both"`, `"arrows"`, `"dots"`, `"none"` |
| `image-gallery` | `gallery` (repeater of images), `image_size`, `gallery_columns`, `gallery_link`, `gallery_rand` | `gallery_link`: `"file"`, `"none"`; `gallery_rand`: `""`, `"rand"` |
| `icon` | `selected_icon`, `view`, `shape`, `align`, `link`, `primary_color`, `size` | `view`: `"default"`, `"stacked"`, `"framed"`; `shape`: `"circle"`, `"square"` |
| `icon-box` | `selected_icon`, `title_text`, `description_text`, `link`, `position`, `title_size`, `view` | |
| `social-icons` | `social_icon_list` (repeater: `social_icon`, `link`), `shape`, `align`, `columns`, `icon_color`, `icon_primary_color`, `icon_secondary_color` | `shape`: `"rounded"`, `"square"`, `"circle"` |
| `star-rating` | `rating_scale`, `rating`, `star_style`, `title`, `align`, `icon_size`, `icon_color`, `icon_unmarked_color` | |
| `rating` | `rating_scale`, `rating_value`, `star_style`, `title`, `alignment` | newer variant, distinct from `star-rating` |
| `counter` | `starting_number`, `ending_number`, `prefix`, `suffix`, `duration`, `thousand_separator`, `thousand_separator_char`, `title`, `align`, `number_color`, `title_color` | |
| `progress` | `title`, `progress_type`, `percent`, `display_percentage`, `inner_text`, `bar_color`, `bar_bg_color`, `title_color` | `display_percentage`: `"show"`, `"hide"` |
| `testimonial` | `testimonial_content`, `testimonial_image`, `testimonial_name`, `testimonial_job`, `testimonial_image_position`, `alignment` | `testimonial_image_position`: `"aside"`, `"top"` |
| `alert` | `alert_type`, `alert_title`, `alert_description`, `show_dismiss`, `dismiss_icon` | `alert_type`: `"info"`, `"success"`, `"warning"`, `"danger"`; `show_dismiss`: `"show"`, `"hide"` |
| `accordion` | `tabs` (repeater: `tab_title`, `tab_content`), `selected_icon`, `selected_active_icon`, title/content colors | one panel open at a time |
| `toggle` | same structure as `accordion` | multiple panels can be open |
| `html` | `html` | raw HTML string |
| `shortcode` | `shortcode` | e.g. `"[contact-form-7 id=\"123\"]"` |
| `google_maps` | `address`, `zoom`, `height` | `widgetType` uses underscore, not hyphen |
| `menu-anchor` | `anchor`, `anchor_description` | link with `#<anchor>` to scroll to it |
| `sidebar` | `sidebar` | registered sidebar ID from the theme |
| `audio` | `audio_type`, `hosted_url`, `external_url`, `autoplay`, `loop` | `audio_type`: `"hosted"`, `"external"` |
