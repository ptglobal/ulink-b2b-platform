# SPEC-09 — Security & RBAC Specification

**Status:** Baseline · **Owner:** Dev B · **Related:** SPEC-03 (access model), ADR-0003

## Authentication
- Customer auth via Directus (JWT). Sessions/refresh per Directus defaults.
- Admin/Editor/Sales authenticate to the Directus admin app.
- Server-side writes use a scoped `DIRECTUS_TOKEN`; **never** shipped to the browser.
- Public RFQ writes are allowed only through the Next.js BFF route. Visitor/customer RFQ submission does not write directly to Directus.
- RFQ notification webhook calls are app-internal only and use `INTERNAL_API_TOKEN`.

## Authorization (RBAC)
| Role | Summary |
|---|---|
| Admin | Full system |
| Editor | CRUD content + publish; no users/roles |
| Sales | CRUD rfq_requests, rfq_assignment_rules, orders, invoices, deliveries, customers; read content |
| Customer | App access; **row-level** read of own orders/invoices/deliveries |

Row-level filter: `{ customer: { user: { _eq: "$CURRENT_USER" } } }` on
orders/invoices/deliveries; customers read/update own record only.

## Transport & headers
- **HTTPS** everywhere (Let's Encrypt on VPS; TLS on Vercel). HSTS.
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, frame protection,
  a sensible CSP (allow self + CDN/media origins).
- CORS restricted to the site origin(s) in production.

## Input & anti-spam
- Validate all external input (zod) server-side.
- Public mutations (RFQ, contact): Cloudflare Turnstile + Redis IP rate-limit + dedupe.
- The RFQ anti-spam controls live in the BFF; Directus only receives already validated writes.
- `POST /api/rfq` writes with `DIRECTUS_TOKEN`; visitor/customer roles do not create `rfq_requests` directly in Directus.
- `POST /api/internal/rfq-notify` reads/writes with `INTERNAL_API_TOKEN`; Directus Flow calls it after RFQ create.
- Parameterized/SDK queries only (no raw string SQL); Directus handles escaping.

## Secrets
- All secrets in env (`.env`, Vercel/host secrets). `.env*` git-ignored.
- Rotate `DIRECTUS_KEY/SECRET`, DB and admin passwords, tokens on handover and on any leak.

## Files & uploads
- Storage is local only via the mounted Directus volume at `directus/uploads`.
- Allowed upload types:
  - Images: `jpg`, `jpeg`, `png`, `webp`
  - SVG: internal team / brand asset only
  - Documents: `pdf`, `docx`, `xlsx`
- Global size cap: `10MB`.
- SVG cap: `2MB`.
- Folder convention: module-based folders under `media/`.
- Naming convention: `collection-id-uuid.ext`.
- Deletion flow: soft delete first, hard delete after `7 days`.
- Cleanup job: daily at `12:00`.
- Orphan files: keep a `24h` grace period before purge.
- Audit log: record actor, timestamp, action, file metadata, module, source, IP, and user agent.

## Auditing & least privilege
- Each role gets the minimum permissions to do its job. Review permissions before
  go-live. Directus activity log retained.
- `languages` is publicly readable so the locale switcher can list `vi`, `en`, and
  `ja`; only bootstrap/admin writes locale rows.
- Translation collections are readable for public/customer/sales roles and editable
  by Editor so CMS authors can manage localized content without direct system access.
- `rfq_assignment_rules` is Sales-managed; customers and visitors cannot read or write the routing table.

## Verification
Role walkthrough (each role sees only what it should); customer A cannot read
customer B's data; HTTPS + headers scan; anti-spam flood test.
