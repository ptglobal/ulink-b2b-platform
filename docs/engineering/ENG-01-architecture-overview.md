# ENG-01 — Architecture Overview

**Status:** Baseline · **Owner:** Dev B · **Related:** [delivery plan §4](../plans/2026-06-03-ulink-delivery-plan-fullscope-8wk.md), ADR-0001/0004/0005/0006

## Components
| Component | Tech | Responsibility |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR/ISR pages, portal, API route handlers |
| CMS/API | Directus 11 | Admin, REST/GraphQL, auth, RBAC, i18n, media |
| Database | PostgreSQL 16 | System of record |
| Cache | Redis 7 | SKU cache (<50ms), Directus response cache |
| Edge/CDN | Vercel | Static/ISR delivery |
| Host | VPS + Docker Compose | Directus + Postgres + Redis |

## Topology & data flow
```
Visitor ─▶ Vercel/Edge ─▶ Next.js (SSG/ISR pages, /api/sku, /api/rfq)
                              │ REST/GraphQL        │ Redis
                              ▼                     ▼
                         Directus (VPS) ◀──────── Redis cache
                              ▼
                         PostgreSQL
Editor/Sales ─▶ Directus Admin ─ publish ─▶ webhook ─▶ Next.js revalidate + cache prime
```

## Rendering policy
- **SSG/ISR** for marketing & content pages (revalidate on publish).
- **Client/SSR** for portal, RFQ cart, filters, language switch, forms.
- **Route handlers** for `/api/sku` (Redis), `/api/rfq` (anti-spam -> Directus), `/api/internal/rfq-notify` (Directus Flow webhook -> sales assignment/email/notification), `/api/internal/erp-outbox` (outbox drain worker), and `/api/revalidate` (Directus Flow webhook).
- Content publish loop: Directus publish/unpublish/delete -> webhook -> Next.js `revalidateTag('col:'+collection)` + `revalidateTag('entity:'+collection+':'+id)` + `revalidatePath`.
- RFQ create loop: public submit -> `POST /api/rfq` -> Directus `rfq_requests` row -> `flow-rfq-notify` -> `POST /api/internal/rfq-notify` -> email + Directus notification.
- ERP outbound loop: meaningful order/invoice/delivery change -> Directus `integration_events` outbox row -> `flow-erp-outbox` -> `POST /api/internal/erp-outbox` -> ERP webhook -> status update / retry / DLQ.

## Deployment units
1. **frontend** → Vercel (independent deploy).
2. **backend stack** → `docker-compose.yml` on the VPS (Directus + Postgres + Redis).

## Cross-cutting
- **i18n:** next-intl + Directus Translations (ADR-0004).
- **SEO:** metadata + JSON-LD + sitemap/robots (SPEC-08).
- **Security:** RBAC + row-level, HTTPS, anti-spam, secrets via env (SPEC-09).
- **Performance:** caching + image/JS budgets (SPEC-08, PROC-04).

## Scalability & evolution
- Stateless frontend scales on Vercel; Directus scales vertically first, then
  managed Postgres + multiple Directus replicas behind Redis cache.
- **Integration phase:** NestJS BFF + ERP sync via the ERP-ready interface (ADR-0007, SPEC-04).
