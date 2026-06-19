# Directus API Testing Guide

This is the current tester-facing guide for the Directus layer in ULink.
It reflects the live custom endpoints implemented in `directus/extensions/`.

## Quick Access

| Tool | URL / Command | Purpose |
|---|---|---|
| Swagger UI | `http://localhost:8055/docs` | Browse and try custom + core APIs |
| Live merged spec | `http://localhost:8055/docs/spec` | Raw JSON used by Swagger UI |
| Static export | `cd directus && npm run openapi:export` | Writes `openapi.json` for Postman/Insomnia |
| Directus Admin | `http://localhost:8055` | Login to obtain a bearer token |

## Important Notes

- `GET /docs/spec` is the live spec route for the custom docs endpoint.
- The custom docs spec is merged with Directus core APIs.
- Custom onboarding now requires:
  - OTP verification,
  - consent (`agree`, `agree_at`),
  - `verified_token` from the OTP flow.
- The onboarding endpoint creates an active user and an active customer row.

## Authentication

- `Visitor` can call public content and registration endpoints.
- `Customer`, `Sales`, `Editor`, and `Admin` are role-restricted depending on the endpoint.
- Use the bearer token from Directus Admin or a login response when testing protected routes.

## OTP Flow

### `POST /otp/issue`

Used to send a verification code before onboarding or password change.

Request:

```json
{
  "email": "tester@example.com",
  "purpose": "register"
}
```

Allowed purposes:
- `register`
- `login-2fa`

Response:

```json
{
  "data": {
    "sent": true,
    "expires_in_seconds": 600,
    "debug_code": "123456"
  }
}
```

`debug_code` only appears when debug OTP is enabled in the environment.

### `POST /otp/verify`

Validates the code and returns a reusable `verified_token`.

Request:

```json
{
  "email": "tester@example.com",
  "purpose": "register",
  "code": "123456"
}
```

Response:

```json
{
  "data": {
    "verified": true,
    "verified_token": "vt_..."
  }
}
```

## Customer Onboarding

### `POST /customer-onboarding/register`

Public self-registration for B2B customers.

Required body:

```json
{
  "company_name": "ACME Corporation",
  "contact_name": "Nguyen Van A",
  "email": "a@acme.vn",
  "phone": "0987654321",
  "password": "SuperSecret123!",
  "confirm_password": "SuperSecret123!",
  "agree": true,
  "agree_at": "2026-06-19T12:00:00.000Z",
  "verified_token": "vt_..."
}
```

Response:

```json
{
  "data": {
    "user_id": "uuid-here",
    "customer_id": 123,
    "status": "active"
  }
}
```

Key behavior:

- Creates an active `directus_users` row with the Customer role.
- Creates an active `customers` row linked to that user.
- Stores consent in `customers.consented_at`.
- Rejects registration if the OTP token is missing or expired.
- Sends a welcome email after creation.

Common errors:

- `409` if the email already exists for a user or customer.
- `422` for missing fields, consent issues, or password mismatch.
- `401` if email verification is missing or expired.

## Password Reset and Password Change

### `POST /password-reset-request/send`

Sends a password-reset email. Returns success even if the email does not exist.

Request:

```json
{
  "email": "tester@example.com",
  "purpose": "forgot"
}
```

Purpose values:
- `forgot`
- `change`

Response:

```json
{ "data": { "sent": true } }
```

### `POST /password-reset-request/reset`

Uses the reset token from the email link.

Request:

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

Response:

```json
{ "data": { "ok": true } }
```

### `POST /password-change/change`

Changes the password after the user has completed email verification.

Request:

```json
{
  "email": "tester@example.com",
  "verified_token": "vt_...",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

Response:

```json
{ "data": { "ok": true } }
```

Notes:

- This endpoint uses the OTP `change` purpose.
- It does not use `current_password`.
- It clears active sessions after a successful change.

## Commercial Import

### `POST /commercial-import/preview`
### `POST /commercial-import/commit`

Allowed roles:
- `Admin`
- `Sales`

Request:

```json
{
  "collection": "customers",
  "csvText": "erp_ref,company_name,email\nERP-001,ACME,a@acme.vn",
  "allowPartial": false
}
```

Supported collections:
- `customers`
- `orders`
- `invoices`
- `deliveries`

Preview response shape:

```json
{
  "data": {
    "collection": "customers",
    "mode": "preview",
    "allowPartial": false,
    "counts": {
      "created": 1,
      "updated": 0,
      "skipped": 0,
      "failed": 0
    },
    "rows": [
      {
        "row": 2,
        "key": "ERP-001",
        "action": "created",
        "errors": [],
        "nested": { "order_items": [] }
      }
    ],
    "errorRows": []
  }
}
```

Commit response uses the same shape, plus `committed: true` when at least one row is written, and `aborted: true` when a non-partial commit fails validation.

Important behavior:

- Matching prefers `erp_ref`.
- For customers, matching falls back to `tax_code`, then `email`.
- Orders can import nested `order_items_json`.
- `allowPartial: true` lets valid rows continue even if some rows fail.

## Media Policy

### `POST /media-policy/soft-delete`

Allowed roles:
- `Admin`
- `Editor`
- `Sales`

Request:

```json
{
  "fileId": "uuid-of-the-file",
  "reason": "Obsolete asset",
  "source": "manual-test"
}
```

`id` is also accepted as an alias for `fileId`.

Response:

```json
{
  "data": {
    "fileId": "uuid-of-the-file",
    "module": "pages",
    "purgeAfter": "2026-06-26T12:00:00.000Z"
  }
}
```

### `POST /media-policy/hard-delete`

Allowed roles:
- `Admin` only

Request:

```json
{
  "fileId": "uuid-of-the-file",
  "reason": "Security incident",
  "confirmHardDelete": true,
  "confirmFileId": "uuid-of-the-file",
  "source": "manual-test"
}
```

Response:

```json
{
  "data": {
    "fileId": "uuid-of-the-file",
    "module": "pages",
    "purgedAt": "2026-06-19T12:00:00.000Z"
  }
}
```

Notes:

- Soft delete moves the file into the `trash` folder and creates a retention row.
- Hard delete removes the file permanently and writes audit records.
- `confirmHardDelete` and `confirmFileId` must both be present and correct.

## Core Directus APIs

Examples:

- `GET /items/products?filter[status][_eq]=published`
- `GET /items/products?deep[translations][_filter][languages_code][_eq]=en&fields=*,translations.*`
- `POST /items/customers`
- `PATCH /items/customers/{id}`
- `DELETE /items/customers/{id}`

## Recommended Tester Workflow

1. Start the stack with `docker compose up -d`.
2. Log into Directus Admin and get a bearer token.
3. Open `http://localhost:8055/docs`.
4. Test onboarding first, then import, media policy, and password flows.
5. Use the Directus Admin UI to verify side effects.
6. Run the matching verification scripts when needed:
   - `cd directus && npm run verify:onboarding`
   - `npm run verify:commercial-import`
   - `npm run media:verify`
   - `npm run verify:reset-password`
   - `npm run verify:change-password`

## Source Files

- [directus/docs/overview.md](./overview.md)
- [directus/docs/SCHEMA.md](./SCHEMA.md)
- [directus/extensions/docs-endpoint/openapi_custom_endpoints.json](../extensions/docs-endpoint/openapi_custom_endpoints.json)
- [directus/testing/verify_onboarding.mjs](../testing/verify_onboarding.mjs)
- [directus/testing/verify_commercial_data_import.mjs](../testing/verify_commercial_data_import.mjs)
- [directus/testing/verify_media_policy.mjs](../testing/verify_media_policy.mjs)

