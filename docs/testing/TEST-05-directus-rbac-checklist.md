# TEST-05 - Directus RBAC Checklist

**Status:** Draft  
**Owner:** Dev B  
**Target:** Directus API at `http://localhost:8055`  
**Basis:** `directus/bootstrap.mjs`, `directus/SCHEMA.md`, `docs/specs/SPEC-09-security-rbac.md`

RBAC verification is API-first. Directus Admin UI at port `8055` is useful for
smoke checks, but pass/fail evidence comes from role-specific API requests.

## Test fixtures required

- Admin user from `.env` (`DIRECTUS_ADMIN_EMAIL`)
- User `editor-rbac@example.com`
- User `sales-rbac@example.com`
- User `customer-a-rbac@example.com`
- User `customer-b-rbac@example.com`
- Customer A data set:
  - `RBAC-ORD-A-001`
  - `RBAC-INV-A-001`
  - `RBAC-ERP-DLV-A-001`
  - `RBAC-RFQ-A-001`
- Customer B data set:
  - `RBAC-ORD-B-001`
  - `RBAC-INV-B-001`
  - `RBAC-ERP-DLV-B-001`
  - `RBAC-RFQ-B-001`

## Expected role rules

- `Admin`: full access to system, content, portal data, roles, policies, users
- `Editor`: CRUD content collections and singletons only; no access to portal data
- `Sales`: read content and singletons; full CRUD on `customers`, `orders`,
  `order_items`, `invoices`, `deliveries`, `rfq_requests`
- `Customer`: read published content, read/update own `customers`, read own
  `orders`, `order_items`, `invoices`, `deliveries`, create and read own
  `rfq_requests`

## Collections under test

- `customers`
- `orders`
- `order_items`
- `invoices`
- `deliveries`
- `rfq_requests`

## RBAC matrix

| Case ID | Role | Collection | Action | Target record | Expected |
|---|---|---|---|---|---|
| RBAC-ADM-01 | Admin | `orders` | read list | A + B | ALLOW |
| RBAC-ADM-02 | Admin | `invoices` | update | A + B | ALLOW |
| RBAC-ADM-03 | Admin | system roles | read | all | ALLOW |
| RBAC-EDT-01 | Editor | `blog_posts` | create | n/a | ALLOW |
| RBAC-EDT-02 | Editor | `site_settings` | update | singleton | ALLOW |
| RBAC-EDT-03 | Editor | `orders` | read | any | DENY |
| RBAC-EDT-04 | Editor | `customers` | read | any | DENY |
| RBAC-SAL-01 | Sales | `customers` | read list | A + B | ALLOW |
| RBAC-SAL-02 | Sales | `orders` | create | new | ALLOW |
| RBAC-SAL-03 | Sales | `invoices` | update | A + B | ALLOW |
| RBAC-SAL-04 | Sales | `rfq_requests` | delete | A + B | ALLOW |
| RBAC-SAL-05 | Sales | `hero_banners` | update | any | DENY |
| RBAC-CUS-01 | Customer A | `customers` | read list | own | ALLOW |
| RBAC-CUS-02 | Customer A | `customers` | update | own | ALLOW |
| RBAC-CUS-03 | Customer A | `customers` | read | B | DENY |
| RBAC-CUS-04 | Customer A | `orders` | read list | own | ALLOW |
| RBAC-CUS-05 | Customer A | `orders` | read | B | DENY |
| RBAC-CUS-06 | Customer A | `order_items` | read list | own order lines | ALLOW |
| RBAC-CUS-07 | Customer A | `order_items` | read | B order lines | DENY |
| RBAC-CUS-08 | Customer A | `invoices` | read list | own | ALLOW |
| RBAC-CUS-09 | Customer A | `invoices` | read | B | DENY |
| RBAC-CUS-10 | Customer A | `deliveries` | read list | own | ALLOW |
| RBAC-CUS-11 | Customer A | `deliveries` | read | B | DENY |
| RBAC-CUS-12 | Customer A | `rfq_requests` | create | own payload | ALLOW |
| RBAC-CUS-13 | Customer A | `rfq_requests` | read list | own | ALLOW |
| RBAC-CUS-14 | Customer A | `rfq_requests` | read | B | DENY |
| RBAC-CUS-15 | Customer A | `orders` | create | new | DENY |
| RBAC-CUS-16 | Customer A | `invoices` | update | own | DENY |
| RBAC-CUS-17 | Customer A | `deliveries` | delete | own | DENY |
| RBAC-CUS-18 | Customer B | same as Customer A | mirrored | own vs A | same expectations |

## API endpoints to use

- `POST /auth/login`
- `GET /items/customers`
- `GET /items/orders`
- `GET /items/order_items`
- `GET /items/invoices`
- `GET /items/deliveries`
- `GET /items/rfq_requests`
- `POST /items/rfq_requests`
- `PATCH /items/customers/{id}`
- `PATCH /items/invoices/{id}`
- `POST /items/orders`
- `DELETE /items/deliveries/{id}`

## Evidence rules

- Always test allow and deny paths
- Always test list read and direct record read where possible
- Always test Customer A and Customer B both ways
- Always verify relation-based row filters:
  - `orders -> customer -> user`
  - `order_items -> order -> customer -> user`
  - `deliveries -> order -> customer -> user`
- Treat any cross-customer visibility as critical failure

## Execution result

- Date: 2026-06-09
- Environment: local Docker Compose, Directus `http://localhost:8055`
- Bootstrap verification: PASS via `npm run verify`
- RBAC fixture seed: PASS via `npm run rbac:seed`
- RBAC verification: PASS via `npm run rbac:verify`
- Notes:
  - Root cause was missing policy-to-role binding for custom Directus 11 policies
  - `Editor`, `Sales`, and `Customer` permissions were defined but inactive until policies were attached to roles
  - Bootstrap now verifies bindings through the Directus `/access` junction endpoint instead of assuming `policy.roles` returns role IDs
  - Runtime verification now passes for all four roles: `Admin`, `Editor`, `Sales`, and both mirrored `Customer` tenants
  - Row-level filters were confirmed working for `customers`, `orders`, `order_items`, `invoices`, `deliveries`, and `rfq_requests`
