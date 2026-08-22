# Baseline: "Dockerize this app" WITHOUT the skill

Captured 2026-08-23. Fresh session, no skills installed, prompt:
"Dockerize this app so I can run it in a container." run against
`sample-app/`. Output below is verbatim.

---

## Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

# Install dependencies first so this layer is cached until package files change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY server.js ./

# Run as the unprivileged user that ships with the node image
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/health || exit 1

CMD ["node", "server.js"]
```

## .dockerignore

```
# Dependencies are installed inside the image via npm ci
node_modules

# Never bake secrets/local config into the image; pass at runtime instead
.env
.env.*

# Logs and caches
*.log
npm-debug.log*
.npm

# VCS and editor noise
.git
.gitignore
.vscode
.idea

# Docker files themselves aren't needed in the build context output
Dockerfile
.dockerignore
docker-compose.yml
```

## docker-compose.yml

```yaml
services:
  api:
    build: .
    image: sgu-demo-api:latest
    ports:
      - "3000:3000"
    # .env stays on the host (it's dockerignored); values are injected at runtime
    env_file:
      - .env
    restart: unless-stopped
```

## Commands it suggested

```bash
docker build -t sgu-demo-api .
docker run --rm -p 3000:3000 --env-file .env --name sgu-demo-api sgu-demo-api
curl http://localhost:3000/health
```

---

## Note on run-to-run variance (three baseline runs)

- Run 1 (above): `node:20-alpine`, single stage.
- Run 2: `node:22-alpine`, **multi-stage** (deps + runtime), added an
  `.env.example`.
- Run 3: `node:20-alpine`, single stage, `compose.yaml` instead of
  `docker-compose.yml`.

All three: non-root user, cache-friendly copy order, exec-form CMD,
HEALTHCHECK, a `.dockerignore`, and an unrequested compose file. None
pinned a minor version or mentioned digest pinning; the image was tagged
`:latest` each time. A different Dockerfile every run - that inconsistency
is part of what the skill removes.
