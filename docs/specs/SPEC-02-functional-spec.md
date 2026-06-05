# SPEC-02 — Functional Specification

**Status:** Baseline · **Owner:** BA · **Related:** [SPEC-01 SRS](SPEC-01-software-requirements.md), [SPEC-03 Data Model](SPEC-03-data-model.md)

Module-by-module behaviour. Each module lists actors, primary flows, business
rules, and acceptance. Field-level detail is in SPEC-03; API in SPEC-04.

---

## 1. Homepage
**Actors:** Visitor.
**Sections:** Hero (banner + CTA), Core Solutions, Industry Solutions, Strategic
Partners, Case Studies, Resource Center teaser, Quick RFQ CTA, trust signals.
**Rules:** All sections CMS-driven and orderable; only `published` items render.
**Acceptance:** Renders within performance budget (NFR-01); CTA routes to Quick Order.

## 2. Regional Hubs
**Actors:** Visitor.
**Flows:** Hub index → hub detail. Detail shows **Delivery SLA, Warehouse Capacity,
Technical Team, Cluster Overview**, location/coords, gallery.
**Data:** `regional_hubs` — Dong Van 4, Bac Thang Long, Bac Ninh, Hung Yen, Hai Phong.
**Acceptance:** All 5 hubs display accurate data (acceptance criterion).

## 3. Solutions / Products
**Actors:** Visitor.
**Flows:**
1. Category browse — Cleanroom (Gloves, Wipers, Adhesive Tapes, Anti-static) and
   Packaging (PE/OPP Bags, Shrink Film, Thermal Insulation, Auxiliary).
2. **SKU search** — type-ahead/keyword; resolves via cached `/api/sku` (<50ms hit).
3. **Product detail** — Technical Specifications, **Download TDS/MSDS**, **Request
   Sample**, **Add to RFQ Cart**.
**Rules:** Unpublished products are hidden; TDS/MSDS are gated by `status`.
**Acceptance:** SKU search returns correct SKU; cache hit <50ms; TDS/MSDS downloads.

## 4. Industry Solutions
**Actors:** Visitor.
**Flow:** Filter products/solutions by **Electronics, Pharmaceutical, Cosmetics,
Food & Beverage**. Industry pages cross-link related products.

## 5. Resource Center
**Actors:** Visitor.
**Content:** Technical Documents, ISO Certifications, Case Studies, Blog & News,
Download Center (filterable by type/lang). All CMS-managed.

## 6. Quick Order / RFQ
**Actors:** Visitor, Customer.
**Flows:**
1. **SKU Input** — add by code (validated against `/api/sku`).
2. **Bulk Quantity Upload** — paste/CSV of `sku,qty` rows.
3. **RFQ Cart** — review line items, quantities.
4. **Submit Request** — contact + company + lines → `rfq_requests` (status `new`),
   anti-spam enforced; confirmation shown.
**Rules:** "Add to Cart" = add to **RFQ** cart (no checkout/payment). Submission
routes to Sales.
**Acceptance:** No Critical Bug in this path (NFR-10); submission persists & notifies.

## 7. B2B Portal *(authenticated)*
**Actors:** Customer, Sales/Admin (manage side).
**Data source:** CMS-managed (ADR-0003); ERP sync is future.
| Feature | Behaviour | Data |
|---|---|---|
| Login / Register | Directus auth; customer linked to `customers` | `directus_users`, `customers` |
| Dashboard | Summary of orders, outstanding debt, upcoming deliveries | aggregates |
| Order History | List + detail of **own** orders (row-level) | `orders`, `order_items` |
| Scheduled Delivery | Upcoming/late deliveries for own orders | `deliveries` |
| Debt / Công nợ | Invoices, balances, due dates | `invoices` |
| Re-order | Clone a past order's lines into a new RFQ cart | derived |
**Rules:** A Customer sees only their own records (filter `customer.user = $CURRENT_USER`).
Sales/Admin manage all records via CMS.

## 8. CMS Management *(17 modules)*
**Actors:** Editor, Sales, Admin.
CRUD for: Hero Banner, Strategic Partners, Product Category, Product SKU, Product
Detail, TDS/MSDS upload, Regional Hubs, Blog & News, ISO Certifications, Download
Center, SEO Metadata, Media Library, User & Permission, RFQ Request, Multi-language
VI/EN/JP, Publish/Unpublish, User Roles. Most are native Directus features
(SPEC-03 / SCHEMA.md).

## 9. About ULink
**Actors:** Visitor.
Pages: Company Overview, Core Competencies, Sustainability, Careers, **Contact**
(form with anti-spam → `contact_messages`/lead).

---

## Cross-cutting rules
- **i18n:** every public page available in VI/EN/JP; locale in URL; hreflang set.
- **Publish state:** only `published` content is public.
- **SEO:** each page exposes CMS-driven metadata + JSON-LD (SPEC-08).
- **Errors:** user-friendly empty/error states; never expose stack traces.
