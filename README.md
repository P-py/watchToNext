# watchToNext

Movie recommendation platform powered by KNN similarity analysis. Discover what to watch next based on movies you already love — not generic popularity rankings.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js · TypeScript · TailwindCSS · framer-motion |
| Backend | Kotlin · Spring Boot · REST API |
| Database | PostgreSQL · Redis · Flyway |
| Auth | Keycloak · OAuth2 / OpenID Connect |
| Data | TMDB (via static dataset seed) |

## Getting started

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev          # http://localhost:3000
```

> Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local` to run with mock data while the backend is not yet running.

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

#### 2 — Start the databases

```bash
cp .env.example .env          # first time only
docker compose up -d
```

This starts **PostgreSQL** (port 5432) and **Redis** (port 6379). Both have health checks — wait until `docker compose ps` shows them as `healthy`.

#### 3 — Create schema + seed data

```bash
cd backend
./gradlew :api:dbSetup
```

This runs **Flyway schema migrations** (creates tables) then **seeds all ~1 M movies** from the CSV. The command is idempotent — safe to run multiple times. With a 629 MB dataset expect **10–20 minutes**; progress is logged every 500 rows.

To specify a custom CSV location:

```bash
./gradlew :api:dbSetup -Pseed.csvPath=/absolute/path/to/csv/
```

#### 4 — Run the API server

```bash
./gradlew :api:bootRun      # http://localhost:8080
./gradlew build             # compile + test all modules
```

> After the seed the CSV can be deleted — the database is the source of truth.
> See [`docs/backend.md`](docs/backend.md) for full architecture details.

## Project structure

```
frontend/         Next.js application
docs/             Architecture and standards documentation
CLAUDE.md         AI assistant context and conventions
```

## Documentation

| File | Contents |
|---|---|
| [`docs/project-overview.md`](docs/project-overview.md) | Goals and core features |
| [`docs/architecture.md`](docs/architecture.md) | System architecture |
| [`docs/frontend.md`](docs/frontend.md) | Frontend stack and typography |
| [`docs/backend.md`](docs/backend.md) | Backend stack and API shape |
| [`docs/coding-standards.md`](docs/coding-standards.md) | Code style, naming, animations, commit convention |

## Attribution

Movie data is provided by [The Movie Database (TMDB)](https://www.themoviedb.org).

> This product uses the TMDB API but is not endorsed or certified by TMDB.

The dataset is sourced from the [Full TMDB Movies Dataset](https://www.kaggle.com/datasets/asaniczka/tmdb-movies-dataset-2023-930k-movies) on Kaggle, licensed under [ODC Attribution (ODC-By)](https://opendatacommons.org/licenses/by/1-0/). Use is non-commercial and academic only, in accordance with [TMDB's Terms of Use](https://www.themoviedb.org/api-terms-of-use).

## Commit convention

Conventional Commits with gitmoji — e.g. `✨ feat(search): add debounced input`. Full reference in [`docs/coding-standards.md`](docs/coding-standards.md).
