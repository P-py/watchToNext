# ER & Class Diagrams

> **Academic project — temporary, non-commercial.** Not a production service and not affiliated with any movie studio, streaming provider, or TMDB. See the [README](../README.md) for the full disclaimer.

> These diagrams reflect the **implemented** system — the schema comes from the
> Flyway migrations (`backend/api/.../db/migration`) and the classes from the
> `:api` and `:engine` modules. The `.png` exports under `diagrams/` predate the
> implementation and are stale; the Mermaid blocks below are the source of truth.

---

## ER Diagram

The catalog tables (`genres`, `movies`, `movie_genres`) are populated once by the
seeder from the Kaggle dataset. The `users` row is provisioned from the JWT on
first authenticated request; the three preference tables are written by the app.

```mermaid
erDiagram
    genres {
        int id PK
        varchar name
    }
    movies {
        bigint id PK
        bigint tmdb_id UK
        varchar title
        text overview
        varchar poster_path
        numeric vote_average
        int vote_count
        numeric popularity
        date release_date
    }
    movie_genres {
        bigint movie_id PK,FK
        int genre_id PK,FK
    }
    users {
        uuid id PK
        varchar display_name
        varchar email UK
        timestamptz created_at
        timestamptz updated_at
    }
    user_movie_ratings {
        uuid user_id PK,FK
        bigint movie_id PK,FK
        numeric rating
        timestamptz created_at
        timestamptz updated_at
    }
    user_favorites {
        uuid user_id PK,FK
        bigint movie_id PK,FK
        timestamptz created_at
    }
    user_watched_movies {
        uuid user_id PK,FK
        bigint movie_id PK,FK
        timestamptz watched_at
    }

    movies ||--o{ movie_genres : "tagged with"
    genres ||--o{ movie_genres : "tags"
    users ||--o{ user_movie_ratings : "rates"
    movies ||--o{ user_movie_ratings : "rated by"
    users ||--o{ user_favorites : "favorites"
    movies ||--o{ user_favorites : "favorited by"
    users ||--o{ user_watched_movies : "watched"
    movies ||--o{ user_watched_movies : "watched by"
```

---

## Class Diagram

Layered `:api` (controllers → services → repositories) plus the Spring-free
`:engine` module, which the API reaches through the `MovieFeaturesProvider`
port. No live TMDB client — movie data is seeded offline.

```mermaid
classDiagram
    %% ── :api — controllers (thin HTTP) ──
    class MovieController
    class GenreController
    class RecommendationController
    class RatingController
    class FavoriteController
    class WatchedController
    class UserController

    %% ── :api — services ──
    class MovieService {
        +listPopular(page, size) PageDto~MovieSummaryDto~
        +listPopularByGenre(genreId, page, size) PageDto~MovieSummaryDto~
        +searchByTitle(query, page, size) PageDto~MovieSummaryDto~
        +getById(id) MovieSummaryDto
    }
    class GenreService {
        +listGenres() List~GenreDto~
    }
    class RecommendationService {
        +recommendFor(userId, limit) List~RecommendationDto~
        +similarTo(movieId, limit) List~RecommendationDto~
        +recommendFromSeeds(movieIds, limit) List~RecommendationDto~
    }
    class UserPreferenceService {
        +upsertRating(userId, movieId, rating)
        +addFavorite(userId, movieId)
        +markWatched(userId, movieId)
        +listRatingItems(userId) List~RatingItemDto~
        +listFavoriteItems(userId) List~FavoriteItemDto~
        +listWatchedItems(userId) List~WatchedItemDto~
    }
    class UserService {
        +getMe(jwt) UserMeDto
        +updateMe(jwt, request) UserMeDto
    }

    %% ── :api — persistence (Spring Data JPA) ──
    class MovieRepository
    class GenreRepository
    class UserRepository
    class UserMovieRatingRepository
    class UserFavoriteRepository
    class UserWatchedRepository

    %% ── :api — adapter (port implementation) ──
    class MovieFeaturesAdapter {
        +loadCatalog() List~MovieFeatures~
    }

    %% ── :engine — KNN recommender (no Spring) ──
    class MovieFeaturesProvider {
        <<interface>>
        +loadCatalog() List~MovieFeatures~
    }
    class ContentKnnRecommender {
        +recommend(seeds, limit, excluded) List~ScoredMovie~
        -cosineSimilarity(a, b) Double
    }
    class MovieFeatures {
        +Long movieId
        +Set~Int~ genreIds
        +Double voteAverage
        +Int voteCount
        +Double popularity
    }
    class WeightedMovie {
        +Long movieId
        +Double weight
    }
    class ScoredMovie {
        +Long movieId
        +Double score
    }

    MovieController --> MovieService
    GenreController --> GenreService
    RecommendationController --> RecommendationService
    RatingController --> UserPreferenceService
    FavoriteController --> UserPreferenceService
    WatchedController --> UserPreferenceService
    UserController --> UserService

    MovieService --> MovieRepository
    GenreService --> GenreRepository
    UserService --> UserRepository
    UserPreferenceService --> MovieRepository
    UserPreferenceService --> UserMovieRatingRepository
    UserPreferenceService --> UserFavoriteRepository
    UserPreferenceService --> UserWatchedRepository
    RecommendationService --> MovieRepository
    RecommendationService --> ContentKnnRecommender
    RecommendationService --> MovieFeaturesProvider

    MovieFeaturesAdapter ..|> MovieFeaturesProvider
    MovieFeaturesAdapter --> MovieRepository
    ContentKnnRecommender --> MovieFeatures
    ContentKnnRecommender --> WeightedMovie
    ContentKnnRecommender --> ScoredMovie
```
