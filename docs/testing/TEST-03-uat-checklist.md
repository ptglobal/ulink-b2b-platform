# TEST-03 - UAT Checklist & Acceptance Criteria

**Status:** Baseline · **Owner:** BA + ULink · **Basis:** Contract §1.5, PRD §8 · **Sign-off gate**

UAT is run by ULink on staging (Wk7) and on production (Wk8). Each item is a
verifiable check. Release requires all **must-pass** items and zero open S1.

## A. Acceptance criteria (contract §1.5 / PRD §8) - must-pass
- [ ] Stable on **Chrome, Edge, Safari** (desktop + mobile Safari).
- [ ] **No Critical bug in the RFQ/Order flow.**
- [ ] Page-load KPI met: **PageSpeed >= 90 desktop**, Core Web Vitals good.
- [ ] Product and **hub (KCN) data display accurately**.
- [ ] **SEO**: correct URL structure + metadata; sitemap/robots/schema valid.

## B. Functional acceptance by module - must-pass
- [ ] Homepage sections render and are CMS-managed.
- [ ] All 5 Regional Hubs show SLA / Warehouse / Team / Cluster.
- [ ] Product browse + **SKU search**; cached lookup < 50ms.
- [ ] Product detail: specs, **TDS/MSDS download**, request sample, add to RFQ.
- [ ] Industry filters (Electronics/Pharma/Cosmetics/Food).
- [ ] Resource Center: docs, ISO certs, case studies, blog, downloads.
- [ ] **Quick Order**: SKU input, bulk upload, RFQ cart, submit -> Sales.
- [ ] **B2B Portal**: login, dashboard, order history, scheduled delivery, **debt**, **re-order** - each customer sees only their own data.
- [ ] **CMS**: all 17 modules CRUD; publish/unpublish; roles Admin/Editor/Sales/Customer.
- [ ] **i18n**: VI/EN/JP per content policy; switch works; hreflang present.
- [ ] **Media/storage**: allowed uploads pass, oversize files reject, untrusted SVG rejects, soft delete moves file to trash, hard delete requires admin confirm, cleanup job removes expired files, audit logs contain full metadata.
- [ ] About pages + Contact (anti-spam).

## C. Non-functional - must-pass
- [ ] HTTPS everywhere; security headers present.
- [ ] Anti-spam blocks form floods.
- [ ] Responsive on desktop/tablet/mobile.
- [ ] RBAC + row-level verified (A cannot see B's data).
- [ ] Directus locales exist in order `vi`, `en`, `ja`; `vi` is the fallback locale.
- [ ] Content collections expose translation support in Directus Studio.

## D. RFQ smoke checks - must-pass
- [ ] Successful RFQ submit returns 200 and creates a `rfq_requests` record with status `new`.
- [ ] Invalid email is rejected with 422.
- [ ] Invalid phone is rejected with 422.
- [ ] Zero quantity or empty items are rejected with 422.
- [ ] Unknown SKU is rejected with 422.
- [ ] Bad Turnstile token is rejected with 403.
- [ ] Duplicate submit inside the dedupe window is rejected with 409.
- [ ] Too many submits from one IP are rejected with 429.

## E. Handover artifacts present (§2.3)
- [ ] Design System · Source code · API docs · Deployment Guide · UAT results ·
  SEO setup · User Guide · Training delivered.

## Sign-off
| Role | Name | Date | Result |
|---|---|---|---|
| ULink (Bên A) | | | Accept / Reject |
| Agency (Bên B) | | | |

**Definition of Done = operator-green:** ULink opens the production URL and confirms
expected output before sign-off.
