# TEST-02 — Test Cases (by module)

**Status:** Baseline · **Owner:** Tester · **Parent:** [TEST-01](TEST-01-test-strategy.md)

Format: `ID | Precondition | Steps | Expected`. Critical-path cases (RFQ/Order) are
marked ⛔ and must pass before release. Expand as features land.

## Quick Order / RFQ ⛔
| ID | Steps | Expected |
|---|---|---|
| TC-RFQ-01 | Add valid SKU by code | Line added with name/unit |
| TC-RFQ-02 | Add invalid SKU code | Inline "not found"; no line added |
| TC-RFQ-03 | Bulk upload CSV `sku,qty` (valid + invalid rows) | Valid rows added; invalid flagged |
| TC-RFQ-04 | Submit RFQ with valid company, email, phone, items, and token | 200; record in `rfq_requests` (status `new`); confirmation shown |
| TC-RFQ-05 | Submit with invalid email | 422; validation message |
| TC-RFQ-06 | Submit with invalid phone | 422; validation message |
| TC-RFQ-07 | Submit with zero quantity line item | 422; validation message |
| TC-RFQ-08 | Submit with empty items array | 422; validation message |
| TC-RFQ-09 | Submit with unknown SKU | 422; validation message |
| TC-RFQ-10 | Submit with bad Turnstile token | 403; blocked before persistence |
| TC-RFQ-11 | Rapid repeat submits from one IP | 429; rate-limited after threshold |
| TC-RFQ-12 | Repeat the same normalized payload inside dedupe window | 409; duplicate blocked |

## SKU lookup / cache
| ID | Steps | Expected |
|---|---|---|
| TC-SKU-01 | GET /api/sku/{published code} (cold) | 200, `x-cache: MISS` |
| TC-SKU-02 | GET same code again | 200, `x-cache: HIT`, < 50ms |
| TC-SKU-03 | GET unknown code | 404 `not_found` |
| TC-SKU-04 | Publish SKU update → GET | Reflects new data (cache primed/invalidated) |

## Products
| ID | Steps | Expected |
|---|---|---|
| TC-PRD-01 | Open product detail | Specs, gallery, TDS/MSDS, sample, RFQ visible |
| TC-PRD-02 | Download TDS/MSDS | File downloads |
| TC-PRD-03 | Unpublished product URL | 404 / not listed |

## B2B Portal ⛔ (row-level)
| ID | Steps | Expected |
|---|---|---|
| TC-POR-01 | Login as customer A | Dashboard shows A's data |
| TC-POR-02 | A views Order History | Only A's orders |
| TC-POR-03 | A tries to read B's order id/API | Denied / empty |
| TC-POR-04 | A views Debt | A's invoices + balances |
| TC-POR-05 | A views Scheduled Delivery | A's deliveries |
| TC-POR-06 | Re-order a past order | Lines cloned into RFQ cart |

## CMS / i18n / SEO
| ID | Steps | Expected |
|---|---|---|
| TC-CMS-01 | Editor publishes a blog post | Appears on site after revalidate; VI/EN/JA variants stay in sync via entity tag |
| TC-CMS-02 | Editor unpublishes a product | Removed from site and cache invalidated across locales |
| TC-CMS-03 | Editor deletes a resource document | Resource list is invalidated and the item disappears |
| TC-CMS-04 | Directus sends webhook with bad secret | `POST /api/revalidate` returns 403; no cache invalidation happens |
| TC-I18N-01 | Switch vi→en→ja on a page | Same page, translated; hreflang present |
| TC-SEO-01 | View source of product page | Title/desc/canonical + Product JSON-LD |
| TC-SEO-02 | Fetch /sitemap.xml, /robots.txt | Valid; locales included |

## Media / storage
| ID | Steps | Expected |
|---|---|---|
| TC-MED-01 | Upload allowed PNG into module folder | Upload succeeds; file stored in correct module folder |
| TC-MED-02 | Upload allowed PDF into module folder | Upload succeeds; file stored in correct module folder |
| TC-MED-03 | Upload oversize file | Rejected by upload guardrail |
| TC-MED-04 | Upload untrusted SVG | Rejected unless trusted brand role + folder |
| TC-MED-05 | Soft delete file via media endpoint | File moved to trash; retention row created |
| TC-MED-06 | Hard delete file via admin confirm flow | File removed; retention row marked purged |
| TC-MED-07 | Run cleanup on expired soft-delete row | Purges file after 7-day retention |
| TC-MED-08 | Inspect audit rows for upload/delete | Actor, file id, filename, size, mime, module, source, IP, and user agent recorded |

## Non-functional (see TEST-04)
| ID | Steps | Expected |
|---|---|---|
| TC-PERF-01 | Lighthouse on home/product (desktop) | PageSpeed ≥ 90; CWV good |
| TC-BRW-01 | Key pages on Chrome/Edge/Safari | Render + function correctly |
| TC-RWD-01 | Key pages at mobile/tablet/desktop | Layout correct, nav usable |
