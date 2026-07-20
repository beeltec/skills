# WP-CLI Operations for Elementor

All commands assume WP-CLI is installed and the working directory is the WordPress root (or `--path=/path/to/wordpress` is appended).

## Reading Elementor Content

### Get a Single Page's Elementor Data

```bash
wp post meta get <post_id> _elementor_data
```

Returns the raw JSON string. Pipe through `jq` for readable output:

```bash
wp post meta get <post_id> _elementor_data | jq .
```

### Save to File for Editing

```bash
wp post meta get <post_id> _elementor_data > page-content.json
```

### List All Elementor Pages

```bash
wp post list --meta_key=_elementor_data --fields=ID,post_title,post_status,post_type --format=table
```

### List Elementor Templates

```bash
wp post list --post_type=elementor_library --fields=ID,post_title,post_status --format=table
```

### Get Page Settings

```bash
wp post meta get <post_id> _elementor_page_settings
```

### Check Elementor Edit Mode

```bash
wp post meta get <post_id> _elementor_edit_mode
```

Returns `"builder"` if the page uses Elementor.

## Writing Elementor Content

### Update Page Content (File-Based — Recommended)

Always use a file to avoid shell escaping issues with complex JSON:

```bash
# 1. Edit the JSON file
# 2. Write it back
wp post meta update <post_id> _elementor_data "$(cat page-content.json)"
```

Or using `wp eval` for safer handling:

```bash
wp eval "
  \$data = file_get_contents('/tmp/elementor-content.json');
  update_post_meta(<post_id>, '_elementor_data', wp_slash(\$data));
"
```

The `wp_slash()` call is critical — WordPress runs `wp_unslash()` on meta values during save, so pre-slashing preserves the data.

### Update Page Settings

```bash
wp post meta update <post_id> _elementor_page_settings '{"background_background":"classic","background_color":"#FFFFFF"}'
```

## Safety Practices

### Always Backup Before Writing

```bash
# Backup current content
wp post meta get <post_id> _elementor_data > backup-<post_id>-$(date +%Y%m%d%H%M%S).json

# Then make your changes and write
```

### Validate JSON Before Writing

```bash
# Check syntax
cat page-content.json | jq . > /dev/null 2>&1 && echo "Valid JSON" || echo "INVALID JSON"

# Check it's an array (database format)
cat page-content.json | jq 'type == "array"'
```

## Cache Clearing

After any write operation, flush Elementor's CSS cache to regenerate stylesheets:

```bash
wp elementor flush-css
```

Without this, the page may display stale styles or appear broken.

### Full Cache Clear (if styles still stale)

```bash
wp elementor flush-css
wp cache flush
wp rewrite flush
```

## Template Operations

### Import a Template File

```bash
wp elementor library import /path/to/template.json
```

Returns the new post ID. The template appears in Elementor → Templates.

### Import with Title Override

```bash
wp elementor library import /path/to/template.json --title="My Custom Template"
```

### Export Is Not Supported via CLI

Elementor's CLI doesn't support export. To export, use the `wp post meta get` approach and construct the template wrapper manually:

```json
{
  "title": "Exported Template",
  "type": "page",
  "version": "0.4",
  "page_settings": {},
  "content": [ /* paste the _elementor_data array here */ ]
}
```

## Creating New Elementor Pages

Full sequence to create a new page with Elementor content:

```bash
# 1. Create the WordPress post
POST_ID=$(wp post create --post_type=page --post_title="New Page" --post_status=publish --porcelain)

# 2. Enable Elementor on the page
wp post meta update $POST_ID _elementor_edit_mode "builder"
wp post meta update $POST_ID _elementor_version "3.25.0"

# 3. Set the content (from a JSON file)
wp eval "
  \$data = file_get_contents('/tmp/new-page-content.json');
  update_post_meta($POST_ID, '_elementor_data', wp_slash(\$data));
"

# 4. Set page template to Elementor full width (optional)
wp post meta update $POST_ID _wp_page_template "elementor_header_footer"

# 5. Flush CSS cache
wp elementor flush-css

echo "Created Elementor page: $POST_ID"
```

### Page Template Options

| Template Value | Description |
|---------------|-------------|
| `"default"` | Theme's default template |
| `"elementor_header_footer"` | Elementor canvas with theme header/footer |
| `"elementor_canvas"` | Full Elementor canvas (no header/footer) |

Set via:

```bash
wp post meta update <post_id> _wp_page_template "elementor_header_footer"
```

## Batch Operations

### Update All Elementor Pages

```bash
# Get all Elementor page IDs
PAGE_IDS=$(wp post list --meta_key=_elementor_edit_mode --meta_value=builder --fields=ID --format=csv | tail -n +2)

for ID in $PAGE_IDS; do
  echo "Processing page $ID..."

  # Export current content
  wp post meta get $ID _elementor_data > /tmp/elementor-$ID.json

  # Modify with jq (example: change all button colors)
  cat /tmp/elementor-$ID.json | jq '
    (.. | objects | select(.widgetType == "button")) .settings.background_color = "#FF5733"
  ' > /tmp/elementor-$ID-modified.json

  # Write back
  wp eval "
    \$data = file_get_contents('/tmp/elementor-$ID-modified.json');
    update_post_meta($ID, '_elementor_data', wp_slash(\$data));
  "
done

# Flush CSS cache once at the end
wp elementor flush-css
```

### Search for Text Across All Elementor Pages

```bash
PAGE_IDS=$(wp post list --meta_key=_elementor_edit_mode --meta_value=builder --fields=ID --format=csv | tail -n +2)

for ID in $PAGE_IDS; do
  CONTENT=$(wp post meta get $ID _elementor_data 2>/dev/null)
  if echo "$CONTENT" | grep -q "search text here"; then
    TITLE=$(wp post get $ID --field=post_title)
    echo "Found in page $ID: $TITLE"
  fi
done
```

## Troubleshooting

### Blank Page After Update

**Cause:** Invalid JSON written to `_elementor_data`.

**Fix:**
1. Check the backup: `cat backup-<post_id>-*.json | jq . > /dev/null`
2. Restore from backup: `wp eval "\$data = file_get_contents('backup-<post_id>-*.json'); update_post_meta(<post_id>, '_elementor_data', wp_slash(\$data));"`
3. Flush cache: `wp elementor flush-css`

### Stale Styles After Update

**Cause:** Elementor's CSS cache wasn't regenerated.

**Fix:**
```bash
wp elementor flush-css
```

If that doesn't work:
```bash
# Nuclear option: clear all Elementor CSS files
wp eval "
  \$upload_dir = wp_upload_dir();
  \$css_dir = \$upload_dir['basedir'] . '/elementor/css/';
  array_map('unlink', glob(\$css_dir . '*.css'));
"
wp elementor flush-css
```

### Content Appears But Layout is Broken

**Cause:** Usually a nesting violation — widgets outside containers, or missing `isInner` flags.

**Fix:** Validate the structure:
```bash
# Check all elements have valid elType
wp post meta get <post_id> _elementor_data | jq '[.. | objects | select(.elType) | .elType] | unique'

# Check widgets have empty elements arrays
wp post meta get <post_id> _elementor_data | jq '[.. | objects | select(.widgetType) | select(.elements | length > 0)]'
```

### `wp_slash()` Issue — Backslashes Doubled

**Cause:** Not using `wp_slash()` before `update_post_meta()`. WordPress auto-unslashes, so content with quotes or backslashes gets corrupted.

**Fix:** Always use the `wp eval` approach with `wp_slash()` as shown in the Writing section.

### Element IDs Not Unique

**Cause:** Copy-pasting elements without regenerating IDs.

**Fix:** Generate new 8-char hex IDs for all duplicated elements:
```bash
wp post meta get <post_id> _elementor_data | jq '[.. | objects | .id // empty] | length as $total | [.. | objects | .id // empty] | unique | length as $unique | {total: $total, unique: $unique, has_duplicates: ($total != $unique)}'
```
