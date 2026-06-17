# Directus Folder Overview — ULink B2B Platform

This folder contains everything needed to configure, extend, seed, and govern a **standard Directus 11** instance (`directus/directus:11`) for the ULink Industries B2B procurement platform.

It is **not** a fork of Directus. It is a **code-as-configuration + custom extensions** layer that runs on top of the official image.

## Table of Contents

- [Purpose & Integration](#why-this-folder-exists)
- [Directory Structure](#directory-structure)
- [Core Bootstrap Files](#core-bootstrap-files)
- [Schema Definitions](#schema-definitions-schema)
- [RBAC System](#rbac-system-rbac)
- [Shared Libraries](#shared-libraries-lib)
- [Custom Extensions](#custom-extensions-extensions)
- [Seeding](#seeding-seed)
- [SQL Migrations](#sql-migrations-sqlmigrations)
- [Verification Scripts](#verification--operations-scripts)
- [Usage & Maintenance](#common-workflows--npm-scripts)

## Why This Folder Exists

- Directus provides admin UI, REST/GraphQL, auth, RBAC (including row-level), i18n (Translations), media library, and more out of the box (see [ADR-0001](../../docs/decisions/ADR-0001-headless-cms-directus.md)).
- The team only needs to define the **data model**, **strict RBAC**, **business rules**, and **minimal custom logic**.
- Everything important (schema, roles, permissions, folder structure) is defined in code for reproducibility, reviewability, and CI-friendly setup.
- `SCHEMA.md` is the human-readable contract that must stay in sync with the implementation.

## How It Integrates with the Platform

From [docker-compose.yml](../../docker-compose.yml):

- The official Directus container mounts:
  - `./directus/uploads` → `/directus/uploads` (media storage)
  - `./directus/extensions` → `/directus/extensions` (custom logic)
  - `./directus/lib` → `/directus/lib` (shared modules)
  - `./directus/constants.mjs` → `/directus/constants.mjs`
- Bootstrap and verification scripts run **from the host** (they use the Directus REST API + direct Postgres when needed).
- Frontend (Next.js) consumes Directus via SDK or thin API routes (`/api/rfq`, `/api/sku`, revalidation webhooks, etc.).
- Redis is used for Directus response caching + application-level SKU cache.
- Postgres is the single source of truth.

**Typical startup sequence** (after `docker compose up -d`):
1. Wait for Directus healthy.
2. `cd directus && npm install && npm run bootstrap`
3. (Optional) Run specific verify scripts or `npm run rbac:verify`.

---

## Directory Structure

```
directus/
├── bootstrap.mjs                 # Idempotent main setup script (runs everything)
├── config.mjs                    # Directus SDK client + admin authentication
├── constants.mjs                 # Hard-coded role/policy UUIDs + reusable field defs
├── SCHEMA.md                     # Authoritative documentation (collections, roles, enums, media policy, ERP)
├── package.json                  # "ulink-directus-bootstrap" + all npm scripts
├── package-lock.json
│
├── schema/                       # Data model definitions (source of truth)
│   ├── collections.mjs
│   └── relations.mjs
│
├── rbac/                         # Complete RBAC model (roles + policies + permissions + access)
│   ├── roles.mjs
│   ├── policies.mjs
│   ├── access.mjs
│   └── permissions.mjs
│
├── lib/                          # Reusable modules used by bootstrap + extensions
│   ├── ensure-helpers.mjs        # Idempotent "ensure" wrappers around Directus SDK
│   ├── media-policy.mjs          # Strict upload rules, folder mapping, retention policy
│   ├── i18n.mjs                  # vi/en/ja locales + Directus Translations model
│   ├── folder-db.mjs             # Low-level Postgres folder + file helpers (bypass Directus)
│   ├── db-indexes.mjs            # Applies SQL migrations after schema bootstrap
│   └── smtp.mjs                  # Email helper (used by onboarding)
│
├── extensions/                   # Custom Directus extensions (5 total)
│   ├── commercial-import-endpoint/
│   ├── customer-onboarding-endpoint/
│   ├── customer-onboarding-hook/
│   ├── media-policy-endpoint/
│   └── media-policy-hook/
│
├── seed/                         # Initial + demo data
│   ├── initial_content.mjs
│   ├── demo_commerce.mjs
│   └── translation_data.mjs
│
├── sql/migrations/               # SQL executed after Directus schema creation
│   ├── 2026-06-10-add-query-indexes.sql
│   ├── 2026-06-12-add-commercial-import-indexes.sql
│   ├── 2026-06-12-add-erp-outbox-view.sql
│   └── 2026-06-12-add-product-sku-case-insensitive-unique.sql
│
├── uploads/                      # Actual media files (mounted into Directus)
│
├── *.mjs (verification & ops)    # verify_bootstrap.mjs, verify_*.mjs, rbac_*.mjs, media-cleanup.mjs, etc.
│
└── node_modules/                 # Only bootstrap dependencies (@directus/sdk, pg, dotenv)
```

---

## Core Bootstrap Files

### `bootstrap.mjs`
The single entry point. It:
1. Authenticates as the Directus admin.
2. Creates all collections (via `ensureCollection`).
3. Creates all relations.
4. Sets up roles, policies, access mappings, and permissions (with cleanup of stale items).
5. Seeds languages (`vi`, `en`, `ja` — `vi` is fallback).
6. Ensures the media folder tree.
7. Runs `seedInitialContent` + `seedDemoCommerce`.
8. Applies raw SQL migrations/indexes via `applyDbIndexes()`.

Run with: `npm run bootstrap`

The script is designed to be **idempotent** — safe to run multiple times.

### `config.mjs`
Creates a Directus SDK client (REST + authentication) pointed at `DIRECTUS_PUBLIC_URL` and logs in with the admin credentials from `.env`.

### `constants.mjs`
- Defines stable UUIDs for the 5 roles and 5 policies (prevents drift).
- Exports reusable field definitions (`ID_FIELD`, `STATUS_FIELD`).

### `SCHEMA.md`
The **living specification**. It describes:
- All content collections and B2B portal collections
- Singletons (`site_settings`, `homepage`)
- Relationships and junction tables
- Status enums and domain-specific statuses
- Row-level security rules
- ERP-ready fields + `integration_events` outbox pattern
- Media policy & retention workflow
- i18n strategy

**Rule:** If you change anything in `schema/`, `rbac/`, or `bootstrap.mjs`, update `SCHEMA.md` in the same PR.

---

## Schema Definitions (`schema/`)

**`collections.mjs`**
Exports `COLLECTION_DEFS` — an array of full collection definitions consumed by bootstrap.

Notable patterns:
- Most content collections get `status` (published/draft/archived) + `translations` alias field.
- Portal collections (`customers`, `orders`, `rfq_requests`, `integration_events`, etc.) use domain-specific statuses.
- `product_skus.sku_code` is unique at schema level (further enforced case-insensitively via SQL migration).
- Hidden junction collections for M2M (`products_industries`, `products_files`).
- Two singletons + `media_retention` + `media_audit_events` for governance.
- `languages` collection + hidden `<collection>_translations` collections (provisioned via `lib/i18n.mjs`).

**`relations.mjs`**
Exports `RELATION_DEFS`. Defines all M2O relationships (and the reverse one_field aliases for M2M/O2M).

---

## RBAC System (`rbac/`)

Directus 11 uses **Roles + Policies + Access mappings + Permissions**.

### Roles (`roles.mjs`)
Pre-defined UUIDs + metadata:
- `Administrator` (full admin_access + app_access)
- `Editor`
- `Sales`
- `Customer`
- `Visitor` (public / unauthenticated)

### Policies (`policies.mjs`)
- `Administrator` policy → `admin_access: true`
- `Visitor` policy → public (no app access)
- Editor / Sales / Customer policies → app_access true, admin_access false

### Access Mappings (`access.mjs`)
Links each role (or `null` for public) to its policy. The Visitor policy is attached to `role: null`.

### Permissions (`permissions.mjs`)
The most important file. `buildPermissionDefs()` generates the full permission set. Key behaviors:

- **Visitor / Customer**: Read-only on published content collections + singletons. Customers get row-level filters on their own commerce data.
- **Sales**: Full CRUD on `customers`, `orders`, `rfq_requests`, `rfq_assignment_rules`, invoices, deliveries + read on content.
- **Editor**: Full CRUD on all content collections, singletons, translations, and files/folders.
- Directus system collections (`directus_files`, `directus_folders`) have carefully scoped permissions.
- `ensurePermissions` cleans up stale permissions for the managed policies on every bootstrap.

**Customer self-service contract** (from SCHEMA.md):
- Customers can only edit `contact_name`, `phone`, `address` on their own `customers` row.
- `erp_ref`, `company_name`, `tax_code`, `sales_owner` are Sales/Admin managed.

---

## Shared Libraries (`lib/`)

### `ensure-helpers.mjs`
The heart of the idempotent bootstrap. Provides:
- `ensureCollection`, `ensureRelation`
- `ensureRole`, `ensurePolicy`, `ensureAccess`, `ensurePermission`
- `ensureUser`, `ensureItem`, `ensureTranslation`, `ensureSingleton`
- Duplicate/stale cleanup logic for permissions
- `getPublicPolicyId()` (needed because the public policy is system-generated)

All "ensure" functions swallow "already exists" errors and log `+` / `=` / `~` / `-` actions.

### `media-policy.mjs`
Central policy definition (`MEDIA_POLICY`):
- Allowed MIME types & extensions
- Max sizes (10MB normal, 2MB for SVG)
- Folder convention (`media/products`, `media/documents`, `media/regional-hubs`, `media/trash`, etc.)
- `collectionModules` mapping
- Retention rules (7-day soft delete, 24h orphan grace)
- `validateUploadCandidate()` and helpers

Used by both the media hook and the bootstrap folder setup.

### `i18n.mjs`
- Defines `LOCALES` (vi first as fallback, then en, ja)
- `TRANSLATABLE_COLLECTIONS` list
- `TRANSLATION_FIELDS` per collection
- Helper functions to generate hidden translation collections + relations
- `createTranslationAliasField()` used in content collections

### `folder-db.mjs`
Low-level Postgres client that talks directly to `directus_folders` and `directus_files` tables.
Used during bootstrap to create the module folder tree before any files are uploaded. Bypasses Directus permissions.

### `db-indexes.mjs`
After Directus collections exist, this script:
- Connects directly to Postgres (using `DB_HOST_EXTERNAL` or localhost)
- Executes **all** `.sql` files in `sql/migrations/` in lexical order
- Splits on `;` and runs statements

This is how performance indexes and the ERP outbox view are guaranteed to exist.

### `smtp.mjs`
Thin wrapper around Directus mail transport. Used by the customer onboarding endpoint to send welcome emails.

---

## Custom Extensions (`extensions/`)

All extensions follow the Directus extension format (`directus:extension` in their `package.json`). They have `src/` (TypeScript/JS source) and `dist/` (built output). Directus loads from `dist/`.

Extensions are mounted as a whole directory, so source + dist travel together.

### 1. `commercial-import-endpoint`
**Type:** Endpoint (`/commercial-import`)

REST endpoints for bulk CSV operations (restricted to Admin + Sales roles via `accountability.role`).

- `POST /preview` — dry-run parse + validation
- `POST /commit` — actual insert/update with partial-failure support

Business collections supported: `customers`, `orders`, `invoices`, `deliveries`.

See also: `csv.js` parser + error renderer.

### 2. `customer-onboarding-endpoint`
**Type:** Endpoint (`/customer-onboarding`)

Public (or lightly protected) self-registration:
- `POST /register` — creates `directus_users` (Customer role, active) + `customers` (inactive) atomically.
- Sends welcome email via `lib/smtp.mjs`.
- Strong validation + rollback on partial failure.
- Duplicate email checks (both users and customers tables).

### 3. `customer-onboarding-hook`
**Type:** Hook (`items.create` + `users.create`)

Automatic linking:
- When any user is created (via Directus admin or the register endpoint), the hook looks for a matching `customers.email`.
- If found and not yet linked, it sets `user = <new user id>` and `status = 'active'`.
- Prevents multiple linking and cross-user linking.

This implements the "Sales invites / pre-creates customer → customer self-registers or is invited" contract.

### 4. `media-policy-hook`
**Type:** Action hook on `files.upload`

Enforcement layer that runs on **every** file upload:

- Validates against `MEDIA_POLICY` (type, size, SVG trust).
- Determines module from the target folder.
- On rejection: writes `upload_rejected` audit event, **deletes the file**, and throws (rejecting the upload).
- On acceptance: writes `upload_accepted` audit event.

Also populates `media_retention` records for lifecycle management.

### 5. `media-policy-endpoint`
**Type:** Endpoint (`/media-policy`)

Explicit admin actions (normally triggered from UI or scripts):

- `POST /soft-delete` — moves file to retention queue (allowed for Admin/Editor/Sales).
- `POST /hard-delete` — permanent removal (Admin only, requires double confirmation).

Both endpoints write full audit records and update retention state. The actual file deletion on disk + DB is handled in the shared service logic under the media-policy-hook folder (intentionally shared).

**Design pattern:** Hooks for automatic enforcement + Endpoints for human/admin actions. This is used consistently for media governance.

---

## Seeding (`seed/`)

### `initial_content.mjs`
Seeds a realistic starting taxonomy:
- Industries (electronics, pharmaceutical-cosmetics, …) with translations
- Product category tree (Cleanroom Consumables → Gloves, Wipers, …)
- Some products, SKUs, documents, regional hubs, etc.

Uses `helpers.ensureItem` + `helpers.ensureTranslation`.

### `demo_commerce.mjs`
Creates:
- A demo Customer user + linked `customers` row
- Sample orders, order_items, invoices, deliveries
- Uses IDs returned from initial content seeding (hubs, SKUs, etc.)

### `translation_data.mjs`
JSON-like map of all translatable strings for the seeded items (vi/en/ja).

---

## SQL Migrations (`sql/migrations/`)

Executed automatically at the end of `bootstrap.mjs` via direct Postgres (not through Directus).

Current migrations (as of 2026-06):
- **2026-06-10-add-query-indexes.sql** — General query performance (portal paths, etc.)
- **2026-06-12-add-product-sku-case-insensitive-unique.sql** — Enforces `lower(btrim(sku_code))` uniqueness (critical for Redis cache key integrity)
- **2026-06-12-add-commercial-import-indexes.sql** — Speeds up the commercial import matching logic
- **2026-06-12-add-erp-outbox-view.sql** — Creates `failed_erp_webhooks` reporting view over `integration_events`

**Rule:** New indexes or views for portal/ERP paths belong here, not as Directus "indexes" in the UI.

---

## Verification & Operations Scripts

The project has a strong "verify everything" culture.

Notable scripts (all runnable via `npm run ...`):

- `verify` — basic bootstrap verification
- `verify:commercial-import`
- `verify:onboarding`
- `verify:reset-password`
- `verify:rfq-notify`
- `verify:erp-outbound-webhook`
- `verify:sku-cache-hook`
- `verify:media-policy`
- `media:cleanup` — runs the daily retention purge logic
- `rbac:seed` / `rbac:verify`
- `inspect_roles.mjs`
- `test_query.mjs`
- `openapi:export` — generates a complete `openapi.json` (core + custom endpoints)

These scripts act as **executable documentation and regression tests**. Many are used during development and in the Definition of Done process.

---

## API Documentation & Interactive Testing (`extensions/docs-endpoint`)

Directus core automatically provides `/server/specs/oas` for all collections and system endpoints. However, **custom extension endpoints** (the ones you care about for testing) are not included.

### New dedicated docs endpoint (added for this need)

A lightweight extension was added:

- **Live merged OpenAPI + Swagger UI** (recommended):
  - `GET http://localhost:8055/docs` → Self-contained Swagger UI with the full merged spec **embedded** (custom endpoints are always visible, even without login).
  - `GET http://localhost:8055/docs/openapi.json` → Raw JSON (add Bearer token for the complete core collection list).

The UI includes a banner explaining how to unlock the full Directus collections. Custom endpoints (especially `POST /customer-onboarding/register`) are force-injected and always present.

**Dedicated tester documentation**: See [directus/API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) — contains copy-paste curl examples, request/response samples, auth requirements, edge cases, and tester notes for every custom endpoint. Perfect for manual testing and Postman collections.

This makes the previously missing endpoints visible:

- `POST /customer-onboarding/register`
- `POST /commercial-import/preview`
- `POST /commercial-import/commit`
- `POST /media-policy/soft-delete`
- `POST /media-policy/hard-delete`

**How to use for testing the "register" endpoint (and others):**

1. Restart docker so the new extension is picked up:
   ```bash
   docker compose up -d --force-recreate directus
   ```

2. Open in browser (login as admin first in another tab, or use token in Postman):
   ```
   http://localhost:8055/docs
   ```

3. In the UI you will now see the **customer-onboarding** tag with the full `/register` operation, plus the other custom endpoints with request bodies and responses.

4. Export a static file any time:
   ```bash
   cd directus
   npm run openapi:export
   ```
   This produces `directus/openapi.json` (merged). Import it into Postman, Swagger Editor, Insomnia, etc.

The `/docs/openapi.json` endpoint forwards your current Authorization header, so the core part of the spec only shows what the logged-in role can see (great for testing Customer vs Sales views).

### Why this was needed

Standard Directus OAS only covers the data model generated from collections. All three custom business endpoints lived only in code + the `verify_*.mjs` scripts until this docs endpoint was added.

---

## Uploads Folder

Contains real media files uploaded through Directus (or seeded). The folder structure inside mirrors the module folders created by `ensureFolderTree` (`media/products`, `media/documents`, `media/pages`, `media/trash`, etc.).

Files are named using Directus conventions but the policy layer enforces collection-aware placement.

---

## Common Workflows & npm Scripts

From `package.json`:

```json
"bootstrap": "node bootstrap.mjs",
"verify": "node verify_bootstrap.mjs",
"rbac:seed": "node rbac_seed.mjs",
"rbac:verify": "node rbac_verify.mjs",
"media:verify": "node verify_media_policy.mjs",
"media:cleanup": "node media-cleanup.mjs",
"verify:commercial-import": "...",
"verify:onboarding": "..."
```

Typical development loop when changing the data model:
1. Edit `schema/collections.mjs` or `rbac/permissions.mjs`
2. Update `SCHEMA.md`
3. `npm run bootstrap`
4. Run relevant `verify:*` scripts
5. Manually spot-check in Directus Admin UI + frontend

---

## Key Design Principles Visible in This Folder

1. **Idempotency everywhere** — bootstrap can be re-run safely.
2. **Row-level security as first-class** — most customer data access is filtered in the permission definitions, not in application code.
3. **Dual enforcement for important rules** (media policy = hook + endpoint + DB + audit).
4. **ERP-ready from day one** — `erp_ref` fields + `integration_events` outbox + dedicated migration for the view.
5. **i18n baked into the model** — Directus Translations + explicit `languages` collection + fallback to `vi`.
6. **SKU normalization contract** — lowercase + DB unique constraint to keep Redis cache and Directus in sync.
7. **Audit + retention for media** — nothing is silently deleted.
8. **Verification scripts as contracts** — if a verify script breaks, the feature is not done.

---

## Maintenance Notes

- Never manually create collections/roles/permissions in the Directus UI if they are defined here — they will be overwritten or cause drift.
- When adding a new content collection that needs translations, add it to `TRANSLATABLE_COLLECTIONS` and `TRANSLATION_FIELDS` in `lib/i18n.mjs`, plus the corresponding entries in `schema/`.
- When changing permissions, run `npm run rbac:verify` and consider updating the relevant verify script.
- SQL migrations are append-only in practice (new files with date prefix).
- The `dist/` folders in extensions should be kept in sync with `src/` (rebuild when changing extension logic).

For the broader architecture, see:
- [ENG-01-architecture-overview.md](../../docs/engineering/ENG-01-architecture-overview.md)
- [SCHEMA.md](./SCHEMA.md)
- Various specs in `../../docs/specs/`

---

This file should be updated whenever significant structure or behavior changes in the `directus/` folder.