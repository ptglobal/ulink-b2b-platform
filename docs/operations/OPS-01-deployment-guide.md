# OPS-01 — Deployment Guide

**Status:** Baseline · **Owner:** Dev B · **Related:** ADR-0006, PROC-05

How to provision and deploy ULink: **frontend on Vercel**, **backend on a VPS** via
Docker Compose.

## 1. Backend — VPS (Directus + Postgres + Redis)
**Prereqs:** a small VPS (2 vCPU / 4 GB+), Docker + Compose, a domain/subdomain
(e.g. `cms.ulink…`) pointed at the VPS.

```bash
git clone <repo> && cd ulink
cp .env.example .env            # set strong POSTGRES_*, DIRECTUS_KEY/SECRET, admin creds,
                                # DIRECTUS_PUBLIC_URL=https://cms.ulink...
docker compose pull
docker compose up -d
docker compose ps               # healthy
```

**HTTPS / reverse proxy:** put Caddy or Nginx in front of Directus (`:8055`) with
Let's Encrypt. Example reverse proxy: `cms.ulink…` → `localhost:8055`. Enable HSTS.

**Seed:** `cd directus && npm install && npm run bootstrap` (then complete collections
per SCHEMA.md). Configure roles/permissions + i18n.

## 2. Frontend — Vercel
- Import the repo; root = `frontend/`. Framework: Next.js (auto).
- **Env vars (Production):** `DIRECTUS_URL=https://cms.ulink…`, `DIRECTUS_TOKEN`,
  `REDIS_URL` (managed Redis or VPS-exposed over TLS), `NEXT_PUBLIC_SITE_URL=https://www.ulink…`,
  `TURNSTILE_*`.
- Bind the production domain; Vercel handles TLS + CDN + ISR.

## 3. Redis access from Vercel
Frontend `/api/sku` needs Redis. Use a managed Redis (Upstash) **or** expose VPS Redis
over TLS with auth (do not expose plaintext to the internet). Update `REDIS_URL`.

## 4. DNS
| Record | Points to |
|---|---|
| `www` / apex | Vercel |
| `cms` | VPS (Directus) |

## 5. CI/CD
- Frontend: Vercel auto-builds on push to `main` (preview on PRs).
- Backend: redeploy via `docker compose pull && up -d --force-recreate` (script/Action).

## 6. Post-deploy
Run the PROC-05 smoke tests. Confirm HTTPS, CORS (`CORS_ORIGIN` = site origin),
backups (OPS-03), and monitoring.

## Environment variables (reference)
Backend: `POSTGRES_*`, `DIRECTUS_KEY/SECRET`, `DIRECTUS_ADMIN_*`, `DIRECTUS_PUBLIC_URL`,
`CACHE_*`, `REDIS`. Frontend: `DIRECTUS_URL`, `DIRECTUS_TOKEN`, `REDIS_URL`,
`NEXT_PUBLIC_SITE_URL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
