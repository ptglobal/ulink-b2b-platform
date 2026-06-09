# SPEC-03 — Data Model & ERD

**Status:** Baseline · **Owner:** Dev B · **Authoritative field list:** [`directus/SCHEMA.md`](../../directus/SCHEMA.md)

This doc adds relationships, the ERD, and the access model on top of the collection
field list in `SCHEMA.md`. Implemented in Directus (PostgreSQL).

## Entity-relationship overview
```
product_categories ─┐ (parent self-ref)
                     │
        ┌────────────┴───────────┐
   products ──< product_skus     │ products >─ m2m ─< industries
        │                         │
        ├─ m2m ─ files (gallery)  │
        └─< documents (TDS/MSDS)  │
                                  │
regional_hubs                     │
   ▲   ▲   ▲                      │
   │   │   └──────────── deliveries >── orders
   │   └────────────────── orders ───< order_items >── product_skus
   │                          │
customers ──(user m2o directus_users)
   │  └──< orders
   │  └──< invoices >── orders
   └──< rfq_requests (also created anonymously)

blog_posts   case_studies   iso_certifications   pages   hero_banners   partners
(content collections — independent, all have status + SEO fields + translations)
```

## Relationships
| From | Type | To | Notes |
|---|---|---|---|
| product_categories | self m2o | product_categories | hierarchy (Cleanroom→Gloves…) |
| products | m2o | product_categories | |
| product_skus | m2o | products | SKU belongs to product |
| products | m2m | industries | industry tagging |
| products | m2o (file) / m2m (files) | directus_files | hero + gallery |
| documents | m2o | products | TDS/MSDS per product |
| customers | m2o | directus_users | links auth identity |
| orders | m2o | customers, regional_hubs | |
| order_items | m2o | orders, product_skus | |
| invoices | m2o | customers, orders | AR / công nợ |
| deliveries | m2o | orders, regional_hubs | scheduled delivery |
| rfq_requests | m2o | regional_hubs, directus_users (assigned_sales) | line_items JSON |

## Access model (row-level)
| Collection | Customer | Sales | Editor | Admin |
|---|---|---|---|---|
| content (products, hubs, blog, …) | read (published) | read | CRUD | CRUD |
| orders / order_items | read **own** | CRUD | – | CRUD |
| invoices | read **own** | CRUD | – | CRUD |
| deliveries | read **own** | CRUD | – | CRUD |
| rfq_requests | read own; submit through `/api/rfq` | CRUD | – | CRUD |
| customers | read/update own | CRUD | – | CRUD |

"Own" = Directus permission filter `{ customer: { user: { _eq: "$CURRENT_USER" } } }`.

Visitor and customer RFQ submission is application-mediated: `POST /api/rfq` writes with a server token; Directus visitor/customer roles do not create `rfq_requests` directly.

## Conventions
- **PK:** auto-increment integer `id` (UUID for files/users per Directus default).
- **Status:** `published | draft | archived` on every content collection.
- **Soft-state:** orders/invoices/deliveries use a domain `status` enum (see SCHEMA.md).
- **i18n:** Directus Translations on text-bearing fields (vi/en/ja).
- **Timestamps:** `date_created`, `date_updated` (Directus system fields) enabled.
- **Money:** store as integer minor units or `decimal(15,2)`; never float.

## ERP-ready interface (future Integration)
`orders`, `invoices`, `deliveries` expose a stable import contract (REST + CSV
schema + webhook) so a future ERP becomes the upstream source without schema change
(see SPEC-04 §ERP interface, ADR-0003).
