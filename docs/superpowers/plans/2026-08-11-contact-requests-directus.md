# Contact Requests Directus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save every contact form submission into Directus `contact_requests`, then keep both contact forms on the site submitting to that API and redirecting to the existing success page on success.

**Architecture:** Use the existing `contactSchema` and the same Directus write pattern already used by `newsletter` and `sample-request`. Directus owns persistence through a new `contact_requests` collection, while Next.js owns validation, error translation, and the browser submit flow. The UI stays visually unchanged except for a real submit path, loading state, and inline error feedback.

**Tech Stack:** Next.js 14 App Router, `@directus/sdk`, Directus bootstrap schema, `zod`, Node test runner with `tsx`, existing `route-helpers`, existing `contactSchema`.

## Global Constraints

- Reuse `frontend/src/lib/validators.ts` `contactSchema`; do not invent a second contact validator.
- Keep the success destination as `/about/contact-success`.
- The browser must never write to Directus directly; all writes go through `POST /api/contact`.
- `contact_requests.created_at` must be server-managed and not trusted from client input.
- Keep the current contact form layouts and copy; only wire behavior and minimal submit feedback.

---

## File Structure

- Modify: `directus/schema/collections.mjs`
  Responsibility: define the new `contact_requests` collection and its fields.
- Modify: `directus/rbac/permissions.mjs`
  Responsibility: allow the app server token to create contact requests and let Sales/Admin read them in Directus.
- Create: `directus/verify_contact_requests.mjs`
  Responsibility: assert the collection exists, the field names match the contract, and the create/read access model is bootstrapped.
- Modify: `directus/package.json`
  Responsibility: add a dedicated `verify:contact-requests` script.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the new collection contract and what `created_at` means.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: add the `ContactRequest` type and include it in `Schema`.
- Modify: `frontend/src/lib/validators.ts`
  Responsibility: keep the existing `contactSchema` as the app-wide request shape and align any field wording if needed.
- Create: `frontend/src/lib/contact-request.server.ts`
  Responsibility: take a validated contact payload and persist it to Directus.
- Create: `frontend/src/lib/contact-request.server.test.ts`
  Responsibility: lock the payload mapping into `contact_requests`.
- Create: `frontend/src/app/api/contact/route.ts`
  Responsibility: validate, persist, and return a compact created response.
- Modify: `frontend/src/components/contact/contact-info-cards.tsx`
  Responsibility: submit the contact form to the new API and show loading/error state.
- Modify: `frontend/src/components/about/about-contact.tsx`
  Responsibility: submit the about-page contact form to the new API and show loading/error state.
- Create: `frontend/src/lib/contact-submit.ts`
  Responsibility: shared client helper that posts a contact request to `/api/contact`.
- Create: `frontend/src/lib/contact-submit.test.ts`
  Responsibility: lock the request URL and JSON body for the browser helper.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: add `contact_requests` to the authoritative data model.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: document `POST /api/contact` and its response/errors.
- Modify: `docs/testing/TEST-03-uat-checklist.md`
  Responsibility: add the contact-form smoke checks and Directus verification steps.

## Task 1: Define the Directus collection and contract

**Files:**
- Create: `directus/verify_contact_requests.mjs`
- Modify: `directus/package.json`
- Modify: `directus/schema/collections.mjs`
- Modify: `directus/rbac/permissions.mjs`
- Modify: `directus/SCHEMA.md`
- Modify: `frontend/src/lib/directus.ts`
- Modify: `docs/specs/SPEC-03-data-model.md`

**Interfaces:**
- Consumes: `contact_requests` with fields `full_name`, `email`, `phone`, `subject`, `message`, `created_at`.
- Produces: `ContactRequest` type in `frontend/src/lib/directus.ts` and Directus bootstrap metadata for the new collection.

- [ ] **Step 1: Write the failing bootstrap verification**

Create `directus/verify_contact_requests.mjs` with an explicit contract check:

```js
import assert from 'node:assert/strict';
import { collections } from './schema/collections.mjs';

const contactRequests = collections.find((entry) => entry.collection === 'contact_requests');

assert.ok(contactRequests, 'contact_requests collection exists');
assert.deepEqual(
  contactRequests.fields.map((field) => field.field),
  ['id', 'full_name', 'email', 'phone', 'subject', 'message', 'created_at']
);
```

Also add a script entry in `directus/package.json`:

```json
{
  "scripts": {
    "verify:contact-requests": "node verify_contact_requests.mjs"
  }
}
```

- [ ] **Step 2: Run the verification and confirm it fails**

Run:

```bash
cd directus
npm run verify:contact-requests
```

Expected: fail because `contact_requests` does not exist yet.

- [ ] **Step 3: Add the collection and access rules**

Define `contact_requests` in `directus/schema/collections.mjs` with these fields:

```js
{
  collection: 'contact_requests',
  fields: [
    { field: 'full_name', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'email', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'phone', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'subject', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'message', type: 'text', meta: { interface: 'input-multiline', required: true } },
    {
      field: 'created_at',
      type: 'dateTime',
      meta: { interface: 'datetime', readonly: true },
      schema: { default_value: '$NOW' }
    }
  ]
}
```

Add RBAC in `directus/rbac/permissions.mjs` so:

```js
// Visitor / public: no read access.
// App server token: create only.
// Sales: read-only for triage.
// Admin: CRUD.
```

Add `ContactRequest` to `frontend/src/lib/directus.ts`:

```ts
export interface ContactRequest {
  id?: number | string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at?: string;
}

export interface Schema {
  contact_requests: ContactRequest[];
}
```

Document the collection in `directus/SCHEMA.md` and `docs/specs/SPEC-03-data-model.md` with the same field list and the note that `created_at` is the server-side timestamp used for submission order.

- [ ] **Step 4: Rerun the verification and make sure the contract passes**

Run:

```bash
cd directus
npm run verify:contact-requests
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add directus/verify_contact_requests.mjs directus/package.json directus/schema/collections.mjs directus/rbac/permissions.mjs directus/SCHEMA.md frontend/src/lib/directus.ts docs/specs/SPEC-03-data-model.md
git commit -m "feat: add contact requests collection"
```

## Task 2: Build the server-side save path and API route

**Files:**
- Create: `frontend/src/lib/contact-request.server.ts`
- Create: `frontend/src/lib/contact-request.server.test.ts`
- Create: `frontend/src/app/api/contact/route.ts`
- Modify: `frontend/src/lib/validators.ts`
- Modify: `frontend/src/lib/directus.ts`

**Interfaces:**
- Consumes: `ContactInput` from `contactSchema`.
- Produces: `saveContactRequest(data)` returning the created Directus id.

- [ ] **Step 1: Write the failing service test**

Create `frontend/src/lib/contact-request.server.test.ts` to lock the payload mapping before the persistence code exists:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import { saveContactRequest } from './contact-request.server';

test('saveContactRequest maps the validated payload into contact_requests', async () => {
  const writes: Array<Record<string, unknown>> = [];

  const result = await saveContactRequest(
    {
      name: '  Nguyễn Văn A  ',
      email: '  Buyer@Company.vn  ',
      phone: ' 0901234567 ',
      subject: '  Báo giá vật tư  ',
      message: '  Tôi cần tư vấn  '
    },
    {
      writeContactRequest: async (payload) => {
        writes.push(payload);
        return { id: 77 };
      }
    }
  );

  assert.equal(result.id, 77);
  assert.deepEqual(writes[0], {
    full_name: 'Nguyễn Văn A',
    email: 'buyer@company.vn',
    phone: '0901234567',
    subject: 'Báo giá vật tư',
    message: 'Tôi cần tư vấn'
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
cd frontend
node --import tsx --test src/lib/contact-request.server.test.ts
```

Expected: fail because `contact-request.server.ts` does not exist yet.

- [ ] **Step 3: Implement the persistence helper and route**

Create `frontend/src/lib/contact-request.server.ts` with a small, testable contract:

```ts
export async function saveContactRequest(
  input: ContactInput,
  deps?: {
    writeContactRequest: (payload: {
      full_name: string;
      email: string;
      phone: string;
      subject: string;
      message: string;
    }) => Promise<{ id: number | string }>;
  }
): Promise<{ id: number | string }>;
```

Behavior:
- trim all string fields;
- lowercase `email`;
- pass only the 5 business fields to Directus;
- never accept `created_at` from the browser;
- return the created id.

Create `frontend/src/app/api/contact/route.ts` using `handleRoute(req, { schema: contactSchema }, ...)` and `createWriteDirectusClient()`:

```ts
const created = await saveContactRequest(data, {
  writeContactRequest: async (payload) => {
    const directus = createWriteDirectusClient();
    return directus.request(createItem('contact_requests', payload));
  }
});

return jsonCreated({ id: created.id });
```

The route should:
- return `201` on success;
- return `422` from `handleRoute` when validation fails;
- return `502` with a clear log line if Directus write fails.

- [ ] **Step 4: Rerun the service test and verify it passes**

Run:

```bash
cd frontend
node --import tsx --test src/lib/contact-request.server.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/contact-request.server.ts frontend/src/lib/contact-request.server.test.ts frontend/src/app/api/contact/route.ts frontend/src/lib/validators.ts frontend/src/lib/directus.ts
git commit -m "feat: add contact request api"
```

## Task 3: Wire both contact forms to the API

**Files:**
- Create: `frontend/src/lib/contact-submit.ts`
- Create: `frontend/src/lib/contact-submit.test.ts`
- Modify: `frontend/src/components/contact/contact-info-cards.tsx`
- Modify: `frontend/src/components/about/about-contact.tsx`

**Interfaces:**
- Consumes: a plain object with `name`, `email`, `phone`, `subject`, `message`.
- Produces: a shared client submit helper that returns `{ ok: true }` or `{ ok: false; message: string }`.

- [ ] **Step 1: Write the failing client helper test**

Create `frontend/src/lib/contact-submit.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import { submitContactRequest } from './contact-submit';

test('submitContactRequest posts the contact payload to /api/contact', async () => {
  let capturedUrl = '';
  let capturedBody = '';

  const result = await submitContactRequest(
    {
      name: 'Nguyễn Văn A',
      email: 'buyer@company.vn',
      phone: '0901234567',
      subject: 'Báo giá',
      message: 'Cần tư vấn'
    },
    async (url, init) => {
      capturedUrl = url;
      capturedBody = String(init?.body ?? '');
      return new Response(JSON.stringify({ success: true, data: { id: 91 } }), { status: 201 });
    }
  );

  assert.equal(capturedUrl, '/api/contact');
  assert.deepEqual(JSON.parse(capturedBody), {
    name: 'Nguyễn Văn A',
    email: 'buyer@company.vn',
    phone: '0901234567',
    subject: 'Báo giá',
    message: 'Cần tư vấn'
  });
  assert.equal(result.ok, true);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
cd frontend
node --import tsx --test src/lib/contact-submit.test.ts
```

Expected: fail because the helper does not exist yet.

- [ ] **Step 3: Implement the shared browser submit helper**

Create `frontend/src/lib/contact-submit.ts` with this shape:

```ts
export async function submitContactRequest(
  payload: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  },
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: true } | { ok: false; message: string }>;
```

Behavior:
- POST JSON to `/api/contact`;
- treat any non-2xx as a failure with a readable message;
- do not navigate itself; let the components keep control of redirect timing.

Update `contact-info-cards.tsx` and `about-contact.tsx` to:
- read values from `FormData`;
- call `submitContactRequest`;
- show a disabled/loading submit button while the request is in flight;
- display a short inline error message on failure;
- `router.push('/about/contact-success')` only after a successful response.

Keep the current look and copy; do not redesign the forms.

- [ ] **Step 4: Rerun the helper test and verify the components still typecheck**

Run:

```bash
cd frontend
node --import tsx --test src/lib/contact-submit.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/contact-submit.ts frontend/src/lib/contact-submit.test.ts frontend/src/components/contact/contact-info-cards.tsx frontend/src/components/about/about-contact.tsx
git commit -m "feat: wire contact forms to api"
```

## Task 4: Final verification and docs sync

**Files:**
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/testing/TEST-03-uat-checklist.md`

**Interfaces:**
- Consumes: `POST /api/contact`.
- Produces: documented API behavior and final smoke checklist entries.

- [ ] **Step 1: Update the API spec**

Add `POST /api/contact` to `docs/specs/SPEC-04-api-spec.md` with:

- required fields: `name`, `email`, `phone`, `subject`, `message`;
- `201` on success with the new id;
- `422` for validation errors;
- `502` for Directus write failure;
- note that the route writes to `contact_requests` and the browser never writes Directus directly.

- [ ] **Step 2: Update the UAT checklist**

Add these smoke cases to `docs/testing/TEST-03-uat-checklist.md`:

- contact form on `/contact` submits successfully and redirects to `/about/contact-success`;
- contact form on `/about` submits successfully and redirects to `/about/contact-success`;
- a new `contact_requests` row appears in Directus with the submitted `full_name`, `email`, `phone`, `subject`, and `message`;
- `created_at` is present on the stored record;
- invalid email or missing required fields return a visible error and do not create a record.

- [ ] **Step 3: Run the full verification suite**

Run:

```bash
cd directus
npm run verify:contact-requests

cd ../frontend
node --import tsx --test src/lib/contact-request.server.test.ts src/lib/contact-submit.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 4: Final commit**

```bash
git add docs/specs/SPEC-04-api-spec.md docs/testing/TEST-03-uat-checklist.md
git commit -m "docs: record contact request flow"
```

## Spec Coverage

- Collection contract: Task 1 defines `contact_requests` and the access model.
- Server persistence: Task 2 writes validated contact submissions into Directus.
- Browser submit flow: Task 3 wires both forms to the API and preserves the existing success page redirect.
- Validation and error handling: Tasks 2 and 3 cover 422 validation failures and non-2xx API responses.
- Operator documentation: Task 4 updates the API spec and UAT checklist.

## Self-Review

- No placeholder text remains.
- Every task has a concrete file list, test command, and expected outcome.
- The plan stays within one subsystem: contact intake to Directus.
- The two existing contact forms are both included, so no duplicate unhandled submit path remains.
- The collection field names stay consistent across Directus schema, API route, and docs.
