# PROC-05 — Release & Go-live Runbook

**Status:** Baseline · **Owner:** Dev B/PM · **Related:** OPS-01, TEST-03, ENG-04

Step-by-step cutover. Goal: **operator-green** — ULink sees the live production URL
working before sign-off.

## Pre-flight (T-1 day)
- [ ] Scope frozen; all must-pass UAT items green on staging (TEST-03).
- [ ] Zero open S1; S2 in critical paths resolved.
- [ ] Backups configured + a restore test done (OPS-03).
- [ ] Production `.env` set (real secrets, rotated); domain + DNS ready; SSL provisioned.
- [ ] Content readiness confirmed (VI/EN/JP per policy); media uploaded.

## Cutover
1. **Backend:** on the VPS, pull release; `docker compose pull && docker compose up -d --force-recreate`.
2. **Migrations/seed:** apply Directus schema + any seed/config to the live DB.
3. **Frontend:** deploy to Vercel (production); set production env; bind domain.
4. **DNS/SSL:** point domain; verify HTTPS (HSTS); www/non-www canonical.
5. **Cache:** prime SKU cache; trigger ISR revalidation.

## Smoke tests (production)
- [ ] Home loads on `/vi`, `/en`, `/ja`; language switch works.
- [ ] Product detail + TDS/MSDS download.
- [ ] **Quick Order → submit RFQ** → appears in Directus (Sales).
- [ ] **Portal login** → order history / debt / delivery; row-level correct.
- [ ] `/api/sku/<code>` cache hit < 50ms.
- [ ] sitemap.xml / robots.txt reachable; sample page schema valid.
- [ ] Lighthouse ≥ 90 on a key page (production).

## Operator-green sign-off
- [ ] **ULink opens the production URL and confirms expected output** (TEST-03 sign-off).

## Rollback
- Frontend: Vercel → promote previous deployment.
- Backend: `docker compose` redeploy previous image tag; restore DB from latest backup
  if schema/data changed. Document the trigger + outcome.

## Post-release
- Tag `vX.Y.Z` + release notes. Enable monitoring/alerts (OPS-03). Schedule the
  training session (GUIDE-03). Watch logs/errors for 48h.
