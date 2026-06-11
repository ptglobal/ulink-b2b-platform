# GUIDE-01 — CMS Admin Guide

**Status:** Baseline (screenshots added at handover) · **Audience:** Editor, Sales, Admin

How to run ULink's content and RFQ/order operations in **Directus** (`https://cms.ulink…`).

## Sign in
Open the CMS URL → log in. Your role (Editor / Sales / Admin) determines what you see.

## Content (Editor/Admin)
| Task | Where |
|---|---|
| Hero banners, partners | `hero_banners`, `partners` |
| Product categories / products / SKUs | `product_categories`, `products`, `product_skus` |
| Upload TDS/MSDS | `documents` (set `doc_type`, link product) |
| Regional hubs | `regional_hubs` |
| Blog, case studies, ISO certs, downloads | respective collections |
| Pages (About, etc.) | `pages` |
| Media (images/files) | File Library + media retention workflow |
| SEO | `meta_*` fields on each item |

Rules:
- Upload only approved file types.
- Store media in module folder under `media/`.
- Do not upload user-supplied SVG unless sanitized or explicitly approved as a brand asset.
- Use soft delete for removal requests; hard delete happens later via cleanup or admin confirm flow.
- Do not delete media still referenced by content.

**Publish/Unpublish:** set **Status** = `published` to show, `draft`/`archived` to hide.
Publishing updates the website automatically (revalidation).

**Multi-language (VI/EN/JP):** use the **Translations** tab on an item; fill each
language. VI is required; EN/JP per the content policy.

## RFQ & Orders (Sales/Admin)
| Task | Where |
|---|---|
| View/triage incoming RFQs | `rfq_requests` (status `new` → `quoted`/`won`/`lost`; assign to a salesperson) |
| Manage customers | `customers` |
| Create/update orders | `orders` + `order_items` |
| Record invoices / debt (công nợ) | `invoices` (amount, due date, paid status) |
| Schedule deliveries | `deliveries` |

Customers see only their own orders/invoices/deliveries in the portal.

## Users & roles (Admin)
Create users, assign roles (Admin/Editor/Sales/Customer) under **Settings → Roles &
Permissions**. Keep least privilege; rotate passwords.

## Tips
- Always set Status; unpublished = hidden.
- Add alt text to images (accessibility + SEO).
- Don't delete media still referenced by content.
