---
name: ULink Carbon Corporate
description: Group-grade wholesale procurement built on Carbon with a multilingual ULink corporate layer.
colors:
  interactive: "#4169E1"
  interactive-hover: "#3458C9"
  background: "#F7F8FC"
  layer-01: "#FFFFFF"
  layer-02: "#EDF1FA"
  field-01: "#F7F8FC"
  text-primary: "#0B1B3F"
  text-secondary: "#52627D"
  border-subtle: "#D8E0F0"
  border-strong: "#8797B8"
  support-success: "#24A148"
  support-warning: "#F1C21B"
  support-error: "#DA1E28"
typography:
  family: "IBM Plex Sans, Noto Sans Variable, Noto Sans JP Variable, Segoe UI, sans-serif"
  mono: "IBM Plex Mono, Menlo, monospace"
  public-display: "Carbon fluid-heading-06"
  page-heading: "Carbon heading-05"
  product-heading: "Carbon heading-04"
  body: "Carbon body-01"
  compact: "Carbon body-compact-01"
grid:
  base-unit: "8px"
  columns-large: 16
  columns-medium: 8
  columns-small: 4
  wide-gutter: "32px"
  narrow-gutter: "16px"
  condensed-gutter: "1px"
shape:
  component-radius: "4px"
  overlay-radius: "8px"
  tag-radius: "999px"
elevation:
  resting: "none"
  overlay: "0 4px 12px rgba(0,0,0,.20)"
motion:
  productive: "110ms cubic-bezier(.2,0,.38,.9)"
  expressive: "240ms cubic-bezier(.4,.14,.3,1)"
---

# ULink Carbon Enterprise Design System

## North star

**Wholesale intelligence, made operational.**

ULink should read as one enterprise platform from the first capability statement to the last invoice row. Carbon is the interaction and component contract; ULink's deep Royal Blue, navy, and multilingual IBM Plex/Noto typography form the corporate identity layer. Public pages, purchasing workflows, the customer portal, and administration use the same official components, icons, states, and spacing logic, with density changing by task.

The result is institutional rather than decorative: crisp key lines, strong information hierarchy, controlled 2–8px radii, deliberate Royal Blue actions, visible operational evidence, and photography that documents a specific capability.

## Carbon implementation rules

- Import the official `@carbon/react` Sass entry point once at the app root.
- Use `@carbon/react` for interactive components and `@carbon/icons-react` for every functional icon.
- Prefer Carbon tokens and component classes over custom one-off styling.
- Extend Carbon only when ULink has a procurement-specific need that Carbon does not express.
- Do not recreate a Carbon component with Tailwind when the library already provides it.
- Every extension must preserve Carbon focus, keyboard, disabled, loading, error, and reduced-motion behavior.

## Layout and density

- **Public and editorial:** wide 2x Grid, 16 columns at large breakpoints, 32px gutters, generous 64–112px section spacing.
- **Forms and product detail:** wide or narrow grid; labels never hang into a gutter.
- **Portal and admin:** condensed grid for related metrics and tables, wide grid around forms and page headers.
- **Mobile:** four columns with 16px outer margin. Tiles stack cleanly and all primary controls retain a 44px minimum touch target.
- Horizontal and vertical key lines must align across adjacent content, imagery, controls, and tables.

## Color

ULink uses Carbon White theme behavior with a restrained corporate palette. Cool Gray 10 is the application canvas, White is layer 01, cool blue-gray provides dividers and secondary layers, deep navy is primary ink, and Royal Blue (#4169E1) is the single interactive brand signal.

Blue is reserved for actionable or selected states. Success, warning, and error always use Carbon support tokens. Large decorative gradients, glass layers, colored card shadows, and tinted-neutral drift are prohibited.

## Typography

IBM Plex Sans is the corporate interface and editorial family for Vietnamese and English, matching Carbon's enterprise character. Japanese surfaces prioritize Noto Sans JP Variable. IBM Plex Mono remains reserved for SKU, lot, order, quote, invoice, quantity, SLA, and system identifiers.

Marketing may use Carbon fluid headings; product, portal, and admin surfaces use fixed productive type tokens. Body copy is capped at 65–75 characters, while tables may expand to the working width.

## Components

- **Buttons:** Carbon Button kinds only. Primary blue marks the single dominant action; secondary, tertiary, and ghost follow Carbon hierarchy. Default control height is 48px on public/forms and 40px in productive admin contexts.
- **Inputs:** Carbon TextInput, TextArea, Select, Dropdown, DatePicker, Checkbox, and FormGroup. Persistent labels and inline errors are mandatory.
- **Tiles:** Carbon Tile/ClickableTile behavior with a controlled 0–8px radius hierarchy. No decorative border-and-shadow pairing and no nested card stacks.
- **Navigation:** 48px Carbon global-header rhythm. Public navigation may add a brand wordmark; authenticated navigation uses Carbon side-nav behavior.
- **Data:** Carbon DataTable, TableToolbar, Pagination, Tag, InlineNotification, Skeleton, and structured empty states.
- **Overlays:** Carbon Modal or side panel only for tasks that cannot remain inline.

## Imagery and content ownership

Every meaningful photograph or illustration is registered to one placement. The same file must not appear in two content roles. Stable identity assets (logo, certification mark, partner logo) and functional Carbon icons are exempt.

Business-facing copy and media paths live in Directus. Locale message files contain only interface language such as labels, validation, navigation, and state messages. Directus content must be seeded idempotently and editable in Vietnamese, English, and Japanese.

## Motion and accessibility

Productive transitions use Carbon's 110ms motion; expressive public transitions may use 240ms when they explain hierarchy or connection. Decorative page-load choreography is not used in task surfaces. All animation has a reduced-motion alternative.

Target WCAG 2.1 AA: visible focus, full keyboard flows, 4.5:1 body contrast, meaningful alternative text, non-color status cues, and resilient Vietnamese/English/Japanese wrapping.

## Prohibited patterns

- Rounded SaaS cards, glassmorphism, soft ambient gradients, gradient text, and shadow-heavy white panels.
- Repeated icon-above-copy feature cards without a real navigational or operational function.
- Lucide, Feather, emoji, or mixed icon families in application UI.
- Reusing a photo as a placeholder for a different product, industry, person, hub, or page.
- Hardcoded marketing arrays inside React components when Directus can own the content.
