# With skill: "Dockerize this app" WITH the dockerize skill

Captured 2026-08-23. Fresh session, dockerize skill enabled, identical
prompt: "Dockerize this app so I can run it in a container." run against
`sample-app/`. Output below is verbatim (build and run were executed and
verified; container reached `healthy`).

---

## 1. Stack detection and base image (reported before writing files)

**Manifests found:**
- `package.json` — name `sgu-demo-api`, dependencies: `express ^4.21.2`,
  `cors ^2.8.5`, `morgan ^1.10.0`; start script `node server.js`
- `package-lock.json` — lockfile present, so reproducible installs via
  `npm ci` are possible
- No `requirements.txt`, `pyproject.toml`, `go.mod`, `pom.xml`, or
  `Cargo.toml`

**Conclusion:** Node.js Express HTTP API, entrypoint `server.js`,
listening on `process.env.PORT || 3000`.

**Base image:** `node:20.19-alpine` — official Node LTS image pinned to
major.minor; the alpine variant is safe because all three dependencies are
pure JavaScript with no native modules or glibc requirements.

## 2. Dockerfile

```dockerfile
# ---- Stage 1: install production dependencies ----
FROM node:20.19-alpine AS deps
WORKDIR /app

# Copy only the dependency manifests first so source edits
# do not invalidate the installed-dependencies layer.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 2: clean runtime ----
FROM node:20.19-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy only what runs: installed deps, then application source.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js ./

# Use the node image's built-in unprivileged user.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
```

## 3. .dockerignore

```
# Version control
.git
.gitignore

# Dependencies (installed inside the image)
node_modules

# Environment files - never bake secrets into the image
.env
.env.*
*.env

# Logs and caches
*.log
npm-debug.log*
.npm
.cache

# Build output
dist
build

# Docker files themselves
Dockerfile
.dockerignore

# Editor/OS noise
.vscode
.idea
.DS_Store
```

## 4. Build and run (executed)

```
docker build -t sgu-demo-api:demo .
docker run -d --name sgu-demo-api -p 3000:3000 sgu-demo-api:demo
```

- URL: http://localhost:3000/
- `GET /` returned `{"service":"sgu-demo-api","status":"ok"}`;
  `GET /health` returned `{"healthy":true}`
- In-container user verified as `node` (non-root); health status reached
  `healthy`

## 5. Summary (as presented)

- **Base image:** `node:20.19-alpine` (official, version-pinned,
  alpine-safe since all deps are pure JS). For production, pin by digest
  (`node:20.19-alpine@sha256:...`) for full reproducibility.
- **Stages:** 2 — a `deps` stage runs `npm ci --omit=dev`; the `runtime`
  stage copies in only `node_modules`, `package.json`, and `server.js`.
- **User:** `node`, the image's built-in unprivileged user (verified at
  runtime with `whoami`).
- **Cache ordering:** manifests copied and installed before source, so
  editing `server.js` never re-runs `npm ci`.
- **Port:** 3000 exposed and mapped; `HEALTHCHECK` polls `/health` via
  Node's built-in fetch; `CMD` is exec-form.

## 6. Findings (as presented)

- **Credential in project:** `.env` contains
  `API_KEY=demo-not-a-real-secret-1234`. Excluded from the image via
  `.dockerignore`; not baked into any layer. Pass real secrets at runtime
  (`docker run --env-file .env ...`).
- **`.gitignore` gap:** only `*.log` is ignored — `.env` and
  `node_modules` would be committed to git. Worth fixing.
