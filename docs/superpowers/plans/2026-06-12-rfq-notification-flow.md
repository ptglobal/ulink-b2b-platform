# RFQ Notification Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-assign each new RFQ by hub + industry, send the right Sales inbox and Directus notification, and make exact duplicate RFQ submissions return the original RFQ id instead of creating a second record.

**Architecture:** Keep `POST /api/rfq` as the only public intake path, but move post-create work into a dedicated internal Next.js webhook endpoint that Directus Flow `flow-rfq-notify` calls after each successful RFQ create. The app layer owns the routing matrix, email body, Directus notification write, and retry/logging behavior; Directus owns the trigger and the editable assignment rules collection. The same RFQ normalization code must also produce a stable idempotency key from `email + normalized company + items` so exact duplicates can be resolved to the first RFQ id.

**Tech Stack:** Next.js 14 App Router, `@directus/sdk`, Directus Flows and bootstrap schema, Redis, SMTP mail delivery, Node test runner with `tsx`, markdown docs.

---

## File Structure

- Create: `frontend/src/lib/rfq-idempotency.ts`
  Responsibility: derive the stable duplicate key and manage Redis-backed claim/lookup/update for exact duplicate RFQ submissions.
- Create: `frontend/src/lib/internal-auth.ts`
  Responsibility: parse and validate `Authorization: Bearer ...` for all internal Next.js webhook routes.
- Modify: `frontend/src/lib/rfq-validation.ts`
  Responsibility: normalize `hub` and canonicalize `industry` so routing and idempotency see one stable payload shape.
- Modify: `frontend/src/lib/rfq-validation.test.ts`
  Responsibility: lock the new `hub` and `industry` normalization behavior.
- Modify: `frontend/src/lib/rfq-anti-spam.ts`
  Responsibility: keep only Turnstile and rate-limit checks; dedupe moves to the idempotency helper.
- Modify: `frontend/src/lib/rfq-anti-spam.test.ts`
  Responsibility: remove the duplicate-conflict expectation and keep anti-spam coverage focused on spam rejection.
- Modify: `frontend/src/lib/rfq-submit.ts`
  Responsibility: persist `hub`, use the idempotency helper, and return the original RFQ id for exact duplicates.
- Modify: `frontend/src/lib/rfq-submit.test.ts`
  Responsibility: prove duplicates return the original id and changed item lists still create a fresh record.
- Create: `frontend/src/lib/rfq-notification.ts`
  Responsibility: load routing data, resolve the assignee/fallback inbox, and build the summary email and Directus notification payloads.
- Create: `frontend/src/lib/rfq-mailer.ts`
  Responsibility: encapsulate SMTP delivery so the notification route can retry transient failures without duplicating transport setup.
- Create: `frontend/src/lib/rfq-notification.test.ts`
  Responsibility: lock routing resolution, fallback behavior, and email/notification content.
- Create: `frontend/src/lib/internal-auth.test.ts`
  Responsibility: lock the shared bearer-token auth helper used by internal webhook routes.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: add the `site_settings`, `regional_hubs`, `industries`, `rfq_requests`, `rfq_assignment_rules`, and notification-related types needed by the internal notifier.
- Modify: `frontend/src/app/api/rfq/route.ts`
  Responsibility: wire the new idempotency helper into the public RFQ write path.
- Modify: `frontend/src/app/api/internal/sku-cache/route.ts`
  Responsibility: reuse the shared internal bearer-token helper instead of keeping a route-local copy.
- Create: `frontend/src/app/api/internal/rfq-notify/route.ts`
  Responsibility: bearer-protected Directus Flow webhook that assigns owner, sends email, writes a Directus notification, and logs retry-worthy failures.
- Modify: `frontend/package.json`
  Responsibility: add the notification/idempotency tests and the SMTP mail dependency if needed.
- Create: `frontend/.env.local.example`
  Responsibility: document `INTERNAL_API_TOKEN`, SMTP variables, `DIRECTUS_TOKEN`, and the other local secrets needed to run the flow.
- Modify: `directus/schema/collections.mjs`
  Responsibility: define the RFQ assignment rules collection in bootstrap.
- Modify: `directus/schema/relations.mjs`
  Responsibility: register the hub, industry, and assigned-sales relations for the routing collection.
- Modify: `directus/rbac/permissions.mjs`
  Responsibility: let Sales/Admin manage routing rules and RFQ triage while keeping public/customer RFQ creates disabled.
- Modify: `directus/rbac_seed.mjs`
  Responsibility: seed at least one hub + industry routing rule for local verification.
- Modify: `directus/verify_bootstrap.mjs`
  Responsibility: assert the routing collection exists after bootstrap and that the expected default rule shape is present.
- Create: `directus/verify_rfq_notification_flow.mjs`
  Responsibility: smoke the full Directus Flow -> Next.js notifier -> SMTP/Directus notification path.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the routing collection, the RFQ idempotency contract, and the `new`-status / assigned-sales behavior.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: add the routing collection and the canonical `hub + industry` assignment model.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: document `POST /api/internal/rfq-notify` and the updated RFQ duplicate-response semantics.
- Modify: `docs/specs/SPEC-09-security-rbac.md`
  Responsibility: describe the internal webhook auth and the new routing-rule permissions.
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
  Responsibility: show the RFQ create -> flow -> assign -> notify sequence.
- Modify: `docs/engineering/ENG-05-local-development-setup.md`
  Responsibility: document SMTP, `INTERNAL_API_TOKEN`, and the smoke verification command.
- Modify: `docs/operations/OPS-01-deployment-guide.md`
  Responsibility: document production/staging env vars, the Directus Flow name, and the notifier endpoint.
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
  Responsibility: explain the Sales triage path after auto-assignment and how to reassign RFQs manually.
- Modify: `docs/testing/TEST-02-test-cases.md`
  Responsibility: add exact duplicate / RFQ idempotency, owner assignment, fallback inbox, and notifier-failure cases.
- Modify: `docs/testing/TEST-05-directus-rbac-checklist.md`
  Responsibility: add the Sales/Admin expectations for the new routing-rules collection.

## Task 1: Make RFQ creates idempotent and hub-aware

**Files:**
- Create: `frontend/src/lib/rfq-idempotency.ts`
- Create: `frontend/src/lib/rfq-idempotency.test.ts`
- Modify: `frontend/src/lib/rfq-validation.ts`
- Modify: `frontend/src/lib/rfq-validation.test.ts`
- Modify: `frontend/src/lib/rfq-anti-spam.ts`
- Modify: `frontend/src/lib/rfq-anti-spam.test.ts`
- Modify: `frontend/src/lib/rfq-submit.ts`
- Modify: `frontend/src/lib/rfq-submit.test.ts`
- Modify: `frontend/src/app/api/rfq/route.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing tests**

Add tests that force the new payload shape and idempotency semantics before any implementation lands:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { validateRfqPayload } from './rfq-validation';
import { buildRfqIdempotencyKey } from './rfq-idempotency';

test('normalizes hub and industry for routing', () => {
  const result = validateRfqPayload({
    company: '  ACME  ',
    contact: 'Mr A',
    email: 'A@ACME.VN',
    phone: ' (+84) 901-234-567 ',
    hub: ' 3 ',
    industry: '  Chemical  ',
    items: [{ sku: 'CR-GLV-001', qty: 1 }]
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Unexpected validation failure');
  assert.equal(result.value.company, 'ACME');
  assert.equal(result.value.hub, 3);
  assert.equal(result.value.industry, 'chemical');
});

test('builds the same idempotency key for the same company, email, and items', () => {
  const keyA = buildRfqIdempotencyKey({
    company: 'ACME',
    email: 'a@acme.vn',
    items: [{ sku: 'cr-glv-001', qty: 1 }]
  });

  const keyB = buildRfqIdempotencyKey({
    company: ' ACME ',
    email: 'A@ACME.VN',
    items: [{ sku: 'cr-glv-001', qty: 1 }]
  });

  assert.equal(keyA, keyB);
});
```

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { submitRfq } from './rfq-submit';

test('returns the original RFQ id for an exact duplicate payload', async () => {
  let createCalls = 0;

  const baseBody = {
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    hub: 3,
    industry: 'chemical',
    items: [{ sku: 'CR-GLV-001', qty: 1 }],
    token: 'good-token'
  };

  const first = await submitRfq(baseBody, {
    ip: '1.2.3.4',
    verifyTurnstile: async () => true,
    rateLimit: async () => ({ ok: true }),
    fetchSkus: async () => [{ sku_code: 'CR-GLV-001' }],
    getExistingRfqId: async () => null,
    reserveIdempotencyKey: async () => ({ ok: true }),
    saveIdempotencyKey: async () => undefined,
    createRfq: async () => {
      createCalls += 1;
      return { id: 123 };
    }
  });

  const second = await submitRfq(baseBody, {
    ip: '1.2.3.4',
    verifyTurnstile: async () => true,
    rateLimit: async () => ({ ok: true }),
    fetchSkus: async () => [{ sku_code: 'CR-GLV-001' }],
    getExistingRfqId: async () => 123,
    reserveIdempotencyKey: async () => ({ ok: false }),
    saveIdempotencyKey: async () => undefined,
    createRfq: async () => {
      throw new Error('must not be called for an exact duplicate');
    }
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!second.ok) throw new Error('Unexpected duplicate failure');
  assert.equal(second.data.id, 123);
  assert.equal(createCalls, 1);
});
```

- [ ] **Step 2: Run the tests and confirm they fail for the right reason**

Run from the repo root:

```bash
node --import tsx --test frontend/src/lib/rfq-validation.test.ts frontend/src/lib/rfq-idempotency.test.ts frontend/src/lib/rfq-submit.test.ts frontend/src/lib/rfq-anti-spam.test.ts
```

Expected: fail because `hub` normalization, the idempotency helper, and the duplicate-return behavior do not exist yet.

- [ ] **Step 3: Implement the minimal code to make the tests pass**

Add the shared idempotency helper and thread it through the public RFQ path:

```ts
// frontend/src/lib/rfq-idempotency.ts
export function buildRfqIdempotencyKey(input: {
  company: string;
  email: string;
  items: Array<{ sku: string; qty: number }>;
}): string;

export interface RfqIdempotencyStore {
  getExistingRfqId(key: string): Promise<number | string | null>;
  reserveIdempotencyKey(key: string): Promise<{ ok: true } | { ok: false }>;
  saveIdempotencyKey(key: string, rfqId: number | string): Promise<void>;
}
```

```ts
// frontend/src/lib/rfq-submit.ts
const idempotencyKey = buildRfqIdempotencyKey({
  company: validation.value.company,
  email: validation.value.email,
  items: validation.value.items
});

const existingId = await deps.getExistingRfqId(idempotencyKey);
if (existingId !== null) {
  return { ok: true, data: { id: existingId } };
}

const reserved = await deps.reserveIdempotencyKey(idempotencyKey);
if (!reserved.ok) {
  const retryId = await deps.getExistingRfqId(idempotencyKey);
  if (retryId !== null) {
    return { ok: true, data: { id: retryId } };
  }
  return { ok: false, error: { code: 'CONFLICT', message: 'Duplicate RFQ submission detected.' } };
}
```

Update `validateRfqPayload` so `hub` is normalized to an integer and `industry` is canonicalized to a lowercase slug. Persist `hub` in `createRfq`, keep `status: 'new'`, and remove the old conflict-style dedupe from `enforceRfqAntiSpam`.

- [ ] **Step 4: Run the tests again and make sure the new behavior passes**

Run from the repo root:

```bash
node --import tsx --test frontend/src/lib/rfq-validation.test.ts frontend/src/lib/rfq-idempotency.test.ts frontend/src/lib/rfq-submit.test.ts frontend/src/lib/rfq-anti-spam.test.ts
```

Expected: PASS, with duplicate RFQ bodies returning the first record id and changed item lists still creating a new record.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/rfq-idempotency.ts frontend/src/lib/rfq-validation.ts frontend/src/lib/rfq-submit.ts frontend/src/app/api/rfq/route.ts frontend/package.json
git commit -m "feat: make rfq intake idempotent"
```

## Task 2: Add the internal notifier and Sales routing logic

**Files:**
- Create: `frontend/src/lib/internal-auth.ts`
- Create: `frontend/src/lib/internal-auth.test.ts`
- Create: `frontend/src/lib/rfq-notification.ts`
- Create: `frontend/src/lib/rfq-mailer.ts`
- Create: `frontend/src/lib/rfq-notification.test.ts`
- Modify: `frontend/src/lib/directus.ts`
- Modify: `frontend/src/app/api/internal/sku-cache/route.ts`
- Create: `frontend/src/app/api/internal/rfq-notify/route.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing tests**

Add tests that lock the route auth, routing fallback, and message shape before the notifier exists:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { requireInternalToken } from './internal-auth';

test('accepts the configured bearer secret', () => {
  assert.equal(
    requireInternalToken('Bearer dev-internal-token', 'dev-internal-token'),
    'dev-internal-token'
  );
});

test('rejects a mismatched bearer secret', () => {
  assert.throws(
    () => requireInternalToken('Bearer wrong-token', 'dev-internal-token'),
    /Invalid internal API token/
  );
});
```

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveRfqAssignment, buildRfqSummaryEmail } from './rfq-notification';

test('routes by exact hub + industry match first', () => {
  const result = resolveRfqAssignment({
    rfq: {
      id: 123,
      company: 'ACME',
      contact_name: 'Mr A',
      email: 'a@acme.vn',
      phone: '+84901234567',
      hub: { id: 3, name: 'South Hub' },
      industry: 'chemical',
      message: 'Need quote',
      line_items: [{ sku: 'cr-glv-001', qty: 1 }],
      assigned_sales: null,
      source: 'web'
    },
    rules: [
      { hub: 3, industry: 'chemical', assigned_sales: 'sales-a-id', is_default: false, priority: 10 }
    ],
    siteSettings: { contact_email: 'contact@ulink.com' }
  });

  assert.equal(result.assignedSales, 'sales-a-id');
  assert.equal(result.notifyTo, 'sales-a@example.com');
});

test('falls back to the sales inbox when no rule matches', () => {
  const result = resolveRfqAssignment({
    rfq: {
      id: 123,
      company: 'ACME',
      contact_name: 'Mr A',
      email: 'a@acme.vn',
      phone: '+84901234567',
      hub: null,
      industry: 'chemical',
      message: 'Need quote',
      line_items: [{ sku: 'cr-glv-001', qty: 1 }],
      assigned_sales: null,
      source: 'web'
    },
    rules: [],
    siteSettings: { contact_email: 'contact@ulink.com' }
  });

  assert.equal(result.assignedSales, null);
  assert.equal(result.notifyTo, 'contact@ulink.com');
});

test('builds a summary email with the Directus admin link', () => {
  const email = buildRfqSummaryEmail({
    baseUrl: 'https://cms.ulink.vn',
    rfqId: 123,
    company: 'ACME',
    contactName: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    hubName: 'South Hub',
    industryName: 'Chemical',
    message: 'Need quote',
    lineItems: [{ sku: 'cr-glv-001', qty: 1 }]
  });

  assert.match(email.subject, /RFQ #123/);
  assert.match(email.text, /South Hub/);
  assert.match(email.text, /cms\.ulink\.vn\/admin\/content\/rfq_requests\/123/);
});
```

- [ ] **Step 2: Run the tests and confirm they fail for the right reason**

Run from the repo root:

```bash
node --import tsx --test frontend/src/lib/internal-auth.test.ts frontend/src/lib/rfq-notification.test.ts
```

Expected: fail because the shared internal auth helper, the routing resolver, and the mail/notification builders do not exist yet.

- [ ] **Step 3: Implement the minimal code to make the tests pass**

Create a shared internal auth helper and the notifier route:

```ts
// frontend/src/lib/internal-auth.ts
export function requireInternalToken(
  authorization: string | null | undefined,
  expected = process.env.INTERNAL_API_TOKEN
): string;
```

```ts
// frontend/src/app/api/internal/rfq-notify/route.ts
export const runtime = 'nodejs';

export async function POST(req: Request) {
  requireInternalToken(req.headers.get('authorization'));
  const body = await req.json();
  const rfqId = parseRfqNotificationWebhook(body);
  const context = await loadRfqNotificationContext(rfqId);
  const plan = resolveRfqAssignment(context);

  await retryTransient(() => sendRfqSummary(plan.email));
  await updateRfqAssignment(rfqId, plan.assignedSales);
  await createDirectusNotification(plan.notification);

  return successJson({
    rfq_id: rfqId,
    assigned_sales: plan.assignedSales,
    notified_to: plan.notifyTo
  });
}
```

`frontend/src/lib/rfq-notification.ts` should own the pure pieces:
- load the RFQ, hub, industry, site settings, and routing rules from Directus;
- resolve exact hub + industry matches before hub-only defaults;
- fall back to `site_settings.contact_email` when no salesperson matches;
- build one summary email and one Directus notification payload;
- keep the RFQ status as `new` and only patch `assigned_sales`.

`frontend/src/lib/rfq-mailer.ts` should hide the SMTP transport setup and expose a small `sendRfqSummaryEmail()` helper so the route can retry transient mail failures without repeating transport code.

Update `frontend/src/lib/directus.ts` to add the data types for the notifier reads and writes, and switch `frontend/src/app/api/internal/sku-cache/route.ts` to the shared bearer-token helper.

- [ ] **Step 4: Run the tests again and make sure the notifier helpers pass**

Run from the repo root:

```bash
node --import tsx --test frontend/src/lib/internal-auth.test.ts frontend/src/lib/rfq-notification.test.ts
```

Expected: PASS, with exact routing rules winning over the fallback inbox and the admin link embedded in the email body.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/internal-auth.ts frontend/src/lib/rfq-notification.ts frontend/src/lib/rfq-mailer.ts frontend/src/app/api/internal/rfq-notify/route.ts frontend/src/lib/directus.ts frontend/package.json
git commit -m "feat: add rfq notification webhook"
```

## Task 3: Add the Directus routing collection, flow, and docs

**Files:**
- Modify: `directus/schema/collections.mjs`
- Modify: `directus/schema/relations.mjs`
- Modify: `directus/rbac/permissions.mjs`
- Modify: `directus/rbac_seed.mjs`
- Modify: `directus/verify_bootstrap.mjs`
- Create: `directus/verify_rfq_notification_flow.mjs`
- Modify: `directus/SCHEMA.md`
- Modify: `docs/specs/SPEC-03-data-model.md`
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/specs/SPEC-09-security-rbac.md`
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
- Modify: `docs/engineering/ENG-05-local-development-setup.md`
- Modify: `docs/operations/OPS-01-deployment-guide.md`
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
- Modify: `docs/testing/TEST-02-test-cases.md`
- Modify: `docs/testing/TEST-05-directus-rbac-checklist.md`
- Create: `frontend/.env.local.example`

- [ ] **Step 1: Write the failing bootstrap and smoke assertions**

Add a bootstrap assertion that the routing collection exists, and add a smoke script that exercises the full flow:

```js
// directus/verify_bootstrap.mjs
assert(collections.some((c) => c.collection === 'rfq_assignment_rules'), 'RFQ assignment rules collection exists.');
```

```js
// directus/verify_rfq_notification_flow.mjs
const response = await fetch(`${baseUrl}/api/internal/rfq-notify`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${internalToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event: 'items.create',
    collection: 'rfq_requests',
    key: rfqId
  })
});

assert.equal(response.status, 200);
const body = await response.json();
assert.equal(body.success, true);
assert.equal(body.data.rfq_id, rfqId);
```

- [ ] **Step 2: Run the bootstrap and smoke checks and confirm they fail for the right reason**

Run from the repo root:

```bash
node directus/verify_bootstrap.mjs
node directus/verify_rfq_notification_flow.mjs
```

Expected: fail because `rfq_assignment_rules` and the notifier webhook are not wired up yet.

- [ ] **Step 3: Implement the Directus schema and access model**

Add a small editable routing collection to bootstrap so Sales can manage the mapping without code changes:

```js
// directus/schema/collections.mjs
{
  collection: 'rfq_assignment_rules',
  meta: { icon: 'rule', note: 'RFQ Assignment Rules' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'industry', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'assigned_sales', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'priority', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
    { field: 'is_default', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } }
  ]
}
```

Add the needed relations and permissions:
- `rfq_assignment_rules.hub -> regional_hubs`
- `rfq_assignment_rules.industry -> industries`
- `rfq_assignment_rules.assigned_sales -> directus_users`
- Sales/Admin can CRUD the routing rules.
- Customer/Visitor cannot read or write the routing rules.

Seed at least one rule in `directus/rbac_seed.mjs` so the smoke script can prove the exact-match branch and the fallback branch.

Configure Directus Flow `flow-rfq-notify` in the CMS UI so it:
- triggers on `rfq_requests` create;
- POSTs `{"event":"items.create","collection":"rfq_requests","key":"<id>"}` to `POST /api/internal/rfq-notify`;
- sends `Authorization: Bearer ${INTERNAL_API_TOKEN}`;
- does not try to do email, assignment, or retry logic itself.

- [ ] **Step 4: Update docs and the operator checklist**

Document the new routing model and the webhook contract:
- `docs/specs/SPEC-03-data-model.md`: add `rfq_assignment_rules` and note that `rfq_requests.industry` is the canonical lowercase slug used by routing.
- `docs/specs/SPEC-04-api-spec.md`: add `POST /api/internal/rfq-notify`, auth, and response semantics; update the duplicate RFQ case to return the original id instead of `409`.
- `docs/specs/SPEC-09-security-rbac.md`: document the shared internal bearer token and the new Sales/Admin permissions for routing rules.
- `docs/engineering/ENG-01-architecture-overview.md`: show `RFQ create -> Directus Flow -> notifier route -> email + Directus notification`.
- `docs/engineering/ENG-05-local-development-setup.md`: list SMTP env vars, `INTERNAL_API_TOKEN`, and the smoke command.
- `docs/operations/OPS-01-deployment-guide.md`: list the production secrets and the `flow-rfq-notify` setup.
- `docs/guides/GUIDE-01-cms-admin-guide.md`: explain how Sales uses the auto-assigned RFQ and how to reassign manually in Directus.
- `docs/testing/TEST-02-test-cases.md`: add duplicate-RFQ idempotency, assignment, fallback inbox, and SMTP failure recovery cases.
- `docs/testing/TEST-05-directus-rbac-checklist.md`: add the routing-rules collection and its role expectations.
- `frontend/.env.local.example`: document the new local secrets.

- [ ] **Step 5: Run the final verification suite**

Run from the repo root:

```bash
node directus/verify_bootstrap.mjs
node directus/verify_rfq_notification_flow.mjs
node --import tsx --test frontend/src/lib/internal-auth.test.ts frontend/src/lib/rfq-idempotency.test.ts frontend/src/lib/rfq-notification.test.ts frontend/src/lib/rfq-submit.test.ts
```

Expected: PASS. The smoke script should show the RFQ record still exists even if the notifier retries were needed, and the sales owner or sales inbox receives both the email and the Directus notification.

- [ ] **Step 6: Commit**

```bash
git add directus/schema/collections.mjs directus/schema/relations.mjs directus/rbac/permissions.mjs directus/rbac_seed.mjs directus/verify_bootstrap.mjs directus/verify_rfq_notification_flow.mjs directus/SCHEMA.md docs/specs/SPEC-03-data-model.md docs/specs/SPEC-04-api-spec.md docs/specs/SPEC-09-security-rbac.md docs/engineering/ENG-01-architecture-overview.md docs/engineering/ENG-05-local-development-setup.md docs/operations/OPS-01-deployment-guide.md docs/guides/GUIDE-01-cms-admin-guide.md docs/testing/TEST-02-test-cases.md docs/testing/TEST-05-directus-rbac-checklist.md frontend/.env.local.example
git commit -m "feat: add rfq sales notification flow"
```

## Spec Coverage

- Spec 1, 2, and 3: Task 3 adds the editable hub + industry routing rules and the fallback inbox.
- Spec 4: Task 2 adds the email and Directus notification delivery path.
- Spec 5 and 11: Task 1 keeps validation, anti-spam, and idempotency in the public RFQ path.
- Spec 6 and 7: Task 1 keeps `status: 'new'` and does not auto-promote RFQs after assignment.
- Spec 8: intentionally not implemented in Phase 1; there is no SLA/timeout reassign job in this plan.
- Spec 9: Task 2 builds a summary email plus the Directus admin link.
- Spec 10: Task 2 and Task 3 keep the revision trail in Directus and document the reassignment workflow.
- Spec 12: Task 2 retries notification delivery in the app layer and logs failures without deleting the RFQ record.

## Self-Review

- No placeholder text remains.
- Every spec requirement is tied to at least one task.
- Type names stay consistent across the plan: `rfq_assignment_rules`, `buildRfqIdempotencyKey`, `requireInternalToken`, `resolveRfqAssignment`, and `POST /api/internal/rfq-notify`.
- Assumption kept explicit: `site_settings.contact_email` is the fallback inbox when no direct Sales owner matches.
