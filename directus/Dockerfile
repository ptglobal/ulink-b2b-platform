FROM directus/directus:11

# Bake extension source + per-extension node_modules into the image so the
# extensions can import their own dependencies (e.g. ioredis) without needing
# them installed at runtime. docker-compose.yml bind-mounts only the `src/`
# of each extension on top of this image, leaving the baked `node_modules/`
# intact.
USER root
COPY extensions /directus/extensions
RUN for d in /directus/extensions/*/; do \
      if [ -f "$d/package.json" ]; then \
        echo "Installing deps in $d"; \
        (cd "$d" && npm install --omit=dev --no-audit --no-fund); \
      fi; \
    done
USER node
# Entrypoint inherited from the parent image — runs directus bootstrap + start.
