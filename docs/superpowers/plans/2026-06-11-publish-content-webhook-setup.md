# Publish Content Webhook Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up an authenticated Directus -> Next.js publish/unpublish webhook so CMS changes invalidate the right content caches.

**Architecture:** Directus Flow stays thin: it filters the relevant collections and events, then POSTs a minimal JSON payload to one Next.js route. Next.js owns the revalidation rules, validates `REVALIDATE_SECRET`, and calls `revalidateTag` plus `revalidatePath` through a small pure helper so the mapping is testable without a live Directus instance. Setup docs and env samples keep the secret and the flow contract consistent across local, staging, and production.

**Tech Stack:** Directus Flows, Next.js 14 App Router, `next/cache`, Node test runner with `tsx`, markdown ops/spec docs, PowerShell or `curl` smoke checks.

---

## File Structure

- Create: `frontend/src/lib/content-revalidation.ts`
  Responsibility: parse the webhook payload, validate the secret, and map collections to `revalidateTag` / `revalidatePath` targets.
- Create: `frontend/src/lib/content-revalidation.test.ts`
  Responsibility: lock the secret check, payload validation, and collection-to-path mapping.
- Create: `frontend/src/app/api/revalidate/route.ts`
  Responsibility: authenticate Directus, parse the payload, call Next.js cache revalidation, and return a normalized JSON response.
- Modify: `frontend/package.json`
  Responsibility: add the new helper test file to the `test` script so `npm test` covers the webhook contract.
- Modify: `frontend/.env.local.example`
  Responsibility: document `REVALIDATE_SECRET` for the Next.js route.
- Modify: `docs/specs/SPEC-04-api-spec.md`
  Responsibility: define `POST /api/revalidate` as an app-owned endpoint with auth, payload, and response semantics.
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
  Responsibility: show the publish -> webhook -> revalidate flow in the system diagram and data-flow notes.
- Modify: `docs/engineering/ENG-05-local-development-setup.md`
  Responsibility: add the local secret and Directus Flow setup steps.
- Modify: `docs/operations/OPS-01-deployment-guide.md`
  Responsibility: document the production webhook URL, header secret, and Directus Flow action.
- Modify: `docs/testing/TEST-02-test-cases.md`
  Responsibility: add publish, unpublish, delete, and bad-secret verification cases.

### Task 1: Lock webhook contract and cache target mapping

**Files:**
- Create: `frontend/src/lib/content-revalidation.ts`
- Create: `frontend/src/lib/content-revalidation.test.ts`
- Modify: `frontend/package.json`
- Test: `frontend/src/lib/content-revalidation.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parsePublishWebhookPayload,
  requireRevalidateSecret,
  resolveRevalidationTargets
} from './content-revalidation';

test('rejects a missing webhook secret', () => {
  assert.throws(
    () => requireRevalidateSecret(undefined, undefined),
    /REVALIDATE_SECRET is required/
  );
});

test('accepts the configured bearer secret', () => {
  assert.equal(
    requireRevalidateSecret('Bearer dev-revalidate-secret', 'dev-revalidate-secret'),
    'dev-revalidate-secret'
  );
});

test('rejects a mismatched bearer secret', () => {
  assert.throws(
    () => requireRevalidateSecret('Bearer wrong-secret', 'dev-revalidate-secret'),
    /Invalid webhook secret/
  );
});

test('maps a published product update to list and detail paths', () => {
  const parsed = parsePublishWebhookPayload({
    event: 'items.update',
    collection: 'products',
    id: 42,
    slug: 'cr-glv-001',
    locale: 'vi',
    status: 'published'
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error(parsed.error.message);

  assert.deepEqual(resolveRevalidationTargets(parsed.data), {
    tags: ['products'],
    paths: ['/vi/solutions', '/vi/products/cr-glv-001']
  });
});

test('maps a bulk blog update to the collection tag and list path only', () => {
  const parsed = parsePublishWebhookPayload({
    event: 'items.update',
    collection: 'blog_posts',
    keys: [1001, 1002],
    locale: 'ja',
    status: 'published'
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error(parsed.error.message);

  assert.deepEqual(resolveRevalidationTargets(parsed.data), {
    tags: ['blog_posts'],
    paths: ['/ja/resources']
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`

Expected: fail because `frontend/src/lib/content-revalidation.ts` is missing and the new test file is not in the script yet.

- [ ] **Step 3: Add the new test file to the frontend test script**

Update `frontend/package.json` test command so it includes the new file.

```json
{
  "scripts": {
    "test": "node --import tsx --test src/lib/directus.test.mjs src/lib/auth.test.mjs src/lib/api-response.test.ts src/lib/rfq-validation.test.ts src/lib/rfq-sku.test.ts src/lib/rfq-anti-spam.test.ts src/lib/rfq-submit.test.ts src/lib/content-revalidation.test.ts"
  }
}
```

- [ ] **Step 4: Implement the pure helper**

```ts
// frontend/src/lib/content-revalidation.ts
export type ContentCollection =
  | 'products'
  | 'pages'
  | 'blog_posts'
  | 'case_studies'
  | 'regional_hubs'
  | 'documents'
  | 'product_categories'
  | 'partners'
  | 'hero_banners';

export type PublishWebhookEvent = 'items.create' | 'items.update' | 'items.delete';

export interface PublishWebhookPayload {
  event: PublishWebhookEvent;
  collection: ContentCollection;
  id?: string | number;
  keys?: Array<string | number>;
  slug?: string;
  status?: 'published' | 'draft' | 'archived';
  locale?: string;
}

export interface RevalidationTargets {
  tags: string[];
  paths: string[];
}

export function requireRevalidateSecret(
  authorization: string | null | undefined = undefined,
  expectedSecret = process.env.REVALIDATE_SECRET
): string {
  if (!expectedSecret) {
    throw new Error('REVALIDATE_SECRET is required for content webhook requests.');
  }

  const received = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : authorization ?? undefined;

  if (!received || received !== expectedSecret) {
    throw new Error('Invalid webhook secret.');
  }

  return received;
}

export function parsePublishWebhookPayload(
  value: unknown
): { ok: true; data: PublishWebhookPayload } | { ok: false; error: Error } {
  if (!value || typeof value !== 'object') {
    return { ok: false, error: new Error('Request body must be an object.') };
  }

  const body = value as Record<string, unknown>;
  const event = body.event;
  const collection = body.collection;

  if (
    event !== 'items.create' &&
    event !== 'items.update' &&
    event !== 'items.delete'
  ) {
    return { ok: false, error: new Error('Unsupported webhook event.') };
  }

  if (
    collection !== 'products' &&
    collection !== 'pages' &&
    collection !== 'blog_posts' &&
    collection !== 'case_studies' &&
    collection !== 'regional_hubs' &&
    collection !== 'documents' &&
    collection !== 'product_categories' &&
    collection !== 'partners' &&
    collection !== 'hero_banners'
  ) {
    return { ok: false, error: new Error('Unsupported content collection.') };
  }

  return {
    ok: true,
    data: {
      event: event as PublishWebhookEvent,
      collection: collection as ContentCollection,
      id: body.id as string | number | undefined,
      keys: Array.isArray(body.keys)
        ? (body.keys as Array<string | number>)
        : undefined,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      status:
        body.status === 'published' ||
        body.status === 'draft' ||
        body.status === 'archived'
          ? body.status
          : undefined,
      locale: typeof body.locale === 'string' && body.locale.trim() ? body.locale : 'vi'
    }
  };
}

export function resolveRevalidationTargets(payload: PublishWebhookPayload): RevalidationTargets {
  const locale = payload.locale ?? 'vi';
  const tags = [payload.collection];
  const paths = new Set<string>();

  if (payload.collection === 'hero_banners' || payload.collection === 'partners') {
    paths.add(`/${locale}`);
  }

  if (payload.collection === 'product_categories' || payload.collection === 'products') {
    paths.add(`/${locale}/solutions`);
  }

  if (payload.collection === 'products' && payload.slug) {
    paths.add(`/${locale}/products/${payload.slug}`);
  }

  if (payload.collection === 'regional_hubs') {
    paths.add(`/${locale}/regional-hubs`);
  }

  if (
    payload.collection === 'documents' ||
    payload.collection === 'blog_posts' ||
    payload.collection === 'case_studies'
  ) {
    paths.add(`/${locale}/resources`);
  }

  if (payload.collection === 'pages' && payload.slug) {
    paths.add(`/${locale}/${payload.slug}`);
  }

  return {
    tags,
    paths: Array.from(paths)
  };
}
```

- [ ] **Step 5: Run the helper tests and fix until green**

Run: `npm test`

Expected: PASS with the helper tests included in the script.

- [ ] **Step 6: Commit the helper layer**

```bash
git add frontend/package.json frontend/src/lib/content-revalidation.ts frontend/src/lib/content-revalidation.test.ts
git commit -m "feat: add content revalidation helper"
```

### Task 2: Add authenticated `POST /api/revalidate`

**Files:**
- Create: `frontend/src/app/api/revalidate/route.ts`
- Modify: `frontend/src/lib/content-revalidation.ts` if the route needs one extra exported helper for auth normalization
- Test: `curl` / `Invoke-WebRequest` smoke against local Next.js

- [ ] **Step 1: Implement the route**

```ts
// frontend/src/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

import { errorJson, successJson } from '@/lib/api-response-next';
import {
  parsePublishWebhookPayload,
  requireRevalidateSecret,
  resolveRevalidationTargets
} from '@/lib/content-revalidation';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');

  try {
    requireRevalidateSecret(auth, process.env.REVALIDATE_SECRET);
  } catch {
    return errorJson(403, 'FORBIDDEN', 'Invalid webhook secret.');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'BAD_REQUEST', 'Request body must be valid JSON.');
  }

  const parsed = parsePublishWebhookPayload(body);
  if (!parsed.ok) {
    return errorJson(400, 'BAD_REQUEST', parsed.error.message);
  }

  const targets = resolveRevalidationTargets(parsed.data);

  for (const tag of targets.tags) {
    revalidateTag(tag);
  }

  for (const path of targets.paths) {
    revalidatePath(path);
  }

  return successJson({
    event: parsed.data.event,
    collection: parsed.data.collection,
    revalidated: targets
  });
}
```

- [ ] **Step 2: Verify the route with the local dev server**

Run: `npm run dev`

Expected: Next.js starts on `http://localhost:3000`.

Run in another terminal:

```bash
curl -i -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer dev-revalidate-secret" \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"items.update\",\"collection\":\"products\",\"slug\":\"cr-glv-001\",\"locale\":\"vi\",\"status\":\"published\"}"
```

Expected: `200` and a normalized success payload with `revalidated.tags` and `revalidated.paths`.

Run the same request without the `Authorization` header.

Expected: `403` with code `FORBIDDEN`.

- [ ] **Step 3: Commit the route**

```bash
git add frontend/src/app/api/revalidate/route.ts frontend/src/lib/content-revalidation.ts
git commit -m "feat: add publish revalidation webhook"
```

### Task 3: Wire Directus Flow and the operator docs

**Files:**
- Modify: `frontend/.env.local.example`
- Modify: `docs/specs/SPEC-04-api-spec.md`
- Modify: `docs/engineering/ENG-01-architecture-overview.md`
- Modify: `docs/engineering/ENG-05-local-development-setup.md`
- Modify: `docs/operations/OPS-01-deployment-guide.md`
- Modify: `docs/testing/TEST-02-test-cases.md`

- [ ] **Step 1: Add the secret to the frontend env example**

```env
# Webhook secret used by Directus Flow -> /api/revalidate
REVALIDATE_SECRET=replace-with-long-random-string
```

- [ ] **Step 2: Add the API contract for the webhook route**

Insert a new subsection in `docs/specs/SPEC-04-api-spec.md`:

```md
### 2.3 `POST /api/revalidate` - publish webhook
Purpose: invalidate CMS content caches after Directus publish, unpublish, or delete events.

- **Auth:** `Authorization: Bearer ${REVALIDATE_SECRET}`
- **Body:** JSON with `event`, `collection`, `id` or `keys`, `slug`, `status`, `locale`
- **200** -> normalized success envelope with `data.revalidated.tags` and `data.revalidated.paths`.
- **400** -> malformed JSON or unsupported payload.
- **403** -> missing or invalid webhook secret.

Example body:

    {
      "event": "items.update",
      "collection": "blog_posts",
      "id": 123,
      "slug": "huong-dan-onboarding-ulink",
      "status": "published",
      "locale": "vi"
    }

The handler calls `revalidateTag(collection)` for the affected collection and `revalidatePath(path)` for the list/detail paths that belong to that collection.
```

- [ ] **Step 3: Update architecture and setup docs**

Add the publish webhook flow to `docs/engineering/ENG-01-architecture-overview.md`, `docs/engineering/ENG-05-local-development-setup.md`, and `docs/operations/OPS-01-deployment-guide.md`.

Editor/Sales -> Directus Admin -> publish/unpublish/delete -> webhook -> Next.js /api/revalidate -> revalidateTag + revalidatePath

Frontend env: `REVALIDATE_SECRET`
Directus Flow header: `Authorization: Bearer <same secret>`
Webhook URL: `POST https://<frontend-domain>/api/revalidate`

Directus Flow name: `flow-revalidate-content`
Trigger: `items.create`, `items.update`, `items.delete`
Collections: `products`, `pages`, `blog_posts`, `case_studies`, `regional_hubs`, `documents`, `product_categories`, `partners`, `hero_banners`
Condition: fire only when the content is published, becomes published, becomes unpublished, or is deleted.
Enable Log Activity for every run.

- [ ] **Step 4: Add publish/unpublish/delete test cases**

Add rows to `docs/testing/TEST-02-test-cases.md`:

```md
| TC-CMS-01 | Editor publishes a blog post | Appears on site after revalidate |
| TC-CMS-02 | Editor unpublishes a product | Product detail and list cache are invalidated; page no longer shows published content |
| TC-CMS-03 | Editor deletes a resource document | Resources list cache is invalidated |
| TC-CMS-04 | Directus sends webhook with bad secret | 403 from `/api/revalidate`; no cache revalidation happens |
```

- [ ] **Step 5: Commit the docs and env change**

```bash
git add frontend/.env.local.example docs/specs/SPEC-04-api-spec.md docs/engineering/ENG-01-architecture-overview.md docs/engineering/ENG-05-local-development-setup.md docs/operations/OPS-01-deployment-guide.md docs/testing/TEST-02-test-cases.md
git commit -m "docs: add publish webhook setup"
```

### Task 4: Verify end-to-end on the local stack

**Files:**
- No new files; verify the route, docs, and Directus Flow behavior against the live stack.

- [ ] **Step 1: Run the full frontend test suite**

Run: `npm test`

Expected: PASS, including `content-revalidation.test.ts`.

- [ ] **Step 2: Run TypeScript and lint checks**

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 3: Smoke the webhook manually**

Run the frontend dev server if it is not already running: `npm run dev`

Send a publish payload with the real secret:

```bash
curl -i -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer <real-secret>" \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"items.update\",\"collection\":\"products\",\"slug\":\"cr-glv-001\",\"locale\":\"vi\",\"status\":\"published\"}"
```

Expected: `200` and a success envelope.

Repeat with a missing or wrong secret.

Expected: `403` and no revalidation.

- [ ] **Step 4: Test the Directus Flow in the admin UI**

Publish and unpublish one sample record in each of the affected collection groups:
- `products`
- `blog_posts` or `case_studies`
- `regional_hubs`
- `documents`

Expected: Directus Flow run log shows success, and the Next.js page cache refreshes on the next request.

- [ ] **Step 5: Final commit / handoff note**

```bash
git add .
git commit -m "feat: wire content publish webhook setup"
```

## Self-Review

- Spec coverage: the plan covers the secret, the authenticated webhook route, the collection/path mapping, the Directus Flow setup, and the operator/test docs.
- Placeholder scan: no `TODO`, `TBD`, or "implement later" placeholders left in the plan text.
- Type consistency: `ContentCollection`, `PublishWebhookPayload`, `parsePublishWebhookPayload`, `requireRevalidateSecret`, and `resolveRevalidationTargets` use the same names across tests, helper, and route.
