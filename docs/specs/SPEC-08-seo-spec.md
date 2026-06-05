# SPEC-08 — SEO Technical Specification & Schema Markup

**Status:** Baseline · **Owner:** Dev A · **Related:** SPEC-05, SPEC-07, PROC-04

The contracted "SEO Technical Setup & Schema Markup" deliverable.

## URLs & indexing
- Clean, slug-based, **locale-prefixed** URLs; lowercase; stable.
- **Canonical** on every page; **hreflang** for vi/en/ja + `x-default`.
- `sitemap.xml` (all locales, generated; see `frontend/src/app/sitemap.ts`) and
  `robots.ts`. Unpublished/portal routes excluded.

## Metadata
- Per-page `title`, `description`, Open Graph, Twitter card — **CMS-driven**
  (`meta_*` fields), with sensible defaults from `site_settings`.
- Title template `%s · ULink Industries`.

## Structured data (JSON-LD)
| Page | Schema |
|---|---|
| Global | `Organization` (logo, contact, sameAs) |
| Product detail | `Product` (+ `Offer`/RFQ, brand, sku) |
| Listing/detail | `BreadcrumbList` |
| Blog post | `Article` |
| FAQ sections | `FAQPage` (where present) |

## Performance = SEO
Core Web Vitals are a ranking + acceptance factor. Enforce the budget in PROC-04:
SSG/ISR, `next/image`, font optimization, minimal JS, no layout shift. Target
PageSpeed ≥ 90 desktop.

## Verification
- Google Rich Results / schema validator passes for each template.
- `sitemap.xml` reachable + valid; `robots.txt` correct.
- Lighthouse SEO ≥ 95 on key pages; metadata present per locale.
- No duplicate content across locales (hreflang + canonical correct).
