# Contact Requests Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new admin inbox for `contact_requests` with the same list/detail pattern used by the existing RFQ and sample-request screens.

**Architecture:** The admin area will keep the current server-rendered route pattern under `/[locale]/admin`. A new list page will load contact submissions from Directus on the server, hand them to a client table for search and row navigation, and a detail page will render one submission at a time. Navigation entry points will be added to the sidebar and dashboard so the inbox is discoverable from the existing admin shell.

**Tech Stack:** Next.js App Router, React server components, React client components, Directus SDK, existing auth helpers, Tailwind CSS.

## Global Constraints

- Keep all admin routes locale-aware under `/[locale]/admin/...`.
- Reuse the existing admin layout, auth guard, and visual style from RFQ/sample-request pages.
- Read from `contact_requests` only; do not add edit/delete actions in this pass.
- Use the existing `contact_requests` Directus collection and fields already bootstrapped in Directus.
- Keep the implementation isolated to admin UI and Directus reads; do not change unrelated content, resources, events, or contact form submission flow.

---

### Task 1: Expose Contact Requests from the Admin Shell

**Files:**
- Modify: `frontend/src/components/admin/admin-sidebar.tsx`
- Modify: `frontend/src/app/[locale]/admin/page.tsx`

**Interfaces:**
- Consumes: existing admin navigation structure, dashboard KPI card patterns, `createWriteDirectusClient()`, `readItems()`
- Produces: a sidebar link and dashboard card that point to `/admin/contact-requests`

- [ ] **Step 1: Add the sidebar entry**

Add a new menu item in `AdminSidebar` with label `Liên hệ gửi về` or equivalent admin copy, icon `Mail` or another mail/inbox icon, and `href: '/admin/contact-requests'`.

- [ ] **Step 2: Add the dashboard KPI card**

Extend the dashboard stats query to count `contact_requests` alongside RFQs, sample requests, products, and users. Add a KPI card that links to `/admin/contact-requests` and shows the live count.

- [ ] **Step 3: Add a quick action link**

Add one dashboard quick-action row that opens the contact inbox directly so the admin landing page mirrors the existing `products`, `articles`, and `users` shortcuts.

- [ ] **Step 4: Verify navigation wiring**

Run the frontend typecheck after the navigation changes and confirm the new sidebar item and KPI link compile with the existing `Link`/icon imports.

---

### Task 2: Build the Contact Requests List Page

**Files:**
- Create: `frontend/src/app/[locale]/admin/contact-requests/page.tsx`
- Create: `frontend/src/components/admin/contact-requests-client.tsx`

**Interfaces:**
- Consumes: `getCurrentUser()`, `createWriteDirectusClient()`, `readItems()`, `Schema`, `redirect()`
- Produces: a locale-aware admin list page with search, empty state, and row navigation to the detail route

- [ ] **Step 1: Write the server page scaffold**

Create the new admin page using the same auth pattern as `rfqs/page.tsx` and `sample-requests/page.tsx`: check `getCurrentUser()`, redirect unauthenticated users to `/login`, create a session-capable Directus client, and fetch `contact_requests` with fields:

```ts
[
  'id',
  'full_name',
  'email',
  'phone',
  'subject',
  'message',
  'created_at'
]
```

Sort newest first using `created_at` or `-id` if needed by the current Directus shape.

- [ ] **Step 2: Define the table row model**

Create a `ContactRequestItem` interface in the client component that matches the fields loaded by the page. Keep the shape minimal and aligned to the Directus collection so the table and detail page use the same data contract.

- [ ] **Step 3: Build the client table**

Render a searchable list with the same admin styling used elsewhere:

```ts
search over:
- full_name
- email
- phone
- subject
- message
```

Show columns for name, email, phone, subject, and created time. Include a row action or clickable row that navigates to `/admin/contact-requests/[id]`.

- [ ] **Step 4: Add empty and error states**

Match the other admin screens by showing a friendly empty state when there are no submissions and a red error banner when the server loader fails.

- [ ] **Step 5: Verify list behavior**

Confirm the page loads inside the existing admin shell, filters as expected, and every row opens the detail view route.

---

### Task 3: Build the Contact Request Detail View

**Files:**
- Create: `frontend/src/app/[locale]/admin/contact-requests/[id]/page.tsx`
- Create: `frontend/src/components/admin/contact-request-detail.tsx`

**Interfaces:**
- Consumes: `getCurrentUser()`, `createWriteDirectusClient()`, `readItems()`, route params `{ id }`
- Produces: a detail page that renders one `contact_requests` item and exposes a back link to the list page

- [ ] **Step 1: Write the detail loader**

Create the server page that parses the route `id`, guards auth, fetches one record from `contact_requests`, and handles the not-found case cleanly. Use the same Directus client helper pattern as the list page.

- [ ] **Step 2: Design the detail layout**

Render the submission in a card-based view with these sections:

```ts
- Contact identity: full_name, email, phone
- Subject
- Message body
- Created time
```

Keep the layout visually consistent with other admin detail modals/pages so the page feels part of the same system.

- [ ] **Step 3: Add navigation back to the inbox**

Include a prominent back link to `/admin/contact-requests` and ensure the browser back path works from the detail page as well.

- [ ] **Step 4: Verify direct navigation**

Open the list page, click one row, and confirm the route changes to `/admin/contact-requests/[id]` and the detail content matches the selected record.

---

### Task 4: Verify, Smoke Test, and Record the Change

**Files:**
- Modify: `frontend/src/app/[locale]/admin/page.tsx`
- Modify: `frontend/src/components/admin/admin-sidebar.tsx`
- Modify: `frontend/src/app/[locale]/admin/contact-requests/page.tsx`
- Modify: `frontend/src/app/[locale]/admin/contact-requests/[id]/page.tsx`
- Modify: `frontend/src/components/admin/contact-requests-client.tsx`
- Modify: `frontend/src/components/admin/contact-request-detail.tsx`

**Interfaces:**
- Consumes: the new admin routes and Directus reads from Tasks 1-3
- Produces: a verified admin inbox that is reachable from the dashboard and sidebar

- [ ] **Step 1: Run frontend typecheck**

Run:

```bash
cd frontend
npm run typecheck
```

Expected: pass with no type errors in the new admin pages or client components.

- [ ] **Step 2: Run a focused smoke test**

Manually open:

```text
/vi/admin
/vi/admin/contact-requests
/vi/admin/contact-requests/[id]
```

Expected: the dashboard shows the new card, the sidebar shows the new inbox entry, and the detail page opens from a list row.

- [ ] **Step 3: Check Directus data shape**

Confirm the page renders `full_name`, `email`, `phone`, `subject`, `message`, and `created_at` from the existing `contact_requests` collection without adding any new writes.

- [ ] **Step 4: Leave unrelated admin flows untouched**

Confirm RFQ, sample request, subscriber, product, and article admin screens still load as before; this change should only add the contact inbox.

