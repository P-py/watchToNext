# Frontend Architecture

## Technology Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- framer-motion (animations)

## Typography

- **Body font:** DM Sans — warm, rounded, comfortable for dark backgrounds
- **Mono font:** DM Mono — matched to DM Sans for code and labels
- Base `line-height: 1.65`, `letter-spacing: 0.01em` for comfortable body reading
- Headings use `letter-spacing: -0.02em` and `font-weight: 600`
- Never override the font stack inline — all font settings flow from `globals.css` and the CSS variables `--font-dm-sans` / `--font-dm-mono`

## Design Principles

The frontend must follow these principles:

- modular components
- reusable UI
- separation of concerns
- scalable architecture
- responsive design

## Component Hierarchy

```mermaid
graph TD
  Pages["app/\nPages & Routing"]
  Modules["modules/\nFeature Modules\n(movies · search · recommendations · user)"]
  Components["components/\nUI Primitives\n(Button · Card · Grid · Modal · Navbar ...)"]
  Hooks["hooks/\nData Fetching\n(useMovies · useSearch · useMovieDetails)"]
  Services["services/\nAPI Layer\n(movies · recommendations · user)"]
  Types["types/\nDomain Interfaces"]
  Utils["utils/\ncn · format · animations"]

  Pages --> Modules
  Pages --> Components
  Pages --> Hooks
  Modules --> Components
  Hooks --> Services
  Services --> Types
  Components --> Utils
  Modules --> Types
```

## Data Flow

```mermaid
sequenceDiagram
  participant Page
  participant Hook
  participant Service
  participant API as REST API

  Page->>Hook: call (e.g. useMovies)
  Hook->>Service: moviesService.getPopular()
  Service->>API: GET /api/movies/popular
  API-->>Service: JSON response
  Service-->>Hook: typed data
  Hook-->>Page: { movies, loading, error }
```

## Folder Structure

```
src/
app/        → Next.js pages and routing
components/ → reusable UI components
modules/    → feature-specific components
services/   → API communication
hooks/      → reusable hooks
types/      → TypeScript interfaces
utils/      → helper functions (cn, format, animations)
```

## UI Components

Examples of reusable components:

- Button
- Card
- Modal
- Navbar
- Input
- Grid / AnimatedGrid
- Pagination

## Feature Modules

```
modules/
  movies/             MovieCard
  search/             SearchBar
  recommendations/    RecommendationGrid
  user/               UserProfile
```

Each module should contain:

components
services
types
hooks

## API base URL

All HTTP calls flow through `services/api.ts`, which prepends a single base URL to every request. **The `/api` prefix lives in the base URL, not in the service paths.** Services therefore call `api.get("/movies/popular")`, never `api.get("/api/movies/popular")` — same convention as the Postman collection in `backend/postman/`.

The base URL is read from `NEXT_PUBLIC_API_URL`:

- **Development** — defaults to `http://localhost:8080/api` if the variable is missing.
- **Production** — the variable is required; `services/api.ts` throws at module load if it is not set.

Next.js env precedence (highest wins): `.env.local` > `.env.production` / `.env.development` > `.env`. Variables exposed to the browser **must** start with `NEXT_PUBLIC_` — without that prefix, Next.js strips them at build time.

Setup:

```bash
cp .env.local.example .env.local   # then edit if your backend is somewhere else
```

Toggle `NEXT_PUBLIC_USE_MOCKS=true` to bypass the network and return mock data from the services — useful while the backend is unavailable.
