# ADR-0006 — Hosting: Vercel (frontend) + VPS Docker Compose (backend)

**Status:** Accepted · **Date:** 2026-06-03 · **Confirm infra payer at kickoff**

## Context
Need cheap, robust hosting with edge delivery for the frontend and a persistent home
for Directus + PostgreSQL + Redis. Must be redeployable per the build-once-redeploy
strategy.

## Decision
- **Frontend:** Vercel (edge CDN, CI/CD, ISR).
- **Backend:** a single small **VPS** running **Docker Compose** (Directus + Postgres
  + Redis) behind Caddy/Nginx with Let's Encrypt HTTPS.
- **Media:** local volume or S3-compatible (Cloudflare R2).

## Consequences
- Low running cost (~$10–25/mo), folds into the annual maintenance fee.
- Fully containerized → cheap re-deployment for future sites (royalty model).
- Single-VPS is a single point of failure → automated Postgres backups + restart
  policy; managed Postgres is a documented upgrade path.

## Alternatives considered
- **Directus Cloud** — simpler ops, higher cost, less portable.
- **All-in on one PaaS** — Vercel can't host Directus/Postgres; splitting is cleanest.
