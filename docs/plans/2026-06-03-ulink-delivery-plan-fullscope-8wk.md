# ULink Industries — B2B Procurement Platform
## Delivery & Execution Plan — Full Scope, 8 Weeks (v1.2, EN)

| | |
|---|---|
| **Document** | Delivery & Execution Plan — Full Contract Scope |
| **Project** | ULink Industries – B2B Industrial Procurement Platform |
| **Version** | 1.2 (full scope · 8 weeks · Directus-only · English) |
| **Date** | 2026-06-03 |
| **Basis** | PRD & SOW v1.0 (12/05/2026) + Contract Appendix / Phụ lục (signed 18/05/2026) |
| **Contract value** | 52,774,000 VNĐ (fixed, lump-sum) |
| **Timeline** | **8 weeks** (indicative kickoff Mon 09 Jun 2026 → go-live ~01 Aug 2026) |
| **Team** | 1 Business Analyst · 2 Developers · 1 Tester |

> **Changelog.** Alternatives considered and *not* chosen: (a) **MVP-first 6-week** (B2B Portal deferred to a paid Phase 2) — rejected; client wants all contract features in scope. (b) **6-week full scope** — rejected as too dense (Portal + Quick Order + i18n + performance all collided in one week). (c) **NestJS + Directus dual backend** — rejected as a redundant double backend for this build. **This v1.2 is the plan of record:** full scope, 8 weeks, **Directus-only** (NestJS deferred to the future ERP/Integration phase).

---

## 0. The one-paragraph version

We deliver the **entire contracted feature set** — marketing site, Regional Hubs, Product Directory with SKU search, Industry Solutions, Resource Center, Quick Order/RFQ, the full B2B Portal (login, dashboard, order history, scheduled delivery, debt/công nợ management, re-order), the complete 17-module CMS, and tri-lingual VI/EN/JP — in **8 weeks** at the agreed **52.7M VNĐ**. "Cheap" is achieved through **leverage, not corner-cutting**: a headless CMS (**Directus**) supplies the admin panel, REST/GraphQL API, authentication, role-based access, row-level data security, i18n, and media library out of the box, so the back office for orders/debt/delivery/customers is *configuration, not code*. The portal's order/debt/delivery data is **managed in the system's own database now**; live ERP synchronization is the PRD's separate future "Integration" phase (§3). Two developers run as **parallel tracks** to cover the full scope, and the 8-week length adds a dedicated i18n/performance/QA week and a real UAT/go-live week with buffer.

---

## 1. Strategic framing — aligning with the asset's value

The upfront fee (≈ **52.7M VNĐ ≈ $2,080**) is small for this scope. Two clauses in the Appendix (§1.4) explain why that is rational and dictate the architecture:

1. **Co-ownership + 10% royalty** — Bên A co-owns the source/design and earns 10% of post-tax software revenue on every future deployment Bên B sells to third parties.
2. **12M VNĐ/year/site maintenance** — recurring revenue per deployed site.

**Implication:** the value is *recurring and multiplied across deployments*, not the one-off build. The correct engineering posture is therefore **"build once, redeploy cheaply N times."** Every choice below — headless CMS, Docker-Compose packaging, environment-driven config, seedable demo content, design tokens, and the ERP-ready interface (§5) — lowers the marginal cost of deployment #2…#N toward zero. That is what makes the thin upfront fee a deliberate **loss-leader** rather than a loss, and what makes the project *aligned with its value*.

---

## 2. Scope — all contract features (every item IN)

| Group | Module | Week |
|---|---|---|
| **Marketing** | Homepage (Hero, Core Solutions, Industry Solutions, Strategic Partners, Case Studies, Resource Center teaser, Quick RFQ CTA, Trust signals, Quick support) | 1 |
| | About ULink (Company Overview, Core Competencies, Sustainability, Careers, Contact) | 2 |
| **Regional Hubs** | Dong Van 4 (Delivery SLA, Warehouse Capacity, Technical Team, Cluster Overview) + Bac Thang Long, Bac Ninh, Hung Yen, Hai Phong | 2 |
| **Products** | Category tree, Listing, **SKU search**, Detail (Technical Specs, TDS/MSDS download, Request Sample, Add to RFQ Cart); Cleanroom (Gloves/Wipers/Adhesive Tapes/Anti-static) + Packaging (PE-OPP Bags/Shrink Film/Thermal Insulation/Auxiliary) | 3 |
| **Industry** | Electronics, Pharmaceutical, Cosmetics, Food & Beverage (filters) | 4 |
| **Resource** | Technical Documents, ISO Certifications, Case Studies, Blog & News, Download Center | 4 |
| **Quick Order** | SKU Input, Bulk Quantity Upload, RFQ Cart, Submit Request (cached SKU lookup <50ms) | 3 cart → 6 |
| **B2B Portal** | Login/Register, Dashboard, **Order History**, **Scheduled Delivery**, **Debt/Công nợ Management**, **Re-order** | 2 → 6 (data via CMS — §3, §5) |
| **CMS (17 modules)** | Hero Banner, Strategic Partners, Product Category, Product SKU, Product Detail, TDS/MSDS upload, Regional Hubs, Blog & News, ISO Certifications, Download Center, SEO Metadata, Media Library, User & Permission, RFQ Request, Multi-language VI/EN/JP, Publish/Unpublish, User Roles | 1 → 5 (mostly native Directus — §5) |
| **Non-functional** | PageSpeed ≥90 desktop, Core Web Vitals, Responsive D/T/M, HTTPS, Anti-spam, RBAC, VI/EN/JP, Quick Order <50ms | §11, §12 |

---

## 3. ⭐ Load-bearing assumption (read first)

> **"All portal features complete"** means: Order History, Debt/Công nợ Management, Scheduled Delivery, and Re-order are built **fully functional**, with their data **managed directly in the system (Directus / PostgreSQL)** — entered/maintained in the CMS by Sales/Admin, or imported via CSV.
>
> **Real-time ERP/CRM synchronization is the future "Integration" phase** (exactly where the PRD roadmap places it). Within these 8 weeks we additionally build an **ERP-sync-ready interface** (§5) so a future ERP plugs in cheaply — but we do **not** sync a live ERP (none exists yet).
>
> ✅ Features ship **complete and demoable** now.
> ⚠️ **Confirm with ULink at kickoff.** If ULink requires live ERP synchronization inside these 8 weeks, that needs an ERP system + credentials that do not exist today, and a separate appendix per §3.3.

This is the only interpretation under which "all features in 8 weeks" is both **feasible** and **honest**, and it matches the PRD roadmap (MVP → Scale-up → Integration).

---

## 4. Technical architecture

### 4.1 Stack (Directus-only)

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | **Next.js 14+ (App Router)** | SSR/ISR for SEO + performance |
| **UI** | **Tailwind CSS + Shadcn/UI** | "Japanese Industrial Minimalism" via design tokens; *is* the Design System deliverable |
| **Backend / Admin / API** | **Directus** (on PostgreSQL) | Admin UI + REST + GraphQL + **Auth** + RBAC + **row-level permissions** + i18n + Media Library out of the box |
| **Custom API** | **Next.js Route Handlers** | `/api/sku` (Redis-backed, <50ms), `/api/rfq` (anti-spam) — no separate NestJS app needed |
| **Database** | **PostgreSQL** | Relational product/SKU/order/AR data; scalable |
| **Cache** | **Redis** | SKU index + Quick Order <50ms + response cache |
| **Media / object storage** | Local volume or S3-compatible (Cloudflare R2) | TDS/MSDS PDFs, images |
| **Infra** | **Vercel** (frontend) + **single VPS w/ Docker Compose** (Directus+Postgres+Redis) behind Caddy/Nginx (Let's Encrypt HTTPS) | Cheapest robust topology; CI/CD; edge CDN |
| **Anti-spam** | Cloudflare Turnstile (free) + honeypot + rate-limit | RFQ/Contact forms |
| *(Future)* | **NestJS** | BFF / ERP-sync layer at the Integration phase — **not** in these 8 weeks |

### 4.2 Topology & data flow

```
                 ┌──────────────────────────────────────────────┐
  Visitor   ──▶  │  Vercel Edge/CDN  ──  Next.js 14 (App Router) │
                 │   • SSG/ISR marketing & product pages          │
                 │   • Portal screens (auth via Directus)         │
                 │   • /api/sku/[code]  (Redis-backed, <50ms)     │
                 └───────────┬───────────────────────┬───────────┘
                             │ REST/GraphQL           │ Redis
                             ▼                         ▼
                 ┌──────────────────────┐     ┌───────────────┐
                 │  Directus (VPS,      │◀────│  Redis cache  │
                 │  Docker Compose)     │     │  SKU index,   │
                 │  Admin+API+Auth+RBAC │     │  resp. cache  │
                 └──────────┬───────────┘     └───────────────┘
                            ▼
                 ┌──────────────────────┐     ┌────────────────────────┐
                 │  PostgreSQL (Docker) │◀────│  ERP-ready interface   │
                 └──────────────────────┘     │  (REST + CSV import +  │
  Editors/Sales ─▶ Directus Admin (same)      │   webhook) — future    │
                            └─ publish ──▶ webhook → Next.js revalidate │   ERP plugs in here    │
                                                     + Redis prime      └────────────────────────┘
```

**Content publish loop:** an editor publishes in Directus → a Directus Flow fires a webhook → Next.js `revalidateTag` (ISR) + Redis SKU cache prime. Visitors always hit static/edge-cached HTML; SKU lookups hit warm Redis.

---

## 5. Data model (Directus collections)

**Many of the 17 CMS modules are native Directus features** (zero build): Media Library (Files), User & Permission + Roles (Admin/Editor/Sales/Customer), Publish/Unpublish (`status`), Multi-language (Translations), RFQ admin. The rest are collections.

**Content collections:** `hero_banners`, `partners`, `product_categories` (self-relation for Cleanroom/Packaging tree, SEO fields), `products`, `product_skus` (Redis-indexed), `documents` (doc_type TDS/MSDS/cert/brochure — also feeds Download Center), `regional_hubs`, `industries`, `blog_posts`, `case_studies`, `iso_certifications`, `pages` + `homepage`/`site_settings` singletons. SEO metadata = `meta_*` fields on each collection + default in `site_settings`.

**B2B Portal collections (the data source — §3):**

| Collection | Key fields | Serves |
|---|---|---|
| `customers` | links `directus_users`, company, tax_code, contacts | Auth + scoping |
| `orders` / `order_items` | code, customer→, order_date, status, hub→, total / sku→, qty, unit_price | **Order History** |
| `invoices` | customer→, order→, amount, due_date, paid_status, balance | **Debt / Công nợ** |
| `deliveries` | order→, scheduled_date, status, hub→ | **Scheduled Delivery** |
| `rfq_requests` | company, contact, email, phone, industry, hub→, line_items, status[new/quoted/won/lost], assigned_sales→ | **RFQ management** |
| *(action)* Re-order | clone past `order_items` → RFQ Cart / new order | **Re-order** |

- **Row-level security:** Directus permission filter `customer.user._eq: $CURRENT_USER` → each Customer sees only their own orders/invoices/deliveries. Admin/Sales manage everything via the **auto-generated admin UI** (no back-office build).
- **ERP-ready interface (Week 6):** a standardized REST endpoint set + CSV import schema + webhook contract for `orders`/`invoices`/`deliveries`, so the future Integration phase syncs an ERP without touching core.

### 5.1 Roles & permissions

| Role | Capability |
|---|---|
| **Admin** | Everything: all collections, users, roles, settings, SEO, publish |
| **Editor** | CRUD content + publish/unpublish; no user/role admin |
| **Sales** | Read content; full CRUD on `rfq_requests`, `orders`, `invoices`, `deliveries`; manage customer records |
| **Customer** | Authenticated portal; **row-level** access to own orders/invoices/deliveries/re-order |

---

## 6. Information architecture → Next.js routes

`[lang]` ∈ {vi, en, ja}; default `vi`.

```
/[lang]                              Home
/[lang]/regional-hubs[/[slug]]       Hubs (Dong Van 4 / Bac Thang Long / Bac Ninh / Hung Yen / Hai Phong)
/[lang]/solutions[/[category]]       Cleanroom / Packaging (+ sub-categories)
/[lang]/products/[slug]              Product Detail (specs, TDS/MSDS, sample, RFQ)
/[lang]/industries/[slug]            Electronics / Pharmaceutical / Cosmetics / Food & Beverage
/[lang]/resources/...                documents · certifications · case-studies · blog · downloads
/[lang]/quick-order                  SKU input · bulk upload · RFQ cart · submit
/[lang]/portal/...                   login · dashboard · orders · deliveries · debt · re-order  (auth)
/[lang]/about                        Company · Competencies · Sustainability · Careers · Contact
/api/sku/[code]                      Redis-backed SKU lookup (<50ms)
/api/rfq                             RFQ submit (anti-spam → Directus)
/sitemap.xml /robots.txt             SEO
```

Rendering: **SSG/ISR** for content (revalidate-on-publish); **client/SSR** for portal, cart, filters, forms, language switch.

---

## 7. Team & two-track model

The parallel-track split is what lets **2 developers** cover the full scope with minimal cross-blocking.

| Role | Responsibility |
|---|---|
| **BA (1)** | Function list, user stories, backlog; clarify each module; coordinate UAT; consolidate Change Requests |
| **Dev A — "Site & Content"** | Frontend marketing/site (Home, About, Hubs, Products, Industry, Resource); **i18n content**; **SEO & Performance** |
| **Dev B — "Platform & Commerce"** | Directus modeling + roles/permissions; **Auth & B2B Portal**; **RFQ / Quick Order**; `/api/sku` (<50ms), `/api/rfq`; customer/order/debt admin; **ERP-ready interface** |
| **Tester (1)** | Test Strategy; functional testing each sprint; Responsive + Cross-browser (**Safari**); Performance/SEO verification (Lighthouse); regression; sign-off |

---

## 8. Eight-week schedule (swimlane)

> Each week ends with a **staging URL the client can click** (operator-green: code + green tests ≠ done; a human must open the URL and see it work).

### Week 1 (09–13 Jun) — Foundation, Design System, Homepage *(+ i18n infra, SEO baseline)*
- **BA:** Function list, user stories, backlog; confirm scope/priorities.
- **Dev A:** App shell; Header/Footer/Navigation; **Homepage**; Tailwind+Shadcn design tokens (Japanese Industrial Minimalism); **i18n scaffold (vi/en/ja)**; **SEO/perf baseline** (next/image, metadata, sitemap skeleton).
- **Dev B:** Docker Compose **Directus + PostgreSQL + Redis**; CI/CD + Staging; **model ALL collections** (incl. portal: customers/orders/invoices/deliveries); roles + **row-level permissions**; native Auth.
- **Test:** Test Strategy; Test Case template; Bug Tracking Process.
- **ULink:** Initial requirements, brand assets, scope confirmation; **start providing content**; **confirm §3 (ERP-later)**.

### Week 2 (16–20 Jun) — About ULink & Regional Hubs *(+ Portal Auth/shell)*
- **BA:** Clarify About, Hubs, and the **Portal flow**.
- **Dev A:** Company Overview, Core Competencies, Sustainability, Careers, Contact; **Regional Hubs** (Dong Van 4 + Bac Thang Long, Bac Ninh, Hung Yen, Hai Phong).
- **Dev B:** **Customer Auth** (Login/Register); **Portal shell + Dashboard scaffold**; seed sample orders/invoices/deliveries.
- **Test:** Functional Testing Sprint 1; **Responsive + Cross-browser (Safari)**.
- **ULink:** Hub + About content; confirm Portal flow.

### Week 3 (23–27 Jun) — Solutions & Product Catalog *(+ RFQ Cart, SKU API)*
- **BA:** User stories — Product Listing, Detail, Request Sample, RFQ, Download Documents.
- **Dev A:** Product Category; **Listing** + **SKU search**; **Detail** (Specs, **TDS/MSDS**, Request Sample, **Add to RFQ Cart**).
- **Dev B:** **RFQ Cart + Submit** → `rfq_requests`; **`/api/sku` Redis <50ms**; `/api/rfq` anti-spam.
- **Test:** Test cases — Product Catalog, Download, RFQ.
- **ULink:** Product / SKU / TDS-MSDS data.

### Week 4 (30 Jun–04 Jul) — Industry Solutions & Resource Center *(+ Order History, Delivery)*
- **BA:** Clarify Industry, Resource Center.
- **Dev A:** **Industry Solutions** (Electronics/Pharma/Cosmetics/Food); **Resource Center** (Technical Docs, ISO Certifications, Case Studies, Blog & News, Download Center).
- **Dev B:** **Order History** + **Scheduled Delivery** (portal frontend); content CMS.
- **Test:** Test cases — Industry, Resource Center, Order History.
- **ULink:** Resource Center content, certs, blog.

### Week 5 (07–11 Jul) — Full CMS & SEO technical *(+ Debt, Re-order)*
- **BA:** Review admin CMS; clarify debt/AR rules.
- **Dev A:** **SEO technical** (schema markup, sitemap, robots, hreflang, CMS-driven metadata, URL structure).
- **Dev B:** Finalize **CMS** (customer/order/debt/delivery/RFQ management); **Debt/Công nợ** + **Re-order** (portal).
- **Test:** Test cases — CMS, Debt, Delivery, Re-order.
- **ULink:** Confirm debt/delivery business rules + sample customer data.

### Week 6 (14–18 Jul) — Quick Order & Portal polish *(+ ERP-ready interface)*
- **BA:** Clarify Quick Order, Re-order; integration-interface requirements.
- **Dev A:** Portal frontend polish; begin preparing i18n content.
- **Dev B:** **Quick Order** (SKU Input, **Bulk Quantity Upload**, RFQ Cart, Submit); **ERP-sync-ready interface** (§5).
- **Test:** Test cases — Quick Order, Re-order, import interface.
- **ULink:** **Confirm ERP status**; Quick Order rules.

### Week 7 (21–25 Jul) — i18n content, Performance, QA *(+ UAT round 1)*
- **BA:** Prepare UAT scenarios; coordinate UAT round 1.
- **Dev A:** **i18n content VI/EN/JP** (VI full · EN full · JP key pages); **Performance hardening → PageSpeed ≥90 + CWV**; Responsive/Safari fixes.
- **Dev B:** Support fixes; stabilize Portal/Quick Order data; draft API docs.
- **Test:** **Full regression**; **verify Lighthouse (PageSpeed/CWV) + SEO**; **internal UAT dry-run**.
- **ULink:** **UAT round 1**, issue/feedback.

### Week 8 (28 Jul–01 Aug) — UAT, Finalization & Go-live
- **BA:** Consolidate Change Requests; track bug-fixing & final acceptance; prepare handover docs.
- **Dev A:** Bug-fix + final performance tuning; finalize SEO; **User Guide**.
- **Dev B:** **Production deploy**; **Domain, SSL, Analytics**; backups; **API Documentation** + **Deployment Guide & Technical Handover**.
- **Test:** Consolidate test cases; regression; retest fixed bugs; **sign-off**.
- **ULink:** Final UAT; confirm fixes; review User Guide/Release Note/Handover; **open the production URL and verify**; confirm **go-live & acceptance** (operator-green).

---

## 9. i18n VI / EN / JP

Full VI/EN/JP infrastructure + routing + hreflang from Week 1. Content at go-live: **VI 100% · EN 100%** of primary/structural pages · **JP** homepage/hubs/key product pages + structure (remaining JP filled via CMS afterward, by client or a small paid content pass). Confirm the JP translation source at kickoff.

## 10. SEO technical setup

- Clean, slug-based, locale-prefixed URLs; canonical + `hreflang` for vi/en/ja.
- JSON-LD: `Organization`, `Product` (+ RFQ offer), `BreadcrumbList`, `Article`.
- CMS-driven `title`/`description`/`og:image`; auto `sitemap.xml` (all locales) + `robots.txt`.
- Performance feeds Core Web Vitals (baked in from Week 1).
- Deliverable: SEO Technical Setup & Schema doc + verified indexable structure.

## 11. Non-functional requirements — how each is met & measured

| NFR | How | Evidence |
|---|---|---|
| **PageSpeed ≥90 desktop** | SSG/ISR, `next/image`, font optimization, Tailwind purge, code-split, minimal 3rd-party JS, edge CDN | Lighthouse CI report |
| **Core Web Vitals** | Stable layouts (no CLS), preloaded LCP image, deferred JS | PageSpeed report |
| **Responsive D/T/M** | Tailwind breakpoints, mobile-first | Device QA matrix |
| **Quick Order < 50ms** | Redis SKU index; `/api/sku/[code]` reads Redis (origin only on miss); pre-warmed on publish. *Scope: cached single-SKU lookup latency (the spec's "Quick Order response").* Page loads and RFQ submission (network + DB write + anti-spam) are not 50ms and were never intended to be — stated explicitly in the UAT checklist | Timed endpoint log / k6 sample |
| **HTTPS** | Let's Encrypt (Caddy/Nginx) + Vercel TLS | SSL Labs / padlock |
| **Anti-spam** | Turnstile + honeypot + rate-limit | Flood test |
| **RBAC** | Directus roles + per-collection + row-level permissions | Role walkthrough |
| **i18n VI/EN/JP** | Directus translations + Next.js i18n + hreflang | Language-switch demo |

## 12. Effort & cost alignment

Indicative developer effort across the two tracks (fits ~80 dev-days = 2 devs × 8 weeks):

| Workstream | ~Dev-days |
|---|---|
| Setup, infra, CI/CD, Docker, full data model | 6 |
| Design system (Tailwind tokens + Shadcn) | 4 |
| Homepage + About | 6 |
| Products + SKU search + detail + industries | 9 |
| Regional Hubs | 4 |
| Resource Center | 4 |
| Auth + B2B Portal (dashboard, order history, debt, delivery, re-order) | 12 |
| RFQ + Quick Order + Redis <50ms | 7 |
| CMS finalization + roles/permissions + RFQ admin | 5 |
| ERP-ready interface | 3 |
| i18n wiring + content | 6 |
| SEO + schema + performance hardening | 6 |
| Responsive + cross-browser + a11y | 4 |
| UAT, bug-fix, docs, training, go-live | 8 |
| **Total** | **≈ 84 dev-days** |

At 52.7M VNĐ, 8 weeks × 4 people runs **below market rate** — rational only as a deliberate **loss-leader** that captures the recurring value (10% royalty on Bên B's future deployments + 12M VNĐ/yr/site maintenance, §1). The ~3 dev-days on the ERP-ready interface and the Docker/seed/token packaging are the investment that makes deployment #2…#N cheap. *These are planning estimates, not a re-quote; the price is fixed per §1.3. Infra running cost ≈ $10–25/mo, folding into the annual maintenance.*

## 13. Deliverables → contract mapping (§2.3 / PRD §7)

UI/UX Design System · Source code (FE + BE) · API Documentation · Deployment Guide & Technical Handover · UAT Checklist & Bug-fixing · SEO Technical Setup & Schema · User Guide · Training session.

## 14. UAT & acceptance mapping (§1.5 / PRD §8)

| Criterion | Demonstrated by |
|---|---|
| Stable on Chrome, Edge, **Safari** | Cross-browser QA matrix + live demo |
| **No Critical Bug in ordering (RFQ/Order) flow** | End-to-end pass; zero-critical bug board |
| Page-load KPI (PageSpeed ≥90 / CWV) | Lighthouse CI report |
| Product & hub (KCN) data displays correctly | Content QA vs source; client review |
| SEO indexes correct URL structure + metadata | sitemap.xml, schema validator, hreflang |

**Definition of Done (operator-green, non-negotiable):** production artifact rebuilt & deployed → DB migrated + seed/config applied → **the client opens the production URL and sees the expected output** → UAT checklist signed. CI-green / staging-green alone is *not* done.

## 15. Quality & process

Branch + PR review before merge to protected `main`; CI lint/format/typecheck + Lighthouse on previews; conventional commits; tagged releases; staging continuously live from Week 1; weekly demo + written status to client.

## 16. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|:---:|---|
| **Client content late** (products/SKU/TDS-MSDS/ISO/images/copy/JP) | High | Day-0 content-intake checklist + deadlines; seed placeholders; CMS swap is non-blocking |
| Misunderstanding that **ERP real-time** is needed | High | Lock §3 at kickoff; ERP-ready interface (Wk6); live sync → separate Integration appendix |
| **JP** translation cost/quality | Med | Full i18n infra; JP key-pages at launch (§9) |
| PageSpeed ≥90 fragility | Med | Image/JS discipline from Wk1; Lighthouse CI blocks regressions |
| Fixed price, 8 wks × 4 people | — | Deliberate loss-leader for royalty + maintenance (§12) |
| ~~Week-5 density (6-week plan)~~ | ~~High~~ | **Resolved**: extended to 8 weeks; Wk7 dedicated to i18n/perf/QA |

## 17. Dependencies from ULink

Brand assets · content + JP translation (with deadlines) · product/SKU/TDS-MSDS/ISO data · domain + DNS access (go-live HTTPS) · **confirmation of §3 (ERP-later)** · debt/delivery business rules + sample customer data · UAT participants (Wk7, Wk8).

## 18. Open items to confirm at kickoff

1. **§3 ERP-later** assumption (portal data CMS-managed now; live ERP = future). 2. Hosting & infra payer (~$10–25/mo, folds into maintenance). 3. Domain + DNS access. 4. Content & JP-translation source + ready dates. 5. Kickoff date (indicative 09 Jun 2026). 6. Brand assets vs. we define the token set. 7. Payment milestones (e.g., Wk2 / Wk5 / go-live).

## 19. Next steps (on approval)

1. Approve v1.2 (or amend §3 / §18). 2. `git init` + push skeleton; stand up Docker Compose (Directus+PG+Redis) on staging. 3. Send the content-intake checklist to ULink. 4. Lock design tokens + collection schema (incl. portal). 5. Begin Week 1.

> Future phase (paid, separate appendix): **ERP/CRM integration** — live sync of orders/invoices/deliveries through the Week-6 interface. Quoted when ULink's ERP is available, per the PRD roadmap & §3.3.
