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

The seeder (`SeedMoviesRunner`) **filters out adult titles** — any CSV row whose `adult` column is `true` is skipped (the count is logged). This is an academic project, so adult / inappropriate content never enters the catalog. The filter applies at import time only: a database seeded before this change keeps any adult rows, so re-seed from a clean database to purge them.

| Step | Command |
|------|---------|
| Download CSV | From Kaggle (see README) — place `TMDB_movie_dataset_v11.csv` at repo root |
| Run Flyway + seed | `./gradlew :api:dbSetup` |

> This product uses the TMDB API but is not endorsed or certified by TMDB.

## Keycloak (auth provider)

Keycloak runs as a real service in `docker-compose.yml` (`quay.io/keycloak/keycloak:26.0`, port `8180:8080`). The realm is provisioned on first boot by bind-mounting `infra/keycloak/realm-export.json` and starting with `start-dev --import-realm`. Subsequent boots **do not** re-import — to apply a changed JSON, wipe the volume: `docker compose down keycloak && docker volume rm watchtonext_keycloak_data && docker compose up -d keycloak`.

| What | Where |
|------|-------|
| Admin console | http://localhost:8180/admin (`admin` / `admin` — dev only, from `backend/.env`) |
| OIDC discovery | http://localhost:8180/realms/watchtonext/.well-known/openid-configuration |
| Realm export | `infra/keycloak/realm-export.json` (gold-standard config, see below) |
| Login theme | `infra/keycloak/themes/watchtonext/` — CSS-only restyle of the stock login pages to match the app (dark zinc + amber). Bind-mounted at `/opt/keycloak/themes`; selected via the realm's `loginTheme`. |
| Health check | `/health/ready` on port `9000` (used by the compose healthcheck) |

### Realm `watchtonext`

- **Registration:** open (`registrationAllowed: true`, `registrationEmailAsUsername: true`); email-as-username, no email verification (no SMTP wired), no password reset flow.
- **Password policy:** `length(12) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and notEmail and passwordHistory(3)`.
- **Brute-force protection:** enabled — 5 failures locks the account for 15 minutes (`failureFactor: 5`, `maxFailureWaitSeconds: 900`).
- **Tokens:** 5-minute access token, 30-minute idle SSO session, 10-hour SSO max, refresh-token rotation (`revokeRefreshToken: true`, `refreshTokenMaxReuse: 0`).
- **Events:** user + admin events enabled, 14-day retention — auditable from the admin console.
- **Roles:** realm roles `USER` (default, auto-assigned via the composite `default-roles-watchtonext`) and `ADMIN`.

### Clients

| Client | Type | Purpose |
|--------|------|---------|
| `watchtonext-frontend` | public, PKCE S256 only | Used by the Next.js SPA. Standard flow only — ROPC / implicit / service-accounts all explicitly disabled. Redirect URI `http://localhost:3000/*`. |
| `watchtonext-api` | confidential, bearer-only | Resource server for the Spring Boot backend. Secret in the export is the literal placeholder `dev-only-change-me` — **rotate it via the admin console** in any deployed environment. |

### Deploying to Railway (or similar)

The same image works in production with mode `start --optimized` and these env vars (Postgres reused from the project DB, separate schema):

```
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://<host>:5432/<db>
KC_DB_USERNAME=…
KC_DB_PASSWORD=…
KC_HOSTNAME=<public-fqdn>
KC_PROXY=edge
KC_HTTP_ENABLED=true
KC_BOOTSTRAP_ADMIN_USERNAME=…
KC_BOOTSTRAP_ADMIN_PASSWORD=…
```

The `--import-realm` flag is idempotent — it only imports if the realm doesn't already exist. Safe to leave in the deploy command.

### Token validation in the API

`SecurityConfig` activates `oauth2ResourceServer.jwt()` with the JWK set URI from `application.properties` (`spring.security.oauth2.resourceserver.jwt.jwk-set-uri`). Authorization is selective:

| Endpoint | Auth |
|----------|------|
| `GET /api/movies`, `GET /api/movies/popular`, `GET /api/movies/{id}`, `GET /api/genres` | public — catalog browsing |
| `GET /api/recommendations/similar` | public — used by movie detail page |
| `GET /api/recommendations`, `GET /api/recommendations/from` | authenticated |
| `GET/PUT/DELETE /api/ratings/**` | authenticated |
| `GET/PUT/DELETE /api/favorites/**`, `GET/PUT/DELETE /api/watched/**` | authenticated |
| `OPTIONS /**` | public (CORS pre-flight) |

`config/JwtConverter` extracts realm roles from `realm_access.roles` and maps them to `ROLE_<name>` Spring authorities. `service/UserProvisioningFilter` runs after the Spring Security bearer-token filter and idempotently calls `UserProvisioningService.provision(jwt)` to upsert the `users` row keyed by the JWT `sub`. Failures during provisioning are logged but do not break the request.

On **creation**, `provision()` seeds `displayName` from the JWT claims (`preferred_username` → `name` → synthetic `user-<sub-prefix>` fallback). On **subsequent calls** it only reconciles `email`; `displayName` is owned by the user via `PATCH /api/users/me` and is no longer overwritten from upstream claims. This means a manual rename via `Account Console` in the IdP won't propagate, but the user-driven edit also won't be silently wiped on the next login.

Controllers no longer take `@RequestParam userId`. They read `@AuthenticationPrincipal Jwt jwt` and derive `UUID.fromString(jwt.subject)`. This applies to `RatingController`, `FavoriteController`, and `RecommendationController.recommend()`. `RecommendationController.similar()` stays unauthenticated and has no userId.

## API Style

The backend is planned to expose a REST API with the following endpoints (subject to change during implementation):

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/movies?q=&page=&size=`        | **Public.** Paginated **accent-insensitive substring** title search (`q` required and `@NotBlank`, 1-indexed `page`, `size` ∈ [1,100]), ordered by popularity. Returns `PageDto<MovieSummaryDto>`, **capped to `SEARCH_MAX_RESULTS` (1000)** — a far roomier window than the catalog explorer, since search is intentional in-depth exploration. |
| `GET`  | `/api/movies/suggest?q=&limit=`     | **Public.** Autocomplete — up to `limit` (∈ [1,20], default 8) accent-insensitive substring title matches, **prefix matches ranked first**. Returns a lightweight `MovieSuggestionDto[]` (`{id, title, releaseDate}`). |
| `GET`  | `/api/movies/{id}`                  | **Public.** Movie details — returns `MovieSummaryDto`. 404 when the id is unknown. |
| `GET`  | `/api/movies/popular?page=&size=&genreId=&sort=` | **Public.** Catalog explorer — paginated, **capped to the top `CATALOG_MAX_MOVIES` (200)** titles; deeper exploration is funnelled to title search (1-indexed `page`, `size` ∈ [1,100]). `sort` ∈ `{RELEVANCE, POPULARITY, RATING, RELEASE}`, default `RELEVANCE` — a Bayesian weighted rating that surfaces well-known, well-rated classics first. Optional `genreId` filters to a single genre (always popularity desc, ignores `sort`). |
| `GET`  | `/api/genres`                       | **Public.** All genres as `GenreDto[]` (`{id, name}`), alphabetically — backs the suggestions page genre filter. |
| `GET`  | `/api/recommendations?limit=`       | **Authenticated.** Personalized recommendations (KNN over the caller's ratings; userId from JWT `sub`, `limit` ∈ [1,100]). |
| `GET`  | `/api/recommendations/similar?movieId=&limit=` | **Public.** Movies similar to a given movie (single-seed KNN, excludes the seed, `limit` ∈ [1,100]). 404 when the movie is unknown. |
| `GET`  | `/api/recommendations/from?movieIds=&limit=` | **Authenticated.** Input-seeded recommendations — KNN over an ad-hoc set of movies (`movieIds` 1..50, comma-separated), excluding the seeds. 404 when none of the ids exist. |
| `GET`  | `/api/ratings`                      | **Authenticated.** Lists the caller's ratings as `RatingItemDto[]` (`{movie, rating, ratedAt}`), newest first. |
| `GET`  | `/api/ratings/{movieId}`            | **Authenticated.** Returns `{rating: number\|null}` — the caller's rating for the movie, or `null` when not rated. |
| `PUT`  | `/api/ratings/{movieId}` (body `{rating}`) | **Authenticated.** Upsert a rating for the caller (`rating` ∈ [0.0, 5.0]). |
| `DELETE` | `/api/ratings/{movieId}`          | **Authenticated.** Remove the caller's rating. |
| `GET`  | `/api/favorites`                    | **Authenticated.** Lists the caller's favorites as `FavoriteItemDto[]` (`{movie, favoritedAt}`), newest first. |
| `PUT`  | `/api/favorites/{movieId}`          | **Authenticated.** Mark a movie as favorite for the caller (idempotent). |
| `DELETE` | `/api/favorites/{movieId}`        | **Authenticated.** Remove the favorite. |
| `GET`  | `/api/users/me`                     | **Authenticated.** Returns the caller's profile: `{id, displayName, email, createdAt, ratingsCount, favoritesCount, watchedCount}`. User id is taken from the JWT `sub`; defensively calls `UserProvisioningService` before the read. |
| `PATCH` | `/api/users/me` (body `{displayName}`) | **Authenticated.** Updates the caller's editable profile. Only `displayName` is supported (validated `@NotBlank` + length 1..255; server trims whitespace). Email is read-only and comes from Keycloak. Returns the refreshed `UserMeDto`. `UserProvisioningService` no longer overwrites `displayName` on subsequent logins. |
| `GET`  | `/api/watched`                      | **Authenticated.** Lists the caller's watched movies as `WatchedItemDto[]` (`{movie, watchedAt}`), newest first. |
| `PUT`  | `/api/watched/{movieId}`            | **Authenticated.** Marks a movie as watched for the caller (idempotent). Returns `WatchedDto`. 404 when the movie is unknown. |
| `DELETE` | `/api/watched/{movieId}`          | **Authenticated.** Removes the watched mark. |
| `GET`  | `/api/watched/{movieId}`            | **Authenticated.** Returns `{watched: boolean}` for the caller + movie. |

### Recommendation caching & warm-up

Recommendation responses are cached in Redis (`CacheConfig`): `recommendations` (per user, 2m, evicted on rating/favorite changes), `recommendations-similar` (per movie, 10m), and `recommendations-from` (per seed *set*, 10m). The `/from` key is order-insensitive — `?movieIds=1,2` and `?movieIds=2,1` hit the same entry (`SortedSeedsKeyGenerator`). Cache outages degrade gracefully to a recompute. On top of that, the `:engine` recommender memoizes each seed's neighbor list in-process, and `RecommenderWarmUp` builds the catalog at startup so the first request skips the cold-start cost. See [recommender-model.md](./recommender-model.md#performance--caching--warm-up) for the full picture.

## Catalog ordering — the `RELEVANCE` weighted rating

`GET /api/movies/popular` is the catalog explorer. Its `sort` parameter accepts
four strategies (`MovieSort` enum):

| `sort` | Ordering | Backed by |
|--------|----------|-----------|
| `RELEVANCE` *(default)* | Bayesian weighted rating, desc | `MovieRepository.findTopByWeightedRating` (native query) |
| `POPULARITY` | `popularity` desc, nulls last | `findTopByPopularity` |
| `RATING` | `voteAverage` desc, then `voteCount` desc | `findAll(Pageable)` + `Sort` |
| `RELEASE` | `releaseDate` desc, nulls last | `findAll(Pageable)` + `Sort` |

**Why `RELEVANCE` is not just `popularity`.** TMDB's `popularity` is a
recency/buzz metric — it tracks what is trending *now*, not what is widely
regarded. Ordering by it pushes volatile new releases above well-known classics.
A naive `voteAverage` sort is worse: a movie with a single 10.0 vote outranks
*The Godfather*.

`RELEVANCE` uses the **Bayesian weighted rating** (the IMDB Top-250 formula):

```
WR = (v / (v + m)) · R  +  (m / (v + m)) · C
```

- `R` — the movie's own `voteAverage`
- `v` — the movie's `voteCount`
- `C` — the catalog-wide mean `voteAverage` (computed in-query as
  `AVG(vote_average) WHERE vote_count > 0`)
- `m` — a prior weight: `MovieService.RELEVANCE_MIN_VOTES = 1000`

The term `v / (v + m)` is the *confidence* a movie's own score is trustworthy.
For `v ≫ m` it approaches 1, so high-vote titles keep their own rating; for
`v ≪ m` the score is pulled toward the catalog mean `C`. The net effect: a movie
ranks high only when it is **both highly rated and widely voted on** — the
profile of a well-known classic — while niche high-scores and low-vote obscure
films regress to the mean.

`m` is the tuning knob: raise it to penalise low-vote movies harder, lower it to
trust individual ratings sooner.

**Result cap.** Every `sort` is bounded to the top `CATALOG_MAX_MOVIES = 200`
titles — the shared `cappedResult` helper clamps `totalElements`/`totalPages` and
short-circuits any `page` past the cap with an empty page. **Title search
(`GET /api/movies?q=`) goes through the same helper but with the roomier
`SEARCH_MAX_RESULTS = 1000` window** — search is intentional, in-depth
exploration, so it is bounded only to protect against pathologically broad
queries (count query, cache). The cap does not apply to the `genreId`-filtered
path, which keeps a plain `popularity desc` ordering.

| Endpoint | Cap | Pages @ size 20 |
|----------|-----|-----------------|
| `/movies/popular` (catalog explorer) | `CATALOG_MAX_MOVIES = 200` | 10 |
| `/movies?q=` (title search) | `SEARCH_MAX_RESULTS = 1000` | 50 |

## Title search & autocomplete

Title search (`GET /api/movies?q=`) and autocomplete (`GET /api/movies/suggest?q=`)
both run an **accent-insensitive substring** match:

- The **`unaccent`** extension, added in `V5__search_indexes.sql`, folds accents
  on both sides of the comparison (`amelie` → *Amélie*).
- A row matches when the accent-folded title **contains** the accent-folded
  query — `unaccent(title) ILIKE '%' || unaccent(q) || '%'`.
- **Search** orders results by `popularity` descending.
- **Autocomplete** uses the same match but ranks **prefix matches first**, then
  by popularity, and hard-limits the result set. It returns the lean
  `MovieSuggestionDto` and has its own longer-lived cache (`movies-suggest`).

`V5` is a single idempotent statement (`CREATE EXTENSION … IF NOT EXISTS`) — no
custom functions, no indexes — so it can be applied by hand to a dump-loaded
database as easily as through Flyway. `unaccent` is a *trusted* extension
(PostgreSQL 13+), so no superuser is needed.

> **Migrations run under `:dbSetup`, not `:bootRun`.** A database provisioned
> from a dump (rather than `./gradlew :api:dbSetup`) will not have `V5` — apply
> it manually or run Flyway against that database before the search endpoints
> will work.

## Errors

Every error response — validation, missing resource, conflict, timeout, unknown route, unsupported method/media type, or an uncaught exception — shares the same `ApiError` JSON shape and a controlled `ErrorEnum` code. See [error-handling.md](./error-handling.md) for the full contract, the catalog of codes, and the rules controllers and services must follow.

## Known boot warnings

These are upstream warnings that show up on every boot and are **not actionable in this codebase**. Documented here so they don't get re-investigated each release:

- `WARNING: sun.misc.Unsafe::allocateMemory has been called by io.netty.util.internal.PlatformDependent0` — emitted by Netty (pulled in transitively by Lettuce, the Redis client). Netty 4.2.x still uses `sun.misc.Unsafe` for off-heap allocation; the Netty team is migrating to the JDK Foreign Memory API and the warning will disappear once that lands and Spring Boot bumps its managed version. No behavior impact.
