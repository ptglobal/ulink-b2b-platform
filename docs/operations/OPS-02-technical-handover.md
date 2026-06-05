# OPS-02 — Technical Handover

**Status:** Template (complete at go-live) · **Owner:** Dev B/PM · **Audience:** ULink ops

The contracted "Technical Handover" deliverable. Fill the blanks at handover.

## 1. System map
| Layer | Tech | Where | URL |
|---|---|---|---|
| Frontend | Next.js | Vercel project `____` | https://www.ulink… |
| CMS/API | Directus | VPS `____` | https://cms.ulink… |
| Database | PostgreSQL | VPS (Docker volume `pgdata`) | internal |
| Cache | Redis | VPS / Upstash | internal |
| Media | Files | volume / R2 bucket `____` | — |

## 2. Repositories & branches
- Repo: `____` · default branch `main` · CI: Vercel + `____`.
- Docs: `docs/` (this set). Schema: `directus/SCHEMA.md`.

## 3. Accounts & credentials (transfer securely — never in git)
| System | Account/owner | Handover method |
|---|---|---|
| Vercel | `____` | invite/transfer |
| VPS (SSH) | `____` | key handover |
| Domain/DNS | `____` | registrar access |
| Directus admin | `____` | rotated password |
| Redis/DB | `____` | rotated secrets |
| Cloudflare/Turnstile | `____` | account access |

> Rotate all secrets at handover (SPEC-09).

## 4. Operations
- Deploy: OPS-01. Release: PROC-05. Backups/monitoring: OPS-03.
- Routine: content via Directus admin (GUIDE-01); publishing triggers site revalidate.

## 5. Roles & access (RBAC)
Admin/Editor/Sales/Customer per SPEC-09. List the named people per role at handover.

## 6. Support & maintenance
- Maintenance: 12M VNĐ/year/site (Appendix §1.4) — scope: uptime, security updates,
  backups, minor fixes. Out-of-scope changes → PROC-03.
- Contact/SLA: `____`. Escalation: `____`.

## 7. Known limitations / future
- Live ERP sync is the future Integration phase (ADR-0003); ERP-ready interface present.
- Single-VPS backend (OPS-03 mitigations); managed Postgres is the scale path.

## 8. Handover sign-off
| Role | Name | Date |
|---|---|---|
| Agency (Bên B) | | |
| ULink (Bên A) | | |
