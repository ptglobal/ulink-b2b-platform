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

**For testers**: See the dedicated guide `directus/API_TESTING_GUIDE.md` for detailed per-endpoint examples (including the custom extension endpoints), curl commands, and test scenarios. Interactive docs are available at `${DIRECTUS_URL}/docs`.

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
- **Validation:** `company`, `email`, and a non-empty `items[]` array are required. `email` must be valid, `phone` must be normalized if present, each line item must have a known published SKU and `qty > 0`.
- **Anti-spam:** Cloudflare Turnstile, Redis IP rate-limit, and Redis fingerprint dedupe are enforced before persistence.
- **Idempotency:** exact duplicate submissions reuse the first RFQ id when the normalized `email + company + items` hash already exists.
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
- Exact duplicates return the original id instead of creating a second record.
- **400** -> normalized error envelope with code `BAD_REQUEST` for invalid JSON.
- **403** -> normalized error envelope with code `FORBIDDEN` when Turnstile fails.
- **422** -> normalized error envelope with code `UNPROCESSABLE_ENTITY` for invalid email/phone/qty/SKU or missing fields.
- **429** -> normalized error envelope with code `TOO_MANY_REQUESTS` when the IP rate limit is exceeded.
- **500** -> normalized error envelope with code `INTERNAL_SERVER_ERROR` when server-side RFQ writes are misconfigured.
- **502** -> normalized error envelope with code `BAD_GATEWAY` when persistence fails for another reason.
- The handler writes to Directus with `DIRECTUS_TOKEN`; visitor and customer roles do not create `rfq_requests` directly.

### 2.5 `POST /api/internal/rfq-notify` - Directus RFQ notify webhook
Purpose: assign a new RFQ and send the sales notification after Directus creates the record.
- **Auth:** `Authorization: Bearer ${INTERNAL_API_TOKEN}`
- **Body:** JSON with `event`, `collection`, and `key` or `id` for the RFQ row.
- **200** -> normalized success envelope with `data.rfq_id`, `data.assigned_sales`, `data.notified_to`, `data.mail_status`, and `data.notification_status`.
- **400** -> malformed JSON, unsupported collection, or missing RFQ id.
- **403** -> missing or invalid internal API token.
- **500** -> missing server configuration.
- **502** -> Directus read/write failure while processing the notification.

Directus Flow `flow-rfq-notify` posts to this endpoint after each successful `rfq_requests` create. The notifier resolves the assignee from `rfq_assignment_rules`, falls back to `site_settings.contact_email` when no salesperson matches, sends the summary email, and writes a Directus notification when an assignee exists. The RFQ status stays `new`.

### 2.3 `POST /api/revalidate` - publish webhook
Purpose: invalidate content caches after Directus publish, unpublish, or delete events.
- **Auth:** `Authorization: Bearer ${REVALIDATE_SECRET}`
- **Body:** JSON with `event`, `collection`, `id` or `keys`, `slug`, `status`, `locale`.
- **200** -> normalized success envelope with `data.revalidated.tags` and `data.revalidated.paths`.
- **400** -> malformed JSON or unsupported payload.
- **403** -> missing or invalid webhook secret.

Example:
```json
{
  "event": "items.update",
  "collection": "blog_posts",
  "id": 123,
  "slug": "huong-dan-onboarding-ulink",
  "status": "published",
  "locale": "vi"
}
```

The Next.js handler maps the collection to `revalidateTag('col:'+collection)` and the affected entity to `revalidateTag('entity:'+collection+':'+id)` so all locale variants share one entity cache key. It also calls `revalidatePath(path)` for the affected localized list/detail routes. `products`, `pages`, `blog_posts`, `case_studies`, `regional_hubs`, `documents`, `product_categories`, `partners`, and `hero_banners` all share this single webhook contract.

### 2.4 `POST /api/internal/sku-cache` - Directus SKU cache sync
Purpose: prime or invalidate Redis after Directus `product_skus` changes.
- **Auth:** `Authorization: Bearer ${INTERNAL_API_TOKEN}`
- **Body:** JSON with `event`, `collection`, and `items[]`. Each item may include `id`, `sku_code`, `previous_sku_code`, `product`, `unit`, `pack_size`, `attributes`, and `status`.
- **200** -> normalized success envelope with `data.primed`, `data.invalidated`, and `data.deletedOldKeys`.
- **400** -> malformed JSON or unsupported payload.
- **403** -> missing or invalid internal API token.
- **500** -> missing server configuration or Redis failure.

Example:
```json
{
  "event": "items.update",
  "collection": "product_skus",
  "items": [
    {
      "id": 42,
      "sku_code": "sku-gloves-nitrile-s",
      "previous_sku_code": "sku-gloves-nitrile-xs",
      "product": 7,
      "unit": "box",
      "pack_size": "100 pcs/box",
      "attributes": { "size": "S" },
      "status": "published"
    }
  ]
}
```

The route canonicalizes every `sku_code` with `.trim().toLowerCase()`, writes or deletes Redis keys with one pipeline, and uses `sku:{code-lowercased}` as the only key format. Directus Flow `flow-sku-cache-sync` calls this endpoint and never talks to Redis directly.

### 2.6 `POST /api/internal/erp-outbox` - ERP drain worker
Purpose: drain pending `integration_events` rows and deliver them to ERP when ERP sync is enabled.
- **Auth:** `Authorization: Bearer ${INTERNAL_API_TOKEN}`
- **Body:** optional JSON with `batch_size` for smoke / manual runs.
- **200** -> normalized success envelope with `data.skipped`, `data.sent`, `data.retried`, and `data.failed`.
- **400** -> malformed JSON.
- **403** -> missing or invalid internal API token.
- **500** -> missing server configuration.
- **502** -> Directus read/write failure while processing the outbox batch.

The worker reads `pending` rows from `integration_events`, sends each payload to `destination_url` when present or `ERP_WEBHOOK_URL` otherwise, and updates `status`, `attempts`, `last_status_code`, `last_error`, and `next_attempt_at` based on the ERP response. `4xx` responses become dead-letter immediately; `5xx` and network failures are rescheduled with exponential backoff up to the configured attempt limit.

For smoke and UAT, `/api/mock/erp` is a local mock target that can return controlled `2xx`, `4xx`, or `5xx` responses via a `status` query parameter.

## 3. Error model
App-owned APIs return `{ "success": false, "error": { ... } }` with appropriate HTTP status.
No stack traces in responses.
Codes in use: `BAD_REQUEST` (400), `UNPROCESSABLE_ENTITY` (422), `NOT_FOUND` (404),
`FORBIDDEN` (403), `CONFLICT` (409), `TOO_MANY_REQUESTS` (429),
`INTERNAL_SERVER_ERROR` (500), `BAD_GATEWAY` (502).

## 4. Rate limiting and security
- Public mutations (`/api/rfq`, contact) rate-limited per IP via Redis (sliding window).
- Server-side writes use `DIRECTUS_TOKEN`; never expose admin token to the browser. RFQ submissions from visitors and customers must go through Next.js.
- Content publish webhook calls use `REVALIDATE_SECRET`; Directus Flow posts to `POST /api/revalidate` and the route rejects missing or mismatched bearer secrets. The webhook invalidates `col:{collection}` plus `entity:{collection}:{id}` so translated variants stay in sync.
- Directus SKU cache sync uses `INTERNAL_API_TOKEN`; Directus Flow posts to `POST /api/internal/sku-cache` and the route rejects missing or mismatched bearer secrets before touching Redis.
- Directus RFQ notification uses `INTERNAL_API_TOKEN`; Directus Flow posts to `POST /api/internal/rfq-notify` and the route rejects missing or mismatched bearer secrets before touching Directus or SMTP.
- CORS restricted to the site origin in production.

## 5. ERP-ready interface *(future Integration phase)*
Stable contract so an ERP can become the source for `orders` / `invoices` / `deliveries`:
- **Import:** `POST /erp/import/{orders|invoices|deliveries}` (REST) plus CSV schema (documented per collection).
- **Webhook:** outbound on create/update of these collections (Directus Flow).
- **Idempotency:** external records carry `erp_ref`; upsert by `erp_ref`.
- Not built in the 8-week scope; the schema and endpoint stubs are reserved (Week 6).
