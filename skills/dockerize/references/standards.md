# Why each rule exists

Rationale for the standard in [../SKILL.md](../SKILL.md). One rule per
section, with a bad/good pair.

## Pinned base tags

`:latest` (and bare `node:20`-style tags) move underneath you. The image that
built cleanly today can pull a different OS layer, OpenSSL, or runtime patch
tomorrow - so "works on my machine" stops meaning anything, and a rebuild of
an old commit no longer reproduces the artifact you shipped. Pinning
major.minor freezes the runtime you tested against; pinning the digest
(`@sha256:...`) freezes every byte, which is why it is the production
recommendation.

```dockerfile
# Bad - resolves to something different over time
FROM node:latest

# Good - pinned minor; add @sha256 digest for production
FROM node:20.19-alpine
```

## Cache-friendly layer order

Docker reuses a layer only if every layer above it is unchanged. If you
`COPY . .` before installing dependencies, every source edit invalidates the
copy layer and forces a full dependency reinstall - minutes wasted per build.
Copy the manifests alone, install, then copy source: now edits only rebuild
the cheap final layers.

```dockerfile
# Bad - any source edit reinstalls everything
COPY . .
RUN npm ci

# Good - dependency layer survives source edits
COPY package*.json ./
RUN npm ci
COPY . .
```

## Non-root user

Processes in a container run as root by default, and container root is real
root as far as the kernel is concerned. A code-execution bug in the app then
hands the attacker root inside the container - one kernel or runtime escape
away from the host, and full write access to anything mounted in. Dropping to
an unprivileged user removes that whole class of escalation for free.

```dockerfile
# Bad - implicit root
CMD ["node", "server.js"]

# Good - official node image ships a "node" user
USER node
CMD ["node", "server.js"]
```

## Multi-stage builds

Compilers, dev dependencies, and build caches are needed to *produce* the
app, not to *run* it. A single-stage image ships all of it: hundreds of MB of
extra surface to scan, patch, and download on every deploy. A build stage
that compiles and a runtime stage that copies in only the result keeps the
shipped image small and boring.

```dockerfile
# Bad - toolchain ships to production
FROM node:20.19
COPY . .
RUN npm ci && npm run build
CMD ["node", "dist/main.js"]

# Good - runtime stage carries only what runs
FROM node:20.19 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.19-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "dist/main.js"]
```

## .dockerignore

Without one, `COPY . .` sends the entire directory to the daemon and into
the image: `.git` history, a locally-built `node_modules` (possibly compiled
for the wrong OS), caches - and `.env` files, which quietly bakes local
secrets into a shippable artifact. The ignore file makes the build context
small, fast, and safe.

```text
.git
node_modules
__pycache__
dist
.env
*.log
```

## Exec-form CMD

Shell form (`CMD node server.js`) wraps the app in `/bin/sh -c`, so PID 1 is
the shell, not your process - and the shell does not forward SIGTERM. The
result: `docker stop` waits 10 seconds, then SIGKILLs the app with no
graceful shutdown. Exec form makes the app PID 1 and signals reach it.

```dockerfile
# Bad - sh -c swallows SIGTERM
CMD node server.js

# Good - app receives signals directly
CMD ["node", "server.js"]
```

## HEALTHCHECK

A container can be "running" while the process inside is deadlocked or
returning 500s. `HEALTHCHECK` gives the runtime (and `docker ps`) a real
liveness signal, which orchestrators use to restart or route around a sick
container. Long-running services should have one; one-shot tools do not need
it.

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```
