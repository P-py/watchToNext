# System Architecture

## Architectural Style

The system follows a modular architecture with separation between:

- Presentation Layer (Frontend)
- Application Layer (Backend services)
- Data Layer (Database)
- Infrastructure Layer

## System Overview

```mermaid
graph TD
  Browser([Browser])
  Frontend["Next.js Frontend\n(TypeScript · Tailwind · framer-motion)"]
  Backend["Spring Boot Backend\n(Kotlin · REST API)"]
  PG[("PostgreSQL")]
  Redis[("Redis\n(cache)")]
  Keycloak["Keycloak\n(Auth Server)"]
  TMDB["TMDB API\n(External)"]

  Browser -->|HTTP / SSR| Frontend
  Frontend -->|REST JSON| Backend
  Frontend -->|OAuth2 / OIDC| Keycloak
  Backend -->|JDBC| PG
  Backend -->|Cache| Redis
  Backend -->|Token validation| Keycloak
  Backend -->|HTTP| TMDB
```

## Frontend Architecture

The frontend is built using Next.js with a modular component architecture.

Key principles:

- Reusable UI components
- Separation of UI and business logic
- Service layer for API communication
- Feature-based module organization

```mermaid
graph TD
  Pages["app/\n(Pages & Routing)"]
  Modules["modules/\n(Feature Modules)"]
  Components["components/\n(UI Primitives)"]
  Hooks["hooks/\n(Data Fetching)"]
  Services["services/\n(API Layer)"]
  API["REST API"]

  Pages --> Modules
  Pages --> Components
  Pages --> Hooks
  Modules --> Components
  Hooks --> Services
  Services --> API
```

## Backend Architecture

The backend is built using Kotlin and Spring Boot following a layered architecture.

```mermaid
graph LR
  Client([Client])
  Controller["Controller\n(HTTP endpoints)"]
  Service["Service\n(Business logic)"]
  Repository["Repository\n(Persistence)"]
  Integration["Integration\n(TMDB client)"]
  DB[("PostgreSQL")]
  TMDB["TMDB API"]

  Client -->|Request| Controller
  Controller --> Service
  Service --> Repository
  Repository --> DB
  Service --> Integration
  Integration --> TMDB
  Controller -->|DTO Response| Client
```

## External Integrations

TMDB API

Used for retrieving:

- movie metadata
- genres
- ratings
- movie descriptions
