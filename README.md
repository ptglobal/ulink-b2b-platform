# ULink Industries — B2B Procurement Platform

Monorepo scaffold for the ULink Industries B2B platform.
Delivery plan (scope, architecture, 8-week schedule):
[`docs/plans/2026-06-03-ulink-delivery-plan-fullscope-8wk.md`](docs/plans/2026-06-03-ulink-delivery-plan-fullscope-8wk.md).

## Stack
- **Frontend:** Next.js 14 (App Router) · Tailwind CSS + Shadcn/UI · next-intl (VI / EN / JP)
- **Backend / CMS:** Directus 11 (Admin + REST/GraphQL + Auth + RBAC + i18n + Media Library)
- **Database:** PostgreSQL 16 · **Cache:** Redis 7
- **Infra:** Vercel (frontend) + VPS Docker Compose (Directus + Postgres + Redis)

## Layout
```
.
├─ docker-compose.yml        # Directus + Postgres + Redis
├─ .env.example              # backend/infra env (copy to .env)
├─ directus/                 # CMS config, schema spec, bootstrap
│  ├─ SCHEMA.md              # collections + roles (source of truth)
│  └─ bootstrap.mjs          # creates collections/roles via Directus SDK
├─ frontend/                 # Next.js app
│  ├─ messages/{vi,en,ja}.json
│  └─ src/
│     ├─ app/[locale]/...    # localized routes (vi/en/ja)
│     ├─ app/api/...         # /api/sku (Redis <50ms), /api/rfq
│     ├─ i18n/               # next-intl routing/request/navigation
│     ├─ lib/                # directus + redis clients
│     └─ components/         # layout + ui (shadcn target)
└─ docs/plans/               # delivery plan
```

## Quickstart

### 1. Backend (Directus + Postgres + Redis)
```bash
cp .env.example .env          # then edit secrets
docker compose up -d
# Directus admin → http://localhost:8055  (login with DIRECTUS_ADMIN_EMAIL / PASSWORD)
```

### 2. Seed collections (optional, after Directus is healthy)
```bash
cd directus
npm install
npm run bootstrap             # creates roles + collections per SCHEMA.md
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # set DIRECTUS_URL, REDIS_URL, NEXT_PUBLIC_SITE_URL
npm install
npm run dev                         # http://localhost:3000 → redirects to /vi
```

## Definition of Done (operator-green)
A change is **not** done until: artifact rebuilt → containers force-recreated →
schema/seed applied → **a human opens the URL in a browser and sees the expected
output**. CI-green and staging-green are *not* the bar.

## Status
Scaffold / skeleton only. Pages and collections are stubs — the full build
sequence is in the delivery plan (8 weeks, full contract scope).
