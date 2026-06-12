# SKU Cache Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the token-protected SKU cache mutation endpoint and make public SKU lookup, RFQ SKU validation, and Directus cache updates share one canonical lowercased SKU code path.

**Architecture:** Put all SKU canonicalization, Redis key building, cache record serialization, and mutation planning in one shared Next.js library. Keep `/api/sku/[code]` and `/api/internal/sku-cache` as thin route handlers around that library. The public route does read-through on cache miss and primes Redis; the internal route authenticates Directus Flow calls and applies prime/invalidate/delete-old-key batches with one Redis pipeline. Enforce case-insensitive SKU uniqueness at the database layer with a functional unique index so the cache key and the stored SKU code stay aligned.

**Tech Stack:** Next.js App Router, `@directus/sdk`, Redis via `ioredis`, Directus SQL migrations, Node test runner (`node --import tsx --test`), TypeScript.

---

## File Structure

- Create: `frontend/src/lib/sku-cache.ts`
  Responsibility: normalize SKU codes, build Redis keys, parse internal webhook payloads, plan cache mutations, and perform read-through/cache-fill logic.
- Create: `frontend/src/lib/sku-cache.test.ts`
  Responsibility: lock normalization, read-through, prime/invalidate, rename, and batch behavior.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: add `attributes` to `ProductSku` and tighten status typing for cached SKUs.
- Modify: `frontend/src/lib/rfq-validation.ts`
  Responsibility: normalize customer-supplied SKU codes with the shared helper.
- Modify: `frontend/src/lib/rfq-validation.test.ts`
  Responsibility: verify RFQ item SKUs are normalized.
- Modify: `frontend/src/lib/rfq-sku.ts`
  Responsibility: reuse the shared helper before Directus published-SKU lookup.
- Modify: `frontend/src/lib/rfq-sku.test.ts`
  Responsibility: verify lookup keys are normalized to lowercase.
- Modify: `frontend/src/lib/rfq-submit.test.ts`
  Responsibility: lock the normalized `line_items` shape that RFQ submission persists.
- Modify: `frontend/src/app/api/sku/[code]/route.ts`
  Responsibility: delegate GET lookup to the shared read-through helper and keep the response headers.
- Create: `frontend/src/app/api/internal/sku-cache/route.ts`
  Responsibility: bearer-protected Directus Flow endpoint that applies prime/invalidate batches.
- Modify: `frontend/package.json`
  Responsibility: include the new SKU cache test file in the `npm test` script.
- Create: `directus/verify_sku_cache_hook.mjs`
  Responsibility: smoke the internal endpoint and confirm prime/invalidate behavior against a running Next.js app.
- Create: `directus/sql/migrations/2026-06-12-add-product-sku-case-insensitive-unique.sql`
  Responsibility: enforce `lower(btrim(sku_code))` uniqueness in PostgreSQL.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the canonical lowercase SKU contract and the functional unique index.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: note that `product_skus.sku_code` is normalized lowercased and case-insensitively unique.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: add the internal SKU cache endpoint contract and its auth/status model.
- Modify: `docs/engineering/ENG-05-local-development-setup.md`
  Responsibility: document `INTERNAL_API_TOKEN` for local runs.
- Modify: `docs/operations/OPS-01-deployment-guide.md`
  Responsibility: document `INTERNAL_API_TOKEN` for staging and production.
- Manual config: Directus Flow `flow-sku-cache-sync`
  Responsibility: trigger the internal endpoint on `product_skus` create/update/delete events and pass the record payload.

## Task 1: Build the shared SKU cache helper and wire existing consumers

**Files:**
- Create: `frontend/src/lib/sku-cache.ts`
- Create: `frontend/src/lib/sku-cache.test.ts`
- Modify: `frontend/src/lib/directus.ts`
- Modify: `frontend/src/lib/rfq-validation.ts`
- Modify: `frontend/src/lib/rfq-validation.test.ts`
- Modify: `frontend/src/lib/rfq-sku.ts`
- Modify: `frontend/src/lib/rfq-sku.test.ts`
- Modify: `frontend/src/lib/rfq-submit.test.ts`
- Modify: `frontend/src/app/api/sku/[code]/route.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing tests**

Add tests that force the canonical SKU contract into one place:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeSkuCode,
  buildSkuCacheKey,
  lookupSkuByCode,
  planSkuCacheMutation
} from './sku-cache';

test('normalizes sku codes for cache and query paths', () => {
  assert.equal(normalizeSkuCode('  CR-GLV-001  '), 'cr-glv-001');
  assert.equal(buildSkuCacheKey('  CR-GLV-001  '), 'sku:cr-glv-001');
});

test('read-through lookup returns HIT on cached data and MISS on directus fill', async () => {
  const redisCalls: string[] = [];
  const redis = {
    get: async (key: string) => {
      redisCalls.push(`get:${key}`);
      return null;
    },
    set: async (key: string, value: string, mode: string, ttl: number) => {
      redisCalls.push(`set:${key}:${mode}:${ttl}`);
      assert.equal(mode, 'EX');
      assert.equal(ttl, 3600);
      assert.match(value, /"sku_code":"cr-glv-001"/);
    }
  };

  const result = await lookupSkuByCode('  CR-GLV-001  ', {
    redis,
    fetchSku: async (code) => ({
      id: 42,
      sku_code: code,
      product: 7,
      unit: 'box',
      pack_size: '100 pcs/box',
      attributes: { size: 'S' },
      status: 'published'
    })
  });

  assert.equal(result.ok, true);
  assert.equal(result.cache, 'MISS');
  assert.equal(result.data.sku_code, 'cr-glv-001');
  assert.deepEqual(redisCalls, ['get:sku:cr-glv-001', 'set:sku:cr-glv-001:EX:3600']);
});

test('published skus prime cache, draft and archived skus invalidate it, and renames delete the old key', () => {
  const published = planSkuCacheMutation({
    event: 'items.update',
    collection: 'product_skus',
    items: [
      {
        id: 1,
        sku_code: 'CR-GLV-001',
        previous_sku_code: 'CR-GLV-000',
        product: 7,
        unit: 'box',
        pack_size: '100 pcs/box',
        attributes: { size: 'S' },
        status: 'published'
      }
    ]
  });

  assert.deepEqual(published.setKeys, ['sku:cr-glv-001']);
  assert.deepEqual(published.delKeys, ['sku:cr-glv-000']);

  const archived = planSkuCacheMutation({
    event: 'items.update',
    collection: 'product_skus',
    items: [
      {
        id: 1,
        sku_code: 'CR-GLV-001',
        status: 'archived'
      }
    ]
  });

  assert.deepEqual(archived.setKeys, []);
  assert.deepEqual(archived.delKeys, ['sku:cr-glv-001']);

  const deleted = planSkuCacheMutation({
    event: 'items.delete',
    collection: 'product_skus',
    items: [
      {
        id: 1,
        sku_code: 'CR-GLV-001'
      }
    ]
  });

  assert.deepEqual(deleted.setKeys, []);
  assert.deepEqual(deleted.delKeys, ['sku:cr-glv-001']);
});
```

Also add RFQ normalization coverage so customer-supplied SKU lookups stay on the same canonical form:

```ts
test('assertRfqSkusExist lowercases lookup keys and returns normalized line items', async () => {
  const result = await assertRfqSkusExist([{ sku: '  CR-GLV-001  ', qty: 1 }], {
    fetchSkus: async (skus) => {
      assert.deepEqual(skus, ['cr-glv-001']);
      return [{ sku_code: 'cr-glv-001' }];
    }
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, [{ sku: 'cr-glv-001', qty: 1 }]);
});
```

- [ ] **Step 2: Run the targeted tests and confirm they fail**

Run: `cd frontend && node --import tsx --test src/lib/sku-cache.test.ts src/lib/rfq-validation.test.ts src/lib/rfq-sku.test.ts src/lib/rfq-submit.test.ts`

Expected: fail because the shared SKU cache helper does not exist yet and the RFQ path still only trims SKU input.

- [ ] **Step 3: Implement the shared helper and consumer refactors**

Add the helper functions in `frontend/src/lib/sku-cache.ts`:

```ts
export function normalizeSkuCode(value: string): string;
export function buildSkuCacheKey(value: string): string;
export function lookupSkuByCode(
  rawCode: string,
  deps: {
    redis: { get(key: string): Promise<string | null>; set(...args: unknown[]): Promise<unknown> };
    fetchSku(code: string): Promise<ProductSku | null>;
  }
): Promise<{ ok: true; cache: 'HIT' | 'MISS'; data: ProductSku } | { ok: false; status: 404 }>;
export function planSkuCacheMutation(payload: SkuCacheWebhookPayload): {
  setKeys: string[];
  delKeys: string[];
  records: SkuCacheRecord[];
};
```

Then wire the consumers:

- `frontend/src/app/api/sku/[code]/route.ts` should call `normalizeSkuCode(code)` before the Redis lookup and keep the existing `x-cache` header.
- `frontend/src/lib/rfq-validation.ts` should normalize each `items[].sku` through the shared helper so the fingerprint and downstream lookup use the same canonical code.
- `frontend/src/lib/rfq-sku.ts` should dedupe normalized SKUs before querying Directus and return normalized `sku` values in `line_items`.
- `frontend/src/lib/directus.ts` should add `attributes: Record<string, unknown> | null` to `ProductSku` and type `status` as `published | draft | archived`.
- `frontend/src/lib/rfq-submit.test.ts` should expect normalized lowercased `line_items`.
- `frontend/package.json` should add `src/lib/sku-cache.test.ts` to the `test` script once the file exists.

- [ ] **Step 4: Run the targeted tests again**

Run: `cd frontend && node --import tsx --test src/lib/sku-cache.test.ts src/lib/rfq-validation.test.ts src/lib/rfq-sku.test.ts src/lib/rfq-submit.test.ts`

Expected: PASS, with the RFQ path now returning lowercase SKU codes and the public SKU route still emitting `x-cache: HIT|MISS`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/sku-cache.ts frontend/src/lib/sku-cache.test.ts frontend/src/lib/directus.ts frontend/src/lib/rfq-validation.ts frontend/src/lib/rfq-validation.test.ts frontend/src/lib/rfq-sku.ts frontend/src/lib/rfq-sku.test.ts frontend/src/lib/rfq-submit.test.ts frontend/src/app/api/sku/[code]/route.ts frontend/package.json
git commit -m "feat: normalize sku codes across lookup paths"
```

## Task 2: Add the internal mutation endpoint and Directus flow

**Files:**
- Create: `frontend/src/app/api/internal/sku-cache/route.ts`
- Modify: `frontend/src/lib/sku-cache.ts`
- Create: `directus/verify_sku_cache_hook.mjs`
- Manual config: Directus Flow `flow-sku-cache-sync`

- [ ] **Step 1: Write the failing smoke script**

Create a smoke script that proves the endpoint contract before the route exists:

```js
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const publishedPayload = {
  event: 'items.update',
  collection: 'product_skus',
  items: [
    {
      id: 1,
      sku_code: 'sku-gloves-nitrile-s',
      status: 'published',
      product: 1,
      unit: 'box',
      pack_size: '100 pcs/box',
      attributes: { size: 'S' }
    }
  ]
};

const bad = await fetch(`${baseUrl}/api/internal/sku-cache`, {
  method: 'POST',
  headers: {
    Authorization: 'Bearer wrong-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(publishedPayload)
});

assert.equal(bad.status, 403);
```

The same script should then:

1. POST a valid published payload with `Authorization: Bearer ${INTERNAL_API_TOKEN}` and expect `200`.
2. GET `/api/sku/sku-gloves-nitrile-s` and expect `x-cache: HIT` after the prime.
3. POST a draft or archived payload for the same SKU and expect `200`.
4. GET the same SKU again and expect `x-cache: MISS` on the first read after invalidate, then `HIT` on the next read.

- [ ] **Step 2: Run the smoke script and confirm it fails**

Run: `cd . && node directus/verify_sku_cache_hook.mjs`

Expected: fail because `/api/internal/sku-cache` is not implemented yet, so the bad-token check or the valid prime request cannot succeed.

- [ ] **Step 3: Implement the internal route**

Add `frontend/src/app/api/internal/sku-cache/route.ts` as a thin adapter that:

1. Reads `Authorization` and rejects missing or mismatched `INTERNAL_API_TOKEN` with `403`.
2. Parses JSON and rejects malformed bodies with `400`.
3. Accepts only `event` values `items.create`, `items.update`, and `items.delete` for `collection === 'product_skus'`.
4. Calls the shared planner from `frontend/src/lib/sku-cache.ts`.
5. Applies all `set` and `del` commands with one Redis pipeline.
6. Returns a success envelope that includes the affected `primed`, `invalidated`, and `deletedOldKeys` arrays.

Example response:

```json
{
  "success": true,
  "data": {
    "event": "items.update",
    "collection": "product_skus",
    "primed": ["sku:sku-gloves-nitrile-s"],
    "invalidated": [],
    "deletedOldKeys": ["sku:sku-gloves-nitrile-old"]
  }
}
```

- [ ] **Step 4: Configure the Directus Flow**

Create or update the Directus UI flow named `flow-sku-cache-sync` so it:

- Triggers on `product_skus` `create`, `update`, and `delete`.
- Filters publish-state changes so `published` primes Redis and `draft` / `archived` / delete invalidates Redis.
- Sends `POST /api/internal/sku-cache` with `Authorization: Bearer ${INTERNAL_API_TOKEN}`.
- Passes the current record fields plus `previous_sku_code` when `sku_code` changes:

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

- [ ] **Step 5: Rerun the smoke script**

Run: `cd . && node directus/verify_sku_cache_hook.mjs`

Expected: the bad-token request returns `403`; the valid prime request returns `200`; the public SKU route shows `x-cache: HIT` after the prime; the invalidate request returns `200`; and the next public lookup shows `x-cache: MISS` before the route re-fills the cache.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/api/internal/sku-cache/route.ts frontend/src/lib/sku-cache.ts directus/verify_sku_cache_hook.mjs
git commit -m "feat: add sku cache mutation endpoint"
```

## Task 3: Enforce DB uniqueness and document the contract

**Files:**
- Create: `directus/sql/migrations/2026-06-12-add-product-sku-case-insensitive-unique.sql`
- Modify: `directus/SCHEMA.md`
- Modify: `docs/specs/SPEC-03-data-model.md`
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/engineering/ENG-05-local-development-setup.md`
- Modify: `docs/operations/OPS-01-deployment-guide.md`

- [ ] **Step 1: Write the preflight collision check**

Run this SQL before the migration lands so the functional unique index does not fail on existing data:

```sql
SELECT lower(btrim(sku_code)) AS normalized_code, COUNT(*) AS row_count
FROM product_skus
GROUP BY 1
HAVING COUNT(*) > 1;
```

Expected: no rows. If this returns rows, clean the duplicates before adding the index.

- [ ] **Step 2: Run the preflight check against the local database**

Run the same query against the Directus database used by the bootstrap environment and confirm that no two existing `product_skus` rows collide after `trim().toLowerCase()`.

- [ ] **Step 3: Add the functional unique index**

Create `directus/sql/migrations/2026-06-12-add-product-sku-case-insensitive-unique.sql` with:

```sql
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_product_skus_sku_code_normalized_unique
  ON product_skus (lower(btrim(sku_code)));
```

That index makes the cache key contract real at the database layer, not just in the app code.

- [ ] **Step 4: Update the docs and env guidance**

Update the docs so the next engineer does not need to reverse-engineer the contract:

- `directus/SCHEMA.md`: note that `sku_code` is canonical lowercased text and that the database enforces case-insensitive uniqueness.
- `docs/specs/SPEC-03-data-model.md`: add the same note to the `product_skus` row and the conventions section.
- `docs/specs/SPEC-04-api-spec.md`: add `POST /api/internal/sku-cache`, its bearer auth, and the prime/invalidate response envelope.
- `docs/engineering/ENG-05-local-development-setup.md`: include `INTERNAL_API_TOKEN` in the local env checklist.
- `docs/operations/OPS-01-deployment-guide.md`: include `INTERNAL_API_TOKEN` in the production/staging secret list and the Directus Flow auth note.

- [ ] **Step 5: Rerun verification**

Run:

```bash
cd . && node directus/verify_sku_cache_hook.mjs
```

Then rerun the collision audit query. Expected: the smoke script still passes and the normalized SKU query returns no duplicates.

- [ ] **Step 6: Commit**

```bash
git add directus/sql/migrations/2026-06-12-add-product-sku-case-insensitive-unique.sql directus/SCHEMA.md docs/specs/SPEC-03-data-model.md docs/specs/SPEC-04-api-spec.md docs/engineering/ENG-05-local-development-setup.md docs/operations/OPS-01-deployment-guide.md
git commit -m "feat: enforce canonical sku code uniqueness"
```

## Self-Review

### Spec coverage

- `prime + invalidate` is covered by the shared planner and the internal route.
- `draft -> published` priming is covered by the shared planner and the smoke script.
- `published -> draft/archived` invalidation is covered by the shared planner and the smoke script.
- `sku:{code-lowercased}` is covered by `normalizeSkuCode` and the DB index on `lower(btrim(sku_code))`.
- `sku_code` rename old-key deletion is covered by `previous_sku_code` in the planner and the route response.
- Bulk batching is covered by the `items[]` payload and the Redis pipeline in the internal route.
- Cache miss read-through is covered by `lookupSkuByCode`.
- `INTERNAL_API_TOKEN` is covered in the route, the smoke script, and the deployment docs.

### Placeholder scan

- No `TBD`, `TODO`, or hand-wavy test steps remain.
- Each task names the files to touch and the exact commands to run.

### Type consistency

- Use the same helper names everywhere: `normalizeSkuCode`, `buildSkuCacheKey`, `lookupSkuByCode`, `planSkuCacheMutation`, and `applySkuCacheMutations`.
- Keep the Directus payload shape stable across the smoke script, the flow UI payload, and `SPEC-04`.
- Keep RFQ normalization on the same helper so public SKU lookup and RFQ validation do not drift apart.

### Open item

- The Directus Flow itself lives in the CMS UI, not in git. The smoke script is the regression check that keeps the flow contract honest after deployment.
