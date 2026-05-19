# watchToNext

**Built as part of the coursework for 'Software Engineering' @ [Faculty of Engineering of Sorocaba/FACENS](https://facens.br/) under [Prof. Andreia Damasio de Leles](http://lattes.cnpq.br/3196912058595858)**

> **⚠️ Academic project — temporary and non-commercial.**
> Built as coursework / portfolio. Not a production service, not affiliated with any movie studio, streaming provider, or TMDB. Hosted instances may go offline or be wiped without notice. Do not depend on any URL, data, or endpoint provided by this project.

Movie recommendation platform powered by KNN similarity analysis. Discover what to watch next based on movies you already love — not generic popularity rankings.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) · TypeScript · TailwindCSS · framer-motion |
| Backend-for-Frontend | Next.js route handlers (server-side OIDC + BFF proxy) |
| Backend | Kotlin · Spring Boot · REST API (Gradle multi-module: `:api`, `:engine`) |
| Database | PostgreSQL · Flyway (migrations) |
| Cache & session | Redis (recommendation cache) · auth-redis (encrypted BFF sessions) |
| Auth | Keycloak · OAuth2 / OpenID Connect (Authorization Code + PKCE) |
| Data | TMDB (via static dataset seed) |

## Getting started

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev          # http://localhost:3000
```

> The Next app is a **Backend-for-Frontend**: it runs the OIDC flow server-side and proxies API calls to the Spring Boot backend at `API_UPSTREAM_URL`. The browser only ever sees the relative `/api/proxy/*` and an opaque session cookie. Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local` to bypass the BFF and use mock data while the backend is not yet running.
>
> A new `SESSION_ENCRYPTION_KEY` (32 bytes base64) is required for `auth-redis` payload encryption — generate one with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```
>
> Full env-var reference and auth architecture in [`docs/frontend.md`](docs/frontend.md#auth-bff--opaque-session).

### Backend

#### 1 — Download the dataset

Download the **Full TMDB Movies Dataset** from Kaggle:
<https://www.kaggle.com/datasets/asaniczka/tmdb-movies-dataset-2023-930k-movies>

Place the file in the **repo root** (next to `backend/`):

```
watchToNext/
  TMDB_movie_dataset_v11.csv
  backend/
  frontend/
```

The CSV is gitignored and must never be committed.

#### 2 — Start the infrastructure

```bash
cp backend/.env.example backend/.env   # first time only — Postgres + Keycloak + auth-redis credentials
docker compose up -d
```

This starts:

| Service | Port | Purpose |
|---------|------|---------|
| `postgres` | 5432 | App data (movies, ratings, favorites, users) |
| `redis` | 6379 | Recommendation cache (LRU eviction) |
| `auth-redis` | 6380 | BFF session store, password-protected, no eviction, AOF on |
| `keycloak` | 8180 | OIDC provider; realm imported from `infra/keycloak/realm-export.json` on first boot |

All four have health checks — wait until `docker compose ps` reports them as `healthy`. Keycloak admin console: <http://localhost:8180/admin> (`admin` / `admin`, dev only).

#### 3 — Create schema + seed data

```bash
cd backend
./gradlew :api:dbSetup
```

This runs **Flyway schema migrations** (creates tables) then **seeds the movies** from the CSV (~930 k rows; titles flagged `adult` are skipped). The command is idempotent and resumable — interrupting it (Ctrl-C) keeps every committed batch, and re-running picks up where it stopped (duplicates are skipped via `ON CONFLICT`). With a 629 MB dataset expect **10–20 minutes**; progress is logged after every batch commit (default 5 000 rows).

Overrides:

```bash
./gradlew :api:dbSetup -Pseed.csvPath=/absolute/path/to/csv/   # custom CSV location
./gradlew :api:dbSetup -Pseed.batchSize=10000                  # commit every N inserts
./gradlew :api:dbSetup -Pseed.maxRows=50000                    # stop after N inserts
```

#### 4 — Run the API server

```bash
./gradlew :api:bootRun      # http://localhost:8080
./gradlew build             # compile + test all modules
```

> After the seed the CSV can be deleted — the database is the source of truth.
> See [`docs/backend.md`](docs/backend.md) for full architecture details.

## Deployment

The full stack deploys to **Railway** as a single project — frontend and Keycloak public, the backend and the three data stores (PostgreSQL, two Redis) on the private network. Instead of re-running the seeder in the cloud, a `pg_dump` of the seeded database is restored straight into the Railway Postgres.

Dockerfiles live in `frontend/`, `backend/`, and `infra/keycloak/`. Full step-by-step — services, env vars, the dump restore, post-deploy Keycloak config — in [`docs/deployment.md`](docs/deployment.md).

## Project structure

```
backend/          Spring Boot multi-module (Kotlin) — :api + :engine
frontend/         Next.js application + BFF route handlers
infra/            Keycloak realm export and other infrastructure assets
docs/             Architecture and standards documentation
CLAUDE.md         AI assistant context and conventions
```

## Documentation

| File | Contents |
|---|---|
| [`docs/project-overview.md`](docs/project-overview.md) | Goals and core features |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and service topology |
| [`docs/frontend.md`](docs/frontend.md) | Frontend stack, auth BFF, security headers, env vars |
| [`docs/backend.md`](docs/backend.md) | Backend stack, Keycloak setup, API shape |
| [`docs/deployment.md`](docs/deployment.md) | Railway deployment runbook — services, env vars, dump restore |
| [`docs/recommender-model.md`](docs/recommender-model.md) | Recommender feature vector, similarity metric, configuration |
| [`docs/error-handling.md`](docs/error-handling.md) | Error contract, `ApiError` shape, exception handler rules |
| [`docs/coding-standards.md`](docs/coding-standards.md) | Code style, naming, animations, commit convention |
| [`docs/diagrams.md`](docs/diagrams.md) | Architecture diagrams index |

## Attribution

Movie data is provided by [The Movie Database (TMDB)](https://www.themoviedb.org).

> This product uses the TMDB API but is not endorsed or certified by TMDB.

The dataset is sourced from the [Full TMDB Movies Dataset](https://www.kaggle.com/datasets/asaniczka/tmdb-movies-dataset-2023-930k-movies) on Kaggle, licensed under [ODC Attribution (ODC-By)](https://opendatacommons.org/licenses/by/1-0/). Use is non-commercial and academic only, in accordance with [TMDB's Terms of Use](https://www.themoviedb.org/api-terms-of-use).

## Commit convention

Conventional Commits with gitmoji — e.g. `✨ feat(search): add debounced input`. Full reference in [`docs/coding-standards.md`](docs/coding-standards.md).
