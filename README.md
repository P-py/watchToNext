# watchToNext

Movie recommendation platform powered by KNN similarity analysis. Discover what to watch next based on movies you already love — not generic popularity rankings.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js · TypeScript · TailwindCSS · framer-motion |
| Backend | Kotlin · Spring Boot · REST API |
| Database | PostgreSQL · Redis |
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

> Not yet implemented. See [`docs/backend.md`](docs/backend.md) for the planned architecture.

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
