# Theme Builder Templates (Elementor Pro)

Elementor Pro's Theme Builder lets you create templates for headers, footers, single posts, archives, etc. Creating these programmatically (via migration or WP-CLI) requires several meta keys, taxonomy terms, and a **conditions cache** that are not obvious from the Elementor UI.

## Template Types

| `_elementor_template_type` | `elementor_library_type` taxonomy | Location | Description |
|---|---|---|---|
| `header` | `header` | `header` | Site header |
| `footer` | `footer` | `footer` | Site footer |
| `single-post` | `single-post` | `single` | Single post/CPT page |
| `single-page` | `single-page` | `single` | Single page |
| `archive` | `archive` | `archive` | Archive listing |
| `search-results` | `search-results` | `archive` | Search results page |
| `error-404` | `error-404` | `single` | 404 error page |
| `loop-item` | `loop-item` | *(n/a)* | Loop Grid/Carousel item |

**IMPORTANT:** `_elementor_template_type` values differ from location names. A single-post template uses type `single-post` but location `single`. Using just `single` as the type will **not** work.

## Required Meta and Settings

Creating a Theme Builder template requires ALL of the following:

### 1. Post Creation

```php
$template_id = wp_insert_post( array(
    'post_type'   => 'elementor_library',
    'post_title'  => 'My Single Template',
    'post_status' => 'publish',
) );
```

### 2. Post Meta

```php
// Enable Elementor editor
update_post_meta( $template_id, '_elementor_edit_mode', 'builder' );

// Template type — MUST match the taxonomy term (see table above)
update_post_meta( $template_id, '_elementor_template_type', 'single-post' );

// Display conditions (post meta) — necessary but NOT sufficient alone
update_post_meta( $template_id, '_elementor_conditions', array( 'include/singular/my_cpt' ) );

// Page template — use 'default' for theme builder templates
update_post_meta( $template_id, '_wp_page_template', 'default' );

// Version meta — Elementor expects these
update_post_meta( $template_id, '_elementor_version', '3.33.2' );
update_post_meta( $template_id, '_elementor_pro_version', '3.34.0' );
```

### 3. Taxonomy Term

```php
wp_set_object_terms( $template_id, 'single-post', 'elementor_library_type' );
```

Without this, Elementor's template library won't categorise the template correctly and the Theme Builder UI won't show it in the right section.

### 4. Conditions Cache (Critical)

Elementor Pro stores an **options-level cache** of all template conditions. Setting `_elementor_conditions` post meta alone is NOT enough — you must also register the template in this option:

```php
$conditions = get_option( 'elementor_pro_theme_builder_conditions', array() );

// Key = location ('header', 'footer', 'single', 'archive')
if ( ! isset( $conditions['single'] ) ) {
    $conditions['single'] = array();
}

// Sub-key = template post ID, value = array of condition strings
$conditions['single'][ $template_id ] = array( 'include/singular/my_cpt' );

update_option( 'elementor_pro_theme_builder_conditions', $conditions );
```

**If you skip this step, the template will exist in the database but Elementor will never apply it to any page.**

### 5. Page Settings

```php
$settings = array(
    'content_wrapper_html_tag' => 'article',      // Wraps template output
    'preview_type'             => 'single/my_cpt', // For Elementor editor preview
    'preview_id'               => '123',           // Post ID to preview with
);
update_post_meta( $template_id, '_elementor_page_settings', $settings );
```

### 6. Elementor Content

Set `_elementor_data` as usual (see `wp-cli-operations.md`). For single templates, include a `theme-post-content` widget to render the post's own Elementor content.

## Display Conditions Format

Conditions are strings with this pattern: `{include|exclude}/{scope}/{sub_scope}`

| Condition | Meaning |
|-----------|---------|
| `include/general` | All pages (used by headers/footers) |
| `include/singular/post` | All standard posts |
| `include/singular/page` | All pages |
| `include/singular/my_cpt` | All posts of custom post type `my_cpt` |
| `include/singular/post/123` | Specific post ID 123 |
| `include/archive/my_cpt` | Archive page for CPT `my_cpt` |
| `include/archive/category` | All category archives |
| `include/archive/category/5` | Specific category ID 5 |
| `exclude/singular/post/456` | Exclude specific post 456 |

Multiple conditions are stored as an array. Exclude conditions override includes.

## Theme Requirements

The active theme must register Elementor's theme locations for templates to render. Without this, `elementor_theme_do_location()` is never called and templates are ignored.

**In `functions.php`:**

```php
add_action( 'elementor/theme/register_locations', function( $elementor_theme_manager ) {
    $elementor_theme_manager->register_all_core_location();
} );
```

**In theme template files** (e.g., `singular.php`, `archive.php`, `header.php`, `footer.php`):

```php
// singular.php — single posts/pages
if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'single' ) ) {
    // Default theme output (fallback when no Elementor template matches)
    while ( have_posts() ) { the_post(); the_content(); }
}
```

The function returns `true` if a Theme Builder template was rendered, `false` if no matching template exists (allowing the theme's default markup to be used).

## Post `_wp_page_template` Interaction

**Critical gotcha:** When a post has `_wp_page_template = 'elementor_header_footer'`, WordPress loads Elementor's own page template directly, **bypassing** the theme's template files. This means:

- The theme's `singular.php` is never loaded
- `elementor_theme_do_location('single')` is never called
- The Theme Builder Single template is **never applied**
- The post's `_elementor_data` renders directly as a standalone page

**Fix:** Posts that should use a Theme Builder template must have `_wp_page_template = 'default'`. This ensures WordPress loads the theme's `singular.php`, which calls `elementor_theme_do_location('single')`, which finds and renders the Theme Builder template.

| `_wp_page_template` on post | Result |
|---|---|
| `default` | Theme Builder Single template applies (if conditions match) |
| `elementor_header_footer` | Post renders standalone — Theme Builder Single is **bypassed** |
| `elementor_canvas` | Full canvas, no header/footer, no Theme Builder |

## Dynamic Tags

Single templates typically use dynamic tags to display post data:

```json
{
    "__dynamic__": {
        "title": "[elementor-tag id=\"abc12345\" name=\"post-title\" settings=\"%7B%7D\"]"
    }
}
```

| Tag name | Description | Widget |
|----------|-------------|--------|
| `post-title` | Post title | `heading`, `theme-post-title` |
| `post-excerpt` | Post excerpt | `theme-post-excerpt` |
| `post-featured-image` | Featured image | `image`, `theme-post-featured-image` |
| `post-date` | Publication date | `heading`, `text-editor` |
| `post-terms` | Categories/tags | `heading` |
| `current-date-time` | Current date | `text-editor` |
| `site-logo` | Site logo | `theme-site-logo` |

### Theme Post Content Widget

The `theme-post-content` widget renders whatever Elementor content the individual post has in its `_elementor_data`. This is what makes the "template shell + per-post content" pattern work:

```json
{
    "id": "abc12345",
    "elType": "widget",
    "widgetType": "theme-post-content",
    "settings": {
        "_margin": { "top": "36", "right": "0", "bottom": "0", "left": "0", "unit": "px", "isLinked": false }
    },
    "elements": []
}
```

## Complete Example: Creating a Single CPT Template

```php
// 1. Create the template post
$template_id = wp_insert_post( array(
    'post_type'   => 'elementor_library',
    'post_title'  => 'News Detail',
    'post_status' => 'publish',
) );

// 2. Set all required meta
update_post_meta( $template_id, '_elementor_edit_mode', 'builder' );
update_post_meta( $template_id, '_elementor_template_type', 'single-post' );
update_post_meta( $template_id, '_elementor_conditions', array( 'include/singular/rwtuev_news' ) );
update_post_meta( $template_id, '_wp_page_template', 'default' );
update_post_meta( $template_id, '_elementor_version', '3.33.2' );
update_post_meta( $template_id, '_elementor_pro_version', '3.34.0' );

// 3. Set taxonomy
wp_set_object_terms( $template_id, 'single-post', 'elementor_library_type' );

// 4. Register in conditions cache
$conditions = get_option( 'elementor_pro_theme_builder_conditions', array() );
if ( ! isset( $conditions['single'] ) ) {
    $conditions['single'] = array();
}
$conditions['single'][ $template_id ] = array( 'include/singular/rwtuev_news' );
update_option( 'elementor_pro_theme_builder_conditions', $conditions );

// 5. Set page settings
update_post_meta( $template_id, '_elementor_page_settings', array(
    'content_wrapper_html_tag' => 'article',
    'preview_type'             => 'single/rwtuev_news',
) );

// 6. Build and set Elementor JSON
$template_data = array(
    array(
        'id'       => 'a1b2c3d4',
        'elType'   => 'container',
        'isInner'  => false,
        'settings' => array(
            'content_width'  => 'boxed',
            'flex_direction' => 'column',
        ),
        'elements' => array(
            // Dynamic post title
            array(
                'id'         => 'e5f6a7b8',
                'elType'     => 'widget',
                'widgetType' => 'heading',
                'settings'   => array(
                    'title'       => 'Post Title',
                    'header_size' => 'h1',
                    '__dynamic__' => array(
                        'title' => '[elementor-tag id="dyntitle" name="post-title" settings="%7B%7D"]',
                    ),
                ),
                'elements' => array(),
            ),
            // Post content (renders per-post Elementor data)
            array(
                'id'         => 'c9d0e1f2',
                'elType'     => 'widget',
                'widgetType' => 'theme-post-content',
                'settings'   => array(),
                'elements'   => array(),
            ),
        ),
    ),
);

update_post_meta( $template_id, '_elementor_data', wp_slash( wp_json_encode( $template_data ) ) );

// 7. Flush CSS cache
if ( class_exists( 'WP_CLI' ) ) {
    WP_CLI::runcommand( 'elementor flush-css' );
}
```

## Inspecting Existing Templates

```bash
# List all Theme Builder templates with their types
wp post list --post_type=elementor_library --fields=ID,post_title,post_status --format=table

# Check a template's type and conditions
wp post meta get <template_id> _elementor_template_type
wp post meta get <template_id> _elementor_conditions

# Check the conditions cache
wp eval 'print_r( get_option("elementor_pro_theme_builder_conditions") );'

# Check taxonomy assignment
wp eval 'print_r( array_map( function($t) { return $t->slug; }, wp_get_object_terms(<template_id>, "elementor_library_type") ) );'
```

## Troubleshooting

### Template Not Applying

**Symptoms:** Template exists in database, conditions set on post meta, but the page renders without the template shell.

**Checklist:**
1. Is the template in `elementor_pro_theme_builder_conditions`? (Most common cause)
2. Is `_elementor_template_type` set to `single-post` (not just `single`)?
3. Is the `elementor_library_type` taxonomy term set correctly?
4. Does the post have `_wp_page_template = 'default'`? (`elementor_header_footer` bypasses Theme Builder)
5. Does the theme call `elementor_theme_do_location('single')`?
6. Has the CSS cache been flushed?

### Template Renders But Post Content Missing

**Cause:** The template doesn't include a `theme-post-content` widget, or the post doesn't have `_elementor_edit_mode = 'builder'` and `_elementor_data` set.

### Template Renders But Without Header/Footer

**Cause:** The template post has `_wp_page_template = 'elementor_canvas'` instead of `'default'`, or the theme's header/footer Theme Builder templates don't have matching conditions.
