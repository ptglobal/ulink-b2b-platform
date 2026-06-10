# SPEC-09 — Security & RBAC Specification

**Status:** Baseline · **Owner:** Dev B · **Related:** SPEC-03 (access model), ADR-0003

## Authentication
- Customer auth via Directus (JWT). Sessions/refresh per Directus defaults.
- Admin/Editor/Sales authenticate to the Directus admin app.
- Server-side writes use a scoped `DIRECTUS_TOKEN`; **never** shipped to the browser.
- Public RFQ writes are allowed only through the Next.js BFF route. Visitor/customer RFQ submission does not write directly to Directus.

## Authorization (RBAC)
| Role | Summary |
|---|---|
| Admin | Full system |
| Editor | CRUD content + publish; no users/roles |
| Sales | CRUD rfq_requests, orders, invoices, deliveries, customers; read content |
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
- Parameterized/SDK queries only (no raw string SQL); Directus handles escaping.

## Secrets
- All secrets in env (`.env`, Vercel/host secrets). `.env*` git-ignored.
- Rotate `DIRECTUS_KEY/SECRET`, DB and admin passwords, tokens on handover and on any leak.

## Files & uploads
- TDS/MSDS and images via Directus Files; validate type/size; serve from media origin.

## Auditing & least privilege
- Each role gets the minimum permissions to do its job. Review permissions before
  go-live. Directus activity log retained.

## Verification
Role walkthrough (each role sees only what it should); customer A cannot read
customer B's data; HTTPS + headers scan; anti-spam flood test.
