# watchToNext

Movie recommendation platform powered by KNN similarity analysis. Discover what to watch next based on movies you already love — not generic popularity rankings.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js · TypeScript · TailwindCSS · framer-motion |
| Backend | Kotlin · Spring Boot · REST API |
| Database | PostgreSQL · Redis · Flyway |
| Auth | Keycloak · OAuth2 / OpenID Connect |
| External | TMDB API |

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

Download the **TMDB 5000 Movie Dataset** from Kaggle:
<https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata>

Place both files in the **repo root** (next to `backend/`):

```
watchToNext/
  tmdb_5000_movies.csv
  tmdb_5000_credits.csv
  backend/
  frontend/
```

The CSVs are gitignored and must never be committed.

#### 2 — Configure PostgreSQL

Ensure a local PostgreSQL instance is running and export connection details:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/watchtonext
export SPRING_DATASOURCE_USERNAME=watchtonext
export SPRING_DATASOURCE_PASSWORD=watchtonext
```

Or edit `backend/api/src/main/resources/application.properties` for local dev.

#### 3 — Create schema + seed data

```bash
cd backend
./gradlew :api:dbSetup
```

This runs **Flyway schema migrations** (creates tables) then **seeds all ~4 800 movies** from the CSVs. The command is idempotent — safe to run multiple times.

To specify a custom CSV location:

```bash
./gradlew :api:dbSetup -Pseed.csvPath=/absolute/path/to/csvs/
```

#### 4 — Run the API server

```bash
./gradlew :api:bootRun      # http://localhost:8080
./gradlew build             # compile + test all modules
```

> After the seed, the CSVs can be deleted — the database is the source of truth.
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

## Commit convention

Conventional Commits with gitmoji — e.g. `✨ feat(search): add debounced input`. Full reference in [`docs/coding-standards.md`](docs/coding-standards.md).
