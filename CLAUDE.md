# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Coding standards apply to every change.** See @docs/coding-standards.md — file organization, controller layout, naming, animations, commit conventions. Follow it on all new work without prompting.

## Project Overview

**watchToNext** is a movie recommendation platform that uses KNN (K-Nearest Neighbors) to suggest similar movies based on user selections. It integrates with the TMDB API for movie metadata.

> **Status:** Frontend scaffold complete. Backend not yet implemented.

## Frontend Commands

```bash
cd frontend
npm run dev        # dev server on http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
npx tsc --noEmit   # type check only
```

Copy `frontend/.env.local.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_URL`.

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
  utils/         → helper functions (cn, format, animations)
```

- UI components must not contain business logic — delegate to services and hooks.
- Use TypeScript interfaces (not `type` aliases) for data shapes.
- Pages must be `"use client"` when they use `motion` components from framer-motion.
- Font stack: **DM Sans** (body) + **DM Mono** (code/labels) — configured in `layout.tsx` and `globals.css`. Never override with inline styles or Tailwind `font-*` utilities that bypass the CSS variables.

### Animations — framer-motion

All motion variants are defined in `src/utils/animations.ts`. Never define one-off inline variants.

| Pattern | When to use |
|---|---|
| `AnimatedGrid` + `cardItem` | Any data-driven list (movies, search results) — use `AnimatedGrid` instead of `Grid` |
| `heroStagger` + `fadeUp` | Page hero sections — stagger heading, subtitle, CTAs |
| `AnimatePresence mode="wait"` | Content that conditionally appears or disappears (search results, empty states) |

Only animate `opacity`, `y`, and `scale`. Avoid animating layout-affecting properties (`width`, `height`) as they cause reflows.

### Backend — Kotlin + Spring Boot (Gradle multi-module, root: `backend/`)

| Module | Convention plugin | Purpose |
|--------|------------------|---------|
| `:api` | `spring-conventions` | Spring Boot REST layer: controllers, DTOs, config, TMDB integration |
| `:engine` | `kotlin-conventions` | KNN recommendation algorithm and domain models — no Spring dependency |

Package layout inside each module follows:
```
controller/    → thin HTTP endpoints only          (api)
service/       → orchestration + integration       (api)
repository/    → database queries (PostgreSQL)     (api)
dto/           → request/response shapes           (api)
config/        → Spring configuration classes      (api)
integration/   → TMDB API client                   (api)
model/         → domain models                     (engine)
recommender/   → KNN algorithm                     (engine)
```

- Controllers must be thin — no business logic, only delegation to services.
- KNN logic lives exclusively in `:engine`; `:api` calls it through injected services.
- Use DTOs for all API request/response shapes; never expose domain models directly.

### Infrastructure
- **PostgreSQL** — primary database
- **Redis** — caching layer
- **Keycloak** — authentication via OAuth2/OpenID Connect
- **TMDB API** — external movie metadata source

## Commit Convention

Use **Conventional Commits** with **gitmoji** prefixes:

```
<emoji> <type>[optional scope]: <description>
```

| Emoji | Type | When to use |
|---|---|---|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| ♻️ | `refactor` | Code change that neither fixes a bug nor adds a feature |
| 💄 | `style` | UI / styling changes |
| 📝 | `docs` | Documentation only |
| 🧪 | `test` | Adding or updating tests |
| 🔧 | `chore` | Build process, tooling, dependencies |
| 🚀 | `perf` | Performance improvement |
| 🎉 | `init` | Initial commit / project bootstrap |

Examples:
```
✨ feat(search): add debounced search input
🐛 fix(hooks): move setLoading inside async function to avoid cascade renders
🔧 chore(deps): add clsx and tailwind-merge
```

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
