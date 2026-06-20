#!/usr/bin/env bash
# Wait for Directus to report healthy, then run the idempotent ULink bootstrap.
#
# The host has no Node toolchain, and bootstrap.mjs + schema/seed/rbac are NOT baked
# into the Directus image (only the extensions are), so we run the bootstrap from a
# throwaway node container with the working tree mounted. `--network host` lets it
# reach the published Directus port on loopback.
#
# Used by both the manual first deploy and the .gitlab-ci.yml deploy job.
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

HEALTH_URL="http://127.0.0.1:8055/server/health"
echo ">> Waiting for Directus health at ${HEALTH_URL} ..."
for i in $(seq 1 60); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo ">> Directus is healthy (after $((i * 5))s)."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "!! Directus did not become healthy within 300s" >&2
    docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=50 directus >&2 || true
    exit 1
  fi
  sleep 5
done

echo ">> Running ULink bootstrap (node:20-alpine, idempotent) ..."
docker run --rm \
  --network host \
  -v "$DIR":/app -w /app/directus \
  --env-file "$DIR/.env" \
  -e DIRECTUS_PUBLIC_URL=http://127.0.0.1:8055 \
  node:20-alpine sh -lc 'npm install --no-audit --no-fund --loglevel=error && npm run bootstrap'

echo ">> Bootstrap complete."
