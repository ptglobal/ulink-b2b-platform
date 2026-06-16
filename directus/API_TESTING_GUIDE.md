# Directus API Testing Guide for Testers

This guide helps QA / testers explore and test the **Directus APIs**, with special focus on the custom business endpoints.

## Quick Access

| Tool | URL | Purpose |
|------|-----|---------|
| Interactive Swagger UI | http://localhost:8055/docs | Best starting point. Browse + "Try it out" all endpoints (custom + collections) |
| Merged OpenAPI JSON | http://localhost:8055/docs/openapi.json | Import into Postman, Insomnia, or generate clients. Custom endpoints are always included. |
| Export static file | `cd directus && npm run openapi:export` | Generates `openapi.json` in the directus folder |
| Directus Admin UI | http://localhost:8055 | Login here first to get a Bearer token for full access |

**Tip for testers**: Always log into the Directus Admin UI first with an appropriate role (Admin recommended for full visibility). Then return to `/docs` and click **Authorize** (or use the same token in Postman).

## Authentication & Roles

All custom endpoints (except registration) check the caller's role via `req.accountability.role`.

| Role | Description | Typical Use |
|------|-------------|-------------|
| Administrator | Full access | Testing everything, hard-delete media, commercial import |
| Editor | Content + some media actions | Content management |
| Sales | Commerce data + commercial import + media soft-delete | Business workflows |
| Customer | Limited to own data | Portal testing (usually not used directly on these custom endpoints) |
| Visitor (public) | Read-only published content | Public site testing |

**How to get a token**:
1. Go to http://localhost:8055
2. Login as the desired user/role
3. Open DevTools → Network → any request → Headers → copy the `Authorization: Bearer ...` value
4. Paste into Swagger "Authorize" or Postman "Bearer Token"

You can also create static tokens in Directus Admin (Settings → Access Tokens) for CI-style testing.

## Custom Extension Endpoints

These are the business-specific endpoints added via Directus extensions. They live under the Directus base URL.

### 1. Customer Onboarding – Self Registration

**Endpoint**: `POST /customer-onboarding/register`

**Purpose**: Public self-registration for B2B customers.  
Creates:
- An active `directus_users` record (Customer role)
- An inactive `customers` record

The `customer-onboarding-hook` will automatically link the user to an existing pre-created customer row (by email) and activate it.

**Auth**: None (public)

**Request Body** (all fields required):
```json
{
  "company_name": "ACME Corporation",
  "contact_name": "Nguyen Van A",
  "email": "a@acme.vn",
  "phone": "0987654321",
  "password": "SuperSecret123!",
  "confirm_password": "SuperSecret123!"
}
```

**Success Response (201)**:
```json
{
  "data": {
    "user_id": "uuid-here",
    "customer_id": 123,
    "status": "inactive"
  }
}
```

**Common Error Responses**:
- `409 Conflict` — Email already exists as user or customer
- `422 Unprocessable Entity` — Missing field, password mismatch, or validation error
- `500` — Internal error (rare)

**Curl Example**:
```bash
curl -X POST http://localhost:8055/customer-onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "contact_name": "Test User",
    "email": "tester@example.com",
    "phone": "0912345678",
    "password": "TestPass123!",
    "confirm_password": "TestPass123!"
  }'
```

**Tester Notes**:
- After success, the user can log in immediately (status=active on user).
- The customer row starts as `inactive` — Sales must activate it.
- Test duplicate email, password mismatch, missing fields.
- Check that a welcome email is sent (Mailpit at http://localhost:8025).

### 2. Commercial Data Import

**Endpoints**:
- `POST /commercial-import/preview`
- `POST /commercial-import/commit`

**Purpose**: Bulk import via CSV for commerce data (customers, orders, invoices, deliveries). Preview mode is safe.

**Auth**: Must be logged in as **Administrator** or **Sales** role. Returns 403 otherwise.

**Request Body** (both endpoints use the same shape):
```json
{
  "collection": "customers",           // or "orders", "invoices", "deliveries"
  "csvText": "header1,header2\nvalue1,value2\n...",
  "allowPartial": false                // optional, default false
}
```

**Preview Response** (example):
```json
{
  "data": {
    "parsed": 5,
    "valid": 4,
    "errors": [...],
    "previewRows": [...]
  }
}
```

**Commit Response** (example):
```json
{
  "data": {
    "created": 3,
    "updated": 1,
    "skipped": 0,
    "errors": []
  }
}
```

**Curl Example (Preview)**:
```bash
curl -X POST http://localhost:8055/commercial-import/preview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "customers",
    "csvText": "erp_ref,company_name,email\nERP-001,ACME,a@acme.vn",
    "allowPartial": false
  }'
```

**Tester Notes**:
- Use `preview` first — it never writes data.
- Test with invalid CSV, duplicate keys, missing required columns.
- `allowPartial: true` allows partial success (some rows fail).
- Look at `verify_commercial_data_import.mjs` for more test scenarios.
- The import service normalizes keys (lower + trim for matching).

### 3. Media Policy (Retention & Governance)

**Endpoints**:
- `POST /media-policy/soft-delete`
- `POST /media-policy/hard-delete`

**Purpose**: Controlled deletion of uploaded files with audit + retention (soft delete queues for automatic purge after 7 days).

**Auth**:
- soft-delete: Administrator, Editor, or Sales
- hard-delete: Administrator only + confirmation

**soft-delete Request**:
```json
{
  "fileId": "uuid-of-the-file",
  "reason": "Obsolete marketing asset",
  "source": "manual-test"
}
```

**hard-delete Request** (requires confirmation):
```json
{
  "fileId": "uuid-of-the-file",
  "reason": "Security incident",
  "confirmHardDelete": true,
  "confirmFileId": "uuid-of-the-file"
}
```

**Responses**: `{ "data": { ...result... } }` or error object.

**Curl Example (soft-delete)**:
```bash
curl -X POST http://localhost:8055/media-policy/soft-delete \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "123e4567-e89b-12d3-a456-426614174000",
    "reason": "Test soft delete"
  }'
```

**Tester Notes**:
- Always test soft-delete first.
- Hard-delete requires exact `confirmHardDelete: true` and matching `confirmFileId` — otherwise 400.
- After soft-delete, check `media_retention` collection and `media_audit_events`.
- Run `npm run media:cleanup` (in directus folder) to simulate the daily purge job.
- Upload a file first via the Directus Admin UI (or API) so you have a `fileId`.
- Test permission boundaries (Sales can soft-delete, but not hard-delete).

## Standard Directus Collection APIs (Quick Reference for Testers)

Base: `http://localhost:8055`

### Authentication
- Login: `POST /auth/login` (email + password) → returns access token + refresh token
- Use `Authorization: Bearer <access_token>` on subsequent requests

### Common Patterns
- Read published content:  
  `GET /items/products?filter[status][_eq]=published&fields=id,name,slug,hero&limit=20`

- Deep relations + translations:  
  `GET /items/products?deep[translations][_filter][languages_code][_eq]=en&fields=*,translations.*`

- Create (requires proper role):  
  `POST /items/customers` with JSON body

- Update / Delete also supported per RBAC rules defined in bootstrap.

**Important**: Customer role has row-level security. A Customer can only see their own orders, invoices, etc.

Use the `/docs` Swagger UI — it shows exactly what your current role can access.

## Recommended Tester Workflow

1. Start everything: `docker compose up -d`
2. Open Directus Admin → login as Admin
3. Open http://localhost:8055/docs → Authorize with the token
4. Test custom endpoints using "Try it out" (especially register and commercial import)
5. For repeatable tests: export `openapi.json` and import into Postman
6. Run verification scripts when needed:
   - `cd directus && npm run verify:onboarding`
   - `npm run verify:commercial-import`
   - `npm run media:verify`
7. Check Mailpit (http://localhost:8025) for emails
8. Check database directly (Postgres) or via Directus Admin for side effects (customers, media_retention, integration_events, etc.)

## Additional Resources

- Live interactive docs: `/docs`
- Raw OpenAPI (always includes customs): `/docs/openapi.json`
- Project overview of Directus setup: `directus/overview.md`
- Detailed schema & RBAC: `directus/SCHEMA.md`
- Existing test cases: `docs/testing/`
- Verify scripts (executable contracts): `directus/verify_*.mjs`

---

**Goal of this guide**: Every custom API should be testable by a tester with copy-paste examples and clear expectations, without needing to read source code.

If an endpoint behavior changes, update both this guide and the OpenAPI definitions in `directus/extensions/docs-endpoint/`.