# ENG-05 — Local Development Setup

**Status:** Baseline · **Owner:** Dev Lead · **Prereqs:** Git, Node 20+, npm 10+, Docker + Compose

## 1. Backend (Directus + Postgres + Redis)
```bash
cp .env.example .env            # edit POSTGRES_*, DIRECTUS_KEY/SECRET, admin creds
docker compose up -d
docker compose ps               # all healthy
# Directus admin → http://localhost:8055
```

## 2. Seed collections (after Directus is healthy)
```bash
cd directus
npm install
npm run bootstrap               # creates roles + collections (extend per SCHEMA.md)
```

## 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # DIRECTUS_URL, REDIS_URL, NEXT_PUBLIC_SITE_URL, (TURNSTILE_*)
npm install
npm run dev                         # http://localhost:3000 → /vi
```

## 4. Verify the stack
- `http://localhost:3000/vi` renders; language switch to `/en`, `/ja` works.
- `GET http://localhost:3000/api/sku/<code>` returns JSON (after a SKU exists).
- Directus admin reachable; a published change shows on the site after revalidate.

## 5. Common commands
| Command | What |
|---|---|
| `npm run dev` | Frontend dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `docker compose logs -f directus` | Backend logs |
| `docker compose down` (`-v` to wipe data) | Stop stack |

## 6. Troubleshooting
- **Frontend can't reach Redis:** ensure compose exposes `6379` (it does) and
  `REDIS_URL=redis://localhost:6379`.
- **Directus 500 on boot:** Postgres not healthy yet — wait for healthcheck.
- **CORS errors:** set Directus `CORS_ORIGIN` to the frontend origin.
- **Secrets:** never commit `.env`/`.env.local` (git-ignored).
