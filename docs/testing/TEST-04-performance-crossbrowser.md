# TEST-04 — Performance & Cross-browser Test Plan

**Status:** Baseline · **Owner:** Tester/Dev A · **Related:** SPEC-08, PROC-04

## Performance budgets (NFR-01/02)
| Metric | Target |
|---|---|
| PageSpeed (desktop) | ≥ 90 on Home, Product, Hub, Listing |
| LCP | ≤ 2.5s | 
| CLS | ≤ 0.1 |
| INP | ≤ 200ms |
| Quick Order SKU lookup (cache hit) | < 50ms |
| JS (First Load, key pages) | keep lean (scaffold baseline ~87–98 kB) |

## How to measure
- **Lighthouse CI** on Vercel preview for each PR (fail the budget → fail check).
- Field/lab: PageSpeed Insights on key URLs per locale.
- SKU latency: timed `/api/sku` (log `x-cache` + duration); optional k6 sample.

## Cross-browser matrix
| Browser | Versions | Notes |
|---|---|---|
| Chrome | current, −1 | primary |
| Edge | current | Chromium |
| Safari | current, −1 (macOS + iOS) | **acceptance criterion** — test early (Wk3+) |

Check per browser: layout, fonts/diacritics (VI/JP), forms (RFQ), portal, language
switch, media/downloads.

## Responsive matrix
| Class | Widths |
|---|---|
| Mobile | 360, 390, 414 |
| Tablet | 768, 834 |
| Desktop | 1280, 1440, 1920 |
Verify nav collapse, tables/cards reflow, tap targets, no horizontal scroll.

## Accessibility (paired)
axe scan on key templates; keyboard-only pass; focus-visible; AA contrast (watch
accent-on-light for small text).

## Cadence
Baseline at Wk1; per-PR Lighthouse; Safari from Wk3; full hardening + sign-off in Wk7
(PROC-04). Regressions are S2+ (PROC-01).
