# Regional Hubs Domain Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split hub data into a core `regional_hubs` record plus one-to-one child collections for address, warehouse, SLA, and team data, while preserving seeded hub pages, Directus permissions, and bootstrap verification.

**Architecture:** Keep `regional_hubs` as the anchor for identity, slug, publish status, and the human-facing hub code. Move operational data into `hub_addresses`, `hub_warehouse_stats`, `hub_sla_stats`, and `hub_team`, each linked 1:1 to the parent hub so permissions and audits stay separate. Add small Vietnam geography lookup collections for province and district dropdowns, and use a shared helper plus a Directus hook to assign `HUB-[province]-[counter]` when the primary address is created. Public site pages continue to read the existing hub collection shape where needed; the new child collections are admin-facing and future-proof the domain model.

**Tech Stack:** Directus 11, PostgreSQL 16, Node 20, Directus hook extension runtime, existing bootstrap/verify scripts, `@directus/sdk`, Next.js 14 types, Markdown docs.

---

## File Structure

- Create: `directus/lib/hub-domain.mjs`
  Responsibility: shared hub constants and helpers, including operating-status choices, `formatHubCode()`, and capacity math.
- Create: `directus/extensions/hub-code-sync/package.json`
  Responsibility: register a Directus hook extension for hub code assignment.
- Create: `directus/extensions/hub-code-sync/src/index.js`
  Responsibility: hook into hub-address writes and hub-warehouse-stats writes, sync `regional_hubs.hub_code` from province abbreviation plus sequence, and recalc free warehouse capacity.
- Create: `directus/extensions/hub-code-sync/src/service.js`
  Responsibility: shared hook logic for hub-code assignment, warehouse-capacity normalization, and one-to-one child-row validation.
- Create: `directus/extensions/hub-code-sync/src/service.test.js`
  Responsibility: unit-lock hub code formatting and the address-to-code assignment rules.
- Create: `directus/seed/data/vn-provinces.json`
  Responsibility: canonical province dropdown source data.
- Create: `directus/seed/data/vn-districts.json`
  Responsibility: canonical district dropdown source data keyed to provinces.
- Create: `directus/seed/geography.mjs`
  Responsibility: seed province and district lookup collections from the JSON data.
- Create: `directus/seed/regional-hubs.mjs`
  Responsibility: seed one hub plus its child address/stat/team rows from one compact data object.
- Create: `directus/testing/verify_hub_split.mjs`
  Responsibility: bootstrap-level verification for the new collections, relations, permissions, and seeded records.
- Modify: `directus/schema/collections.mjs`
  Responsibility: add the new lookup and child collections, plus `hub_code` and `operating_status` on `regional_hubs`.
- Modify: `directus/schema/relations.mjs`
  Responsibility: wire the one-to-one and lookup relations for hubs, addresses, warehouse stats, SLA stats, and teams.
- Modify: `directus/lib/i18n.mjs`
  Responsibility: trim `regional_hubs` translation fields down to display copy only.
- Modify: `directus/rbac/permissions.mjs`
  Responsibility: grant Editor CRUD on new hub collections, keep Sales read-only, and keep lookup collections readable for dropdowns.
- Modify: `directus/bootstrap.mjs`
  Responsibility: ensure the new geography seed and hub data seed run in the right order.
- Modify: `directus/seed/initial_content.mjs`
  Responsibility: seed the first hub records through `seedRegionalHub()`.
- Modify: `directus/seed/additional_content.mjs`
  Responsibility: seed the extra hubs through the same helper.
- Modify: `directus/seed/translation_data.mjs`
  Responsibility: remove hub translation fields that move into child collections; keep only the remaining display copy.
- Modify: `directus/testing/verify_bootstrap.mjs`
  Responsibility: call the new hub split checks from the main verification gate.
- Modify: `directus/testing/api_test_samples.json`
  Responsibility: add sample bodies for the new hub collections and lookup records.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the new hub-domain collections and their relations.
- Modify: `directus/docs/SCHEMA_VI.md`
  Responsibility: keep the Vietnamese schema doc aligned with the new collection split.
- Modify: `docs/specs/SPEC-03-data-model.md`
  Responsibility: update the ERD and collection notes for the hub split.
- Modify: `docs/specs/SPEC-05-information-architecture.md`
  Responsibility: note that hub-facing pages now consume a parent hub plus structured child records.
- Modify: `docs/specs/SPEC-02-functional-spec.md`
  Responsibility: update the hub feature description to the split model.
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
  Responsibility: explain which hub fields live in which collection and how admins should edit them.
- Modify: `docs/testing/TEST-02-test-cases.md`
  Responsibility: add manual test cases for code generation, address dropdowns, and child-record permissions.
- Modify: `frontend/src/lib/directus.ts`
  Responsibility: update the `RegionalHub` type to the nested relation shape used by the new collections.
- Modify: `openapi.json`
  Responsibility: refresh the checked-in API contract after the schema split.

## Task 1: Split hub schema into parent + child collections and lock code generation

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

Add a focused unit test for hub code formatting and a bootstrap assertion for the new collections:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { formatHubCode } from '../../../lib/hub-domain.mjs';

test('formatHubCode builds the expected identifier', () => {
  assert.equal(formatHubCode('HNA', 4), 'HUB-HNA-004');
});

test('formatHubCode rejects empty province codes', () => {
  assert.throws(() => formatHubCode('   ', 4), /province code/i);
});
```

Add a bootstrap-level check in `directus/testing/verify_hub_split.mjs` that expects these collection names:

```js
const expected = [
  'regional_hubs',
  'hub_addresses',
  'hub_warehouse_stats',
  'hub_sla_stats',
  'hub_team',
  'vn_provinces',
  'vn_districts'
];
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```powershell
cd directus
node --test extensions/hub-code-sync/src/service.test.js testing/verify_hub_split.mjs
```

Expected: fail because the new helper, hook, and collections do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Implement the shared helper in `directus/lib/hub-domain.mjs`:

```js
export const HUB_OPERATING_STATUSES = [
  { text: 'Đang hoạt động', value: 'active' },
  { text: 'Dừng hoạt động', value: 'stopped' },
  { text: 'Đang bảo trì', value: 'maintenance' },
  { text: 'Đầy hàng', value: 'full' },
  { text: 'Đóng cửa tạm thời', value: 'temporarily_closed' }
];

export function formatHubCode(provinceAbbr, sequence) {
  const code = String(provinceAbbr ?? '').trim().toUpperCase();
  if (!code) throw new Error('province code is required');

  const n = Number(sequence);
  if (!Number.isInteger(n) || n < 1) throw new Error('sequence must be a positive integer');

  return `HUB-${code}-${String(n).padStart(3, '0')}`;
}

export function deriveFreeWarehouseCapacity(total, used) {
  const totalValue = Number(total);
  const usedValue = Number(used);
  return Math.max(0, totalValue - usedValue);
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
  collection: 'hub_addresses',
  meta: { icon: 'home', note: 'Hub Addresses' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true }, schema: { is_unique: true } },
    { field: 'province', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
    { field: 'district', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
    { field: 'detail_address', type: 'text', meta: { interface: 'textarea', required: true } },
    { field: 'coordinates', type: 'string', meta: { interface: 'input' } }
  ]
},
{
  collection: 'hub_warehouse_stats',
  meta: { icon: 'warehouse', note: 'Hub Warehouse Stats' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true }, schema: { is_unique: true } },
    { field: 'total_capacity_m2', type: 'decimal', meta: { interface: 'input', required: true }, schema: { numeric_precision: 12, numeric_scale: 2 } },
    { field: 'used_capacity_m2', type: 'decimal', meta: { interface: 'input', required: true }, schema: { numeric_precision: 12, numeric_scale: 2 } },
    { field: 'free_capacity_m2', type: 'decimal', meta: { interface: 'input', readonly: true }, schema: { numeric_precision: 12, numeric_scale: 2 } }
  ]
},
{
  collection: 'hub_sla_stats',
  meta: { icon: 'schedule', note: 'Hub SLA Stats' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true }, schema: { is_unique: true } },
    { field: 'standard_delivery_time_minutes', type: 'integer', meta: { interface: 'input', required: true } },
    { field: 'on_time_rate_percent', type: 'decimal', meta: { interface: 'input', required: true }, schema: { numeric_precision: 5, numeric_scale: 2 } },
    { field: 'orders_today', type: 'integer', meta: { interface: 'input', required: true } },
    { field: 'daily_capacity', type: 'integer', meta: { interface: 'input', required: true } }
  ]
},
{
  collection: 'hub_team',
  meta: { icon: 'people', note: 'Hub Team' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true }, schema: { is_unique: true } },
    { field: 'person_in_charge', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'phone', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'active_staff_count', type: 'integer', meta: { interface: 'input', required: true } }
  ]
}
```

Add one-to-one relations in `directus/schema/relations.mjs`:

```js
{ collection: 'hub_addresses', field: 'hub', related_collection: 'regional_hubs', meta: { one_field: 'address' } },
{ collection: 'hub_addresses', field: 'province', related_collection: 'vn_provinces' },
{ collection: 'hub_addresses', field: 'district', related_collection: 'vn_districts' },
{ collection: 'hub_warehouse_stats', field: 'hub', related_collection: 'regional_hubs', meta: { one_field: 'warehouse_stats' } },
{ collection: 'hub_sla_stats', field: 'hub', related_collection: 'regional_hubs', meta: { one_field: 'sla_stats' } },
{ collection: 'hub_team', field: 'hub', related_collection: 'regional_hubs', meta: { one_field: 'team' } }
```

Update `regional_hubs` in `directus/schema/collections.mjs` to keep only identity and display copy:

Import `HUB_OPERATING_STATUSES` from `directus/lib/hub-domain.mjs`, then use it for the new operating-status dropdown.

```js
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
    { field: 'operating_status', type: 'string', meta: { interface: 'select-dropdown', required: true, options: { choices: HUB_OPERATING_STATUSES } } },
    { field: 'cluster_overview', type: 'text', meta: { interface: 'textarea' } }
  ]
}
```

Trim `directus/lib/i18n.mjs` so `regional_hubs` only translates the copy that is still public-facing:

```js
regional_hubs: [
  { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
  { field: 'cluster_overview', type: 'text', meta: { interface: 'textarea' } }
]
```

Extend `directus/rbac/permissions.mjs` so `Editor` can CRUD all new hub collections and lookup collections, while `Sales` can read them but not write them:

```js
for (const col of ['hub_addresses', 'hub_warehouse_stats', 'hub_sla_stats', 'hub_team', 'vn_provinces', 'vn_districts']) {
  for (const action of ['create', 'read', 'update', 'delete']) {
    permissions.push({
      policy: EDITOR_POLICY_ID,
      collection: col,
      action,
      permissions: {},
      fields: ['*']
    });
  }

  permissions.push({
    policy: SALES_POLICY_ID,
    collection: col,
    action: 'read',
    permissions: {},
    fields: ['*']
  });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```powershell
cd directus
node --test extensions/hub-code-sync/src/service.test.js testing/verify_hub_split.mjs
```

Expected: PASS for the helper tests and the new collection/relationship assertions.

- [ ] **Step 5: Commit**

```powershell
git add directus/lib/hub-domain.mjs directus/extensions/hub-code-sync directus/schema/collections.mjs directus/schema/relations.mjs directus/lib/i18n.mjs directus/rbac/permissions.mjs
git commit -m "feat: split hub domain schema"
```

## Task 2: Seed lookup data, rewrite hub seeds, and extend bootstrap verification

**Files:**
- Create: `directus/seed/data/vn-provinces.json`
- Create: `directus/seed/data/vn-districts.json`
- Create: `directus/seed/geography.mjs`
- Create: `directus/seed/regional-hubs.mjs`
- Modify: `directus/bootstrap.mjs`
- Modify: `directus/seed/initial_content.mjs`
- Modify: `directus/seed/additional_content.mjs`
- Modify: `directus/seed/translation_data.mjs`
- Modify: `directus/testing/verify_bootstrap.mjs`
- Modify: `directus/testing/api_test_samples.json`
- Modify: `directus/package.json`

- [ ] **Step 1: Add the failing bootstrap and seed tests**

Add a bootstrap check that proves every seeded hub has the new child rows:

```js
const hubs = await client.request(readItems('regional_hubs', { fields: ['id', 'hub_code', 'name', 'operating_status'] }));
assert(hubs.length >= 2, 'Seeded hubs exist');
assert(hubs.every((hub) => /^HUB-[A-Z0-9]+-\d{3}$/.test(hub.hub_code)), 'Every hub has a generated code');

const hubAddresses = await client.request(readItems('hub_addresses', { fields: ['hub', 'province', 'district', 'detail_address'] }));
assert(hubAddresses.length >= hubs.length, 'Each seeded hub has an address row');

const warehouseStats = await client.request(readItems('hub_warehouse_stats', { fields: ['hub', 'total_capacity_m2', 'used_capacity_m2', 'free_capacity_m2'] }));
assert(
  warehouseStats.every((row) => row.free_capacity_m2 === row.total_capacity_m2 - row.used_capacity_m2),
  'Warehouse free capacity stays derived'
);

const slaStats = await client.request(readItems('hub_sla_stats', { fields: ['hub', 'standard_delivery_time_minutes', 'on_time_rate_percent', 'orders_today', 'daily_capacity'] }));
assert(slaStats.length >= hubs.length, 'Each seeded hub has an SLA row');

const teamRows = await client.request(readItems('hub_team', { fields: ['hub', 'person_in_charge', 'title', 'phone', 'active_staff_count'] }));
assert(teamRows.length >= hubs.length, 'Each seeded hub has a team row');
```

Add a seed-level regression test around the shared helper:

```js
test('hub seed helper builds one parent and four child records', async () => {
  const geography = {
    provincesByCode: new Map([
      ['HNA', { id: 1, code: '55', abbr: 'HNA', name: 'Ha Nam' }]
    ]),
    districtsByCode: new Map([
      ['KIM_BANG', { id: 11, code: '048', name: 'Kim Bang', province: 1 }]
    ])
  };

  const result = await seedRegionalHub(helpers, geography, {
    slug: 'dong-van-4',
    name: 'Dong Van 4',
    provinceCode: 'HNA',
    districtCode: 'KIM_BANG',
    detailAddress: 'KCN Dong Van IV, Kim Bang, Ha Nam',
    totalCapacityM2: 5000,
    usedCapacityM2: 1800,
    standardDeliveryTimeMinutes: 1440,
    onTimeRatePercent: 98.5,
    ordersToday: 16,
    dailyCapacity: 120,
    personInCharge: 'Nguyen Van A',
    title: 'Quan ly Hub',
    phone: '0900000001',
    activeStaffCount: 24
  });

  assert.equal(result.childrenCreated, 4);
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:

```powershell
cd directus
node --test testing/verify_hub_split.mjs extensions/hub-code-sync/src/service.test.js
```

Expected: fail because the geography seed, child collections, and shared hub seed helper do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Create `directus/seed/geography.mjs` to seed the lookup collections from the JSON sources:

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

Create `directus/seed/regional-hubs.mjs` to assemble parent and child rows together:

```js
import { formatHubCode, deriveFreeWarehouseCapacity } from '../lib/hub-domain.mjs';

export async function seedRegionalHub(helpers, geography, input) {
  const province = geography.provincesByCode.get(input.provinceCode);
  const district = geography.districtsByCode.get(input.districtCode);
  if (!province || !district) {
    throw new Error(`Missing geography lookup for ${input.provinceCode}/${input.districtCode}`);
  }

  const hubId = await helpers.ensureItem('regional_hubs', 'slug', {
    name: input.name,
    slug: input.slug,
    hub_code: formatHubCode(province.abbr, input.sequence ?? input.hubSequence ?? 1),
    operating_status: input.operatingStatus ?? 'active',
    cluster_overview: input.clusterOverview ?? null,
    status: 'published'
  });

  await helpers.ensureItem('hub_addresses', 'hub', {
    hub: hubId,
    province: province.id,
    district: district.id,
    detail_address: input.detailAddress,
    coordinates: input.coordinates ?? null
  });

  await helpers.ensureItem('hub_warehouse_stats', 'hub', {
    hub: hubId,
    total_capacity_m2: input.totalCapacityM2,
    used_capacity_m2: input.usedCapacityM2,
    free_capacity_m2: deriveFreeWarehouseCapacity(input.totalCapacityM2, input.usedCapacityM2)
  });

  await helpers.ensureItem('hub_sla_stats', 'hub', {
    hub: hubId,
    standard_delivery_time_minutes: input.standardDeliveryTimeMinutes,
    on_time_rate_percent: input.onTimeRatePercent,
    orders_today: input.ordersToday,
    daily_capacity: input.dailyCapacity
  });

  await helpers.ensureItem('hub_team', 'hub', {
    hub: hubId,
    person_in_charge: input.personInCharge,
    title: input.title,
    phone: input.phone,
    active_staff_count: input.activeStaffCount
  });

  return { hubId, childrenCreated: 4 };
}
```

Update `directus/seed/initial_content.mjs` and `directus/seed/additional_content.mjs` to call `seedRegionalHub()` instead of writing flat hub fields directly.

Update `directus/seed/translation_data.mjs` so hub translations only carry the display copy still owned by `regional_hubs`, not the operational fields that moved out.

Update `directus/bootstrap.mjs` so geography seeds run before hub seeds, then hub seeds run before any RBAC or verification step that expects the new relations.

```js
const geography = await seedVietnamGeography(helpers);
const ids = await seedInitialContent(helpers, geography);
await seedDemoCommerce(helpers, ids);
await seedAdditionalContent(helpers, ids, geography);
```

Update `directus/testing/verify_bootstrap.mjs` to call the new `verify_hub_split.mjs` checks, and add a `verify:hub-split` script in `directus/package.json`:

```json
{
  "scripts": {
    "verify:hub-split": "node testing/verify_hub_split.mjs"
  }
}
```

Update `directus/testing/api_test_samples.json` with example bodies for:
- `vn_provinces`
- `vn_districts`
- `hub_addresses`
- `hub_warehouse_stats`
- `hub_sla_stats`
- `hub_team`

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```powershell
cd directus
node --test testing/verify_bootstrap.mjs testing/verify_hub_split.mjs
```

Expected: PASS. Every seeded hub has a code, one address row, one warehouse row, one SLA row, and one team row.

- [ ] **Step 5: Commit**

```powershell
git add directus/seed/data/vn-provinces.json directus/seed/data/vn-districts.json directus/seed/geography.mjs directus/seed/regional-hubs.mjs directus/bootstrap.mjs directus/seed/initial_content.mjs directus/seed/additional_content.mjs directus/seed/translation_data.mjs directus/testing/verify_bootstrap.mjs directus/testing/api_test_samples.json directus/package.json
git commit -m "feat: seed split hub domain"
```

## Task 3: Close the contract in docs, frontend types, and API artifacts

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

Add a schema-shape test for the frontend type and the generated OpenAPI artifact:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

test('RegionalHub type expects nested hub children', () => {
  const hub = {
    id: 1,
    hub_code: 'HUB-HNA-001',
    name: 'Đông Vân 4',
    slug: 'dong-van-4',
    operating_status: 'active',
    address: { detail_address: 'KCN Đông Vân IV', province: { abbr: 'HNA' }, district: { name: 'Kim Bảng' } }
  };

  assert.equal(hub.address.province.abbr, 'HNA');
});

test('openapi.json exposes the split hub collections', async () => {
  const openapi = await import('../../openapi.json', { assert: { type: 'json' } });
  assert(openapi.default.paths['/items/hub_addresses'], 'hub_addresses path exists');
  assert(openapi.default.paths['/items/hub_warehouse_stats'], 'hub_warehouse_stats path exists');
});
```

Add a doc check note in `docs/testing/TEST-02-test-cases.md` for the edit workflow:
- update address via `hub_addresses`
- update capacity via `hub_warehouse_stats`
- update SLA via `hub_sla_stats`
- update team via `hub_team`
- do not edit these fields on `regional_hubs`

- [ ] **Step 2: Run the verification to confirm it fails**

Run:

```powershell
cd directus
node --test testing/verify_hub_split.mjs
```

Expected: fail until `openapi.json` and the schema split land together.

- [ ] **Step 3: Write the minimal implementation**

Update `frontend/src/lib/directus.ts` so `RegionalHub` is nested instead of flat:

```ts
export interface RegionalHubProvince {
  id: number;
  code: string;
  abbr: string;
  name: string;
}

export interface RegionalHubDistrict {
  id: number;
  code: string;
  name: string;
  province?: RegionalHubProvince | null;
}

export interface HubAddress {
  id: number;
  hub: number;
  province: RegionalHubProvince | null;
  district: RegionalHubDistrict | null;
  detail_address: string;
  coordinates?: string | null;
}

export interface HubWarehouseStats {
  id: number;
  hub: number;
  total_capacity_m2: number;
  used_capacity_m2: number;
  free_capacity_m2: number;
}

export interface HubSlaStats {
  id: number;
  hub: number;
  standard_delivery_time_minutes: number;
  on_time_rate_percent: number;
  orders_today: number;
  daily_capacity: number;
}

export interface HubTeam {
  id: number;
  hub: number;
  person_in_charge: string;
  title: string;
  phone: string;
  active_staff_count: number;
}

export interface RegionalHub {
  id: number;
  hub_code: string;
  name: string;
  slug: string;
  operating_status: 'active' | 'stopped' | 'maintenance' | 'full' | 'temporarily_closed';
  cluster_overview?: string | null;
  address?: HubAddress | null;
  warehouse_stats?: HubWarehouseStats | null;
  sla_stats?: HubSlaStats | null;
  team?: HubTeam | null;
  status?: 'published' | 'draft' | 'archived';
}
```

Update `directus/SCHEMA.md`, `directus/docs/SCHEMA_VI.md`, `docs/specs/SPEC-03-data-model.md`, `docs/specs/SPEC-05-information-architecture.md`, and `docs/specs/SPEC-02-functional-spec.md` so they describe the split collections and the new hub code rule:

```md
- `regional_hubs`: identity, code, slug, publish status, and display copy only.
- `hub_addresses`: province, district, detail address, coordinates.
- `hub_warehouse_stats`: total, used, free capacity.
- `hub_sla_stats`: standard delivery time, on-time rate, orders today, daily capacity.
- `hub_team`: person in charge, title, phone, active staff count.
```

Update `docs/guides/GUIDE-01-cms-admin-guide.md` so editors know the write path:
- create hub in `regional_hubs`
- add one primary row in `hub_addresses`
- add warehouse, SLA, and team rows in their own collections
- keep province/district selection on the address record, not the parent hub

Refresh `openapi.json` after the schema and hook changes so the checked-in API artifact matches the new relations.

- [ ] **Step 4: Run the tests and export to verify they pass**

Run:

```powershell
cd directus
npm run verify
npm run verify:hub-split
npm run openapi:export
```

Expected: bootstrap and hub-split verification pass, and `openapi.json` reflects the new child collections and nested relations.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/lib/directus.ts directus/SCHEMA.md directus/docs/SCHEMA_VI.md docs/specs/SPEC-03-data-model.md docs/specs/SPEC-05-information-architecture.md docs/specs/SPEC-02-functional-spec.md docs/guides/GUIDE-01-cms-admin-guide.md docs/testing/TEST-02-test-cases.md openapi.json
git commit -m "docs: close split hub contract"
```

## Self-Review

### 1. Spec coverage

- Core hub identity and code rule: covered by Task 1.
- Separate address, warehouse, SLA, and team storage: covered by Task 1 and Task 2.
- Province/district dropdowns: covered by Task 1 and Task 2.
- Seeded hubs stay working after the split: covered by Task 2.
- Permissions stay explicit per collection: covered by Task 1.
- Bootstrap verification and sample payloads: covered by Task 2.
- Frontend types and public contract docs stay aligned: covered by Task 3.

### 2. Placeholder scan

- No TBD/TODO placeholders.
- No vague "handle edge cases" steps.
- No missing file paths.
- Each task has concrete test commands and a commit step.

### 3. Type consistency

- `hub_code` stays the only parent-level business identifier.
- `hub_addresses`, `hub_warehouse_stats`, `hub_sla_stats`, and `hub_team` remain 1:1 with `regional_hubs`.
- `formatHubCode()` is the shared source of truth for code formatting in the hook, seed helper, and verification script.
- `free_capacity_m2` is derived from `total_capacity_m2 - used_capacity_m2`, so verification can catch drift.
