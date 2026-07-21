# Elementor Content Best Practices

Use this guide when creating or materially restructuring content, not only for mechanical text replacement.

## Compatibility and change safety

- Prefer Elementor exports/imports and supported CLI commands over direct internal-option manipulation.
- Before database writes, record WordPress and Elementor versions, active theme, target post identity/status, and available Elementor CLI commands. Addon widgets and experiments can change stored control shapes.
- Back up the exact meta values being changed. Use a draft, duplicate, staging environment, or maintenance window when practical.
- Derive unfamiliar widget settings from a same-site example. Keep unknown keys intact; do not rebuild an entire element to change one control.
- Never hard-code `_elementor_version` or `_elementor_pro_version` from documentation examples. Preserve existing values or derive installed versions only when creation requires them.
- Read the value back after writing. JSON syntax alone does not prove Elementor can render the document.

## Design system and responsive content

- Prefer kit global colors and typography through `settings.__globals__`; verify those IDs exist when moving content between sites.
- Prefer modern containers for new layouts, while preserving legacy section/column structures unless migration is requested.
- Keep the element tree as shallow as the design allows. Avoid duplicate desktop/mobile layouts hidden at alternate breakpoints; use responsive direction, width, order, and spacing controls.
- Treat desktop as the base value and add only necessary breakpoint overrides. Support enabled custom breakpoint suffixes such as `_laptop`, `_tablet_extra`, and `_mobile_extra`.
- Use semantic container HTML tags and avoid hidden overflow when it would make content inaccessible.

## Accessibility and content quality

- Use a logical heading outline; generally one page-level H1, followed by unskipped levels.
- Add useful alt text to informative images and empty alt text to decorative images. Do not copy filenames into alt text.
- Use descriptive link/button text, programmatic form labels, logical keyboard order, and visible focus styles.
- Meet WCAG AA contrast. Do not rely on color alone to convey meaning.
- Avoid autoplaying media, carousels, and nonessential motion. When motion is necessary, provide pause/stop controls and respect reduced-motion preferences.
- Use semantic landmarks where they match the content. Add ARIA only when native HTML does not provide the needed meaning.

## Performance and security

- Prefer fewer, shallower containers and avoid duplicated hidden content.
- Use correctly sized/compressed images and destination-library attachment IDs where appropriate.
- Avoid unnecessary custom CSS, third-party widgets, fonts, icon libraries, animations, and background media.
- Do not blindly set loading attributes; let Elementor's image optimization handle them unless measurement justifies an override.
- Treat imported JSON and all content fields as untrusted. Reject unexpected executable HTML, event-handler attributes, unsafe URL schemes, or unauthorized shortcodes/custom code.
- Use WordPress/Elementor APIs rather than direct SQL. Keep shell interpolation out of JSON writes and use `wp_slash()` before `update_post_meta()`.
- Do not expose backups under the public web root. Remove temporary files after successful verification according to site policy.

## Official sources

- [Elementor data structure](https://developers.elementor.com/docs/data-structure/)
- [General elements](https://developers.elementor.com/docs/data-structure/general-elements/)
- [Responsive data](https://developers.elementor.com/docs/data-structure/responsive-data/)
- [Global styles](https://developers.elementor.com/docs/data-structure/global-styles/)
- [Elementor CLI](https://developers.elementor.com/docs/cli/)
- [Elementor accessibility best practices](https://elementor.com/help/best-practices-for-website-accessibility/)
- [Responsive design with containers](https://elementor.com/help/responsive-design-using-containers/)
- [WordPress `update_post_meta()` escaping](https://developer.wordpress.org/reference/functions/update_post_meta/)
