# Deployment — Railway

> **Academic project — temporary, non-commercial.** This runbook deploys the
> whole watchToNext ecosystem to [Railway](https://railway.app) for academic
> validation. It is not a production-hardened guide.

## Why Railway

One project holds every service, GitHub-integrated builds, a private network
(`*.railway.internal`) so only what the browser needs gets a public URL.
Railway has no perpetual free tier — budget a few dollars for the demo window
and delete the project afterwards.

## Architecture — 6 services

| Service | Source | Public? | Notes |
|---------|--------|---------|-------|
| **frontend** | `frontend/Dockerfile` | ✅ public | The Next.js app — the only thing users visit. |
| **keycloak** | `infra/keycloak/Dockerfile` | ✅ public | The browser is *redirected* here to log in, so it cannot be internal. |
| **backend** | `backend/Dockerfile` | 🔒 internal | Reached only by the frontend's BFF proxy, server-side. |
| **postgres** | Railway Postgres | 🔒 internal | App data + (separate schema) Keycloak data. |
| **redis-cache** | Railway Redis | 🔒 internal | Spring response cache. |
| **redis-auth** | Railway Redis | 🔒 internal | BFF session store (token bundles). |

"Internal" = no public domain generated. Services reach each other at
`http://<service>.railway.internal:<port>`.

## Prerequisites

- The repo on GitHub, with `main` at the tagged release.
- `watchtonext-seed.dump` — the sanitized 54,828-movie database dump.
- A tool with `pg_restore` (or run it through a container, see below).

---

## Step 1 — Create the project

New Railway project → **Deploy from GitHub repo** → pick the watchToNext repo.
Railway creates one service; we will add the rest and point each at its
subdirectory.

## Step 2 — Postgres + restore the dump

1. **+ New → Database → PostgreSQL.** Rename it `postgres`.
2. Restore the dump into it. Use the **public** connection string Railway
   shows under the Postgres service → *Connect* (`DATABASE_PUBLIC_URL`):
   ```bash
   pg_restore --no-owner --no-privileges -d "<DATABASE_PUBLIC_URL>" watchtonext-seed.dump
   ```
   No local `pg_restore`? Run it through the image:
   ```bash
   docker run --rm -v "$PWD":/d postgres:16 \
     pg_restore --no-owner --no-privileges -d "<DATABASE_PUBLIC_URL>" /d/watchtonext-seed.dump
   ```
   Do this **before** the backend's first boot — the dump already carries the
   schema and `flyway_schema_history`, so Flyway will see all migrations as
   applied and do nothing.

## Step 3 — Redis ×2

**+ New → Database → Redis**, twice. Rename them `redis-cache` and
`redis-auth`. (Two instances keep the response cache and the session store
isolated, mirroring local `docker-compose`.)

## Step 4 — Keycloak

**+ New → GitHub repo → same repo**, then in the service settings:

- **Root Directory:** `infra/keycloak`
- **Builder:** Dockerfile (auto-detected)
- **Networking:** generate a public domain. Note it as `<KC_URL>`.
- **Variables:**

| Variable | Value |
|----------|-------|
| `KC_DB` | `postgres` |
| `KC_DB_URL` | `jdbc:postgresql://${{postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/${{postgres.PGDATABASE}}` |
| `KC_DB_USERNAME` | `${{postgres.PGUSER}}` |
| `KC_DB_PASSWORD` | `${{postgres.PGPASSWORD}}` |
| `KC_DB_SCHEMA` | `keycloak` |
| `KC_HOSTNAME` | `<KC_URL>` (full `https://…`) |
| `KC_HTTP_ENABLED` | `true` (Railway terminates TLS at the edge) |
| `KC_PROXY_HEADERS` | `xforwarded` |
| `KC_HTTP_PORT` | `8080` |
| `KC_BOOTSTRAP_ADMIN_USERNAME` | a non-default admin name — **not** `admin` |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | a fresh strong password — see warning below |

> ⚠️ **Never use `admin` / `admin` (or any default) — this Keycloak is
> public.** Do not copy the values from `backend/.env`; those are local-dev
> only. Generate a fresh password, e.g. `openssl rand -base64 24`. As a safety
> net the Keycloak image runs a startup guard (`keycloak-entrypoint.sh`) that
> **refuses to boot** if `KC_BOOTSTRAP_ADMIN_PASSWORD` is a well-known weak
> value (`admin`, `password`, `changeme`, …).
>
> The bootstrap admin only seeds on **first boot**. Once Keycloak is up, log
> into `<KC_URL>/admin`, create a permanent admin account (master realm) with
> its own strong password, then **delete the `KC_BOOTSTRAP_ADMIN_*` variables**
> from the service — they have no effect on later boots and shouldn't linger.

`KC_DB_SCHEMA=keycloak` keeps Keycloak's tables out of the app's `public`
schema on the shared Postgres. (A dedicated Postgres service is cleaner but
costs more — fine to share for a demo.)

## Step 5 — Backend (internal)

Add another service from the repo:

- **Root Directory:** `backend`
- **Networking:** **do not** generate a public domain — internal only.
- **Variables:**

| Variable | Value |
|----------|-------|
| `PORT` | `8080` |
| `SERVER_ADDRESS` | `::` (Railway's private network is IPv6-only) |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${{postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/${{postgres.PGDATABASE}}` |
| `SPRING_DATASOURCE_USERNAME` | `${{postgres.PGUSER}}` |
| `SPRING_DATASOURCE_PASSWORD` | `${{postgres.PGPASSWORD}}` |
| `REDIS_URL` | `${{redis-cache.REDIS_URL}}` |
| `KEYCLOAK_JWK_URI` | `<KC_URL>/realms/watchtonext/protocol/openid-connect/certs` |
| `APP_CORS_ALLOWED_ORIGINS` | `<FE_URL>` (the frontend's public URL, from Step 6) |

## Step 6 — Frontend (public)

Add the last service:

- **Root Directory:** `frontend`
- **Networking:** generate a public domain. Note it as `<FE_URL>`.
- **Variables** — note that `NEXT_PUBLIC_*` values are baked in **at build
  time**, so a change to any of them needs a redeploy:

| Variable | Value |
|----------|-------|
| `PORT` | `3000` |
| `NEXT_PUBLIC_USE_MOCKS` | `false` |
| `NEXT_PUBLIC_SHOW_ACADEMIC_DISCLAIMER` | `true` |
| `NEXT_PUBLIC_KEYCLOAK_BASE_URL` | `<KC_URL>` |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `watchtonext` |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `watchtonext-frontend` |
| `NEXT_PUBLIC_AUTH_REDIRECT_URI` | `<FE_URL>` |
| `API_UPSTREAM_URL` | `http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080/api` |
| `KEYCLOAK_JWKS_URL` | `<KC_URL>/realms/watchtonext/protocol/openid-connect/certs` |
| `AUTH_COOKIE_SECURE` | `true` |
| `AUTH_REDIS_URL` | `${{redis-auth.REDIS_URL}}` |
| `SESSION_MAX_LIFESPAN_SECONDS` | `36000` |
| `SESSION_ENCRYPTION_KEY` | a fresh key — `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

Go back to **Step 5** and set the backend's `APP_CORS_ALLOWED_ORIGINS` to this
`<FE_URL>`.

## Step 7 — Point Keycloak's realm at the deployed frontend

The realm import (`infra/keycloak/realm-export.json`) ships with **localhost**
redirect URIs — login will fail in the cloud until they're fixed. The realm is
imported only on first boot, so fix it once in the admin console:

1. Open `<KC_URL>/admin` → log in with the bootstrap admin.
2. Realm **watchtonext** → **Clients → `watchtonext-frontend`**:
   - **Valid redirect URIs:** `<FE_URL>/*`
   - **Web origins:** `<FE_URL>`
3. Save.

(Alternative: edit the redirect URIs in `realm-export.json` to `<FE_URL>`
*before* the first Keycloak deploy. Either works; the console edit is simpler
since you only learn `<FE_URL>` after creating the frontend service.)

The `watchtonext-api` client is bearer-only (no redirect URIs). Its export
secret is the placeholder `dev-only-change-me`; the backend is a pure resource
server and validates tokens via JWKS, so it doesn't consume that secret —
rotating it is good hygiene but not required to boot.

## Verify

1. `<FE_URL>` loads, catalog browses (public).
2. **Criar conta / Entrar** → redirects to `<KC_URL>` (themed login) → back to
   the app authenticated.
3. Favorite / rate / mark watched a movie; check `/suggestions`.
4. The backend has **no** public domain — confirm it's unreachable directly.

## Notes & gotchas

- **Build order:** Postgres (+ restore) → Redis ×2 → Keycloak → backend →
  frontend. The frontend build needs `<KC_URL>` to exist; the backend needs
  `<FE_URL>` for CORS.
- **`NEXT_PUBLIC_*` are build-time.** Changing the Keycloak or redirect URL
  means redeploying the frontend, not just restarting it.
- **Private networking is IPv6.** The backend must bind `::` — that's what
  `SERVER_ADDRESS=::` does. If the frontend gets connection-refused to the
  backend, this is the first thing to check.
- **Don't run `dbSetup` in the cloud.** The catalog comes from the dump; the
  seeder is a local-only tool.
- **Cost:** Keycloak is the heaviest service. Deploy close to the presentation
  and delete the project afterwards.
