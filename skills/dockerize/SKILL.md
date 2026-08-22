---
name: dockerize
description: Writes a production-grade Dockerfile and .dockerignore for the current project, then builds and runs the container. Use when asked to dockerize or containerize an app, write a Dockerfile, or get a project running in Docker.
allowed-tools:
  - Bash(docker build:*)
  - Bash(docker run:*)
  - Bash(docker ps:*)
---

# Dockerize

Containerize the current project to a defined standard - not just a Dockerfile
that works, but one that is reproducible, cache-friendly, and safe to ship.

Every Dockerfile this skill produces must meet the standard below. A merely
working Dockerfile that misses the standard is a failed result.

## Process

1. **Detect the stack.** Read the dependency manifests present in the project:
   `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `pom.xml`,
   `Cargo.toml`. Report what was found and what stack you concluded before
   writing any files. If the stack cannot be determined confidently, say so
   and ask - do not guess.
2. **Choose a base image** and state the reason in one line. Prefer official
   images. Prefer slim or alpine variants when the stack tolerates them, and
   say so when it does not (native modules, glibc needs). Never use `:latest`.
3. **Write the Dockerfile** to the standard below. If a Dockerfile already
   exists, ask before overwriting it. Write only the Dockerfile and
   `.dockerignore` - no compose file or other scaffolding unless asked.
4. **Write `.dockerignore`** covering at minimum: `.git`, dependency
   directories (`node_modules`, `__pycache__`, `venv`), build output, `.env`
   and other env files, and local cache directories. Ask before overwriting
   an existing one.
5. **Build** the image, tagged `<project-name>:demo`, where the project
   name comes from the manifest (`name` field) - not the directory name.
6. **Run** the container, mapping the port the app listens on (read it from
   the code or manifest), and report the local URL.
7. **Summarise** in three to five bullets: base image and why, stage count,
   user, cache ordering, exposed port.

## The standard

Every generated Dockerfile must satisfy all of these:

- **Pinned base tag.** Major and minor version, e.g. `node:20.19-alpine`.
  Note in the summary that digest pinning (`@sha256:...`) is the production
  recommendation.
- **Multi-stage build.** Whenever the project installs dependencies or
  compiles code - that is, almost always - use a separate install/build
  stage and a clean runtime stage that copies in only what runs. Single
  stage only when there is genuinely nothing to separate; say so if so.
- **Non-root user.** The final stage sets an explicit `USER` that is not
  root. Use the image's built-in unprivileged user when one exists.
- **Cache-friendly layer order.** Copy dependency manifests and install
  dependencies first; copy application source after. Source edits must not
  invalidate the dependency layer.
- **`.dockerignore` always written** alongside the Dockerfile.
- **Exec-form `CMD`**, e.g. `CMD ["node", "server.js"]` - never shell form.
- **`HEALTHCHECK`** for anything long-running (servers, workers). One-shot
  CLI tools may omit it.

## Safety rules

- Never write secrets, tokens, or credentials into the Dockerfile - not in
  `ENV`, not in `ARG`, not via `COPY`. If a credential is found in the
  project (for example in a `.env` file), report it as a finding and make
  sure `.dockerignore` excludes it. Never bake it into the image.
- Do not overwrite an existing `Dockerfile` or `.dockerignore` without
  asking.

## Rationale

The reasoning behind each rule - why unpinned tags break reproducibility, why
layer order decides cache hits, what root inside a container really risks,
what multi-stage saves - lives in
[references/standards.md](references/standards.md). Read it when you need to
justify a rule to the user or decide whether an exception is warranted.
