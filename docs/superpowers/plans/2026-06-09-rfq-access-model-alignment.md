# RFQ Access Model Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce one RFQ write path: visitors and customers may submit RFQs only through Next.js, while public users may still read published content directly from Directus.

**Architecture:** Directus RBAC becomes read-only for public/customer content access and stops accepting direct `rfq_requests` creates. Next.js `POST /api/rfq` becomes the only RFQ ingestion path and uses an explicit token-backed Directus write client, while read paths such as `GET /api/sku/[code]` use an explicit public Directus client so reads never inherit write privileges by accident. Documentation and RBAC verification are updated to describe the final contract instead of the current mixed model.

**Tech Stack:** Directus 11 RBAC bootstrap scripts, Next.js 14 App Router route handlers, `@directus/sdk`, Node test runner with `tsx`, Markdown specs/checklists.

---

## File Structure

- Modify: `directus/rbac/permissions.mjs`
  Responsibility: remove direct `rfq_requests` create permission from visitor/public and customer policies.
- Modify: `directus/rbac_verify.mjs`
  Responsibility: prove direct Directus writes to `rfq_requests` are denied for visitors and customers.
- Modify: `frontend/package.json`
  Responsibility: add a runnable TS test entrypoint for the small frontend helper tests in this change.
- Create: `frontend/src/lib/directus.test.ts`
  Responsibility: lock in explicit public-read vs token-required write client behavior.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: replace the env-dependent shared client with explicit public-read and token-required write exports.
- Modify: `frontend/src/app/api/rfq/route.ts`
  Responsibility: make `/api/rfq` the only supported RFQ write path, set/sanitize `source`, and fail clearly if `DIRECTUS_TOKEN` is missing.
- Modify: `frontend/src/app/api/sku/[code]/route.ts`
  Responsibility: use the explicit public Directus client for published SKU reads.
- Modify: `directus/SCHEMA.md`
  Responsibility: document final role/access rules for RFQ and public content.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: clarify that RFQ submission is app-mediated, not a direct Directus create for visitor/customer roles.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: make `/api/rfq` the single RFQ write contract.
- Modify: `docs/specs/SPEC-09-security-rbac.md`
  Responsibility: align security language with the server-token-only RFQ write model.
- Modify: `docs/testing/TEST-05-directus-rbac-checklist.md`
  Responsibility: change expected outcomes for direct Directus RFQ writes and add a note that RFQ writes are verified through Next.js separately.

### Task 1: Lock Directus RBAC to deny direct RFQ creates

**Files:**
- Modify: `directus/rbac_verify.mjs`
- Modify: `directus/rbac/permissions.mjs`
- Test: `directus/rbac_verify.mjs`

- [ ] **Step 1: Write the failing RBAC assertions**

Replace the visitor and customer RFQ create assertions in `directus/rbac_verify.mjs` so the test expects direct Directus `POST /items/rfq_requests` to fail.

```js
// directus/rbac_verify.mjs
async function verifyVisitor(fixtures) {
  const products = await request(null, 'GET', '/items/products');
  assert(products.ok, 'Visitor can read products.');

  const orders = await request(null, 'GET', '/items/orders');
  assert(!orders.ok, 'Visitor cannot read orders.');

  const createRfq = await request(null, 'POST', '/items/rfq_requests', {
    company: 'Visitor Company',
    contact_name: 'Visitor Temp',
    email: 'visitor-temp@example.com',
    phone: '0911111112',
    message: `RBAC-VISITOR-RFQ-${Date.now()}`,
    source: 'web'
  });
  assert(!createRfq.ok, 'Visitor cannot create RFQ records directly in Directus.');
}
```

```js
// directus/rbac_verify.mjs
  const createRfq = await request(customerToken, 'POST', '/items/rfq_requests', {
    company: own.companyName,
    contact_name: own.contactName,
    email: own.email,
    phone: own.phone,
    industry: 'electronics',
    hub: own.hubId,
    line_items: [{ sku: own.rfqSkuCode, qty: 1 }],
    message: `RBAC-CUSTOMER-RFQ-${own.label}-${Date.now()}`,
    status: 'new',
    source: 'portal',
    user: own.userId
  });
  assert(!createRfq.ok, `Customer ${own.email} cannot create RFQ directly in Directus.`);
```

- [ ] **Step 2: Run RBAC verification to prove the new expectation fails first**

Run: `npm run rbac:verify`

Expected: FAIL with visitor and customer RFQ create assertions because `directus/rbac/permissions.mjs` still grants direct `create` on `rfq_requests`.

- [ ] **Step 3: Remove direct RFQ create from visitor and customer policies**

Delete the two `rfq_requests` create permission blocks from `directus/rbac/permissions.mjs`.

```js
// directus/rbac/permissions.mjs
// Delete this block entirely:
permissions.push({
  policy: VISITOR_POLICY_ID,
  collection: 'rfq_requests',
  action: 'create',
  permissions: {},
  fields: ['company', 'contact_name', 'email', 'phone', 'message', 'line_items', 'source', 'hub']
});
```

```js
// directus/rbac/permissions.mjs
// Delete this object entirely from the CUSTOMER_POLICY_ID permission list:
{
  policy: CUSTOMER_POLICY_ID,
  collection: 'rfq_requests',
  action: 'create',
  permissions: {},
  fields: ['*']
},
```

- [ ] **Step 4: Re-bootstrap Directus and rerun RBAC verification**

Run: `npm run bootstrap`

Expected: PASS with bootstrap updating permissions idempotently.

Run: `npm run rbac:seed`

Expected: PASS with fixture data present.

Run: `npm run rbac:verify`

Expected: PASS with visitor/customer direct RFQ create denied and existing own-read checks still passing.

- [ ] **Step 5: Commit the RBAC change**

```bash
git add directus/rbac/permissions.mjs directus/rbac_verify.mjs
git commit -m "fix: remove direct directus rfq creates"
```

### Task 2: Make the frontend RFQ write path explicit

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/lib/directus.test.ts`
- Modify: `frontend/src/lib/directus.ts`
- Modify: `frontend/src/app/api/rfq/route.ts`
- Modify: `frontend/src/app/api/sku/[code]/route.ts`
- Test: `frontend/src/lib/directus.test.ts`

- [ ] **Step 1: Add a runnable TypeScript test command for frontend helper tests**

Install `tsx` and add a test script to `frontend/package.json`.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "tsx --test src/**/*.test.ts",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "devDependencies": {
    "@types/node": "^20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.15",
    "postcss": "^8.4.47",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.14",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}
```

Run: `npm install`

Expected: PASS with `tsx` added to `frontend/package-lock.json`.

- [ ] **Step 2: Write the failing frontend test that defines the client contract**

Create `frontend/src/lib/directus.test.ts` with tests for URL fallback and token-required write behavior.

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { getDirectusUrl, requireDirectusToken } from './directus';

test('getDirectusUrl falls back to local Directus', () => {
  assert.equal(getDirectusUrl(undefined), 'http://localhost:8055');
});

test('requireDirectusToken throws when RFQ write token is missing', () => {
  assert.throws(
    () => requireDirectusToken(undefined),
    /DIRECTUS_TOKEN is required for server-side RFQ writes/
  );
});
```

- [ ] **Step 3: Run the frontend tests to verify they fail**

Run: `npm test`

Expected: FAIL because `getDirectusUrl` and `requireDirectusToken` do not exist yet in `frontend/src/lib/directus.ts`.

- [ ] **Step 4: Replace the shared env-dependent client with explicit read/write clients**

Update `frontend/src/lib/directus.ts` so reads and writes are separate on purpose.

```ts
import { createDirectus, rest, staticToken } from '@directus/sdk';

export interface ProductSku {
  id: number;
  sku_code: string;
  product: number | null;
  unit: string | null;
  pack_size: string | null;
  status: string;
}

export interface RfqRequest {
  id?: number | string;
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string;
  message?: string;
  line_items?: Array<{ sku: string; qty: number }>;
  status?: string;
  source?: 'web' | 'portal';
}

export interface Schema {
  product_skus: ProductSku[];
  rfq_requests: RfqRequest[];
}

export function getDirectusUrl(url = process.env.DIRECTUS_URL): string {
  return url ?? 'http://localhost:8055';
}

export function requireDirectusToken(token = process.env.DIRECTUS_TOKEN): string {
  if (!token) {
    throw new Error('DIRECTUS_TOKEN is required for server-side RFQ writes.');
  }
  return token;
}

export const publicDirectus = createDirectus<Schema>(getDirectusUrl()).with(rest());

export function createWriteDirectusClient(token = requireDirectusToken()) {
  return createDirectus<Schema>(getDirectusUrl()).with(staticToken(token)).with(rest());
}
```

Update `frontend/src/app/api/sku/[code]/route.ts` to use the public client explicitly.

```ts
import { readItems } from '@directus/sdk';
import { errorJson, successJson } from '@/lib/api-response-next';
import { publicDirectus } from '@/lib/directus';
import { getRedis } from '@/lib/redis';

export async function GET(_req: Request, { params: { code } }: { params: { code: string } }) {
  try {
    const redis = getRedis();
    const key = `sku:${code.toLowerCase()}`;

    const cached = await redis.get(key);
    if (cached) {
      return successJson(JSON.parse(cached), {
        init: { headers: { 'x-cache': 'HIT' } }
      });
    }

    const items = await publicDirectus.request(
      readItems('product_skus', {
        filter: { sku_code: { _eq: code } },
        limit: 1
      })
    );
```

Update `frontend/src/app/api/rfq/route.ts` to always go through a token-backed write client and sanitize `source`.

```ts
import { createItem } from '@directus/sdk';
import { errorJson, successJson } from '@/lib/api-response-next';
import { createWriteDirectusClient } from '@/lib/directus';

function normalizeRfqSource(source: unknown): 'web' | 'portal' {
  return source === 'portal' ? 'portal' : 'web';
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'BAD_REQUEST', 'Request body must be valid JSON.');
  }

  if (body.website) {
    return successJson({ accepted: true });
  }

  const missingFields = ['company', 'email'].filter((field) => !body[field]);
  if (missingFields.length > 0) {
    return errorJson(422, 'UNPROCESSABLE_ENTITY', 'Missing required RFQ fields.', {
      missingFields
    });
  }

  let directus;
  try {
    directus = createWriteDirectusClient();
  } catch (err) {
    console.error('RFQ submit misconfigured', err);
    return errorJson(500, 'INTERNAL_SERVER_ERROR', 'RFQ submission is not configured.');
  }

  try {
    const created = await directus.request(
      createItem('rfq_requests', {
        company: String(body.company),
        contact_name: body.contact ? String(body.contact) : '',
        email: String(body.email),
        phone: body.phone ? String(body.phone) : undefined,
        industry: body.industry ? String(body.industry) : undefined,
        message: body.message ? String(body.message) : undefined,
        line_items: Array.isArray(body.items) ? body.items : [],
        status: 'new',
        source: normalizeRfqSource(body.source)
      })
    );

    return successJson({ id: created?.id });
  } catch (err) {
    console.error('RFQ submit failed', err);
    return errorJson(502, 'BAD_GATEWAY', 'Failed to submit RFQ.');
  }
}
```

- [ ] **Step 5: Run frontend verification**

Run: `npm test`

Expected: PASS with the new directus helper contract locked in.

Run: `npm run typecheck`

Expected: PASS with route imports and helper exports wired correctly.

Run: `npm run lint`

Expected: PASS with no unused imports or type issues.

- [ ] **Step 6: Smoke-test the RFQ endpoint behavior**

Run the app in one terminal: `npm run dev`

Expected: Next.js starts on `http://localhost:3000`.

Run in another terminal:

```bash
curl -X POST http://localhost:3000/api/rfq ^
  -H "Content-Type: application/json" ^
  -d "{\"company\":\"ACME\",\"email\":\"buyer@example.com\",\"items\":[{\"sku\":\"CR-GLV-001\",\"qty\":10}],\"source\":\"web\",\"website\":\"\"}"
```

Expected: `200` with `{ "success": true, "data": { "id": ... } }` when `DIRECTUS_TOKEN` is configured.

Temporarily remove `DIRECTUS_TOKEN` and repeat the same request.

Expected: `500` with code `INTERNAL_SERVER_ERROR`, proving direct public fallback is gone.

- [ ] **Step 7: Commit the frontend access-model change**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/lib/directus.ts frontend/src/lib/directus.test.ts frontend/src/app/api/rfq/route.ts frontend/src/app/api/sku/[code]/route.ts
git commit -m "fix: route rfqs through nextjs only"
```

### Task 3: Align the docs with the final access model

**Files:**
- Modify: `directus/SCHEMA.md`
- Modify: `docs/specs/SPEC-03-data-model.md`
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/specs/SPEC-09-security-rbac.md`
- Modify: `docs/testing/TEST-05-directus-rbac-checklist.md`

- [ ] **Step 1: Update the schema and data-model docs**

Make the access rules explicit in `directus/SCHEMA.md` and `docs/specs/SPEC-03-data-model.md`.

```md
| **Customer** | Read published content; read singletons; read/update own `customers`; read own `orders`, `order_items`, `invoices`, `deliveries`; read own `rfq_requests` |
```

```md
| rfq_requests | read **own** (when linked to `user`); submit through `/api/rfq` | CRUD | – | CRUD |
```

Add one sentence below the table in `docs/specs/SPEC-03-data-model.md`:

```md
Visitor and customer RFQ submission is application-mediated: `POST /api/rfq` writes with a server token; Directus visitor/customer roles do not create `rfq_requests` directly.
```

- [ ] **Step 2: Update the API and security specs**

Replace the mixed wording in `docs/specs/SPEC-04-api-spec.md` and `docs/specs/SPEC-09-security-rbac.md` with the final contract.

```md
## 1. Directus API
- **Auth:** customer JWT (login) or server static token; public role for published content reads.
- **Conventions:** the public site may read published content directly from Directus; RFQ writes go through `POST /api/rfq` only.
```

```md
## 4. Rate limiting and security
- Public mutations (`/api/rfq`, contact) rate-limited per IP via Redis (sliding window).
- `POST /api/rfq` always writes with `DIRECTUS_TOKEN`; visitor/customer roles do not create `rfq_requests` directly in Directus.
- CORS restricted to the site origin in production.
```

```md
## Authentication
- Customer auth via Directus (JWT). Sessions/refresh per Directus defaults.
- Admin/Editor/Sales authenticate to the Directus admin app.
- Server-side writes use a scoped `DIRECTUS_TOKEN`; visitor/customer RFQ submission goes through Next.js and never directly to Directus.
```

- [ ] **Step 3: Update the RBAC checklist so it tests the right thing**

Change the RFQ expectations in `docs/testing/TEST-05-directus-rbac-checklist.md`.

```md
- `Customer`: read published content, read/update own `customers`, read own
  `orders`, `order_items`, `invoices`, `deliveries`, read own
  `rfq_requests`; RFQ submission is through `/api/rfq`
```

Add two matrix rows:

```md
| RBAC-VIS-01 | Visitor | `rfq_requests` | direct create | new | DENY |
| RBAC-CUS-12 | Customer A | `rfq_requests` | direct create | own payload | DENY |
```

Add one note under `API endpoints to use`:

```md
- Direct Directus RBAC checks cover `POST /items/rfq_requests` as DENY for Visitor/Customer.
- Application RFQ behavior is verified separately through `POST /api/rfq`.
```

- [ ] **Step 4: Verify the contradictory wording is gone**

Run:

```bash
rg -n "Visitor can create RFQ records|can create RFQ directly|create and read own `rfq_requests`" directus docs
```

Expected: only the new deny wording remains; no spec/checklist line should still claim visitor or customer directly creates `rfq_requests` in Directus.

- [ ] **Step 5: Commit the documentation alignment**

```bash
git add directus/SCHEMA.md docs/specs/SPEC-03-data-model.md docs/specs/SPEC-04-api-spec.md docs/specs/SPEC-09-security-rbac.md docs/testing/TEST-05-directus-rbac-checklist.md
git commit -m "docs: align rfq access model"
```

## Self-Review

- Spec coverage: the plan covers the three required outcomes from the decision.
  1. Public users can still read published content directly from Directus.
  2. Visitor and customer direct Directus writes to `rfq_requests` are denied.
  3. `POST /api/rfq` becomes the only supported RFQ write path and the docs/tests say so.
- Placeholder scan: no `TODO`, `TBD`, or “implement later” placeholders were left in the tasks.
- Type consistency: the same helper names are used throughout the plan: `getDirectusUrl`, `requireDirectusToken`, `publicDirectus`, `createWriteDirectusClient`, `normalizeRfqSource`.

Plan complete and saved to `docs/superpowers/plans/2026-06-09-rfq-access-model-alignment.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
