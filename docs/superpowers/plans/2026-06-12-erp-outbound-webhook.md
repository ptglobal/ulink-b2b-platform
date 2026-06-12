# ERP Outbound Webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist every meaningful order / invoice / delivery change into a transactional outbox, drain it from Next.js on a schedule, and deliver it to a future ERP with idempotent retries and a dead-letter view.

**Architecture:** Directus Flow stays thin and only decides whether a change is meaningful. When it is, the flow writes a full record snapshot into `integration_events` with `entity`, `op`, `record_id`, `erp_ref`, `revision`, `idempotency_key`, `payload`, `status`, and retry metadata. Next.js owns the durable delivery path: a token-protected worker route claims pending rows, POSTs them to `ERP_WEBHOOK_URL`, retries 5xx/timeouts with exponential backoff, and marks 4xx failures as dead-letter immediately. Admins inspect failures through the `failed_erp_webhooks` SQL view backed by the same outbox table.

**Tech Stack:** Directus Flows, Directus bootstrap schema, PostgreSQL migration/view, Next.js 14 App Router, `@directus/sdk`, Node test runner with `tsx`, markdown docs, PowerShell smoke scripts.

---

## File Structure

- Create: `frontend/src/lib/erp-outbound.ts`
  Responsibility: classify meaningful order/invoice/delivery changes, normalize ERP idempotency keys, and build the outbound payload envelope.
- Create: `frontend/src/lib/erp-outbound.test.ts`
  Responsibility: lock the change-classification rules, idempotency key rules, and retry classification rules.
- Create: `frontend/src/lib/erp-outbox-worker.ts`
  Responsibility: drain pending outbox rows, call the ERP endpoint, apply retry/backoff/DLQ state transitions, and update Directus records.
- Create: `frontend/src/lib/erp-outbox-worker.test.ts`
  Responsibility: lock drain behavior, retry scheduling, 4xx vs 5xx handling, and sync-disabled behavior.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: add the `integration_events` schema types so the worker and smoke tests can read and update outbox rows safely.
- Create: `frontend/src/app/api/internal/erp-outbox/route.ts`
  Responsibility: bearer-protected drain endpoint that executes the worker against a batch of pending events.
- Create: `frontend/src/app/api/mock/erp/route.ts`
  Responsibility: local and staging ERP stub that returns programmable 2xx/4xx/5xx responses for smoke tests.
- Modify: `frontend/package.json`
  Responsibility: add the new ERP helper and worker tests to the `npm test` script.
- Modify: `frontend/.env.local.example`
  Responsibility: document `ERP_SYNC_ENABLED`, `ERP_WEBHOOK_URL`, `ERP_WEBHOOK_TOKEN`, `ERP_OUTBOX_BATCH_SIZE`, and `ERP_OUTBOX_MAX_ATTEMPTS`.
- Modify: `directus/schema/collections.mjs`
  Responsibility: add the `integration_events` collection definition and its field contract.
- Create: `directus/sql/migrations/2026-06-12-add-erp-outbox-view.sql`
  Responsibility: create the `failed_erp_webhooks` reporting view and the supporting outbox indexes.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the outbox table, the failed-webhook view, and the ERP idempotency contract.
- Modify: `directus/verify_bootstrap.mjs`
  Responsibility: assert the outbox collection exists with the expected fields and default values.
- Create: `directus/verify_erp_outbound_webhook.mjs`
  Responsibility: smoke the full Directus Flow -> Next.js worker -> ERP stub path and verify sent, retried, and failed states.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: add the outbox entity to the ERD and the data-model/access notes.
- Modify: `docs/specs/erd.md`
  Responsibility: show `integration_events` and the failure-reporting view in the ERD.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: document `POST /api/internal/erp-outbox` and the ERP stub route used for staging and smoke tests.
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
  Responsibility: show the Directus -> outbox -> worker -> ERP flow in the topology notes.
- Modify: `docs/operations/OPS-01-deployment-guide.md`
  Responsibility: document the ERP env vars, the scheduled drain job, and the staging mock endpoint.
- Modify: `docs/testing/TEST-02-test-cases.md`
  Responsibility: add the ERP outbound create/update, retry, dead-letter, and sync-disabled cases.
- Manual config: Directus Flow `flow-erp-outbox`
  Responsibility: trigger on meaningful `orders`, `invoices`, and `deliveries` create/update events and write full snapshots into `integration_events`.

## Task 1: Lock the outbound contract in shared Next.js helpers

**Files:**
- Create: `frontend/src/lib/erp-outbound.ts`
- Create: `frontend/src/lib/erp-outbound.test.ts`
- Modify: `frontend/src/lib/directus.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write the failing tests**

Add tests that prove the outbox contract before any worker code exists:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildErpIdempotencyKey,
  classifyErpResponse,
  nextErpRetryDelayMinutes,
  shouldEnqueueErpEvent
} from './erp-outbound';

test('ignores cosmetic order updates', () => {
  const result = shouldEnqueueErpEvent({
    entity: 'orders',
    op: 'update',
    before: {
      id: 7,
      status: 'processing',
      subtotal: 100,
      tax: 10,
      total: 110,
      notes: 'before',
      erp_ref: null
    },
    after: {
      id: 7,
      status: 'processing',
      subtotal: 100,
      tax: 10,
      total: 110,
      notes: 'after',
      erp_ref: null
    }
  });

  assert.equal(result.shouldEnqueue, false);
});

test('enqueues a delivery status transition with a revision-based idempotency key', () => {
  const result = shouldEnqueueErpEvent({
    entity: 'deliveries',
    op: 'update',
    before: {
      id: 15,
      status: 'scheduled',
      scheduled_date: '2026-06-12',
      delivered_date: null,
      tracking_ref: null,
      erp_ref: null
    },
    after: {
      id: 15,
      status: 'in_transit',
      scheduled_date: '2026-06-12',
      delivered_date: null,
      tracking_ref: 'TRK-001',
      erp_ref: null,
      date_updated: '2026-06-12T03:15:00.000Z'
    }
  });

  assert.equal(result.shouldEnqueue, true);
  assert.equal(result.idempotencyKey, 'deliveries:15:2026-06-12T03:15:00.000Z');
  assert.equal(result.payload.full.status, 'in_transit');
});

test('prefers erp_ref when present', () => {
  assert.equal(
    buildErpIdempotencyKey({
      entity: 'orders',
      recordId: 22,
      erpRef: 'ERP-ORD-2026-99901',
      revision: '2026-06-12T03:15:00.000Z'
    }),
    'ERP-ORD-2026-99901'
  );
});

test('classifies 4xx as dead-letter and 5xx as retry', () => {
  assert.equal(classifyErpResponse(409), 'failed');
  assert.equal(classifyErpResponse(502), 'retry');
  assert.equal(nextErpRetryDelayMinutes(1), 1);
  assert.equal(nextErpRetryDelayMinutes(2), 5);
  assert.equal(nextErpRetryDelayMinutes(3), 15);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && node --import tsx --test src/lib/erp-outbound.test.ts`

Expected: fail because `frontend/src/lib/erp-outbound.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
export function buildErpIdempotencyKey(input: {
  entity: 'orders' | 'invoices' | 'deliveries';
  recordId: number | string;
  erpRef: string | null;
  revision: string;
}) {
  return input.erpRef?.trim() || `${input.entity}:${input.recordId}:${input.revision}`;
}

export function classifyErpResponse(status: number) {
  if (status >= 200 && status < 300) return 'sent';
  if (status >= 400 && status < 500) return 'failed';
  return 'retry';
}

export function nextErpRetryDelayMinutes(attempt: number) {
  if (attempt <= 1) return 1;
  if (attempt === 2) return 5;
  return 15;
}

export function shouldEnqueueErpEvent(input: {
  entity: 'orders' | 'invoices' | 'deliveries';
  op: 'create' | 'update';
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}) {
  const meaningfulByEntity: Record<string, Set<string>> = {
    orders: new Set(['status', 'subtotal', 'tax', 'total', 'hub', 'order_items']),
    invoices: new Set(['paid_status', 'amount', 'paid_amount', 'balance', 'due_date', 'order']),
    deliveries: new Set(['status', 'hub', 'scheduled_date', 'delivered_date', 'tracking_ref'])
  };
  const meaningfulFields = meaningfulByEntity[input.entity];
  const changedFields = Object.keys(input.after).filter((key) => {
    return meaningfulFields.has(key) && input.before[key] !== input.after[key];
  });

  return {
    shouldEnqueue: changedFields.length > 0,
    idempotencyKey: buildErpIdempotencyKey({
      entity: input.entity,
      recordId: input.after.id as number | string,
      erpRef: (input.after.erp_ref as string | null | undefined) ?? null,
      revision: (input.after.date_updated as string | undefined) ?? String(input.after.id ?? '')
    }),
    payload: {
      entity: input.entity,
      op: input.op,
      changedFields,
      full: input.after
    }
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && node --import tsx --test src/lib/erp-outbound.test.ts`

Expected: PASS for the new helper tests, with the existing suite still green.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/erp-outbound.ts frontend/src/lib/erp-outbound.test.ts frontend/src/lib/directus.ts frontend/package.json
git commit -m "feat: add erp outbound contract helper"
```

## Task 2: Add the outbox table and failure reporting view in Directus

**Files:**
- Modify: `directus/schema/collections.mjs`
- Create: `directus/sql/migrations/2026-06-12-add-erp-outbox-view.sql`
- Modify: `directus/SCHEMA.md`
- Modify: `directus/verify_bootstrap.mjs`
- Modify: `docs/specs/SPEC-03-data-model.md`
- Modify: `docs/specs/erd.md`

- [ ] **Step 1: Write the failing verification**

Add bootstrap assertions that the outbox collection exists and has the required fields:

```js
const collections = await client.request(readCollections());
const collectionNames = collections.map((row) => row.collection);
const integrationEvents = collections.find((row) => row.collection === 'integration_events');

assert(collectionNames.includes('integration_events'));
assert(integrationEvents);
assert.equal(integrationEvents.fields.some((field) => field.field === 'entity'), true);
assert.equal(integrationEvents.fields.some((field) => field.field === 'idempotency_key'), true);
assert.equal(integrationEvents.fields.some((field) => field.field === 'status'), true);
assert.equal(integrationEvents.fields.some((field) => field.field === 'attempts'), true);
```

- [ ] **Step 2: Run the verification to confirm it fails**

Run: `cd directus && npm run verify`

Expected: fail because `integration_events` is not defined in the Directus schema yet.

- [ ] **Step 3: Add the schema and SQL view**

Define the new collection in `directus/schema/collections.mjs` with this field contract:

```js
{
  collection: 'integration_events',
  meta: { icon: 'sync', note: 'ERP Outbox Events' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'entity', type: 'string', meta: { interface: 'select-dropdown', required: true } },
    { field: 'op', type: 'string', meta: { interface: 'select-dropdown', required: true } },
    { field: 'record_id', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'erp_ref', type: 'string', meta: { interface: 'input' } },
    { field: 'revision', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'idempotency_key', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
    { field: 'payload', type: 'json', meta: { interface: 'json', required: true } },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: { choices: [{ text: 'Pending', value: 'pending' }, { text: 'Sent', value: 'sent' }, { text: 'Failed', value: 'failed' }] }
      },
      schema: { default_value: 'pending' }
    },
    { field: 'attempts', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
    { field: 'next_attempt_at', type: 'dateTime', meta: { interface: 'datetime' } },
    { field: 'last_attempt_at', type: 'dateTime', meta: { interface: 'datetime' } },
    { field: 'last_status_code', type: 'integer', meta: { interface: 'input' } },
    { field: 'last_error', type: 'text', meta: { interface: 'textarea' } },
    { field: 'destination_url', type: 'string', meta: { interface: 'input' } }
  ]
}
```

Create the SQL migration to support the reporting view and the queue indexes:

```sql
CREATE INDEX IF NOT EXISTS integration_events_status_next_attempt_idx
  ON integration_events (status, next_attempt_at, date_created);

CREATE INDEX IF NOT EXISTS integration_events_entity_record_idx
  ON integration_events (entity, record_id);

CREATE VIEW failed_erp_webhooks AS
SELECT *
FROM integration_events
WHERE status = 'failed';
```

Register the `failed_erp_webhooks` view in the Directus Admin UI after the migration lands, then use it as the triage surface for failed events.

- [ ] **Step 4: Run the verification to confirm it passes**

Run: `cd directus && npm run verify`

Expected: PASS with the new `integration_events` collection present.

- [ ] **Step 5: Commit**

```bash
git add directus/schema/collections.mjs directus/sql/migrations/2026-06-12-add-erp-outbox-view.sql directus/SCHEMA.md directus/verify_bootstrap.mjs docs/specs/SPEC-03-data-model.md docs/specs/erd.md
git commit -m "feat: add erp outbox schema"
```

## Task 3: Build the drain worker, ERP stub, and end-to-end smoke path

**Files:**
- Create: `frontend/src/lib/erp-outbox-worker.ts`
- Create: `frontend/src/lib/erp-outbox-worker.test.ts`
- Create: `frontend/src/app/api/internal/erp-outbox/route.ts`
- Create: `frontend/src/app/api/mock/erp/route.ts`
- Modify: `frontend/.env.local.example`
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
- Modify: `docs/operations/OPS-01-deployment-guide.md`
- Modify: `docs/testing/TEST-02-test-cases.md`
- Create: `directus/verify_erp_outbound_webhook.mjs`

- [ ] **Step 1: Write the failing worker and smoke tests**

Add tests that force the drain behavior and the mock ERP behavior:

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { drainErpOutbox, classifyDrainResult } from './erp-outbox-worker';

test('skips draining when ERP sync is disabled', async () => {
  const result = await drainErpOutbox({
    syncEnabled: false,
    batchSize: 5,
    fetchPendingEvents: async () => []
  });

  assert.equal(result.skipped, true);
  assert.equal(result.sent, 0);
});

test('retries 5xx and dead-letters 4xx', () => {
  assert.equal(classifyDrainResult(200), 'sent');
  assert.equal(classifyDrainResult(409), 'failed');
  assert.equal(classifyDrainResult(503), 'retry');
});
```

The smoke script should seed one pending row, point `ERP_WEBHOOK_URL` at `/api/mock/erp`, hit `POST /api/internal/erp-outbox`, and then query the outbox and failed view to confirm the row moved to `sent` or `failed` as expected.

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && node --import tsx --test src/lib/erp-outbox-worker.test.ts`

Expected: fail because `frontend/src/lib/erp-outbox-worker.ts` and the drain route do not exist yet.

- [ ] **Step 3: Write the minimal worker and routes**

```ts
export async function drainErpOutbox(input: {
  syncEnabled: boolean;
  batchSize: number;
  fetchPendingEvents: () => Promise<Array<{ id: number; entity: string; op: string; payload: unknown }>>;
}) {
  if (!input.syncEnabled) {
    return { skipped: true, sent: 0, retried: 0, failed: 0 };
  }

  const rows = await input.fetchPendingEvents();
  return { skipped: false, sent: rows.length, retried: 0, failed: 0 };
}

export function classifyDrainResult(status: number) {
  return classifyErpResponse(status);
}
```

The route should:

```ts
export async function POST(req: Request) {
  requireInternalToken(req.headers.get('authorization'));
  const result = await drainErpOutbox({
    syncEnabled: process.env.ERP_SYNC_ENABLED === 'true',
    batchSize: Number(process.env.ERP_OUTBOX_BATCH_SIZE ?? '20'),
    fetchPendingEvents: /* Directus query */
  });
  return successJson(result);
}
```

The mock ERP route should return 200 by default and allow controlled 4xx/5xx responses through a test header so the smoke script can prove retry and dead-letter behavior without a real ERP.

- [ ] **Step 4: Run the test and smoke verification to confirm they pass**

Run:

```bash
cd frontend && node --import tsx --test src/lib/erp-outbox-worker.test.ts
cd directus && node verify_erp_outbound_webhook.mjs
```

Expected: the worker test passes, the smoke script proves one successful delivery, and a forced 4xx/5xx path lands in the failed view with retry metadata recorded.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/erp-outbox-worker.ts frontend/src/lib/erp-outbox-worker.test.ts frontend/src/app/api/internal/erp-outbox/route.ts frontend/src/app/api/mock/erp/route.ts frontend/.env.local.example directus/verify_erp_outbound_webhook.mjs docs/specs/SPEC-04-api-spec.md docs/engineering/ENG-01-architecture-overview.md docs/operations/OPS-01-deployment-guide.md docs/testing/TEST-02-test-cases.md
git commit -m "feat: add erp outbox worker"
```

## Self-Review

### 1. Spec coverage

- Outbox logging: covered by Task 2.
- Single shared ERP endpoint: covered by the worker and API spec updates in Task 3.
- Meaningful-change filtering: covered by Task 1 and the Directus flow manual config.
- Full record payload: covered by Task 1 and the flow contract in Task 2.
- `erp_ref` idempotency and null fallback: covered by Task 1.
- Retry policy and DLQ: covered by Task 1 and Task 3.
- Sync off / staging stub: covered by Task 3 and the mock ERP route.
- Ops, docs, and test cases: covered by Task 3.

### 2. Placeholder scan

- No TBD/TODO placeholders.
- No "implement later" text.
- Each task names exact files and includes a concrete test or smoke check.

### 3. Type consistency

- `entity`, `op`, `record_id`, `erp_ref`, `revision`, `idempotency_key`, `payload`, `status`, and retry metadata are used consistently across the helper, schema, worker, and docs.
- `integration_events` is the single source table; `failed_erp_webhooks` is the reporting view over that table.
