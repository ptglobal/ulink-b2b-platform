# Directus Schema — ULink B2B Platform

Source of truth for collections, fields, roles, and i18n. Implement via
`bootstrap.mjs` (or the Directus admin UI) and keep this file in sync.
Conventions: every content collection has `status` (published/draft/archived)
and, where text-bearing, **Translations** for `vi` / `en` / `ja`.

> Maps to delivery plan §5. Native Directus features (no collection to build):
> **Media Library** (Files), **Users/Roles/Permissions**, **Publish state** (`status`),
> **Translations** (i18n).

## Content collections

| Collection | Key fields | Notes |
|---|---|---|
| `hero_banners` | image (file), headline*, subhead, cta_label, cta_link, sort, status | Homepage hero (CMS module 1) |
| `partners` | name*, logo (file), url, sort, status | Strategic Partners (module 2) — implemented in bootstrap as the example |
| `product_categories` | name*, slug*, parent (m2o self), icon (file), description, sort, status, `meta_*` | Cleanroom/Packaging tree (module 3) |
| `products` | name*, slug*, category (m2o), short_desc, long_desc, hero (file), gallery (m2m files), industries (m2m), request_sample (bool), status, `meta_*` | Product Detail (module 5) |
| `product_skus` | sku_code*, product (m2o), specs (json/repeater), unit, pack_size, status | SKU (module 4) — **Redis-indexed** for `/api/sku` |
| `documents` | title*, doc_type (TDS/MSDS/cert/brochure), file*, product (m2o), lang, status | TDS/MSDS (module 6) + Download Center (module 10) |
| `regional_hubs` | name*, slug*, cluster_overview, delivery_sla, warehouse_capacity, technical_team, coords, images (m2m files), status | Hubs (module 7) |
| `industries` | name*, slug*, description, icon (file), products (m2m), `meta_*` | Electronics/Pharma/Cosmetics/Food |
| `blog_posts` | title*, slug*, body, cover (file), author, category, published_at, status, `meta_*` | Blog & News (module 8) |
| `case_studies` | title*, slug*, body, client, industry (m2o), results, images (m2m files), status | Resource Center |
| `iso_certifications` | name*, issuer, number, valid_until (date), file, image, status | ISO Certs (module 9) |
| `pages` | title*, slug*, body, `meta_*`, status | About / Sustainability / Careers / Contact |

SEO Metadata (module 11) = `meta_title`, `meta_description`, `og_image` fields on
each collection above + defaults in a `site_settings` singleton.

## B2B Portal collections (data source — plan §3)

| Collection | Key fields | Serves |
|---|---|---|
| `customers` | user (m2o directus_users), company*, tax_code, contacts | Auth + scoping |
| `orders` | code*, customer (m2o), order_date, status, hub (m2o), total | Order History |
| `order_items` | order (m2o), sku (m2o), qty, unit_price | order lines |
| `invoices` | customer (m2o), order (m2o), amount, due_date, paid_status, balance | Debt / Công nợ |
| `deliveries` | order (m2o), scheduled_date, status, hub (m2o) | Scheduled Delivery |
| `rfq_requests` | company*, contact, email*, phone, industry, hub (m2o), line_items (json), message, status (new/quoted/won/lost), assigned_sales (m2o user) | RFQ management |

Re-order = an action that clones an order's `order_items` into a new RFQ cart / order.

**ERP-ready interface (plan §5, Week 6):** standardized REST + CSV-import + webhook
contract over `orders` / `invoices` / `deliveries` so a future ERP syncs without
touching core.

## Roles (module 13 / 17)

| Role | Access |
|---|---|
| **Admin** | Full (default Directus admin) |
| **Editor** | CRUD all content collections + publish/unpublish; no users/roles |
| **Sales** | Read content; full CRUD on `rfq_requests`, `orders`, `invoices`, `deliveries`, `customers` |
| **Customer** | App access; **row-level** read on own `orders`/`invoices`/`deliveries` via filter `{ customer: { user: { _eq: "$CURRENT_USER" } } }` |

## i18n (module 15)

Enable Directus **Translations** on all text-bearing collections for `vi`, `en`,
`ja`. Frontend consumes via next-intl (`frontend/src/i18n`). Launch content policy
in plan §9 (VI 100% · EN 100% · JP key pages).
