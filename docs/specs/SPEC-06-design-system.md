# SPEC-06 — Design System Specification

**Status:** Baseline · **Owner:** Dev A · **Implements:** `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`

A token-driven design system delivered with Tailwind + Shadcn/UI. This *is* the
contracted "UI/UX Design System" deliverable.

## 1. Design language — Japanese Industrial Minimalism
- **Calm, technical, precise.** Generous whitespace; restrained palette; crisp,
  near-square corners; monospace accents for codes/labels.
- **Content-first.** Type and grid carry the design; decoration is minimal.
- **Trust signals** (SLA, certifications, specs) presented as clean data, not marketing fluff.

## 2. Color tokens (HSL CSS variables → Tailwind)
| Token | HSL | Use |
|---|---|---|
| `--background` | `40 30% 98%` | warm paper ground |
| `--foreground` | `220 18% 12%` | ink text |
| `--primary` | `222 38% 22%` | deep steel indigo — primary actions |
| `--accent` | `8 72% 52%` | vermilion (shu-iro) — sparing emphasis |
| `--muted` / `--muted-foreground` | `40 16% 94%` / `220 10% 40%` | secondary surfaces/text |
| `--border` / `--input` / `--ring` | `220 14% 88%` / … / `222 38% 22%` | lines, fields, focus |
| `--card` / `--card-foreground` | `0 0% 100%` / `220 18% 12%` | elevated surfaces |

Dark mode: reserved (`darkMode: 'class'`), not in launch scope.

## 3. Typography
- **Sans:** Inter (`--font-sans`) — UI & body.
- **Mono:** IBM Plex Mono (`--font-mono`) — SKU codes, labels, eyebrows, data.
- **Scale:** `text-xs … text-6xl` (Tailwind). H1 `text-4xl→6xl` semibold tracking-tight;
  body `text-base/lg`; eyebrow `text-xs uppercase tracking-[0.2em]`.

## 4. Spacing, radius, grid
- **Container:** centered, padding `1.5rem`, max `1280px`.
- **Radius:** `--radius: 0.25rem` (crisp); md/sm derived.
- **Section rhythm:** `py-24 md:py-32` for hero/landing; `py-16` content.

## 5. Components (Shadcn/UI baseline)
Install into `frontend/src/components/ui` via `npx shadcn add`. Inventory:
Button, Input, Textarea, Select, Checkbox, Badge, Card, Table, Tabs, Accordion,
Dialog, Sheet, Dropdown-menu, Breadcrumb, Pagination, Toast, Skeleton, Form (+ zod).
App components: SiteHeader, SiteFooter, LocaleSwitcher, ProductCard, HubCard,
RfqCart, SkuSearch, DocDownload, PortalTable.

## 6. States & interaction
Every interactive element defines: default, hover, focus-visible (ring), active,
disabled, loading. Empty and error states are designed, not afterthoughts.

## 7. Accessibility
- WCAG 2.1 AA contrast for text on tokens (verify accent-on-light for small text).
- Visible focus ring (`--ring`); semantic landmarks; alt text from CMS; keyboard nav.

## 8. Responsive breakpoints
Tailwind `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1280`. Mobile-first; nav collapses
to a sheet < md.

## 9. Governance
Tokens change in `globals.css` only; components consume tokens (never hard-coded hex).
New components follow Shadcn structure and the conventions in [ENG-02](../engineering/ENG-02-coding-standards.md).
