---
name: elementor-content
description: Create, inspect, update, migrate, import, or delete Elementor content in exported JSON templates or WordPress post metadata via WP-CLI. Use for Elementor pages, library and Pro Theme Builder templates, containers, legacy sections/columns, widgets, responsive settings, global styles, and display conditions.
---

# Elementor Content

Manipulate Elementor's JSON conservatively. Prefer an exported template or staging copy; treat direct `_elementor_data` writes as a low-level fallback, since widget schemas and internal metadata vary by Elementor, Pro, addon, and feature version.

## Workflow

1. Identify the target: JSON template or WordPress installation.
2. For WordPress, confirm the site, post ID, post type, installed Elementor/Pro versions, and available CLI commands. Never copy version metadata from examples.
3. Read the complete document and make a timestamped backup before mutating.
4. Inspect a same-site element of the desired type when touching unfamiliar controls. Preserve unknown keys and existing value shapes.
5. Make the smallest tree/settings change that satisfies the request. Preserve IDs of unchanged elements; generate collision-free IDs only for new ones.
6. Validate JSON, structure, responsive/global references, content quality, and security before writing.
7. Write once, read back, parse again, and compare against the intended result.
8. Run Elementor's supported cache-regeneration command, clear other caches only when relevant, and visually verify editor plus frontend at relevant breakpoints.
9. Restore the backup if validation or rendering fails.

Never mutate a live production page when staging or a draft workflow is available. Never publish, delete, or bulk-update content beyond what the request authorizes.

## Choose the Right Reference

| Need | Read |
|---|---|
| JSON wrapper, tree, IDs, settings, responsive values, globals | `references/element-structure.md` |
| Common built-in widget examples | `references/widget-catalog.md` |
| Live database reads/writes, backup, verification, CLI | `references/wp-cli-operations.md` |
| Pro Theme Builder templates and conditions | `references/theme-builder-templates.md` |
| Accessibility, responsive design, performance, security, QA | `references/best-practices.md` |

The widget catalog is examples, not a stable schema — inspect same-site JSON or registered widget controls when exact keys matter, especially for nested, Pro, addon, or Editor V4 elements.

## Data Rules

- Exported files use the template wrapper (`title`, `type`, `version`, `page_settings`, `content`); `_elementor_data` stores the content array only.
- Preserve `settings` as an empty array or object, matching source data; do not normalize without reason.
- Each element needs a document-unique `id`, `elType`, `settings`, and `elements` array; widgets also need `widgetType`.
- Preserve source `isInner` values; never infer container depth from it or rewrite it just because an element moved.
- Child elements belong on containers and explicitly nested-capable widgets; ordinary widgets keep an empty `elements` array.
- Preserve legacy section/column trees unless migration is requested; prefer containers for new layouts the target site supports.
- Preserve `__globals__` references and verify referenced kit styles exist on the destination; do not replace globals with hard-coded values unless asked.
- Support custom breakpoint suffixes beyond `_tablet`/`_mobile`; inspect the site's breakpoint configuration.
- Treat rich text, URLs, custom attributes, custom CSS, shortcodes, and dynamic tags as untrusted input. Preserve only trusted markup; never invent executable content.

## Validation

Before writing: parse the exact payload and confirm the root type; recursively check required fields and duplicate element/repeater IDs (IDs need not be hex); confirm each widget type exists on the target site and preserve supported nested children; check media IDs/URLs, internal links, dynamic tags, and global-style references in the destination context; review heading order, landmarks, alt text, descriptive links, keyboard behavior, visible focus, contrast, and motion controls; review desktop and every enabled breakpoint without duplicating layouts merely to hide them per device; prefer global styles, responsive inheritance, shallow container trees, and appropriately sized media.

After writing: read back and parse the stored value; confirm the intended diff and that unrelated content is unchanged; run `wp elementor flush-css` (and `wp elementor-pro theme-builder clear-conditions` for condition changes) when available; verify the editor loads, then frontend rendering and interactions at relevant breakpoints.
