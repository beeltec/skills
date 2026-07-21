---
name: elementor-content
description: Create, inspect, update, migrate, import, or delete Elementor content in exported JSON templates or WordPress post metadata via WP-CLI. Use for Elementor pages, library templates, containers, legacy sections/columns, nested widgets, responsive settings, global-style references, and Elementor Pro Theme Builder templates or display conditions.
---

# Elementor Content

Manipulate Elementor's JSON data conservatively. Prefer an exported template or a staging copy. Treat direct `_elementor_data` writes as a low-level fallback because widget schemas and internal metadata can vary by Elementor, Elementor Pro, addon, and feature version.

## Workflow

1. Identify whether the target is a JSON template or a WordPress installation.
2. For WordPress, confirm the site, post ID, post type, installed Elementor/Core Pro versions, and available CLI commands. Never copy version metadata from examples.
3. Read the complete document and make a timestamped backup before mutation.
4. Inspect a same-site element of the desired type when adding or changing unfamiliar controls. Preserve unknown keys and existing value shapes.
5. Make the smallest tree/settings change that satisfies the request. Preserve IDs for unchanged elements; generate collision-free IDs only for new elements.
6. Validate JSON, structure, responsive/global references, content quality, and security before writing.
7. Write once, read back, parse again, and compare the intended result.
8. Run Elementor's supported cache-regeneration command, clear other caches only when relevant, and visually verify editor plus frontend at relevant breakpoints.
9. Restore the backup if validation or rendering fails.

Do not mutate a live production page when a staging or draft workflow is available. Do not publish, delete, or bulk-update content unless the user's request authorizes it.

## Choose the Right Reference

| Need | Read |
|---|---|
| JSON wrapper, tree, IDs, settings, responsive values, globals | `references/element-structure.md` |
| Common built-in widget examples | `references/widget-catalog.md` |
| Live database reads/writes, backup, verification, CLI | `references/wp-cli-operations.md` |
| Elementor Pro Theme Builder templates and conditions | `references/theme-builder-templates.md` |
| Accessibility, responsive design, performance, security, QA | `references/best-practices.md` |

Treat the widget catalog as examples, not a stable schema. Inspect same-site JSON or registered widget controls when exact keys matter, especially for nested, Pro, addon, or Editor V4 elements.

## Data Rules

- Use the template wrapper (`title`, `type`, `version`, `page_settings`, `content`) for exported files; `_elementor_data` stores the content array only.
- Preserve `settings` as either an empty array or an object, matching source data. Do not normalize empty arrays to objects without a reason.
- Require each element to have a document-unique `id`, `elType`, `settings`, and `elements` array. Require `widgetType` for widgets.
- Preserve source `isInner` values. Do not infer container depth from `isInner` or rewrite it solely because an element moved.
- Allow child elements on containers and on widgets that are explicitly nested-capable. Ordinary widgets generally have an empty `elements` array.
- Preserve legacy section/column trees unless migration is requested. Prefer containers for new layouts supported by the target site.
- Preserve `__globals__` references and verify referenced kit styles exist on the destination. Do not replace global styles with hard-coded values unless requested.
- Support custom breakpoint suffixes in addition to `_tablet` and `_mobile`; inspect the target site's breakpoint configuration.
- Treat rich text, URLs, custom attributes, custom CSS, shortcodes, and dynamic tags as untrusted input. Preserve only trusted markup and avoid inventing executable content.

## Validation

Before writing:

- Parse the exact payload to be written and confirm the expected root type.
- Recursively check required fields and duplicate element/repeater IDs without assuming IDs are hexadecimal.
- Confirm each widget type exists on the target site and preserve nested-widget children where supported.
- Check media IDs/URLs, internal links, dynamic tags, and global-style references in the destination context.
- Review heading order, landmarks, alt text, descriptive links, keyboard behavior, visible focus, contrast, and motion controls.
- Review desktop and every enabled breakpoint without duplicating whole layouts merely to hide them per device.
- Prefer global styles, responsive inheritance, shallow container trees, and appropriately sized media.

After writing:

- Read back and parse the stored value.
- Confirm the intended diff and that unrelated settings/content remain unchanged.
- Run `wp elementor flush-css` when available. For Theme Builder condition changes, run `wp elementor-pro theme-builder clear-conditions` when available.
- Verify the Elementor editor loads, then verify frontend rendering and interactions at relevant breakpoints.
