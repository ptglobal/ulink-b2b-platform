# SPEC-04 - API Specification

**Status:** Baseline · **Owner:** Dev B · **Related:** [SPEC-03 Data Model](SPEC-03-data-model.md)

Two API surfaces: **Directus** (auto-generated REST + GraphQL for all collections)
and **custom Next.js route handlers** for the two latency/spam-sensitive paths.

## 1. Directus API
- **Base:** `${DIRECTUS_URL}` (e.g. `http://localhost:8055`).
- **REST:** `/items/{collection}` with `filter`, `fields`, `sort`, `limit`, `deep`.
- **GraphQL:** `/graphql` (read) and `/graphql/system`.
- **Auth:** customer JWT (login) or server static token; public role for published content reads.
- **i18n:** request translations via `deep`/`translations` per Directus docs.
- **Conventions:** read published only on the public site (`filter[status][_eq]=published`). RFQ writes go through `POST /api/rfq`, not direct anonymous Directus creates.

Example - published products in a category:
```
GET /items/products?filter[status][_eq]=published&filter[category][_eq]=12&fields=id,name,slug,hero
```

## 2. Custom endpoints (Next.js)

All app-owned endpoints return a normalized JSON envelope.

- **Success**
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

- **Error**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2026-06-08T10:00:00.000Z"
  }
}
```

### 2.1 `GET /api/sku/{code}` - cached SKU lookup
Purpose: <50ms SKU resolution for Quick Order (NFR-02).
- **Cache:** Redis key `sku:{code-lowercased}`, TTL 1h, primed on publish.
- **200** -> normalized success envelope with the SKU in `data`, header `x-cache: HIT|MISS`.
- **404** -> normalized error envelope with code `NOT_FOUND`.
- **500** -> normalized error envelope with code `INTERNAL_SERVER_ERROR`.
```
GET /api/sku/CR-GLV-001
200 {
  "success": true,
  "data": {
    "id": 42,
    "sku_code": "CR-GLV-001",
    "product": 7,
    "unit": "box",
    "pack_size": "100",
    "status": "published"
  }
}
```

### 2.2 `POST /api/rfq` - RFQ submission
Purpose: persist an RFQ and route to Sales.
- **Anti-spam:** honeypot field `website`; Turnstile token (TODO); IP rate-limit (TODO).
- **Body:**
```json
{
  "company": "ACME",
  "contact": "Mr A",
  "email": "a@acme.vn",
  "phone": "...",
  "industry": "electronics",
  "items": [{ "sku": "CR-GLV-001", "qty": 50 }],
  "message": "...",
  "website": ""
}
```
- **200** -> normalized success envelope with created RFQ id in `data.id`.
- **400** -> normalized error envelope with code `BAD_REQUEST` for invalid JSON.
- **422** -> normalized error envelope with code `UNPROCESSABLE_ENTITY` and `error.details.missingFields`.
- **502** -> normalized error envelope with code `BAD_GATEWAY` when persistence fails.
- The handler writes to Directus with `DIRECTUS_TOKEN`; visitor and customer roles do not create `rfq_requests` directly.

## 3. Error model
App-owned APIs return `{ "success": false, "error": { ... } }` with appropriate HTTP status.
No stack traces in responses.
Codes in use: `BAD_REQUEST` (400), `UNPROCESSABLE_ENTITY` (422), `NOT_FOUND` (404),
`INTERNAL_SERVER_ERROR` (500), `BAD_GATEWAY` (502). `TOO_MANY_REQUESTS` (429) is reserved for future rate limiting.

## 4. Rate limiting and security
- Public mutations (`/api/rfq`, contact) rate-limited per IP via Redis (sliding window).
- Server-side writes use `DIRECTUS_TOKEN`; never expose admin token to the browser. RFQ submissions from visitors and customers must go through Next.js.
- CORS restricted to the site origin in production.

## 5. ERP-ready interface *(future Integration phase)*
Stable contract so an ERP can become the source for `orders` / `invoices` / `deliveries`:
- **Import:** `POST /erp/import/{orders|invoices|deliveries}` (REST) plus CSV schema (documented per collection).
- **Webhook:** outbound on create/update of these collections (Directus Flow).
- **Idempotency:** external records carry `erp_ref`; upsert by `erp_ref`.
- Not built in the 8-week scope; the schema and endpoint stubs are reserved (Week 6).
