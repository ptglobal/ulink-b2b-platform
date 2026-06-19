# Regional Hub Basic Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the basic hub contract only: hub code, hub name, required address fields, and operating status dropdown, while keeping the rest of the hub domain unchanged for now.

**Architecture:** Keep `regional_hubs` as the single source of truth for the hub identity record. Add province and district lookup collections so the address fields are real dropdowns, and add a small Directus hook/helper layer to generate `HUB-[province]-[count]` from the selected province abbreviation. Do not split SLA, warehouse, or team data yet; that stays out of scope until the basic info contract is stable.

**Tech Stack:** Directus 11, PostgreSQL 16, Node 20, Directus hook extension runtime, existing bootstrap/verify scripts, `@directus/sdk`, Markdown docs.

---

## File Structure

- Create: `directus/lib/hub-domain.mjs`
  Responsibility: shared hub constants and helper functions, including the operating-status options and hub-code formatter.
- Create: `directus/extensions/hub-code-sync/package.json`
  Responsibility: register a Directus hook extension for hub-code generation.
- Create: `directus/extensions/hub-code-sync/src/index.js`
  Responsibility: hook hub create/update events and assign or refresh `hub_code`.
- Create: `directus/extensions/hub-code-sync/src/service.js`
  Responsibility: normalize province-based code generation and validate required address fields.
- Create: `directus/extensions/hub-code-sync/src/service.test.js`
  Responsibility: lock hub-code formatting and hook behavior.
- Create: `directus/seed/data/vn-provinces.json`
  Responsibility: canonical province dropdown source data.
- Create: `directus/seed/data/vn-districts.json`
  Responsibility: canonical district dropdown source data.
- Create: `directus/seed/geography.mjs`
  Responsibility: seed province and district lookup rows and return in-memory lookup maps.
- Modify: `directus/schema/collections.mjs`
  Responsibility: add `vn_provinces`, `vn_districts`, and the new basic hub fields on `regional_hubs`.
- Modify: `directus/schema/relations.mjs`
  Responsibility: wire hub-to-province and hub-to-district relations.
- Modify: `directus/lib/i18n.mjs`
  Responsibility: keep hub translations aligned with the remaining translated hub copy.
- Modify: `directus/rbac/permissions.mjs`
  Responsibility: let Editor and Sales read the lookup collections used by the dropdowns.
- Modify: `directus/bootstrap.mjs`
  Responsibility: seed geography data before hub data.
- Modify: `directus/seed/initial_content.mjs`
  Responsibility: seed the core hub rows with the new basic fields.
- Modify: `directus/seed/additional_content.mjs`
  Responsibility: seed additional hubs with the same basic fields.
- Modify: `directus/seed/translation_data.mjs`
  Responsibility: keep hub translations aligned with the remaining localized hub copy only.
- Create: `directus/testing/verify_hub_basic_info.mjs`
  Responsibility: verify the new schema fields, relations, seed rows, and hub-code format.
- Modify: `directus/testing/verify_bootstrap.mjs`
  Responsibility: call the new basic-info verification from the main bootstrap gate.
- Modify: `directus/testing/api_test_samples.json`
  Responsibility: add sample payloads for the new lookup collections and hub create payload.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the new hub fields and lookup collections.
- Modify: `directus/docs/SCHEMA_VI.md`
  Responsibility: keep the Vietnamese schema doc aligned with the new basic hub contract.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: update the `RegionalHub` type for `hub_code`, address dropdowns, and operating status.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: document the new hub identity and address model.
- Modify: `docs/specs/SPEC-05-information-architecture.md`
  Responsibility: note the hub page now reads the basic hub address fields.
- Modify: `docs/specs/SPEC-02-functional-spec.md`
  Responsibility: update the hub feature description to the basic-info contract.
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
  Responsibility: explain how admins create a hub and fill the required address/status fields.
- Modify: `docs/testing/TEST-02-test-cases.md`
  Responsibility: add manual cases for hub creation, dropdown selection, and code generation.
- Modify: `openapi.json`
  Responsibility: refresh the checked-in API contract after the schema change.

## Task 1: Add hub identity and address schema

**Files:**
- Create: `directus/lib/hub-domain.mjs`
- Create: `directus/extensions/hub-code-sync/package.json`
- Create: `directus/extensions/hub-code-sync/src/index.js`
- Create: `directus/extensions/hub-code-sync/src/service.js`
- Create: `directus/extensions/hub-code-sync/src/service.test.js`
- Modify: `directus/schema/collections.mjs`
- Modify: `directus/schema/relations.mjs`
- Modify: `directus/lib/i18n.mjs`
- Modify: `directus/rbac/permissions.mjs`

- [ ] **Step 1: Write the failing tests**

Add a unit test for code formatting and a bootstrap-style schema check:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { formatHubCode } from '../../../lib/hub-domain.mjs';

test('formatHubCode builds HUB-[province]-[count]', () => {
  assert.equal(formatHubCode('HNA', 4), 'HUB-HNA-004');
});

test('hub basic info fields exist on regional_hubs', async () => {
  const fields = ['hub_code', 'name', 'province', 'district', 'detail_address', 'operating_status'];
  assert(fields.includes('hub_code'));
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```powershell
cd directus
node --test extensions/hub-code-sync/src/service.test.js testing/verify_hub_basic_info.mjs
```

Expected: fail because the helper, hook, collections, and fields do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Create `directus/lib/hub-domain.mjs`:

```js
export const HUB_OPERATING_STATUSES = [
  { text: 'Đang hoạt động', value: 'active' },
  { text: 'Dừng hoạt động', value: 'stopped' },
  { text: 'Đang bảo trì', value: 'maintenance' },
  { text: 'Đầy hàng', value: 'full' },
  { text: 'Đóng cửa tạm thời', value: 'temporarily_closed' }
];

export function formatHubCode(provinceAbbr, sequence) {
  const abbr = String(provinceAbbr ?? '').trim().toUpperCase();
  if (!abbr) throw new Error('province code is required');

  const count = Number(sequence);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('sequence must be a positive integer');
  }

  return `HUB-${abbr}-${String(count).padStart(3, '0')}`;
}
```

Add these collections to `directus/schema/collections.mjs`:

```js
{
  collection: 'vn_provinces',
  meta: { icon: 'map', note: 'Vietnam Provinces', hidden: true },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
    { field: 'abbr', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
    { field: 'name', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } }
  ]
},
{
  collection: 'vn_districts',
  meta: { icon: 'map', note: 'Vietnam Districts', hidden: true },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'province', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
    { field: 'code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
    { field: 'name', type: 'string', meta: { interface: 'input', required: true } }
  ]
},
{
  collection: 'regional_hubs',
  meta: { icon: 'place', note: 'Regional Hubs' },
  schema: {},
  fields: [
    ID_FIELD,
    STATUS_FIELD,
    createTranslationAliasField(),
    { field: 'hub_code', type: 'string', meta: { interface: 'input', readonly: true }, schema: { is_unique: true } },
    { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
    { field: 'province', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
    { field: 'district', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
    { field: 'detail_address', type: 'text', meta: { interface: 'textarea', required: true } },
    {
      field: 'operating_status',
      type: 'string',
      meta: { interface: 'select-dropdown', required: true, options: { choices: HUB_OPERATING_STATUSES } }
    }
  ]
}
```

Add relations in `directus/schema/relations.mjs`:

```js
{ collection: 'regional_hubs', field: 'province', related_collection: 'vn_provinces' },
{ collection: 'regional_hubs', field: 'district', related_collection: 'vn_districts' }
```

Update `directus/lib/i18n.mjs` so `regional_hubs` translations stay limited to the public copy still used by the page, and keep the lookup collections non-translatable.

Update `directus/rbac/permissions.mjs` so Editor and Sales can read `vn_provinces` and `vn_districts`, and Editor can still write hub records.

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```powershell
cd directus
node --test extensions/hub-code-sync/src/service.test.js testing/verify_hub_basic_info.mjs
```

Expected: PASS for the helper test and the schema assertion.

- [ ] **Step 5: Commit**

```powershell
git add directus/lib/hub-domain.mjs directus/extensions/hub-code-sync directus/schema/collections.mjs directus/schema/relations.mjs directus/lib/i18n.mjs directus/rbac/permissions.mjs
git commit -m "feat: add basic hub info schema"
```

## Task 2: Seed geography and hub records

**Files:**
- Create: `directus/seed/data/vn-provinces.json`
- Create: `directus/seed/data/vn-districts.json`
- Create: `directus/seed/geography.mjs`
- Modify: `directus/bootstrap.mjs`
- Modify: `directus/seed/initial_content.mjs`
- Modify: `directus/seed/additional_content.mjs`
- Modify: `directus/seed/translation_data.mjs`
- Modify: `directus/testing/verify_bootstrap.mjs`
- Modify: `directus/testing/api_test_samples.json`
- Modify: `directus/package.json`

- [ ] **Step 1: Add the failing bootstrap check**

Create `directus/testing/verify_hub_basic_info.mjs` with checks for:

```js
const hubs = await client.request(readItems('regional_hubs', { fields: ['hub_code', 'name', 'province', 'district', 'detail_address', 'operating_status'] }));
assert(hubs.length >= 2, 'Seeded hubs exist');
assert(hubs.every((hub) => /^HUB-[A-Z0-9]+-\d{3}$/.test(hub.hub_code)), 'Every hub has a code');

const provinces = await client.request(readItems('vn_provinces', { fields: ['abbr', 'name'] }));
const districts = await client.request(readItems('vn_districts', { fields: ['name', 'province'] }));
assert(provinces.length > 0, 'Province dropdown data exists');
assert(districts.length > 0, 'District dropdown data exists');
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```powershell
cd directus
node --test testing/verify_hub_basic_info.mjs
```

Expected: fail because the geography seed and new fields are not present yet.

- [ ] **Step 3: Write the minimal implementation**

Create `directus/seed/geography.mjs`:

```js
import provinces from './data/vn-provinces.json' assert { type: 'json' };
import districts from './data/vn-districts.json' assert { type: 'json' };

export async function seedVietnamGeography(helpers) {
  const provincesByCode = new Map();
  const districtsByCode = new Map();

  for (const province of provinces) {
    const id = await helpers.ensureItem('vn_provinces', 'code', province);
    provincesByCode.set(province.code, { id, ...province });
  }

  for (const district of districts) {
    const id = await helpers.ensureItem('vn_districts', 'code', district);
    districtsByCode.set(district.code, { id, ...district });
  }

  return { provincesByCode, districtsByCode };
}
```

Update `directus/bootstrap.mjs` so geography seeds run before hub seeds:

```js
const geography = await seedVietnamGeography(helpers);
const ids = await seedInitialContent(helpers, geography);
await seedDemoCommerce(helpers, ids);
await seedAdditionalContent(helpers, ids, geography);
```

Update `directus/seed/initial_content.mjs` and `directus/seed/additional_content.mjs` so hub seed payloads include:
- `hub_code`
- `province`
- `district`
- `detail_address`
- `operating_status`

Keep existing legacy hub content fields untouched for now; this plan only adds the basic info contract.

Update `directus/seed/translation_data.mjs` so hub translations stay limited to the translated display copy already used by the public hub page.

Update `directus/testing/api_test_samples.json` with sample bodies for `vn_provinces`, `vn_districts`, and the new `regional_hubs` payload shape.

Add a `verify:hub-basic-info` script in `directus/package.json`:

```json
{
  "scripts": {
    "verify:hub-basic-info": "node testing/verify_hub_basic_info.mjs"
  }
}
```

Update `directus/testing/verify_bootstrap.mjs` to call the new hub-basic-info verification from the main bootstrap gate.

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```powershell
cd directus
npm run verify
npm run verify:hub-basic-info
```

Expected: PASS for bootstrap and hub-basic-info verification.

- [ ] **Step 5: Commit**

```powershell
git add directus/seed/data/vn-provinces.json directus/seed/data/vn-districts.json directus/seed/geography.mjs directus/bootstrap.mjs directus/seed/initial_content.mjs directus/seed/additional_content.mjs directus/seed/translation_data.mjs directus/testing/verify_bootstrap.mjs directus/testing/api_test_samples.json directus/package.json
git commit -m "feat: seed basic hub info"
```

## Task 3: Close docs, frontend types, and API contract

**Files:**
- Modify: `frontend/src/lib/directus.ts`
- Modify: `directus/SCHEMA.md`
- Modify: `directus/docs/SCHEMA_VI.md`
- Modify: `docs/specs/SPEC-03-data-model.md`
- Modify: `docs/specs/SPEC-05-information-architecture.md`
- Modify: `docs/specs/SPEC-02-functional-spec.md`
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
- Modify: `docs/testing/TEST-02-test-cases.md`
- Modify: `openapi.json`

- [ ] **Step 1: Add the failing contract test**

Add a shape check for the frontend type and the OpenAPI export:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

test('RegionalHub type includes basic hub info', () => {
  const hub = {
    id: 1,
    hub_code: 'HUB-HNA-001',
    name: 'Dong Van 4 Hub',
    province: 1,
    district: 2,
    detail_address: 'KCN Dong Van IV',
    operating_status: 'active'
  };

  assert.equal(hub.operating_status, 'active');
});
```

- [ ] **Step 2: Run the verification to confirm it fails**

Run:

```powershell
cd directus
node --test testing/verify_hub_basic_info.mjs
```

Expected: fail until the schema, seed, and docs changes land.

- [ ] **Step 3: Write the minimal implementation**

Update `frontend/src/lib/directus.ts` so `RegionalHub` includes:

```ts
export interface RegionalHub {
  id: number;
  hub_code: string;
  name: string;
  slug: string;
  province: number | { id: number; abbr?: string; name?: string } | null;
  district: number | { id: number; name?: string } | null;
  detail_address: string;
  operating_status: 'active' | 'stopped' | 'maintenance' | 'full' | 'temporarily_closed';
  status?: 'published' | 'draft' | 'archived';
}
```

Update `directus/SCHEMA.md`, `directus/docs/SCHEMA_VI.md`, `docs/specs/SPEC-03-data-model.md`, `docs/specs/SPEC-05-information-architecture.md`, and `docs/specs/SPEC-02-functional-spec.md` so they describe:
- `regional_hubs` as the hub identity record
- `hub_code` format
- required province/district/detail-address fields
- operating status enum

Update `docs/guides/GUIDE-01-cms-admin-guide.md` so editors know the write path:
- create or edit the hub in `regional_hubs`
- choose province and district from dropdowns
- fill detail address
- choose operating status

Refresh `openapi.json` after the schema and hook changes so the checked-in API artifact matches the new contract.

- [ ] **Step 4: Run the tests and export to verify they pass**

Run:

```powershell
cd directus
npm run verify
npm run verify:hub-basic-info
npm run openapi:export
```

Expected: bootstrap verification passes and `openapi.json` reflects the updated hub shape.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/lib/directus.ts directus/SCHEMA.md directus/docs/SCHEMA_VI.md docs/specs/SPEC-03-data-model.md docs/specs/SPEC-05-information-architecture.md docs/specs/SPEC-02-functional-spec.md docs/guides/GUIDE-01-cms-admin-guide.md docs/testing/TEST-02-test-cases.md openapi.json
git commit -m "docs: close basic hub info contract"
```

## Self-Review

### 1. Spec coverage

- Hub code generation: covered by Task 1 and Task 2.
- Province and district dropdowns: covered by Task 1 and Task 2.
- Required detail address and operating status: covered by Task 1 and Task 3.
- Seeding and bootstrap verification: covered by Task 2.
- Frontend types and docs: covered by Task 3.

### 2. Placeholder scan

- No TBD/TODO placeholders.
- No vague "handle edge cases" steps.
- No missing file paths.
- Every task has a failing test step, a pass step, and a commit step.

### 3. Type consistency

- `hub_code`, `province`, `district`, `detail_address`, and `operating_status` stay the only new basic hub fields.
- `formatHubCode()` is the shared source of truth for code formatting.
- This plan does not introduce SLA, warehouse, or team collections yet.

