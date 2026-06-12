# Operational Flows — Guidance (Decided Approach)

**Status:** Decisions of record · **Scope:** Directus ⇄ Next.js ⇄ Redis automation flows
**Audited from:** `publish-content-webhook`, `sku-cache-hook`, `rfq-notification-flow`,
`erp-outbound-webhook`, `commercial-data-import`, `flow-ops-management`.
**Vietnamese twin:** [operational-flows-guidance.vi.md](operational-flows-guidance.vi.md)

This is the **decided** approach after auditing the six flow specs. Where a decision
**changes** an original spec, it's marked **⚠ CORRECTION** with the reason. Related:
[ADR-0003](../decisions/ADR-0003-cms-managed-portal-data.md), [ADR-0005](../decisions/ADR-0005-redis-sku-cache.md), [SPEC-04 API](../specs/SPEC-04-api-spec.md).

---

## 0. Foundational principle — cache by default, never read-through on every request

Confirmed and adopted: **the frontend serves cached output and is refreshed by events**,
it does **not** hit Directus/Postgres on every visitor request.

| Approach | 10k concurrent visitors | Freshness | Cost |
|---|---|---|---|
| Real-time direct DB read (no cache) | 10k queries → DB overload, slow/crash | 100% live | very high |
| **Webhook + ISR/Redis cache (chosen)** | Served from cache **<10ms**, DB untouched | Updated on Save (event-driven) | very low |

Nuance to apply:
- **Public content** → Next.js **ISR** (static + revalidate on publish).
- **SKU lookups** → **Redis** (Quick Order <50ms).
- **Authenticated portal + RFQ/Order writes** → **never cached** (always live, per-user, row-level).

## 1. The unifying rule — durable vs best-effort delivery

Decide reliability by whether the flow **self-heals**:

| Flow | Self-healing fallback? | Delivery guarantee |
|---|---|---|
| Content publish → revalidate | **Yes** — ISR time-TTL refreshes on next visit | **Best-effort** + log (no durable retry needed) |
| SKU cache | **Yes** — cache-miss reads Directus & re-fills | **Best-effort** + log |
| RFQ notify / assign | **No** — a missed notice is lost | **Durable** (retry + the record always persists) |
| ERP outbound | **No** — ERP must receive every event | **Durable** (outbox + worker + DLQ) |

> Corollary: **Directus Flows are triggers only.** Anything needing timed retry, backoff,
> or a dead-letter queue runs in the **app layer** (Next.js route handler / worker),
> because Directus Flows cannot schedule durable retries.

---

## 2. Content publish → `/api/revalidate`

**Decision:** Directus Flow fires on `create | update | delete` for the content
collections, filtered to items that are (or were) `published`; a single secured
endpoint revalidates Next.js. Best-effort with ISR TTL as the safety net.

| Question | Decision |
|---|---|
| Trigger | `create`, `update`, `delete`; condition: item is `published` **or** crossed into/out of `published` |
| Unpublish/archive/delete | **Yes** — fire, so the page is removed from cache (no broken links) |
| Collections | `products`, `product_categories`, `pages`, `blog_posts`, `case_studies`, `regional_hubs`, `industries`, `iso_certifications`, `documents`, `partners`, `hero_banners` |
| Single vs bulk | Endpoint accepts a single id **or** a `keys[]` array (bulk/import) |
| Payload | `{ event, collection, id|keys, slug, status, locale, updated_at }` |
| Endpoint | **One** URL `POST /api/revalidate`, `Authorization: Bearer ${REVALIDATE_SECRET}` |
| Side effect | `revalidateTag('col:'+collection)` (lists) **and** `revalidateTag('entity:'+collection+':'+id)` (covers all locales) **and** `revalidatePath` for the changed localized slug |
| Retry | **None durable** — log to Flow run history; ISR `revalidate=3600` self-heals a missed event within ≤1h |
| Audit | Enable Directus Flow **Log Activity** (time, payload, HTTP status) |

⚠ **CORRECTION (i18n):** revalidate the **entity tag** (covers vi/en/ja variants) in
addition to the localized path — a single `locale` in the payload must not leave other
locales stale.

---

## 3. SKU change → Redis cache (`flow-sku-cache-sync`)

**Decision:** On `product_skus` create/update/delete + any status change, prime when
`published`, invalidate otherwise. Self-healing via cache-miss read-through.

| Question | Decision |
|---|---|
| Trigger | `create`, `update`, `delete`; statuses `published / draft / archived` |
| Action | `published` → **prime**; `draft / archived / deleted` → **invalidate** |
| draft→published | **Prime immediately** (first Quick Order lookup is already warm, <50ms) |
| published→draft/archived | **Delete key immediately** (stop lookups/orders of hidden SKUs) |
| Key | `sku:{code}` — `code` = `sku_code.trim().toLowerCase()` |
| Normalize | `trim()` + `toLowerCase()` on **both** write and read |
| sku_code changed | Delete **old** key, prime **new** key (read previous value from the update payload) |
| Invalidating fields | `sku_code`, `product`, `pack_size`, `unit`, `attributes`, `status` |
| Cache-miss path | Read Directus once; if `published`, return + re-fill Redis |
| TTL | **3600s** uniform (safety net; the hook keeps it fresh) |
| Bulk | One Redis **pipeline/MULTI** for the changed `keys[]` (no per-item round-trips) |

⚠ **CORRECTION (collision):** enforce **case-insensitive uniqueness** on `sku_code` —
otherwise `AB-1` and `ab-1` map to the same lowercased key.

> Cache logic lives in **one** place: a Next.js internal endpoint
> `POST /api/internal/sku-cache` (token-guarded) that the Flow calls — not Redis calls
> scattered in Directus.

---

## 4. RFQ created → notify Sales / assign owner (`flow-rfq-notify`)

**Decision:** Auto-assign on create (manual re-assign allowed); notify **after**
validate + anti-spam + dedupe; the record always persists even if notification fails.

| Question | Decision |
|---|---|
| Assignment | **Auto** by rule, with manual re-assign in Directus Admin |
| Rule | **Hub × Industry** → owner; **fallback** Sales Manager / shared queue |
| `assigned_sales` null | Notify shared inbox (`site_settings.contact_email`) / Sales Manager — **never dropped** |
| Channels | **Email** (owner) + **Directus Notification** (in-app bell). Slack/Teams = future |
| Timing | Only **after** validate → Turnstile anti-spam → dedupe → persisted |
| Initial status | `new` (kept on assign; → `quoted` only when Sales sends a quote) |
| SLA auto-reassign | **Not in Phase 1** — Sales Manager watches an "ageing `new`" dashboard |
| Email content | **Summary + deep link** to `/admin/content/rfq_requests/[id]` |
| Audit | Directus Revisions/Activity (who assigned, when) — automatic |
| Notify fails | Record **persists**; mail error logged; Sales still finds it in the RFQ list |

⚠ **CORRECTION (dedupe):** replace the bare `409` on `email+company within 2 min` with an
**idempotency key** = hash(`email` + normalized `company` + `items`). A repeat of the
**same** RFQ returns the **existing id** (idempotent); a **different** RFQ within the
window is **not** blocked. Prevents false-positives where a customer legitimately sends
two different quotes quickly.

---

## 5. order / invoice / delivery change → ERP outbound (`flow-erp-outbox`)

**Decision:** ⚠ **CORRECTION — adopt the Transactional Outbox pattern**, replacing
"realtime push with in-Flow exponential backoff" (Directus Flows cannot schedule timed
retries; and ERP is a future phase per ADR-0003).

**How it works:**
1. On a **meaningful** change, a Directus Flow writes one row to an **`integration_events`**
   outbox table: `{ entity, op, record_id, erp_ref, idempotency_key, payload(full), status:'pending', attempts:0 }`. **Always written** (cheap, durable, ordered) — this is the change log.
2. A **scheduled worker** (Next.js cron / small service) drains `pending` rows **only when
   `ERP_SYNC_ENABLED=true`**, POSTs to `ERP_WEBHOOK_URL`, and owns retry/backoff/DLQ.
3. Reconciliation: the existing pull APIs (`GET /items/{orders|invoices|deliveries}?filter[updated_at][_gte]=…`) let ERP backfill after long downtime.

| Question | Decision |
|---|---|
| Push now or log? | **Outbox now (always)**; deliver only when `ERP_SYNC_ENABLED` |
| 1 endpoint or 3 | **One** envelope; `entity ∈ {orders,invoices,deliveries}` |
| Triggers | `create` + **significant** `update` (status/amounts/items/logistics); ignore cosmetic fields |
| Payload | **Full record** snapshot (ERP upserts) + changed-field list |
| `erp_ref` | Included; null = "create intent" → ERP assigns + writes it back |
| Idempotency key | `erp_ref` if present, else `entity:id:revision` |
| Retry (worker) | 3× **exponential** (1m / 5m / 15m) — in the **worker**, not the Flow |
| DLQ | After max attempts → `status:'failed'` (the `failed_erp_webhooks` view) + Admin **Re-send** + alert |
| 4xx vs 5xx | **4xx** → straight to DLQ (no retry; data/permission error) + alert. **5xx/timeout** → retry cycle |
| ERP absent | `ERP_SYNC_ENABLED=false`: outbox accumulates the change log; optional staging **stub** (Webhook.site/mock route) for UAT |
| Staging/prod | Separate `ERP_WEBHOOK_URL` per `.env.staging` / `.env.production` |
| Delete/cancel | No hard delete; status → `cancelled` emits an event |
| Must-emit transitions | Orders `pending→confirmed`, `processing→shipped`, `shipped→completed`, `*→cancelled`; Invoices `unpaid→partial`, `partial→paid`, `*→overdue`; Deliveries `scheduled→in_transit`, `in_transit→delivered`, `*→cancelled/late` |

---

## 6. Commercial data import (`flow-import-commercial`)

**Decision:** ⚠ **CORRECTION** — a **custom dry-run import** for orders/invoices/deliveries
(the native Directus UI importer cannot upsert by `erp_ref` nor roll back). Native UI
import is acceptable only for simple `customers`.

| Question | Decision |
|---|---|
| Collections | `customers`, `orders` (+nested/linked `order_items`), `invoices`, `deliveries` |
| `order_items` | Never imported orphaned — nested under `orders`, or requires an existing FK |
| Who | **Admin + Sales Ops** only (never Sales/Customer) |
| UI vs custom | **Custom** `POST /api/import` (dry-run + erp_ref upsert + atomicity) for orders/invoices/deliveries; Directus UI ok for `customers` |
| Validation | Per-entity required fields, types, **FK existence** (customer/order/sku), enum checks, amounts ≥ 0 |
| `erp_ref` | **Required** for ERP-sourced commercial data; null only for self-registered customers |
| Upsert key | `erp_ref`; for `customers` fall back to `tax_code` |
| Duplicate | **Upsert** (update in place) — re-runnable syncs |
| Error handling | **Dry-run validates the whole file → per-row error report.** Commit is **atomic per aggregate** (an order + its items succeed/fail together). Default = block-on-any-error (clean file); **optional Admin "allow partial"** for large operational syncs |
| Preview | **Mandatory** — column mapping + sample + created/updated/skipped/failed counts before commit |
| Result log | created / updated / skipped / failed counts + downloadable error rows |

⚠ **CORRECTION (rollback):** "all-or-nothing whole file" is kept as the **default**, but
delivered via **pre-commit validation** (so you never submit a bad file) + **per-aggregate
transactions** — which is what makes the skipped/failed counts meaningful and avoids
rejecting 5,000 good rows for one typo without a clear report.

---

## 7. Ops, ownership & conventions

| Topic | Decision |
|---|---|
| Flow vs custom | Directus Flow = **trigger + simple field automation**; complex logic (email render, Redis, revalidate, ERP, import) = **Next.js route handler/worker** |
| Logic location | Centralized in **Next.js (BFF)** — testable, CI/CD-friendly, off the Directus server |
| Sync vs async | **Async** for email/webhook/revalidate/ERP/cache; **sync** only for validation hooks that must block a bad save |
| Error handling | **Log-only (fail-safe)** for side flows (email/revalidate); **fail-fast** for validation/dedupe |
| Alerting | 5xx-from-app/ERP or repeated failures → Directus run log **+** alert (email/Slack/Teams) — see [OPS-03](../operations/OPS-03-backup-recovery-monitoring.md) |
| Secrets | Env only (`REVALIDATE_SECRET`, `INTERNAL_API_TOKEN`, `ERP_WEBHOOK_TOKEN`, `ERP_WEBHOOK_URL`, `ERP_SYNC_ENABLED`, Redis/SMTP creds). **Never** hard-code or store in Flow UI |
| Staging/prod | Separate endpoints/hosts via `.env.staging` / `.env.production` |
| Smoke tests | A Node script per flow under `directus/` or `scripts/` that posts a simulated event — run after each deploy |
| Naming | Flows `flow-revalidate-content`, `flow-sku-cache-sync`, `flow-rfq-notify`, `flow-erp-outbox`, `flow-import-commercial`. Redis `sku:{code}`. Tags `col:{collection}`, `entity:{collection}:{id}`. Endpoints `/api/revalidate`, `/api/internal/sku-cache`, `/api/import`, `/erp/webhook` |
| Ownership | **Dev** owns infra/code/error-handling; **BA/Sales Ops/Admin** own rules (assignment, email copy, ERP error triage) |
| Per-flow contract | Each flow keeps its own contract spec (the six source docs); this guidance is the decided index |

---

## 8. Summary of corrections vs the original six specs

1. **ERP retry** — in-Flow exponential backoff → **outbox table + scheduled worker** (Flows can't time retries; consistent with `publish-content` §8). Write-always, deliver-when-flagged.
2. **Import engine** — "native Directus UI" → **custom dry-run + erp_ref upsert + atomic** for orders/invoices/deliveries (native importer can't upsert-by-key or roll back). UI ok for `customers`.
3. **Import rollback** — "all-or-nothing whole file" → **pre-commit validation report + per-aggregate transaction** (keeps consistency, makes counts meaningful, no opaque whole-file reject).
4. **RFQ dedupe** — bare `409` on email+company/2min → **idempotency key** (email+company+items-hash); return existing id; don't block distinct RFQs.
5. **Revalidation** — add **i18n-aware** entity-tag revalidation (covers vi/en/ja), not just one localized path.
6. **SKU** — enforce **case-insensitive unique `sku_code`** (lowercased key collision).
7. **Retry philosophy unified** — durable delivery **only** where there is no self-healing fallback (ERP, RFQ-notify); best-effort+log elsewhere (content, SKU).

## 9. Open items — confirm with stakeholders

- **Notify channels:** email + Directus now; add Slack/Teams? (owner: BA/Sales Ops)
- **ERP go-live:** when does `ERP_SYNC_ENABLED` flip true, and what is the real endpoint/auth? (owner: Admin + ERP partner) — until then, outbox-only.
- **Partial import:** is the Admin "allow partial" mode permitted, or strictly atomic always? (owner: Sales Ops / Finance)
- **Assignment matrix:** the concrete Hub × Industry → owner mapping. (owner: Sales Ops)
