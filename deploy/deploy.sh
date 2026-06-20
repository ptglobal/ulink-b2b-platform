#!/usr/bin/env bash
# ULink one-shot deploy: (re)build the self-contained stack with the production
# overlay, wait for Directus health, then run the idempotent bootstrap.
#
# Used by both the manual first deploy and the .gitlab-ci.yml `deploy` job.
# Run from the deploy root (the dir holding docker-compose.yml). Requires root
# (chowns the uploads bind-mount + drives the host docker daemon).
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

echo ">> Ensuring uploads dir is writable by the Directus container user (uid 1000)"
mkdir -p directus/uploads
chown -R 1000:1000 directus/uploads

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

echo ">> Running idempotent bootstrap (collections/roles/seed) over the internal network"
$COMPOSE run --rm --no-deps -T directus-bootstrap \
  sh -lc 'npm install --no-audit --no-fund --loglevel=error && npm run bootstrap'

echo ">> Deploy complete:"
$COMPOSE ps
