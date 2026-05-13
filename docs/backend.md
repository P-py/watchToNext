# Backend Architecture

> **Academic project — temporary, non-commercial.** Not a production service and not affiliated with any movie studio, streaming provider, or TMDB. See the [README](../README.md) for the full disclaimer.

> Note: The backend is scaffolded (Spring Boot application boots) but feature implementation is not yet complete. Endpoints and configuration may change during development.

## Technology Stack

- Kotlin · Spring Boot
- PostgreSQL · Flyway (migrations)
- Redis (cache)
- Keycloak (OAuth2 / OpenID Connect)

## Build System

The backend is a **Gradle multi-module monorepo** rooted at `backend/` (Gradle root project: `backend`).

```
backend/
  gradle/
    libs.versions.toml   ← single version catalog (all deps + plugin classpath)
    wrapper/
  buildSrc/
    src/main/kotlin/
      watchtonext.kotlin-conventions.gradle.kts   ← JVM toolchain, group/version, compiler flags, JUnit
      watchtonext.spring-conventions.gradle.kts   ← Spring Boot + Kotlin plugins, base deps
    build.gradle.kts     ← kotlin-dsl; depends on catalog build.* entries
    settings.gradle.kts  ← loads libs catalog from ../gradle/libs.versions.toml
  api/                   ← :api — Spring Boot REST layer; depends on :engine
    build.gradle.kts     ← applies spring-conventions, adds module deps, implementation(projects.engine)
  engine/                ← :engine — KNN recommendation logic, pure Kotlin (no Spring)
    build.gradle.kts     ← applies kotlin-conventions only
  settings.gradle.kts    ← foojay resolver, TYPESAFE_PROJECT_ACCESSORS, include(":api", ":engine")
  gradle.properties      ← JVM args, parallel, caching, configuration-cache
```

### Module responsibilities

| Module | Convention | Depends on | Purpose |
|--------|-----------|------------|---------|
| `:api` | `spring-conventions` | `:engine` | Spring Boot REST layer: controllers, DTOs, config, integrations |
| `:engine` | `kotlin-conventions` | — | KNN algorithm, domain models, pure business logic |

### Version catalog

All versions live in `backend/gradle/libs.versions.toml`. Never hardcode versions in `build.gradle.kts` files — add an entry to the catalog and reference it via `libs.*` accessor.

| Prefix | Purpose |
|--------|---------|
| `build.*` | Plugin classpath only — used exclusively in `buildSrc/build.gradle.kts` |
| `spring.*`, `kotlin.*`, `jackson.*`, `postgresql`, `flyway.*` | Runtime / compile dependencies |
| `kotlin-test-junit5`, `junit-platform-launcher` | Test dependencies |

### Adding a new module

1. Create `backend/<module>/` with a `build.gradle.kts` applying the relevant convention plugin.
2. Add `include(":<module>")` to `backend/settings.gradle.kts`.
3. Reference it as `projects.<module>` (type-safe accessor) from other modules.

## Layered Architecture

```mermaid
graph LR
  Controller["Controller\nHTTP endpoints\n& request mapping"]
  Service["Service\nBusiness logic\n& KNN algorithm"]
  Repository["Repository\nDatabase queries\n& persistence"]
  DB[("PostgreSQL\n(seeded from TMDB dataset)")]
  Cache[("Redis")]

  Controller --> Service
  Service --> Repository
  Repository --> DB
  Repository --> Cache
```

## Request Lifecycle

```mermaid
sequenceDiagram
  participant Client
  participant Controller
  participant Service
  participant Repository
  participant DB as PostgreSQL

  Client->>Controller: HTTP Request
  Controller->>Service: delegate (passes DTO)
  Service->>Repository: query movie data
  Repository-->>Service: domain model
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
adapter/       Port implementations (MovieMetadataClient → JPA)
seed/          One-time database seeder (run via ./gradlew :api:dbSetup)
```

## Data

Movie data comes from the [Full TMDB Movies Dataset](https://www.kaggle.com/datasets/asaniczka/tmdb-movies-dataset-2023-930k-movies) (Kaggle, ODC-By license). The system is **fully offline after the initial seed** — no runtime calls to TMDB.

| Step | Command |
|------|---------|
| Download CSV | From Kaggle (see README) — place `TMDB_movie_dataset_v11.csv` at repo root |
| Run Flyway + seed | `./gradlew :api:dbSetup` |

> This product uses the TMDB API but is not endorsed or certified by TMDB.

## API Style

The backend is planned to expose a REST API with the following endpoints (subject to change during implementation):

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/movies?q=&page=&size=`        | Paginated title search (`q` required and `@NotBlank`, 1-indexed `page`, `size` ∈ [1,100]). Returns `PageDto<MovieSummaryDto>` ordered by popularity desc. |
| `GET`  | `/api/movies/{id}`                  | Movie details — returns `MovieSummaryDto`. 404 when the id is unknown. |
| `GET`  | `/api/movies/popular?page=&size=`   | Paginated popular movies (1-indexed `page`, `size` ∈ [1,100]) |
| `GET`  | `/api/recommendations?userId=&limit=` | Personalized recommendations for a user (KNN over the user's ratings, `limit` ∈ [1,100]) |
| `GET`  | `/api/recommendations/similar?movieId=&limit=` | Movies similar to a given movie (single-seed KNN, excludes the seed, `limit` ∈ [1,100]). 404 when the movie is unknown. |
| `GET`  | `/api/users/me`                     | Fetch the current authenticated user's profile |
| `POST` | `/api/users/me/watched`             | Mark a movie as watched for the current user |

## Errors

Every error response — validation, missing resource, conflict, timeout, unknown route, unsupported method/media type, or an uncaught exception — shares the same `ApiError` JSON shape and a controlled `ErrorEnum` code. See [error-handling.md](./error-handling.md) for the full contract, the catalog of codes, and the rules controllers and services must follow.

## Known boot warnings

These are upstream warnings that show up on every boot and are **not actionable in this codebase**. Documented here so they don't get re-investigated each release:

- `WARNING: sun.misc.Unsafe::allocateMemory has been called by io.netty.util.internal.PlatformDependent0` — emitted by Netty (pulled in transitively by Lettuce, the Redis client). Netty 4.2.x still uses `sun.misc.Unsafe` for off-heap allocation; the Netty team is migrating to the JDK Foreign Memory API and the warning will disappear once that lands and Spring Boot bumps its managed version. No behavior impact.
