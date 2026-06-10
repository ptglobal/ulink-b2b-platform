# SPEC-01 — Software Requirements Specification (SRS)

**Status:** Baseline · **Owner:** BA · **Related:** [SPEC-02 Functional](SPEC-02-functional-spec.md), [delivery plan](../plans/2026-06-03-ulink-delivery-plan-fullscope-8wk.md)

## 1. Introduction
### 1.1 Purpose
Defines the complete functional and non-functional requirements for the ULink
Industries B2B Procurement Platform. It is the requirements baseline for design,
implementation, test, and UAT acceptance.

### 1.2 Scope
A tri-lingual (VI/EN/JP), SEO-optimized B2B marketing-and-procurement website with
an RFQ flow, a full content-management back office, and an authenticated B2B Portal.
Full contract scope on an 8-week schedule (see delivery plan). **Out of scope:**
live ERP/CRM synchronization (future Integration phase) and online payment/checkout.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| RFQ | Request For Quotation — the primary B2B commerce action (no checkout) |
| SKU | Stock-Keeping Unit — a sellable product variant |
| Hub | Regional warehouse/cluster (Dong Van 4, Bac Thang Long, Bac Ninh, Hung Yen, Hai Phong) |
| TDS/MSDS | Technical/Material Safety Data Sheet (downloadable PDFs) |
| Công nợ | Customer accounts-receivable / debt |
| CMS | Directus admin (content + portal data management) |

### 1.4 References
Contract Appendix (Phụ lục, 18/05/2026); PRD & SOW v1.0 (12/05/2026); delivery plan v1.2.

## 2. Overall description
### 2.1 Users & roles
| Role | Description |
|---|---|
| Visitor | Anonymous prospect browsing/searching, submitting RFQ |
| Customer | Authenticated B2B buyer using the Portal |
| Editor | ULink staff managing content |
| Sales | ULink staff managing RFQs, orders, invoices, deliveries |
| Admin | Full system administration |

### 2.2 Constraints & assumptions
- Stack fixed: Next.js 14 + Directus 11 + PostgreSQL + Redis (see ADRs).
- Portal order/debt/delivery data is **CMS-managed** now; ERP sync is future (ADR-0003).
- Client supplies content, brand assets, JP translation source, domain/DNS.

## 3. Functional requirements (summary; detail in SPEC-02)
| ID | Requirement | Module |
|---|---|---|
| FR-01 | Display homepage (hero, core/industry solutions, partners, case studies, resource teaser, quick-RFQ CTA) | Home |
| FR-02 | Present 5 regional hubs with SLA, warehouse capacity, technical team, cluster overview | Hubs |
| FR-03 | Browse product categories (Cleanroom, Packaging) with hierarchy | Products |
| FR-04 | Search SKUs; cached lookup responds <50ms | Products/Quick Order |
| FR-05 | Product detail: specs, TDS/MSDS download, request sample, add to RFQ cart | Products |
| FR-06 | Filter products by industry (Electronics, Pharma, Cosmetics, Food) | Industry |
| FR-07 | Resource Center: technical docs, ISO certs, case studies, blog, downloads | Resources |
| FR-08 | Quick Order: SKU input, bulk upload, RFQ cart, submit | Quick Order |
| FR-09 | RFQ submission routed to Sales; managed through lifecycle | RFQ |
| FR-10 | Customer authentication (login/register) | Portal |
| FR-11 | Portal dashboard | Portal |
| FR-12 | Order history (own orders) | Portal |
| FR-13 | Scheduled delivery view | Portal |
| FR-14 | Debt/công nợ view | Portal |
| FR-15 | Re-order from a past order | Portal |
| FR-16 | CMS CRUD for all 17 content/admin modules | CMS |
| FR-17 | Multi-language content VI/EN/JP | i18n |
| FR-18 | Publish/unpublish content | CMS |
| FR-19 | Role-based access (Admin/Editor/Sales/Customer) | Security |
| FR-20 | About pages (company, competencies, sustainability, careers, contact) | About |

## 4. Non-functional requirements
| ID | Requirement | Target / measure |
|---|---|---|
| NFR-01 Performance | Page speed | Google PageSpeed ≥ 90 desktop; Core Web Vitals "good" |
| NFR-02 Performance | Quick Order SKU lookup | < 50ms on cache hit (Redis) |
| NFR-03 Compatibility | Browsers | Chrome, Edge, Safari (current − 1) |
| NFR-04 Responsive | Layout | Desktop / Tablet / Mobile |
| NFR-05 Security | Transport | HTTPS everywhere |
| NFR-06 Security | Access | Role-based; row-level on customer data |
| NFR-07 Security | Forms | Anti-spam (Turnstile + rate-limit + dedupe) |
| NFR-08 i18n | Languages | VI / EN / JP with hreflang |
| NFR-09 SEO | Indexing | Correct URL structure, metadata, schema markup |
| NFR-10 Reliability | Ordering flow | No Critical Bug in the RFQ/Order path |
| NFR-11 Maintainability | Code | Lint/format/typecheck gates; documented |
| NFR-12 Portability | Deploy | Dockerized, env-config, redeployable |

## 5. Acceptance criteria
Mapped 1:1 to verifiable checks in [TEST-03 UAT Checklist](../testing/) and contract
§1.5 / PRD §8. Definition of Done is operator-green (see [ENG-04](../engineering/ENG-04-definition-of-done.md)).

## 6. Traceability
Each FR/NFR traces forward to SPEC-02 (behaviour), test cases (TEST-02), and UAT
(TEST-03). Changes follow the [Change Request process](../process/) (contract §3.3).
