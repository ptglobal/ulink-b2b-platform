# PROC-04 — Performance & SEO Tuning Checklist

**Status:** Baseline · **Owner:** Dev A · **Related:** SPEC-08, TEST-04

A repeatable pass to hit PageSpeed ≥ 90 / good Core Web Vitals. Run during build and
in the Week-7 hardening window; re-run before go-live.

## Rendering & data
- [ ] Content pages are SSG/ISR (not SSR) where possible; revalidate on publish.
- [ ] Queries request only needed `fields`; `limit` set; no N+1.
- [ ] Client components only where interactivity requires.

## Assets
- [ ] All images via `next/image` (sized, lazy, modern formats); LCP image preloaded.
- [ ] Fonts optimized (subset, `display: swap`); no FOIT.
- [ ] No large/blocking third-party scripts; defer analytics.
- [ ] Tailwind purged; no unused CSS/JS shipped.

## Core Web Vitals
- [ ] **LCP ≤ 2.5s** — fast hero/LCP element, cached, no client fetch for it.
- [ ] **CLS ≤ 0.1** — explicit media dimensions; reserve space; no late-injected UI.
- [ ] **INP ≤ 200ms** — minimal main-thread work; split heavy client code.

## SEO
- [ ] Per-page metadata + canonical + hreflang (all locales).
- [ ] JSON-LD valid (Organization/Product/Breadcrumb/Article).
- [ ] sitemap.xml + robots.txt correct; portal/unpublished excluded.
- [ ] No duplicate-content across locales.

## Verify
- [ ] Lighthouse desktop ≥ 90 (perf) / ≥ 95 (SEO) on Home, Product, Hub, Listing.
- [ ] Rich Results test passes per template.
- [ ] SKU `/api/sku` cache hit < 50ms.

Record before/after scores in the PR. Regressions block merge (TEST-04 budget gate).
