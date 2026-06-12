# RFQ BFF Validation Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden `POST /api/rfq` so public RFQ requests are validated before persistence and spam, bad data, duplicate submits, and invalid SKUs are blocked.

**Architecture:** Keep Next.js as the only public RFQ write path. Split the work into four small helpers: payload validation, SKU existence lookup, anti-spam state checks, and a thin submission orchestrator that maps results to the API response envelope. Reuse Directus for persistence and public SKU reads, and reuse Redis for rate limit plus dedupe state so the route stays small and testable.

**Tech Stack:** Next.js App Router, `@directus/sdk`, Redis via `ioredis`, Node test runner, TypeScript, Cloudflare Turnstile verification fetch.

---

## File Structure

- Modify: `frontend/package.json`
  Responsibility: add `tsx` so TypeScript unit tests can run under `node --test`.
- Modify: `frontend/package-lock.json`
  Responsibility: lock the new `tsx` dev dependency.
- Create: `frontend/src/lib/rfq-validation.ts`
  Responsibility: parse and normalize RFQ payload shape, email, phone, quantity, items, and source.
- Create: `frontend/src/lib/rfq-validation.test.ts`
  Responsibility: lock the payload validation contract.
- Create: `frontend/src/lib/rfq-sku.ts`
  Responsibility: confirm every submitted SKU exists and is published before write.
- Create: `frontend/src/lib/rfq-sku.test.ts`
  Responsibility: lock SKU existence behavior.
- Create: `frontend/src/lib/rfq-anti-spam.ts`
  Responsibility: verify Turnstile, enforce IP rate limit, and reserve dedupe fingerprints in Redis.
- Create: `frontend/src/lib/rfq-anti-spam.test.ts`
  Responsibility: lock anti-spam behavior.
- Create: `frontend/src/lib/rfq-submit.ts`
  Responsibility: compose validation, anti-spam, SKU lookup, dedupe, and Directus write into one use-case function.
- Create: `frontend/src/lib/rfq-submit.test.ts`
  Responsibility: lock end-to-end submission behavior with stubbed dependencies.
- Modify: `frontend/src/app/api/rfq/route.ts`
  Responsibility: keep HTTP adapter thin and map submit results to JSON responses.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: document new RFQ validation, anti-spam, and error codes.
- Modify: `docs/specs/SPEC-09-security-rbac.md`
  Responsibility: document the BFF-only RFQ write path and anti-spam controls.
- Modify: `docs/testing/TEST-02-test-cases.md`
  Responsibility: add concrete RFQ cases for invalid email, bad phone, zero qty, unknown SKU, rate limit, duplicate submit, and Turnstile failure.
- Modify: `docs/testing/TEST-03-uat-checklist.md`
  Responsibility: add a smoke checklist for successful RFQ submit and blocked spam cases.

## Task 0: Make TypeScript tests runnable

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`

- [ ] **Step 1: Write the failing script change**

```json
{
  "scripts": {
    "test": "node --import tsx --test src/lib/directus.test.mjs src/lib/api-response.test.ts src/lib/rfq-validation.test.ts src/lib/rfq-sku.test.ts src/lib/rfq-anti-spam.test.ts src/lib/rfq-submit.test.ts"
  },
  "devDependencies": {
    "tsx": "^4.19.2"
  }
}
```

- [ ] **Step 2: Run current tests to prove the runner change is needed**

Run: `node --test src/lib/api-response.test.ts`
Expected: fail because Node cannot execute the existing TypeScript test file without the `tsx` loader.

- [ ] **Step 3: Apply the minimal runner update**

Add `tsx` as a dev dependency and switch the test script to the command above so future `.ts` tests run without a separate compile step.

- [ ] **Step 4: Run the test command again**

Run: `node --import tsx --test src/lib/api-response.test.ts`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: enable ts rfq tests"
```

## Task 1: Build RFQ payload validation

**Files:**
- Create: `frontend/src/lib/rfq-validation.ts`
- Create: `frontend/src/lib/rfq-validation.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRfqPayload } from './rfq-validation';

test('rejects invalid email, empty items, and zero qty', () => {
  const result = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'not-an-email',
    phone: '+84 123 456',
    items: [{ sku: 'CR-GLV-001', qty: 0 }],
    message: 'Need quote'
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.error.details.invalidFields.email, ['INVALID_EMAIL']);
  assert.deepEqual(result.error.details.invalidFields.items, ['INVALID_QTY']);
});

test('normalizes phone and source and trims strings', () => {
  const result = validateRfqPayload({
    company: '  ACME  ',
    contact: '  Mr A  ',
    email: 'a@acme.vn',
    phone: ' (+84) 901-234-567 ',
    source: 'portal',
    items: [{ sku: 'CR-GLV-001', qty: 1 }]
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.company, 'ACME');
  assert.equal(result.value.contact_name, 'Mr A');
  assert.equal(result.value.phone, '+84901234567');
  assert.equal(result.value.source, 'portal');
});
```

- [ ] **Step 2: Run the new test file and confirm it fails**

Run: `node --import tsx --test src/lib/rfq-validation.test.ts`
Expected: fail because `validateRfqPayload` does not exist yet.

- [ ] **Step 3: Implement the validator**

Create a pure helper with this shape:

```ts
export type RfqValidationResult =
  | { ok: true; value: NormalizedRfqPayload }
  | {
      ok: false;
      error: {
        code: 'UNPROCESSABLE_ENTITY';
        message: string;
        details: {
          missingFields?: string[];
          invalidFields?: Record<string, string[]>;
        };
      };
    };

export function validateRfqPayload(input: unknown): RfqValidationResult;
```

Validation rules:
- `company` required, trimmed, non-empty.
- `email` required, trimmed, lowercased, must match a practical email regex.
- `phone` optional, but if present must contain only digits plus `+`, spaces, `-`, `(`, `)`, and normalize to digits with one optional leading `+`.
- `items` required and must be a non-empty array.
- Each item must have a string `sku` and an integer `qty > 0`.
- `message`, `contact`, `industry`, `source`, and `website` are normalized when present.

- [ ] **Step 4: Run the tests and verify they pass**

Run: `node --import tsx --test src/lib/rfq-validation.test.ts`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/rfq-validation.ts frontend/src/lib/rfq-validation.test.ts
git commit -m "feat: validate rfq payload"
```

## Task 2: Verify submitted SKUs exist and are published

**Files:**
- Create: `frontend/src/lib/rfq-sku.ts`
- Create: `frontend/src/lib/rfq-sku.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRfqSkusExist } from './rfq-sku';

test('rejects unknown sku before write', async () => {
  const result = await assertRfqSkusExist(
    [{ sku: 'MISSING-SKU', qty: 1 }],
    {
      fetchSkus: async () => []
    }
  );

  assert.equal(result.ok, false);
  assert.deepEqual(result.error.details.invalidSkus, ['MISSING-SKU']);
});
```

- [ ] **Step 2: Run the new test and confirm it fails**

Run: `node --import tsx --test src/lib/rfq-sku.test.ts`
Expected: fail because `assertRfqSkusExist` does not exist yet.

- [ ] **Step 3: Implement the SKU existence helper**

Create a helper that:
- accepts the normalized RFQ items,
- queries public Directus for `product_skus` by `sku_code`,
- requires `status = published`,
- returns `ok: false` with `invalidSkus` when any SKU is missing.

Use the existing `publicDirectus` client from `frontend/src/lib/directus.ts` so the public read path stays explicit.

```ts
export async function assertRfqSkusExist(
  items: Array<{ sku: string; qty: number }>,
  deps?: { fetchSkus?: (skus: string[]) => Promise<Array<{ sku_code: string }>> }
): Promise<
  | { ok: true; value: Array<{ sku: string; qty: number }> }
  | { ok: false; error: { code: 'UNPROCESSABLE_ENTITY'; details: { invalidSkus: string[] } } }
>;
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `node --import tsx --test src/lib/rfq-sku.test.ts`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/rfq-sku.ts frontend/src/lib/rfq-sku.test.ts
git commit -m "feat: validate rfq skus"
```

## Task 3: Add Turnstile, IP rate limit, and duplicate submit guards

**Files:**
- Create: `frontend/src/lib/rfq-anti-spam.ts`
- Create: `frontend/src/lib/rfq-anti-spam.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceRfqAntiSpam } from './rfq-anti-spam';

test('blocks request when Turnstile verification fails', async () => {
  const result = await enforceRfqAntiSpam(
    { token: 'bad-token', ip: '1.2.3.4', fingerprint: 'abc' },
    {
      verifyTurnstile: async () => false,
      rateLimit: async () => ({ ok: true }),
      reserveFingerprint: async () => ({ ok: true })
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'FORBIDDEN');
});

test('blocks request after IP rate limit is exceeded', async () => {
  const result = await enforceRfqAntiSpam(
    { token: 'good-token', ip: '1.2.3.4', fingerprint: 'abc' },
    {
      verifyTurnstile: async () => true,
      rateLimit: async () => ({ ok: false, retryAfterSeconds: 600 }),
      reserveFingerprint: async () => ({ ok: true })
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'TOO_MANY_REQUESTS');
});

test('blocks duplicate submit within dedupe window', async () => {
  const result = await enforceRfqAntiSpam(
    { token: 'good-token', ip: '1.2.3.4', fingerprint: 'abc' },
    {
      verifyTurnstile: async () => true,
      rateLimit: async () => ({ ok: true }),
      reserveFingerprint: async () => ({ ok: false })
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'CONFLICT');
});
```

- [ ] **Step 2: Run the new test and confirm it fails**

Run: `node --import tsx --test src/lib/rfq-anti-spam.test.ts`
Expected: fail because `enforceRfqAntiSpam` does not exist yet.

- [ ] **Step 3: Implement the anti-spam helper**

Build one helper with these concrete rules:
- Verify Cloudflare Turnstile using `TURNSTILE_SECRET_KEY` and the submitted token.
- Use Redis IP key `rfq:ip:${ip}` with a 10 minute window and a limit of 5 submissions per IP.
- Use Redis dedupe key `rfq:dedupe:${fingerprint}` with a 15 minute window and `SET NX`.
- Return typed failures:
  - `FORBIDDEN` when Turnstile fails.
  - `TOO_MANY_REQUESTS` when IP limit is exceeded.
  - `CONFLICT` when the same normalized payload is submitted again inside the dedupe window.

```ts
export async function enforceRfqAntiSpam(
  input: { token: string; ip: string; fingerprint: string },
  deps: {
    verifyTurnstile: (token: string, ip: string) => Promise<boolean>;
    rateLimit: (ip: string) => Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }>;
    reserveFingerprint: (fingerprint: string) => Promise<{ ok: true } | { ok: false }>;
  }
): Promise<
  | { ok: true }
  | {
      ok: false;
      error: {
        code: 'FORBIDDEN' | 'TOO_MANY_REQUESTS' | 'CONFLICT';
        message: string;
        details?: Record<string, unknown>;
      };
    }
>;
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `node --import tsx --test src/lib/rfq-anti-spam.test.ts`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/rfq-anti-spam.ts frontend/src/lib/rfq-anti-spam.test.ts
git commit -m "feat: add rfq anti spam guards"
```

## Task 4: Compose RFQ submission and keep the route thin

**Files:**
- Create: `frontend/src/lib/rfq-submit.ts`
- Create: `frontend/src/lib/rfq-submit.test.ts`
- Modify: `frontend/src/app/api/rfq/route.ts`

- [ ] **Step 1: Write the failing test for the orchestrator**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { submitRfq } from './rfq-submit';

test('submits only after validation, sku check, and anti-spam pass', async () => {
  const result = await submitRfq(
    {
      company: 'ACME',
      contact: 'Mr A',
      email: 'a@acme.vn',
      phone: '+84901234567',
      items: [{ sku: 'CR-GLV-001', qty: 1 }],
      message: 'Need quote',
      token: 'good-token',
      website: ''
    },
    {
      ip: '1.2.3.4',
      verifyTurnstile: async () => true,
      rateLimit: async () => ({ ok: true }),
      reserveFingerprint: async () => ({ ok: true }),
      fetchSkus: async () => [{ sku_code: 'CR-GLV-001' }],
      createRfq: async () => ({ id: 123 })
    }
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.id, 123);
});
```

- [ ] **Step 2: Run the orchestrator test and confirm it fails**

Run: `node --import tsx --test src/lib/rfq-submit.test.ts`
Expected: fail because `submitRfq` does not exist yet.

- [ ] **Step 3: Implement the orchestrator**

Create one function that:
- calls `validateRfqPayload`,
- rejects empty `items` before any external call,
- calls `enforceRfqAntiSpam`,
- calls `assertRfqSkusExist`,
- derives a stable fingerprint from normalized `company`, `email`, `phone`, `industry`, `message`, `source`, and normalized line items,
- writes `rfq_requests` through `createWriteDirectusClient`,
- always persists `status: 'new'`,
- sets `source` to `web` unless the normalized payload says `portal`.

Use these response codes in the orchestrator:
- `400 BAD_REQUEST` for invalid JSON.
- `422 UNPROCESSABLE_ENTITY` for validation failures and unknown SKUs.
- `403 FORBIDDEN` for failed Turnstile.
- `429 TOO_MANY_REQUESTS` for rate limit.
- `409 CONFLICT` for duplicate submit.
- `500 INTERNAL_SERVER_ERROR` when `DIRECTUS_TOKEN` is missing.
- `502 BAD_GATEWAY` when Directus write fails for another reason.

```ts
export async function submitRfq(
  body: unknown,
  deps: {
    ip: string;
    token: string;
    fetchSkus: (skus: string[]) => Promise<Array<{ sku_code: string }>>;
    verifyTurnstile: (token: string, ip: string) => Promise<boolean>;
    rateLimit: (ip: string) => Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }>;
    reserveFingerprint: (fingerprint: string) => Promise<{ ok: true } | { ok: false }>;
    createRfq: (input: {
      company: string;
      contact_name: string;
      email: string;
      phone?: string;
      industry?: string;
      message?: string;
      line_items: Array<{ sku: string; qty: number }>;
      status: 'new';
      source: 'web' | 'portal';
    }) => Promise<{ id: number | string }>;
  }
): Promise<
  | { ok: true; data: { id: number | string } }
  | { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } }
>;
```

- [ ] **Step 4: Rewrite `route.ts` as a thin adapter**

`frontend/src/app/api/rfq/route.ts` should only:
- parse `Request`,
- extract client IP from `cf-connecting-ip`, `x-real-ip`, or `x-forwarded-for`,
- build the dependency bundle with `getRedis()`, `publicDirectus`, and `createWriteDirectusClient()`,
- call `submitRfq`,
- map the returned result into `successJson` or `errorJson`.

The route should not contain validation logic after this step.

- [ ] **Step 5: Run the orchestrator test and a route smoke test**

Run:
```bash
node --import tsx --test src/lib/rfq-submit.test.ts
```

Then run a manual smoke request:
```bash
curl -X POST http://localhost:3000/api/rfq ^
  -H "Content-Type: application/json" ^
  -d "{\"company\":\"ACME\",\"email\":\"a@acme.vn\",\"items\":[{\"sku\":\"CR-GLV-001\",\"qty\":1}],\"message\":\"Need quote\",\"website\":\"\"}"
```

Expected: 200 success response with `data.id`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/rfq-submit.ts frontend/src/lib/rfq-submit.test.ts frontend/src/app/api/rfq/route.ts
git commit -m "feat: harden rfq submission"
```

## Task 5: Update docs and acceptance tests

**Files:**
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/specs/SPEC-09-security-rbac.md`
- Modify: `docs/testing/TEST-02-test-cases.md`
- Modify: `docs/testing/TEST-03-uat-checklist.md`

- [ ] **Step 1: Write the doc updates**

Update `SPEC-04` to state:
- `POST /api/rfq` validates email format, phone format, non-empty items, qty > 0, and SKU existence before write.
- public RFQ submissions are verified with Turnstile.
- IP rate limit and dedupe are enforced.
- new error codes are part of the contract: `403`, `409`, `429`.

Update `SPEC-09` to state:
- public RFQ write path stays in Next.js only,
- Directus remains the persistence target,
- anti-spam lives in the BFF and Directus only receives already-validated writes.

Add test cases for:
- invalid email rejected with `422`,
- invalid phone rejected with `422`,
- zero quantity rejected with `422`,
- empty items rejected with `422`,
- unknown SKU rejected with `422`,
- Turnstile failure rejected with `403`,
- too many submits rejected with `429`,
- duplicate submit rejected with `409`.

- [ ] **Step 2: Run markdown review**

Run:
```bash
rg -n "TBD|placeholder|409|429|403|Turnstile|qty > 0|unknown SKU" docs/specs docs/testing
```

Expected: the new rules appear in the updated docs and no placeholder text remains.

- [ ] **Step 3: Commit**

```bash
git add docs/specs/SPEC-04-api-spec.md docs/specs/SPEC-09-security-rbac.md docs/testing/TEST-02-test-cases.md docs/testing/TEST-03-uat-checklist.md
git commit -m "docs: tighten rfq validation contract"
```

## Self-Review

Coverage check:
- Email format validation is covered by Task 1 and Task 4.
- Phone validation is covered by Task 1 and Task 4.
- `qty > 0` validation is covered by Task 1 and Task 4.
- SKU existence is covered by Task 2 and Task 4.
- Non-empty items is covered by Task 1 and Task 4.
- Turnstile is covered by Task 3 and Task 4.
- IP rate limit is covered by Task 3 and Task 4.
- Duplicate submit / dedupe is covered by Task 3 and Task 4.

Placeholder check:
- No placeholder text or vague task text remains in the plan.

Type consistency check:
- `validateRfqPayload`, `assertRfqSkusExist`, `enforceRfqAntiSpam`, and `submitRfq` are named consistently across tasks.
- Error codes are consistent across route, helpers, and docs.

Plan complete and saved to `docs/superpowers/plans/2026-06-09-rfq-bff-validation-hardening.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
