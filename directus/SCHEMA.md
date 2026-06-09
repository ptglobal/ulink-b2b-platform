# Directus Schema - ULink B2B Platform

This file mirrors the current implementation in `bootstrap.mjs`. If collection
names, field names, enums, or role rules change in bootstrap, update this file in
the same change.

Conventions:
- Content collections use `status = published | draft | archived`.
- Portal collections use domain-specific status enums.
- Primary key is integer `id` on custom collections; Directus native UUIDs stay on
  `directus_users` and `directus_files`.
- `orders`, `invoices`, and `deliveries` carry nullable unique `erp_ref`.
- Text-bearing collections are intended to use Directus Translations for `vi`, `en`,
  and `ja`, but bootstrap does not provision those translation configs automatically.

> Native Directus features, not custom collections:
> `directus_users`, `directus_roles`, `directus_files`, `directus_translations`,
> `directus_activity`.

## Content collections

| Collection | Current bootstrap fields | Notes |
|---|---|---|
| `hero_banners` | `title`, `subtitle`, `image`, `cta_label`, `cta_url`, `sort`, `status` | Homepage hero, module 1 |
| `partners` | `name`, `logo`, `url`, `sort`, `status` | Strategic partners, module 2 |
| `product_categories` | `name`, `slug`, `parent`, `description`, `hero_image`, `sort`, `status`, `meta_title`, `meta_description` | Category tree, self-reference on `parent` |
| `products` | `name`, `slug`, `category`, `short_description`, `specifications`, `hero`, `gallery`, `industries`, `status`, `meta_title`, `meta_description` | Product detail, module 5 |
| `product_skus` | `sku_code`, `product`, `unit`, `pack_size`, `attributes`, `status` | SKU layer, Redis-backed lookup for `/api/sku` |
| `documents` | `title`, `doc_type`, `product`, `file`, `language`, `status` | TDS, MSDS, certificate, brochure |
| `regional_hubs` | `name`, `slug`, `delivery_sla`, `warehouse_capacity`, `technical_team`, `cluster_overview`, `location`, `coordinates`, `status` | Hub landing pages |
| `industries` | `name`, `slug`, `description`, `icon`, `status` | Industry taxonomy |
| `blog_posts` | `title`, `slug`, `body`, `cover`, `author`, `published_at`, `status`, `meta_title`, `meta_description` | Blog/news |
| `case_studies` | `title`, `slug`, `summary`, `body`, `industry`, `cover`, `status` | Resource center content |
| `iso_certifications` | `name`, `number`, `issuer`, `valid_until`, `file`, `status` | ISO certificates |
| `pages` | `title`, `slug`, `body`, `status`, `meta_title`, `meta_description` | Static pages |

SEO defaults live in singleton `site_settings`. Current bootstrap only adds
`meta_title` and `meta_description` on content collections; `og_image` exists on
`site_settings`, not on every collection.

## Singleton collections

| Collection | Current bootstrap fields | Notes |
|---|---|---|
| `site_settings` | `logo`, `contact_email`, `contact_phone`, `address`, `meta_title`, `meta_description`, `og_image` | Global contact and default SEO |
| `homepage` | `title`, `hero_section` | Homepage layout singleton |

## Hidden junction collections

| Collection | Fields | Purpose |
|---|---|---|
| `products_industries` | `products_id`, `industries_id` | Product to industry m2m |
| `products_files` | `products_id`, `directus_files_id` | Product gallery m2m |

## B2B portal collections

| Collection | Current bootstrap fields | Purpose |
|---|---|---|
| `customers` | `status`, `user`, `company_name`, `tax_code`, `contact_name`, `email`, `phone`, `address`, `sales_owner` | Auth mapping and account scoping |
| `orders` | `status`, `code`, `customer`, `order_date`, `hub`, `subtotal`, `tax`, `total`, `notes`, `erp_ref` | Order history |
| `order_items` | `order`, `sku`, `description`, `qty`, `unit_price`, `line_total` | Order lines |
| `invoices` | `code`, `customer`, `order`, `issue_date`, `due_date`, `amount`, `paid_amount`, `balance`, `paid_status`, `erp_ref` | Accounts receivable / debt |
| `deliveries` | `order`, `hub`, `scheduled_date`, `delivered_date`, `status`, `tracking_ref`, `erp_ref` | Scheduled and delivered shipments |
| `rfq_requests` | `company`, `contact_name`, `email`, `phone`, `industry`, `hub`, `line_items`, `message`, `status`, `assigned_sales`, `source`, `user` | RFQ intake and triage |

Re-order remains an application action that clones prior `order_items` into a new
RFQ cart or order flow.

## Relationships

| From | Type | To | Notes |
|---|---|---|---|
| `product_categories.parent` | m2o | `product_categories` | Self-reference for hierarchy |
| `products.category` | m2o | `product_categories` | Product belongs to category |
| `product_skus.product` | m2o | `products` | SKU belongs to product |
| `documents.product` | m2o | `products` | Product documents |
| `documents.file` | m2o | `directus_files` | Attached document file |
| `case_studies.industry` | m2o | `industries` | Industry reference |
| `customers.user` | m2o | `directus_users` | Auth identity |
| `customers.sales_owner` | m2o | `directus_users` | Sales owner |
| `orders.customer` | m2o | `customers` | Order owner |
| `orders.hub` | m2o | `regional_hubs` | Fulfillment hub |
| `order_items.order` | m2o | `orders` | Parent order |
| `order_items.sku` | m2o | `product_skus` | Ordered SKU |
| `invoices.customer` | m2o | `customers` | Invoice owner |
| `invoices.order` | m2o | `orders` | Source order |
| `deliveries.order` | m2o | `orders` | Source order |
| `deliveries.hub` | m2o | `regional_hubs` | Shipping hub |
| `rfq_requests.hub` | m2o | `regional_hubs` | Preferred hub |
| `rfq_requests.assigned_sales` | m2o | `directus_users` | Assigned salesperson |
| `rfq_requests.user` | m2o | `directus_users` | Portal-origin RFQ user |
| `products_industries.products_id` | m2o | `products` | Product side of m2m |
| `products_industries.industries_id` | m2o | `industries` | Industry side of m2m |
| `products_files.products_id` | m2o | `products` | Product side of gallery m2m |
| `products_files.directus_files_id` | m2o | `directus_files` | File side of gallery m2m |

## Roles and access

| Role | Current bootstrap access |
|---|---|
| **Admin** | Full Directus admin access |
| **Editor** | CRUD on all content collections and singletons `site_settings`, `homepage` |
| **Sales** | Read all content and singletons; full CRUD on `customers`, `orders`, `order_items`, `invoices`, `deliveries`, `rfq_requests` |
| **Customer** | Read published content; read singletons; read/update own `customers`; read own `orders`, `order_items`, `invoices`, `deliveries`; read own `rfq_requests` |

Visitor/public users may read published content directly from Directus. RFQ submission for visitors and customers goes through `POST /api/rfq`; Directus visitor/customer roles do not create `rfq_requests` directly.

Customer row-level filters in bootstrap:
- `customers`: `{ user: { _eq: "$CURRENT_USER" } }`
- `orders`: `{ customer: { user: { _eq: "$CURRENT_USER" } } }`
- `order_items`: `{ order: { customer: { user: { _eq: "$CURRENT_USER" } } } }`
- `invoices`: `{ customer: { user: { _eq: "$CURRENT_USER" } } }`
- `deliveries`: `{ order: { customer: { user: { _eq: "$CURRENT_USER" } } } }`
- `rfq_requests`: read own via `{ user: { _eq: "$CURRENT_USER" } }`

## Enums and status values

- Content status: `published`, `draft`, `archived`
- `customers.status`: `active`, `inactive`
- `orders.status`: `pending`, `confirmed`, `processing`, `shipped`, `completed`, `cancelled`
- `invoices.paid_status`: `unpaid`, `partial`, `paid`, `overdue`
- `deliveries.status`: `scheduled`, `in_transit`, `delivered`, `late`, `cancelled`
- `rfq_requests.status`: `new`, `quoted`, `won`, `lost`
- `rfq_requests.source`: `web`, `portal`
- `documents.doc_type`: `tds`, `msds`, `certificate`, `brochure`

## ERP-ready fields

`orders.erp_ref`, `invoices.erp_ref`, and `deliveries.erp_ref` are reserved for
future idempotent ERP import and sync contracts.

## i18n

Target model uses Directus Translations for text-bearing content in `vi`, `en`, and
`ja`. Frontend consumes localized content via `next-intl`. Bootstrap currently does
not create translation configs automatically, so enabling them in Directus remains a
manual setup step.
