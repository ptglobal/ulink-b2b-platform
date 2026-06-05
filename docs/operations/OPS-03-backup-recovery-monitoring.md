# OPS-03 — Backup, Recovery & Monitoring

**Status:** Baseline · **Owner:** Dev B · **Related:** OPS-01, PROC-05

## Backups
| Asset | Method | Frequency | Retention |
|---|---|---|---|
| PostgreSQL | `pg_dump` (cron in a sidecar/host) to off-VPS storage (S3/R2) | daily + pre-deploy | 30 days + monthly |
| Media (uploads) | sync `directus/uploads` (or R2 versioning) | daily | 30 days |
| Config/.env | stored in the team secret manager (not git) | on change | current |

Example daily dump:
```bash
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > backup-$(date +%F).sql.gz   # then upload off-box
```

## Recovery (drill at least once before go-live)
1. Provision/clean Postgres. 2. `gunzip < backup.sql.gz | psql …` restore.
3. Restore media. 4. `docker compose up -d`. 5. Smoke test (PROC-05).
Record RTO/RPO; target RPO ≤ 24h, RTO ≤ a few hours.

## Monitoring & alerting
- **Uptime:** external check on `https://www.ulink…` and `https://cms.ulink…/server/health` (Directus health) → alert on failure.
- **Errors:** frontend + API error tracking (e.g. Sentry) — alert on spikes.
- **Performance:** Lighthouse CI trend; CWV from field data (PageSpeed/Vercel Analytics).
- **Infra:** VPS CPU/RAM/disk; Docker container health/restarts; Redis/Postgres up.
- **Logs:** `docker compose logs` retained; rotate; centralize if possible.

## Routine maintenance
Security updates (base images, deps) on a schedule; verify backups weekly; review
Directus activity log; renew/verify TLS auto-renewal.

## Incident response
Detect → triage severity (PROC-01) → mitigate/rollback (PROC-05) → root-cause →
follow-up. Keep a brief incident log.
