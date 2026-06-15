# Commercial Data Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CSV import workflow for `customers`, `orders`, `invoices`, and `deliveries` that validates before write, supports nested order items, enforces the ERP/import key rules, and returns a clear preview plus downloadable error rows.

**Architecture:** Put the atomic business logic in a new Directus endpoint extension so the import engine can use Directus services and roll back one aggregate cleanly when a row fails. Keep the Next.js `/api/import` route as a thin authenticated facade that accepts the uploaded CSV, forwards the request to Directus, and returns the preview/commit result to the admin UI. The UI itself is a small internal workbench in Next.js that does the upload, shows the dry-run mapping, and turns failed rows into a downloadable CSV. Customers stay compatible with the native Directus importer, but the custom engine still supports them so the same preview/reporting path can be used when operators want it.

**Tech Stack:** Directus endpoint extension runtime, Directus bootstrap schema, PostgreSQL indexes, Next.js 14 App Router, `@directus/sdk`, Node test runner, CSV parsing/stringifying, markdown docs.

---

## File Structure

- Create: `directus/extensions/commercial-import-endpoint/package.json`
  Responsibility: register a new Directus endpoint extension with the same metadata pattern used by the existing Directus endpoints.
- Create: `directus/extensions/commercial-import-endpoint/src/index.js`
  Responsibility: expose `POST /preview` and `POST /commit` handlers and enforce Admin/Sales Ops access through Directus accountability.
- Create: `directus/extensions/commercial-import-endpoint/src/service.js`
  Responsibility: parse CSV rows, resolve import keys, validate foreign keys and enums, run preview mode, and commit each aggregate with rollback on failure.
- Create: `directus/extensions/commercial-import-endpoint/src/csv.js`
  Responsibility: parse CSV text and render downloadable error rows.
- Create: `directus/extensions/commercial-import-endpoint/src/service.test.js`
  Responsibility: lock the CSV contract, preview counts, rollback behavior, nested order item handling, and partial-success behavior.
- Modify: `directus/package.json`
  Responsibility: add the CSV parser dependency and a direct verification script for the import workflow.
- Modify: `directus/schema/collections.mjs`
  Responsibility: add `customers.erp_ref` and keep the commercial collections aligned with the import contract.
- Modify: `directus/lib/db-indexes.mjs`
  Responsibility: load the new commercial import SQL migration automatically instead of hardcoding a single file.
- Create: `directus/sql/migrations/2026-06-12-add-commercial-import-indexes.sql`
  Responsibility: add the unique/normalization indexes required by the import key rules.
- Modify: `directus/verify_bootstrap.mjs`
  Responsibility: assert the `customers` import key field and the new indexes exist after bootstrap.
- Modify: `directus/seed/demo_commerce.mjs`
  Responsibility: keep the seeded customer record compatible with the new nullable `erp_ref` field.
- Create: `directus/verify_commercial_data_import.mjs`
  Responsibility: smoke the full admin-upload -> Next.js facade -> Directus endpoint -> database path and verify preview, commit, rollback, and downloadable error rows.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the new customer ERP key, the import key resolution order, and the nested order-item contract.
- Create: `frontend/src/lib/commercial-import.ts`
  Responsibility: define the request/response types and error-row download helpers used by the admin UI.
- Create: `frontend/src/lib/commercial-import.test.ts`
  Responsibility: lock the client-side download formatting and response-shape helpers.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: add typed `Customer`, `Order`, `OrderItem`, `Invoice`, and `Delivery` records for the import helpers and future admin tools.
- Modify: `frontend/package.json`
  Responsibility: add the new import tests to the standard `npm test` script.
- Create: `frontend/src/app/api/import/route.ts`
  Responsibility: accept the uploaded file from the browser, forward it to the Directus commercial import endpoint, and return the normalized response.
- Create: `frontend/src/app/api/import/route.test.ts`
  Responsibility: lock the proxy behavior, the `preview`/`commit` mode mapping, and the failure envelope.
- Create: `frontend/src/components/admin/commercial-import-workbench.tsx`
  Responsibility: upload CSVs, trigger preview/commit, show the row-by-row result, and download failed rows.
- Create: `frontend/src/app/[locale]/(main)/admin/import/page.tsx`
  Responsibility: provide the internal import page shell and mount the workbench.
- Modify: `frontend/package.json`
  Responsibility: add the new import tests to the `npm test` script.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: add the customer ERP key and the import contract notes.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: document `POST /api/import`, its payload, and the preview/commit response envelope.
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
  Responsibility: show the admin upload -> Next.js facade -> Directus endpoint -> Directus data flow.
- Modify: `docs/operations/OPS-01-deployment-guide.md`
  Responsibility: document the new import route, the Directus endpoint extension, and the environment/runtime assumptions.
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
  Responsibility: explain when admins should use the custom import workbench versus the native Directus importer.
- Modify: `docs/testing/TEST-02-test-cases.md`
  Responsibility: add the import preview, atomic commit, rollback, and partial-success test cases.

## Task 1: Build the Directus import engine and lock the CSV contract

**Files:**
- Create: `directus/extensions/commercial-import-endpoint/package.json`
- Create: `directus/extensions/commercial-import-endpoint/src/index.js`
- Create: `directus/extensions/commercial-import-endpoint/src/service.js`
- Create: `directus/extensions/commercial-import-endpoint/src/csv.js`
- Create: `directus/extensions/commercial-import-endpoint/src/service.test.js`
- Modify: `directus/package.json`

- [ ] **Step 1: Write the failing tests**

Add tests that prove the import contract before the endpoint exists:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCommercialImportPreview,
  renderCommercialImportErrorRows,
  resolveCommercialImportKey
} from './service.js';
import { parseCommercialCsv } from './csv.js';

test('parses nested order items from the orders CSV', () => {
  const csv = [
    'erp_ref,customer_erp_ref,subtotal,tax,total,order_items_json',
    'ERP-ORD-2026-0001,ERP-CUS-1001,150000,15000,165000,"[{""sku_erp_ref"":""ERP-SKU-1"",""qty"":2,""unit_price"":50000,""line_total"":100000}]"'
  ].join('\n');

  const rows = parseCommercialCsv(csv);
  const preview = buildCommercialImportPreview('orders', rows, {
    allowPartial: false
  });

  assert.equal(preview.counts.created, 1);
  assert.equal(preview.rows[0].nested.order_items.length, 1);
  assert.equal(preview.rows[0].key, 'ERP-ORD-2026-0001');
});

test('uses erp_ref, then tax_code, then email for customers', () => {
  assert.equal(
    resolveCommercialImportKey('customers', {
      erp_ref: null,
      tax_code: ' 0102030405 ',
      email: 'buyer@acme.vn'
    }),
    '0102030405'
  );
});

test('renders downloadable error rows', () => {
  const csv = renderCommercialImportErrorRows([
    { row: 3, field: 'erp_ref', message: 'required' }
  ]);

  assert.match(csv, /row,field,message/);
  assert.match(csv, /3,erp_ref,required/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd directus && node --test extensions/commercial-import-endpoint/src/service.test.js`

Expected: fail because the new Directus endpoint files do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Implement the endpoint in the same shape as the existing Directus extension pattern:

```js
export default {
  id: 'commercial-import',
  handler(router, context) {
    router.post('/preview', async (req, res) => {
      const result = await runCommercialImport(context, {
        mode: 'preview',
        collection: req.body.collection,
        csvText: req.body.csvText,
        allowPartial: req.body.allowPartial === true
      });

      return res.json({ data: result });
    });

    router.post('/commit', async (req, res) => {
      const result = await runCommercialImport(context, {
        mode: 'commit',
        collection: req.body.collection,
        csvText: req.body.csvText,
        allowPartial: req.body.allowPartial === true
      });

      return res.json({ data: result });
    });
  }
};
```

Inside `service.js`, keep the logic explicit:

```js
export function resolveCommercialImportKey(collection, row) {
  if (collection === 'customers') {
    return normalize(row.erp_ref) || normalize(row.tax_code) || normalize(row.email);
  }

  if (collection === 'invoices') {
    return normalize(row.erp_ref) || normalize(row.code);
  }

  return normalize(row.erp_ref);
}
```

Use the Directus service classes for writes, and roll back one aggregate when an insert/update fails by deleting any created child rows and restoring the parent snapshot if the row was an update. Keep `preview` strictly read-only.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd directus && node --test extensions/commercial-import-endpoint/src/service.test.js`

Expected: PASS for the new parser, key-resolution, preview, rollback, and error-row tests.

- [ ] **Step 5: Commit**

```bash
git add directus/extensions/commercial-import-endpoint directus/package.json
git commit -m "feat: add commercial import engine"
```

## Task 2: Add the schema and index support the import keys depend on

**Files:**
- Modify: `directus/schema/collections.mjs`
- Modify: `directus/lib/db-indexes.mjs`
- Create: `directus/sql/migrations/2026-06-12-add-commercial-import-indexes.sql`
- Modify: `directus/verify_bootstrap.mjs`
- Modify: `directus/seed/demo_commerce.mjs`
- Modify: `directus/SCHEMA.md`
- Modify: `docs/specs/SPEC-03-data-model.md`

- [ ] **Step 1: Write the failing verification**

Add bootstrap assertions for the new customer ERP key and the normalized uniqueness indexes:

```js
const integrationFields = await client.request(readFields('customers'));
const customerFieldNames = integrationFields.map((field) => field.field);

assert(customerFieldNames.includes('erp_ref'));
assert(customerFieldNames.includes('tax_code'));
assert(customerFieldNames.includes('email'));

const indexes = await db.query(`
  select indexname
  from pg_indexes
  where schemaname = 'public'
    and tablename = 'customers'
`);

assert(indexes.rows.some((row) => row.indexname === 'customers_erp_ref_key'));
assert(indexes.rows.some((row) => row.indexname === 'customers_tax_code_key'));
assert(indexes.rows.some((row) => row.indexname === 'customers_email_key'));
```

- [ ] **Step 2: Run the verification to confirm it fails**

Run: `cd directus && npm run verify`

Expected: fail because `customers.erp_ref` and the normalized unique indexes are not present yet.

- [ ] **Step 3: Add the schema and SQL indexes**

Add the nullable ERP reference field to `customers` in `directus/schema/collections.mjs`:

```js
{ field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
```

Create the migration with normalized unique indexes so keys are case- and trim-stable:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS customers_erp_ref_key
  ON customers (lower(btrim(erp_ref)))
  WHERE erp_ref IS NOT NULL AND btrim(erp_ref) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS customers_tax_code_key
  ON customers (lower(btrim(tax_code)))
  WHERE tax_code IS NOT NULL AND btrim(tax_code) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS customers_email_key
  ON customers (lower(btrim(email)))
  WHERE email IS NOT NULL AND btrim(email) <> '';
```

Update `directus/lib/db-indexes.mjs` to load every SQL file in `directus/sql/migrations/` in lexical order, so the new migration is applied automatically without adding another hardcoded path.

Update the demo seed so the portal-created customer still exercises the nullable-key path:

```js
await helpers.ensureItem('customers', 'email', {
  erp_ref: null,
  user: customerUserId,
  company_name: 'Cong ty Samsung Electronics Viet Nam',
  tax_code: '0102030405-001',
  contact_name: 'Nguyen Van A',
  email: 'customer@ulink.com',
  phone: '0987654321',
  address: 'Lo CN1-1, KCN Yen Phong, Bac Ninh',
  status: 'active'
});
```

Document the import-key order in `directus/SCHEMA.md` and `docs/specs/SPEC-03-data-model.md`: `erp_ref` first, then `tax_code` for customers, then `email` if the customer row has no tax code.

- [ ] **Step 4: Run the verification to confirm it passes**

Run: `cd directus && npm run verify`

Expected: PASS with the new `customers.erp_ref` field and uniqueness indexes present.

- [ ] **Step 5: Commit**

```bash
git add directus/schema/collections.mjs directus/lib/db-indexes.mjs directus/sql/migrations/2026-06-12-add-commercial-import-indexes.sql directus/verify_bootstrap.mjs directus/seed/demo_commerce.mjs directus/SCHEMA.md docs/specs/SPEC-03-data-model.md
git commit -m "feat: add commercial import schema support"
```

## Task 3: Add the Next.js facade, admin workbench, smoke test, and docs

**Files:**
- Modify: `frontend/src/lib/directus.ts`
- Create: `frontend/src/lib/commercial-import.ts`
- Create: `frontend/src/lib/commercial-import.test.ts`
- Create: `frontend/src/app/api/import/route.ts`
- Create: `frontend/src/app/api/import/route.test.ts`
- Create: `frontend/src/components/admin/commercial-import-workbench.tsx`
- Create: `frontend/src/app/[locale]/(main)/admin/import/page.tsx`
- Modify: `frontend/package.json`
- Create: `directus/verify_commercial_data_import.mjs`
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
- Modify: `docs/operations/OPS-01-deployment-guide.md`
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
- Modify: `docs/testing/TEST-02-test-cases.md`

- [ ] **Step 1: Write the failing route and UI tests**

Add tests that prove the facade and the UI helpers before the route exists:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildFailedRowCsv, normalizeImportResponse } from './commercial-import';

test('normalizes the import response envelope', () => {
  const result = normalizeImportResponse({
    data: { counts: { created: 1, updated: 0, skipped: 0, failed: 0 } }
  });

  assert.equal(result.counts.created, 1);
  assert.equal(result.counts.failed, 0);
});

test('renders failed rows as a CSV download', () => {
  const csv = buildFailedRowCsv([{ row: 2, field: 'customer_erp_ref', message: 'not found' }]);

  assert.match(csv, /row,field,message/);
  assert.match(csv, /2,customer_erp_ref,not found/);
});
```

Add the route test to prove the facade forwards the uploaded file to Directus and switches between preview and commit:

```ts
test('forwards a preview upload to the Directus import endpoint', async () => {
  // mock fetch, send formData with collection, allow_partial, file
  // expect the proxied request to use preview mode
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
cd frontend && node --import tsx --test src/lib/commercial-import.test.ts src/app/api/import/route.test.ts
```

Expected: fail because the new facade, workbench, and helpers do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

The Next.js route should only parse the upload and proxy the request:

```ts
export async function POST(req: Request) {
  const form = await req.formData();
  const collection = String(form.get('collection') ?? '');
  const mode = String(form.get('mode') ?? 'preview');
  const allowPartial = form.get('allow_partial') === 'true';
  const file = form.get('file');

  if (!(file instanceof File)) {
    return jsonErrorRaw(400, 'bad_request', 'CSV file is required.');
  }

  const csvText = await file.text();
  const response = await fetch(`${process.env.DIRECTUS_URL}/commercial-import/${mode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`
    },
    body: JSON.stringify({ collection, csvText, allowPartial })
  });

  return Response.json(await response.json(), { status: response.status });
}
```

The admin workbench should render:

```tsx
<CommercialImportWorkbench
  collections={['customers', 'orders', 'invoices', 'deliveries']}
  defaultCollection="orders"
  onPreview={...}
  onCommit={...}
/>
```

Keep the workbench focused on one thing: upload, preview, commit, and download failed rows. Do not turn it into a broader admin dashboard.

- [ ] **Step 4: Run the tests and the smoke verification to confirm they pass**

Run:

```bash
cd frontend && node --import tsx --test src/lib/commercial-import.test.ts src/app/api/import/route.test.ts
cd directus && node verify_commercial_data_import.mjs
```

Expected: the facade tests pass, the smoke script shows preview counts before commit, the default atomic mode rolls back a bad aggregate, and the partial-success mode keeps valid aggregates while returning downloadable failed rows.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/directus.ts frontend/src/lib/commercial-import.ts frontend/src/lib/commercial-import.test.ts frontend/src/app/api/import/route.ts frontend/src/app/api/import/route.test.ts frontend/src/components/admin/commercial-import-workbench.tsx frontend/src/app/[locale]/(main)/admin/import/page.tsx frontend/package.json directus/verify_commercial_data_import.mjs docs/specs/SPEC-04-api-spec.md docs/engineering/ENG-01-architecture-overview.md docs/operations/OPS-01-deployment-guide.md docs/guides/GUIDE-01-cms-admin-guide.md docs/testing/TEST-02-test-cases.md
git commit -m "feat: add commercial import facade"
```

## Self-Review

### 1. Spec coverage

- CSV import scope for `customers`, `orders`, `invoices`, and `deliveries`: covered by Task 1 and Task 3.
- Nested `order_items` under `orders`: covered by Task 1.
- Admin and Sales Ops only: covered by the Directus endpoint accountability check in Task 1 and the admin workbench in Task 3.
- Custom `POST /api/import` instead of native UI for complex imports: covered by Task 3.
- Preview before import: covered by Task 1 and Task 3.
- Created / updated / skipped / failed counts plus downloadable error rows: covered by Task 1 and Task 3.
- Default rollback-on-any-error plus optional partial success: covered by Task 1 and Task 3.
- `erp_ref` required for ERP-sourced commercial rows, nullable only for portal-created customers: covered by Task 2.
- `erp_ref` upsert key, with customer fallback to `tax_code` and then `email`: covered by Task 1 and Task 2.

### 2. Placeholder scan

- No TBD/TODO placeholders.
- No "implement later" text.
- No vague validation wording like "handle edge cases".
- Every task names exact files and exact verification commands.

### 3. Type consistency

- `collection`, `csvText`, `allowPartial`, `counts`, `rows`, `nested.order_items`, and `failed rows` are used consistently across the Directus service, the Next.js facade, and the admin workbench.
- `customers.erp_ref` is the only new schema field introduced for the import key path.
- The import key order stays stable everywhere: `erp_ref` first, then `tax_code` for customers, then `email`, with `code` as the invoice fallback when `erp_ref` is missing.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-12-commercial-data-import.md`. Two execution options:

1. Subagent-Driven (recommended) - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
