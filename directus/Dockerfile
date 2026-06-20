FROM directus/directus:11

# Bake extension source + per-extension node_modules into the image so the
# extensions can import their own dependencies (e.g. ioredis, argon2) without
# needing them installed at runtime. docker-compose.yml bind-mounts only the
# `src/` of each extension on top of this image for local dev; the production
# overlay (docker-compose.prod.yml) drops those mounts and runs the extensions
# straight from this self-contained image.
USER root
COPY extensions /directus/extensions
RUN for d in /directus/extensions/*/; do \
      if [ -f "$d/package.json" ]; then \
        echo "Installing deps in $d"; \
        (cd "$d" && npm install --omit=dev --no-audit --no-fund); \
      fi; \
      # The project ships extensions as plain ESM and "builds" by copying
      # src/ -> dist/ (see directus/package.json `ext:build`). dist/ is
      # git-ignored, so generate it here to keep the image self-contained.
      if [ -d "$d/src" ]; then \
        echo "Building dist for $d"; \
        mkdir -p "$d/dist" && cp -a "$d/src/." "$d/dist/"; \
      fi; \
    done
RUN chown -R node:node /directus/extensions
USER node
# Entrypoint inherited from the parent image — runs directus bootstrap + start.
