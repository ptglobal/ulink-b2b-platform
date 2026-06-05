# SPEC-04 — API Specification

**Status:** Baseline · **Owner:** Dev B · **Related:** [SPEC-03 Data Model](SPEC-03-data-model.md)

Two API surfaces: **Directus** (auto-generated REST + GraphQL for all collections)
and **custom Next.js route handlers** for the two latency/spam-sensitive paths.

## 1. Directus API
- **Base:** `${DIRECTUS_URL}` (e.g. `http://localhost:8055`).
- **REST:** `/items/{collection}` with `filter`, `fields`, `sort`, `limit`, `deep`.
- **GraphQL:** `/graphql` (read) and `/graphql/system`.
- **Auth:** customer JWT (login) or server static token; public role for published content.
- **i18n:** request translations via `deep`/`translations` per Directus docs.
- **Conventions:** read published only on the public site (`filter[status][_eq]=published`).

Example — published products in a category:
```
GET /items/products?filter[status][_eq]=published&filter[category][_eq]=12&fields=id,name,slug,hero
```

## 2. Custom endpoints (Next.js)

### 2.1 `GET /api/sku/{code}` — cached SKU lookup
Purpose: <50ms SKU resolution for Quick Order (NFR-02).
- **Cache:** Redis key `sku:{code-lowercased}`, TTL 1h, primed on publish.
- **200** → SKU JSON, header `x-cache: HIT|MISS`.
- **404** → `{ "error": "not_found" }`.
```
GET /api/sku/CR-GLV-001
200 {"id":42,"sku_code":"CR-GLV-001","product":7,"unit":"box","pack_size":"100","status":"published"}
```

### 2.2 `POST /api/rfq` — RFQ submission
Purpose: persist an RFQ and route to Sales.
- **Anti-spam:** honeypot field `website`; Turnstile token (TODO); IP rate-limit (TODO).
- **Body:**
```json
{ "company":"ACME","contact":"Mr A","email":"a@acme.vn","phone":"...",
  "industry":"electronics","items":[{"sku":"CR-GLV-001","qty":50}],"message":"...","website":"" }
```
- **200** `{ "ok": true, "id": 123 }` · **422** missing fields · **502** persist failure.

## 3. Error model
JSON `{ "error": "<code>" }` with appropriate HTTP status. No stack traces in responses.
Codes: `invalid_json` (400), `missing_fields` (422), `not_found` (404),
`rate_limited` (429, TODO), `submit_failed` (502).

## 4. Rate limiting & security
- Public mutations (`/api/rfq`, contact) rate-limited per IP via Redis (sliding window).
- Server-side writes use `DIRECTUS_TOKEN`; never expose admin token to the browser.
- CORS restricted to the site origin in production.

## 5. ERP-ready interface *(future Integration phase)*
Stable contract so an ERP can become the source for `orders`/`invoices`/`deliveries`:
- **Import:** `POST /erp/import/{orders|invoices|deliveries}` (REST) + CSV schema (documented per collection).
- **Webhook:** outbound on create/update of these collections (Directus Flow).
- **Idempotency:** external records carry `erp_ref`; upsert by `erp_ref`.
- Not built in the 8-week scope; the schema + endpoint stubs are reserved (Week 6).
