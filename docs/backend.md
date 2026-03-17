# Backend Architecture

> Note: The backend described here is the **planned/target architecture**. As noted in the root README, the backend implementation is not yet complete, and endpoints/configuration may change during development.

## Technology Stack

- Kotlin
- Spring Boot
- PostgreSQL
- Redis
- Keycloak (authentication)

## Layered Architecture

```mermaid
graph LR
  Controller["Controller\nHTTP endpoints\n& request mapping"]
  Service["Service\nBusiness logic\n& KNN algorithm"]
  Repository["Repository\nDatabase queries\n& persistence"]
  Integration["Integration\nTMDB API client"]
  DB[("PostgreSQL")]
  Cache[("Redis")]
  TMDB["TMDB API"]

  Controller --> Service
  Service --> Repository
  Service --> Integration
  Repository --> DB
  Repository --> Cache
  Integration --> TMDB
```

## Request Lifecycle

```mermaid
sequenceDiagram
  participant Client
  participant Controller
  participant Service
  participant Repository
  participant Integration
  participant DB as PostgreSQL
  participant TMDB as TMDB API

  Client->>Controller: HTTP Request
  Controller->>Service: delegate (passes DTO)
  Service->>Repository: query domain data
  Repository-->>Service: domain model
  Service->>Integration: fetch movie metadata
  Integration->>TMDB: HTTP GET
  TMDB-->>Integration: movie JSON
  Integration-->>Service: mapped metadata
  Service-->>Controller: response DTO
  Controller-->>Client: HTTP Response (JSON)
```

## Backend Structure

```
controller/    HTTP endpoints
service/       Business logic
repository/    Persistence
model/         Domain models
dto/           Data transfer objects
config/        Configuration classes
integration/   External API integration (TMDB)
```

## API Style

The backend is planned to expose a REST API with the following endpoints (subject to change during implementation):

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/movies`                       | Search or list movies (supports filters/query params) |
| `GET`  | `/api/movies/{id}`                  | Movie details |
| `GET`  | `/api/movies/popular`               | List popular movies (used on home screen) |
| `GET`  | `/api/recommendations`              | Recommendations for a movie (requires `movieId` query parameter) |
| `GET`  | `/api/recommendations/personalized` | Personalized recommendations for the current user |
| `GET`  | `/api/users/me`                     | Fetch the current authenticated user's profile |
| `POST` | `/api/users/me/watched`             | Mark a movie as watched for the current user |
