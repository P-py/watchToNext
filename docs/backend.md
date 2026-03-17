# Backend Architecture

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

The backend exposes a REST API.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/movies` | Search or list movies |
| `GET` | `/api/movies/{id}` | Movie details |
| `GET` | `/api/recommendations` | KNN-based recommendations |
| `GET` | `/api/users` | User operations |
