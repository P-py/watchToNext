# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**watchToNext** is a movie recommendation platform that uses KNN (K-Nearest Neighbors) to suggest similar movies based on user selections. It integrates with the TMDB API for movie metadata.

> **Status:** Early stage — currently documentation/planning phase. No source code has been committed yet.

## Architecture

The system is split into two separate applications:

### Frontend — Next.js + TypeScript + TailwindCSS
```
src/
  app/           → Next.js App Router pages and routing
  components/    → reusable UI components
  modules/       → feature-specific components (movies, search, recommendations, user)
  services/      → API communication layer (all fetch/axios calls live here)
  hooks/         → reusable React logic
  types/         → TypeScript interfaces and types
  utils/         → helper functions
```

- UI components must not contain business logic — delegate to services and hooks.
- Use TypeScript interfaces (not `type` aliases) for data shapes.

### Backend — Kotlin + Spring Boot
```
controller/    → thin HTTP endpoints only
service/       → all business logic
repository/    → database operations (PostgreSQL)
model/         → domain models
dto/           → request/response data transfer objects
config/        → Spring configuration classes
integration/   → TMDB API client
```

- Controllers must be thin — no business logic, only delegation to services.
- Services own all business logic including KNN recommendation logic.
- Use DTOs for all API request/response shapes; never expose domain models directly.

### Infrastructure
- **PostgreSQL** — primary database
- **Redis** — caching layer
- **Keycloak** — authentication via OAuth2/OpenID Connect
- **TMDB API** — external movie metadata source

## Naming Conventions

| Context | Convention |
|---|---|
| React components | PascalCase |
| Variables & functions | camelCase |
| Constants | UPPER_CASE |
| Files | kebab-case or camelCase |

## REST API Endpoints

When the backend is implemented, the API follows this shape:

- `GET /api/movies` — list/search movies
- `GET /api/movies/{id}` — movie details
- `GET /api/recommendations` — KNN-based recommendations
- `GET /api/users` — user operations
