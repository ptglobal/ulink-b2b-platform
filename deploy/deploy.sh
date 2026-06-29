#!/usr/bin/env bash
# ULink one-shot deploy: (re)build the self-contained stack with the production
# overlay, wait for Directus health, then run the idempotent bootstrap.
#
# Used by both the manual first deploy and the .gitlab-ci.yml `deploy` job. Runs
# fine as the non-root gitlab-runner user: uploads live in a docker named volume
# (container-owned), so no chown is needed; the user only needs docker access.
# Run from the deploy root (the dir holding docker-compose.yml).
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

echo ">> Building + (re)creating the stack (prod overlay: infra on loopback, Directus on :8055)"
$COMPOSE up -d --build --remove-orphans

echo ">> Waiting for Directus health (max 300s)"
for i in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8055/server/health || true)"
  if [ "$code" = "200" ]; then echo "   healthy after $((i * 5))s"; break; fi
  if [ "$i" -eq 60 ]; then
    echo "!! Directus not healthy (last HTTP code: $code)" >&2
    $COMPOSE logs --tail=60 directus >&2 || true
    exit 1
  fi
  sleep 5
done

# ── Fresh seed: nuke everything when FRESH_SEED=true ──
if [ "${FRESH_SEED:-false}" = "true" ]; then
  echo ">> FRESH_SEED=true — wiping database, uploads, and cache..."

  # 1. Drop + recreate database
  set -a; source .env; set +a
  $COMPOSE exec -T postgres \
    psql -U "$POSTGRES_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\" WITH (FORCE);" \
    -c "CREATE DATABASE \"$POSTGRES_DB\" OWNER \"$POSTGRES_USER\";"
  echo "   Database recreated."

  # 2. Wipe all uploaded files
  $COMPOSE exec -T directus sh -c 'rm -rf /directus/uploads/* 2>/dev/null || true'
  echo "   Uploads cleared."

  # Copy seed PDFs to uploads directory with UUID names on the host
  mkdir -p directus/uploads
  cp "pdf/file _1.pdf" "directus/uploads/135cf49a-528d-468e-bf03-8ab05c12670f.pdf"
  cp "pdf/file _2.pdf" "directus/uploads/17e93170-4d2b-4a45-b18f-a4c3f8ab2f48.pdf"
  cp "pdf/file _3.pdf" "directus/uploads/22a340ce-b785-4543-b1ef-4cf3eec8e9aa.pdf"
  echo "   Seed files copied to uploads."

  # 3. Flush Redis cache
  $COMPOSE exec -T redis redis-cli FLUSHALL
  echo "   Redis flushed."

  # 4. Restart Directus so it runs migrations on the empty DB
  echo "   Restarting Directus to apply migrations..."
  $COMPOSE restart directus
  for i in $(seq 1 60); do
    code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8055/server/health || true)"
    if [ "$code" = "200" ]; then echo "   healthy after restart ($((i * 5))s)"; break; fi
    if [ "$i" -eq 60 ]; then
      echo "!! Directus not healthy after DB reset" >&2; exit 1
    fi
    sleep 5
  done
fi

echo ">> Running idempotent bootstrap (collections/roles/seed) over the internal network"
$COMPOSE run --rm --no-deps -T directus-bootstrap \
  sh -lc 'npm install --no-audit --no-fund --loglevel=error && npm run bootstrap'

echo ">> Deploy complete:"
$COMPOSE ps
