# Directus Auth Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement hybrid customer onboarding in Directus with a minimal frontend register path: self-register creates an active `directus_users` record plus an inactive linked `customers` record, sales invite activates pre-created customers, and all outbound mail uses a local Mailpit dev stack and Resend in production.

**Architecture:** Keep onboarding logic on the Directus side. A custom endpoint handles self-register so `company_name` is captured cleanly, creates the Directus user first, then creates the linked customer record and sends the welcome email. A separate hook watches `directus_users` creation so sales-invited or admin-created users are linked to any pre-existing customer record by email and the customer is activated. Self-register rejects any email that already has a customer record, so invite and register stay mutually exclusive. Local development uses Mailpit as the SMTP target; production uses Resend SMTP. The frontend stays intentionally small: one register form, one success state, and one unit test that proves the payload reaches the new Directus onboarding endpoint.

**Tech Stack:** Directus 11 extensions, PostgreSQL 16, Docker Compose, Node 20, `@directus/sdk`, `node:test`, Next.js 14, SMTP mail delivery.

---

## File Structure

- Create: `directus/extensions/customer-onboarding-endpoint/package.json`
  Responsibility: Directus endpoint package definition for the self-register route.
- Create: `directus/extensions/customer-onboarding-endpoint/src/index.js`
  Responsibility: HTTP route that registers a customer, creates the user first, then creates the linked customer record, and sends the welcome email.
- Create: `directus/extensions/customer-onboarding-endpoint/src/service.js`
  Responsibility: shared helpers for validation, lookup, record creation, and welcome-mail payload building.
- Create: `directus/extensions/customer-onboarding-hook/package.json`
  Responsibility: Directus hook package definition for user-create linking.
- Create: `directus/extensions/customer-onboarding-hook/src/index.js`
  Responsibility: hook on `directus_users` creation that links an existing customer by email and activates it.
- Create: `directus/extensions/customer-onboarding-hook/src/service.js`
  Responsibility: shared helpers for customer lookup/update and status transitions.
- Modify: `directus/schema/collections.mjs`
  Responsibility: set the onboarding-safe default for `customers.status` and keep the schema contract aligned.
- Modify: `directus/rbac/permissions.mjs`
  Responsibility: restrict Customer-role updates to `contact_name`, `phone`, and `address`; keep Sales full access.
- Modify: `directus/SCHEMA.md`
  Responsibility: document the onboarding contract, status rules, and field-edit rules in the schema spec.
- Create: `directus/verify_onboarding.mjs`
  Responsibility: end-to-end verification for self-register, invite-style linking, permission boundaries, and welcome mail capture.
- Modify: `directus/package.json`
  Responsibility: add a dedicated `verify:onboarding` script.
- Modify: `docker-compose.yml`
  Responsibility: add Mailpit locally and wire Directus SMTP to it.
- Modify: `frontend/src/lib/auth.ts`
  Responsibility: point register calls at the Directus onboarding endpoint and include `company_name`.
- Modify: `frontend/src/components/auth/register-form.tsx`
  Responsibility: add `company_name` to the form and keep the success state simple.
- Create: `frontend/src/lib/auth.test.mjs`
  Responsibility: lock the register payload and endpoint path with a fast Node unit test.
- Modify: `docs/testing/TEST-03-uat-checklist.md`
  Responsibility: add the final smoke checks for onboarding, mail, and RBAC.

## Task 1: Freeze backend contract first, before code paths are added

**Files:**
- Create: `directus/verify_onboarding.mjs`
- Modify: `directus/package.json`
- Modify: `directus/schema/collections.mjs`
- Modify: `directus/rbac/permissions.mjs`
- Modify: `directus/SCHEMA.md`
- Modify: `docs/testing/TEST-03-uat-checklist.md`

- [ ] **Step 1: Write the failing onboarding verification**

Create `directus/verify_onboarding.mjs` with three explicit checks:

1. Self-register flow
   - POST to the new onboarding endpoint with:
     ```json
     {
       "company_name": "ACME Vietnam",
       "contact_name": "Nguyen Van A",
       "email": "buyer@acme.vn",
       "phone": "0901234567",
       "password": "customer-password-123"
     }
     ```
   - Assert:
     - user is created with Customer role
     - `directus_users.status === "active"`
     - matching `customers` row exists
     - `customers.user` points to the new user ID
     - `customers.status === "inactive"`
     - `company_name`, `contact_name`, `email`, and `phone` are copied to the customer row
     - Mailpit has exactly one welcome mail for `buyer@acme.vn`

2. Invite-style flow
   - Create a `customers` row first with `status = inactive` and no `user`.
   - Create a `directus_users` row with the same email.
   - Assert the hook links the rows and flips `customers.status` to `active`.

3. RBAC boundary
   - Log in as the customer user.
   - Assert `PATCH /items/customers/:id` succeeds for:
     - `contact_name`
     - `phone`
     - `address`
   - Assert the same request fails for:
     - `company_name`
     - `tax_code`
     - `sales_owner`

Use this script shape so the plan fails before implementation instead of hiding gaps.

- [ ] **Step 2: Add the directus script entry**

Add this script to `directus/package.json`:

```json
{
  "scripts": {
    "verify:onboarding": "node verify_onboarding.mjs"
  }
}
```

- [ ] **Step 3: Tighten schema defaults and field-level update rules**

Change `customers.status` in `directus/schema/collections.mjs` from the current active default to:

```js
schema: { default_value: 'inactive' }
```

Then change the Customer policy update fields in `directus/rbac/permissions.mjs` from `['*']` to:

```js
fields: ['contact_name', 'phone', 'address']
```

Keep Sales full access to `customers` unchanged.

- [ ] **Step 4: Update the schema doc so the rule is visible**

In `directus/SCHEMA.md`, replace the customer onboarding note with an explicit contract:

```md
- Self-register creates `directus_users` active and `customers` inactive.
- Sales invite links an existing or pre-created customer row and activates it.
- Customers can edit `contact_name`, `phone`, and `address` only.
- `company_name`, `tax_code`, and `sales_owner` are Sales/Admin-managed after approval.
```

- [ ] **Step 5: Update the UAT checklist with onboarding smoke cases**

Add these cases to `docs/testing/TEST-03-uat-checklist.md`:

```md
- Self-register creates an inactive customer linked to the new Directus user.
- Sales-invited user activates the pre-created customer record.
- Customer role can edit contact_name, phone, and address only.
- Customer role cannot edit company_name, tax_code, or sales_owner.
- Welcome mail is visible in Mailpit after successful self-register.
```

- [ ] **Step 6: Run the onboarding verify script and confirm it fails**

Run:

```bash
cd directus
npm run verify:onboarding
```

Expected: fail because the endpoint, hook, and mail wiring do not exist yet.

- [ ] **Step 7: Commit the contract work**

```bash
git add directus/verify_onboarding.mjs directus/package.json directus/schema/collections.mjs directus/rbac/permissions.mjs directus/SCHEMA.md docs/testing/TEST-03-uat-checklist.md
git commit -m "test: lock directus onboarding contract"
```

## Task 2: Build Directus onboarding endpoint and user-create hook

**Files:**
- Create: `directus/extensions/customer-onboarding-endpoint/package.json`
- Create: `directus/extensions/customer-onboarding-endpoint/src/index.js`
- Create: `directus/extensions/customer-onboarding-endpoint/src/service.js`
- Create: `directus/extensions/customer-onboarding-hook/package.json`
- Create: `directus/extensions/customer-onboarding-hook/src/index.js`
- Create: `directus/extensions/customer-onboarding-hook/src/service.js`

- [ ] **Step 1: Implement self-register as a Directus endpoint**

Create a new endpoint that accepts only these required fields:

```json
{
  "company_name": "ACME Vietnam",
  "contact_name": "Nguyen Van A",
  "email": "buyer@acme.vn",
  "phone": "0901234567",
  "password": "customer-password-123"
}
```

Behavior:
- Trim and lowercase `email`.
- Reject missing `company_name`, `contact_name`, `email`, `phone`, or `password` with a 422.
- Reject duplicate email with a 409.
- Reject any email that already has a `customers` row with a 409 so the self-register and invite paths do not collide.
- Create a `directus_users` record with:
  - Customer role
  - `status: "active"`
  - the submitted email
  - the submitted password
  - `first_name` set from `contact_name`
- Create a `customers` row with:
  - `status: "inactive"`
  - `company_name`
  - `contact_name`
  - `email`
  - `phone`
  - `user` set to the new user ID
- Create the user first, then the customer row, so the hook stays a no-op for self-register.
- Send one welcome email after both records exist.
- Return 201 with a compact JSON body such as:
  ```json
  { "ok": true, "user_id": "...", "customer_id": "...", "status": "inactive" }
  ```

- [ ] **Step 2: Implement a hook for invite-style user creation**

Create a hook that listens to Directus user creation and handles this flow:
- if a `customers` row already exists with the same email and no `user` link, set `customers.user = new_user.id`
- set `customers.status = "active"` when that link is completed
- if a customer row is already linked to another user, reject the create to avoid duplicate accounts
- if no customer row exists, do nothing for the hook itself; self-register creates the customer after the user is created

Use the existing extension style already in `directus/extensions/media-policy-hook/`:
- keep the logic in a small `src/service.js`
- keep `src/index.js` focused on wiring the event and calling helpers

- [ ] **Step 3: Add the welcome-mail template in code, not in the frontend**

Keep the template simple and deterministic:

```text
Subject: [ULINK] Tài khoản đã được tạo
Body: Chào {contact_name}, tài khoản ULINK của bạn đã được tạo. Sales sẽ kiểm tra thông tin công ty và kích hoạt tài khoản sau khi duyệt.
CTA: /login
```

The endpoint should send this mail after successful self-register. Do not add a second template system unless the first one is not enough.

- [ ] **Step 4: Run the new verify script after implementation**

Run:

```bash
cd directus
npm run verify:onboarding
```

Expected: self-register and invite-style linking both pass, and Mailpit shows the welcome mail.

- [ ] **Step 5: Commit the onboarding backend**

```bash
git add directus/extensions/customer-onboarding-endpoint directus/extensions/customer-onboarding-hook
git commit -m "feat: add directus onboarding endpoint and hook"
```

## Task 3: Wire local Mailpit and production Resend SMTP

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add Mailpit as the local SMTP target**

Add a `mailpit` service alongside PostgreSQL, Redis, and Directus. Use the standard Mailpit ports:
- SMTP: `1025`
- Web UI: `8025`

Keep the service private to local dev and make it available to Directus by service name.

- [ ] **Step 2: Point Directus mail settings at Mailpit in local compose**

Add the Directus SMTP/mail env block so the local stack can send mail through Mailpit. Keep the production intent explicit in comments:
- local: Mailpit
- production: Resend SMTP

Do not change the frontend for mail delivery. Directus owns the mail path.

- [ ] **Step 3: Confirm the mail path works end to end**

Run:

```bash
docker compose up -d postgres redis mailpit directus
```

Then verify:
- Mailpit web UI opens on `http://localhost:8025`
- self-register sends one mail to the Mailpit inbox
- the welcome mail body contains `/login`

- [ ] **Step 4: Commit the mail wiring**

```bash
git add docker-compose.yml
git commit -m "feat: wire directus mailpit smtp"
```

## Task 4: Keep frontend minimal and only use it to exercise backend

**Files:**
- Modify: `frontend/src/lib/auth.ts`
- Modify: `frontend/src/components/auth/register-form.tsx`
- Create: `frontend/src/lib/auth.test.mjs`

- [ ] **Step 1: Point register() at the new onboarding endpoint**

Change the register path from the native Directus users register endpoint to the new Directus onboarding endpoint, and include `company_name` in the payload.

Expected request body shape:

```json
{
  "company_name": "ACME Vietnam",
  "contact_name": "Nguyen Van A",
  "email": "buyer@acme.vn",
  "phone": "0901234567",
  "password": "customer-password-123"
}
```

Update the `RegisterInput` shape to include `company: string` and map that field to `company_name` in the request body.

- [ ] **Step 2: Add `company_name` to the existing register form**

Keep the current layout and success state.

Required form fields:
- `company_name`
- `contact`
- `email`
- `phone`
- `password`

Do not add a new pending screen component. The existing success state already works as the simple approval message for backend testing.

- [ ] **Step 3: Lock the request shape with a Node unit test**

Create `frontend/src/lib/auth.test.mjs` and mock `fetch` to assert:
- the request URL is the onboarding endpoint
- `company_name` is present
- `contact_name`, `email`, `phone`, and `password` are passed through unchanged

Example assertion shape:

```js
assert.equal(url, 'http://localhost:8055/customer-onboarding/register');
assert.deepEqual(JSON.parse(options.body), {
  company_name: 'ACME Vietnam',
  contact_name: 'Nguyen Van A',
  email: 'buyer@acme.vn',
  phone: '0901234567',
  password: 'customer-password-123'
});
```

- [ ] **Step 4: Run the frontend test**

Run:

```bash
cd frontend
node --import tsx --test src/lib/auth.test.mjs
```

Expected: pass after the register path is wired.

- [ ] **Step 5: Commit the minimal frontend smoke path**

```bash
git add frontend/src/lib/auth.ts frontend/src/components/auth/register-form.tsx frontend/src/lib/auth.test.mjs
git commit -m "feat: add minimal onboarding register form"
```

## Task 5: Final smoke pass and documentation sync

**Files:**
- Modify: `docs/testing/TEST-03-uat-checklist.md`

- [ ] **Step 1: Run the full onboarding verify**

Run:

```bash
cd directus
npm run verify
npm run verify:onboarding
```

Expected:
- bootstrap still passes
- onboarding verify passes
- welcome mail appears in Mailpit
- invite-style linking activates the customer row

- [ ] **Step 2: Run the frontend smoke test again**

Run:

```bash
cd frontend
node --import tsx --test src/lib/auth.test.mjs
```

Expected: pass.

- [ ] **Step 3: Record the final onboarding smoke checklist**

Keep `docs/testing/TEST-03-uat-checklist.md` in sync with the final flow:
- self-register
- welcome mail
- pending customer
- invite activation
- customer field restrictions

- [ ] **Step 4: Final commit after verification**

```bash
git add docs/testing/TEST-03-uat-checklist.md
git commit -m "docs: record directus onboarding smoke checks"
```
