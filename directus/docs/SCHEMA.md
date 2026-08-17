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
- Text-bearing collections use Directus Translations for `vi`, `en`, and `ja`.
  Bootstrap provisions the `languages` collection plus hidden `<collection>_translations`
  collections for the content model. `vi` is the fallback locale and is always first.

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
| `product_skus` | `sku_code`, `product`, `unit`, `pack_size`, `attributes`, `status` | SKU layer, Redis-backed lookup for `/api/sku`; `sku_code` is canonical lowercased text and the DB enforces case-insensitive uniqueness on `lower(btrim(sku_code))` |
| `documents` | `title`, `doc_type`, `product`, `file`, `language`, `status` | TDS, MSDS, certificate, brochure |
| `regional_hubs` | `hub_code`, `name`, `slug`, `province`, `detail_address`, `operating_status`, `coordinates`, `warehouse_total_area`, `warehouse_utilized_area`, `warehouse_available_area`, `warehouse_storage_tons`, `warehouse_pallets`, `standard_delivery_time`, `on_time_rate`, `on_time_rate_delta`, `orders_today`, `order_capacity_per_day`, `avg_delivery_time`, `person_in_charge_name`, `person_in_charge_title`, `person_in_charge_phone`, `current_personnel_count`, `status` | Hub management with warehouse, SLA, and team sections |
| `industries` | `name`, `slug`, `description`, `icon`, `status` | Industry taxonomy |
| `blog_posts` | `title`, `slug`, `body`, `cover`, `author`, `published_at`, `status`, `meta_title`, `meta_description` | Blog/news |
| `case_studies` | `title`, `slug`, `summary`, `body`, `industry`, `cover`, `status` | Resource center content |
| `iso_certifications` | `name`, `number`, `issuer`, `valid_until`, `file`, `status` | ISO certificates |
| `pages` | `title`, `slug`, `body`, `content`, `status`, `meta_title`, `meta_description` | Static pages plus structured Carbon modules |

SEO defaults live in singleton `site_settings`. Current bootstrap only adds
`meta_title` and `meta_description` on content collections; `og_image` exists on
`site_settings`, not on every collection.

## Singleton collections

| Collection | Current bootstrap fields | Notes |
|---|---|---|
| `site_settings` | `logo`, `contact_email`, `contact_phone`, `address`, `meta_title`, `meta_description`, `og_image` | Global contact and default SEO |
| `homepage` | `title`, `hero_section`, `content` | Homepage layout singleton; localized structured modules and unique media roles |

## Hub child collections

| Collection | Fields | Purpose |
|---|---|---|
| `hub_industrial_zones` | `name`, `hub` (m2o → `regional_hubs`), `image` | Industrial zones / parks served by a hub |
| `hub_team_members` | `name`, `role`, `years_experience`, `photo`, `hub` (m2o → `regional_hubs`), `sort` | Technical team members at a hub |

## Hidden junction collections

| Collection | Fields | Purpose |
|---|---|---|
| `products_industries` | `products_id`, `industries_id` | Product to industry m2m |
| `products_files` | `products_id`, `directus_files_id` | Product gallery m2m |

## B2B portal collections

| Collection | Current bootstrap fields | Purpose |
|---|---|---|
| `customers` | `status`, `user`, `erp_ref`, `company_name`, `tax_code`, `contact_name`, `email`, `phone`, `address`, `sales_owner`, `consented_at` | Auth mapping, account scoping, and registration consent timestamp |
| `orders` | `status`, `code`, `customer`, `order_date`, `hub`, `subtotal`, `tax`, `total`, `notes`, `erp_ref` | Order history |
| `order_items` | `order`, `sku`, `description`, `qty`, `unit_price`, `line_total` | Order lines |
| `invoices` | `code`, `customer`, `order`, `issue_date`, `due_date`, `amount`, `paid_amount`, `balance`, `paid_status`, `erp_ref` | Accounts receivable / debt |
| `deliveries` | `order`, `hub`, `scheduled_date`, `delivered_date`, `status`, `tracking_ref`, `erp_ref` | Scheduled and delivered shipments |
| `rfq_requests` | `company`, `contact_name`, `email`, `phone`, `industry`, `hub`, `line_items`, `message`, `status`, `assigned_sales`, `source`, `user` | RFQ intake and triage |
| `rfq_assignment_rules` | `hub`, `industry`, `assigned_sales`, `priority`, `is_default` | Editable RFQ routing rules used by the internal notifier |
| `contact_requests` | `full_name`, `email`, `phone`, `subject`, `message`, `status`, `created_at` | Public contact form submissions from `/contact` and `/about` |

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
| `rfq_assignment_rules.hub` | m2o | `regional_hubs` | Routing hub rule |
| `rfq_assignment_rules.industry` | m2o | `industries` | Routing industry rule |
| `rfq_assignment_rules.assigned_sales` | m2o | `directus_users` | Sales assignee / inbox owner |
| `contact_requests` | none | none | stored by the app server via `/api/contact` |
| `products_industries.products_id` | m2o | `products` | Product side of m2m |
| `products_industries.industries_id` | m2o | `industries` | Industry side of m2m |
| `products_files.products_id` | m2o | `products` | Product side of gallery m2m |
| `products_files.directus_files_id` | m2o | `directus_files` | File side of gallery m2m |
| `hub_industrial_zones.hub` | m2o | `regional_hubs` | Industrial zone belongs to hub |
| `hub_industrial_zones.image` | m2o | `directus_files` | Zone image file |
| `hub_team_members.hub` | m2o | `regional_hubs` | Team member belongs to hub |
| `hub_team_members.photo` | m2o | `directus_files` | Team member photo |

## Roles and access

| Role | Current bootstrap access |
|---|---|
| **Admin** | Full Directus admin access |
| **Editor** | CRUD on all content collections, singletons `site_settings`, `homepage`, `hub_industrial_zones`, `hub_team_members` |
| **Sales** | Read all content and singletons; full CRUD on `customers`, `orders`, `order_items`, `invoices`, `deliveries`, `rfq_requests`, `rfq_assignment_rules`; read/update `contact_requests.status`; read `hub_industrial_zones`, `hub_team_members` |
| **Customer** | Read published content; read singletons; read/update own `customers`; read own `orders`, `order_items`, `invoices`, `deliveries`; read own `rfq_requests`; read `hub_industrial_zones`, `hub_team_members` |

Visitor/public users may read published content directly from Directus. RFQ submission for visitors and customers goes through `POST /api/rfq`; Directus visitor/customer roles do not create `rfq_requests` directly. Exact duplicate RFQ payloads reuse the first `rfq_requests` id instead of inserting a second row.
Public contact submission is application-mediated: `POST /api/contact` writes with the frontend service token; visitor/customer roles do not create `contact_requests` directly.

Customer onboarding contract:
- Self-register creates `directus_users` active and `customers` active.
- The onboarding request now requires terms consent (`agree`, `agree_at`) and
  an OTP-backed `verified_token` for the same email.
- The `customers.consented_at` field stores the consent timestamp from the
  registration request.
- Sales invite links an existing or pre-created customer row and activates it.
- Customers can edit `contact_name`, `phone`, and `address` only.
- `erp_ref`, `company_name`, `tax_code`, and `sales_owner` are Sales/Admin-managed after approval.

Customer row-level filters in bootstrap:
- `customers`: `{ user: { _eq: "$CURRENT_USER" } }`
- `orders`: `{ customer: { user: { _eq: "$CURRENT_USER" } } }`
- `order_items`: `{ order: { customer: { user: { _eq: "$CURRENT_USER" } } } }`
- `invoices`: `{ customer: { user: { _eq: "$CURRENT_USER" } } }`
- `deliveries`: `{ order: { customer: { user: { _eq: "$CURRENT_USER" } } } }`
- `rfq_requests`: read own via `{ user: { _eq: "$CURRENT_USER" } }`
- `rfq_assignment_rules`: Sales/Admin manage routing rules; visitor/customer cannot read or write them

## Enums and status values

- Content status: `published`, `draft`, `archived`
- `customers.status`: `active`, `inactive`
- `orders.status`: `pending`, `confirmed`, `processing`, `shipped`, `completed`, `cancelled`
- `invoices.paid_status`: `unpaid`, `partial`, `paid`, `overdue`
- `deliveries.status`: `scheduled`, `in_transit`, `delivered`, `late`, `cancelled`
- `rfq_requests.status`: `new`, `quoted`, `won`, `lost`
- `rfq_requests.source`: `web`, `portal`
- `rfq_assignment_rules.is_default`: boolean fallback rule marker
- `documents.doc_type`: `tds`, `msds`, `certificate`, `brochure`
- `regional_hubs.operating_status`: `active`, `stopped`, `maintenance`, `full`, `temporarily_closed`

## ERP-ready fields

`customers.erp_ref`, `orders.erp_ref`, `invoices.erp_ref`, and `deliveries.erp_ref`
are reserved for idempotent ERP import and sync contracts.

Commercial import matching prefers `customers.erp_ref` first, then falls back to
`tax_code`, then `email`. The bootstrap migration enforces case-insensitive
uniqueness on normalized `lower(btrim(...))` values for all three customer keys.

## ERP outbox

`integration_events` stores meaningful order, invoice, and delivery changes as a
durable outbox row before the scheduled worker attempts delivery to ERP.

Fields:
- `entity`: `orders`, `invoices`, `deliveries`
- `op`: `create`, `update`
- `record_id`: source record id as string
- `erp_ref`: nullable ERP reference
- `revision`: source revision marker used for idempotency fallback
- `idempotency_key`: unique key used by the worker and ERP envelope
- `payload`: full JSON snapshot plus change metadata
- `status`: `pending`, `sent`, `failed`
- `attempts`: retry count
- `next_attempt_at`: next scheduled retry time
- `last_attempt_at`: last worker attempt time
- `last_status_code`: last HTTP status returned by ERP
- `last_error`: last error message
- `destination_url`: ERP target URL used for the attempt

`failed_erp_webhooks` is a reporting view over `integration_events` where
`status = 'failed'`.

Indexes for portal query paths are maintained as SQL migrations under `directus/sql/migrations/`.
They are automatically applied at the end of the Directus bootstrap script (`bootstrap.mjs`).

SKU contract:
- `product_skus.sku_code` is stored and queried in lowercase after `.trim().toLowerCase()`.
- The database enforces uniqueness on `lower(btrim(sku_code))` so cache keys and Directus rows cannot diverge by case.

## i18n

Target model uses Directus Translations for text-bearing content in `vi`, `en`, and
`ja`. Directus bootstrap now creates the `languages` collection, seeds `vi` first,
and provisions translation-enabled collections for the content model. Frontend
consumes localized content via `next-intl`. Missing translations fall back to `vi`.

## Media and storage

Media uploads are stored locally under `directus/uploads`.

Upload policy:
- Allowed extensions: `jpg`, `jpeg`, `png`, `webp`, `svg`, `pdf`, `docx`, `xlsx`
- Global max upload size: `10MB`
- SVG max size: `2MB`
- SVG uploads are restricted to trusted internal folders and trusted roles

Folder convention:
- Root folder: `media`
- Module folders: `products`, `documents`, `pages`, `partners`, `regional-hubs`, `site-settings`, `trash`
- Naming convention for stored files: `collection-id-uuid.ext`

Retention collections:
- `media_retention`
- `media_audit_events`

Retention workflow:
- Soft delete first
- Hard delete after `7` days
- Daily cleanup job runs at `12:00`
- Orphan files use a `24h` grace period before cleanup
- Audit log stores actor, timestamp, action, file id, filename, size, mime type, module, reason, source, IP, and user agent
