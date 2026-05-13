# ER & Class Diagrams

> **Academic project — temporary, non-commercial.** Not a production service and not affiliated with any movie studio, streaming provider, or TMDB. See the [README](../README.md) for the full disclaimer.

> These diagrams reflect the **planned backend design** derived from the frontend type definitions, API contracts, and architecture docs.

---

## ER Diagram

```mermaid
erDiagram
    MOVIE {
        bigint id PK
        int tmdb_id UK
        varchar title
        text overview
        varchar poster_path
        varchar backdrop_path
        date release_date
        decimal vote_average
        int vote_count
        int runtime
    }

    GENRE {
        int id PK
        varchar name
    }

    PERSON {
        bigint id PK
        int tmdb_id UK
        varchar name
        varchar profile_path
    }

    USER {
        uuid id PK
        varchar username
        varchar email UK
        varchar avatar_url
    }

    MOVIE_GENRE {
        bigint movie_id FK
        int genre_id FK
    }

    MOVIE_CAST {
        bigint movie_id FK
        bigint person_id FK
        varchar character
    }

    USER_WATCHED_MOVIE {
        uuid user_id FK
        bigint movie_id FK
        timestamp watched_at
    }

    USER_FAVORITE_GENRE {
        uuid user_id FK
        int genre_id FK
    }

    MOVIE ||--o{ MOVIE_GENRE : "belongs to"
    GENRE ||--o{ MOVIE_GENRE : "tags"
    MOVIE ||--o{ MOVIE_CAST : "features"
    PERSON ||--o{ MOVIE_CAST : "acts in"
    USER ||--o{ USER_WATCHED_MOVIE : "watches"
    MOVIE ||--o{ USER_WATCHED_MOVIE : "watched by"
    USER ||--o{ USER_FAVORITE_GENRE : "prefers"
    GENRE ||--o{ USER_FAVORITE_GENRE : "preferred by"
```

---

## Class Diagram

```mermaid
classDiagram
    %% ── Controllers ──
    class MovieController {
        +getMovies(query, page) PaginatedResponseDTO~MovieDTO~
        +getMovieById(id) MovieDetailsDTO
        +getPopularMovies(page) PaginatedResponseDTO~MovieDTO~
    }
    class RecommendationController {
        +getRecommendations(movieId) List~MovieDTO~
        +getPersonalized() List~MovieDTO~
    }
    class UserController {
        +getProfile() UserProfileDTO
        +addWatched(movieId) void
    }

    %% ── Services ──
    class MovieService {
        +findAll(query, page) PaginatedResponse~Movie~
        +findById(id) MovieDetails
        +findPopular(page) PaginatedResponse~Movie~
        +findByGenre(genreId, page) PaginatedResponse~Movie~
    }
    class RecommendationService {
        +getForMovie(movieId) List~Movie~
        +getPersonalized(userId) List~Movie~
    }
    class KnnService {
        +buildFeatureVector(movie) DoubleArray
        +findKNearest(target, candidates, k) List~Movie~
        -cosineSimilarity(a, b) Double
    }
    class UserService {
        +getProfile(userId) UserProfile
        +addWatchedMovie(userId, movieId) void
    }

    %% ── Repositories ──
    class MovieRepository {
        +findById(id) Optional~Movie~
        +findByTmdbId(tmdbId) Optional~Movie~
        +findAllByGenre(genreId, pageable) Page~Movie~
        +findPopular(pageable) Page~Movie~
    }
    class UserRepository {
        +findById(id) Optional~User~
        +findByEmail(email) Optional~User~
    }
    class GenreRepository {
        +findAll() List~Genre~
    }

    %% ── Domain Models ──
    class Movie {
        +Long id
        +Int tmdbId
        +String title
        +String overview
        +String posterPath
        +String backdropPath
        +LocalDate releaseDate
        +Double voteAverage
        +Int voteCount
        +Int runtime
        +List~Genre~ genres
    }
    class Genre {
        +Int id
        +String name
    }
    class Person {
        +Long id
        +Int tmdbId
        +String name
        +String profilePath
    }
    class MovieCast {
        +Movie movie
        +Person person
        +String character
    }
    class User {
        +UUID id
        +String username
        +String email
        +String avatarUrl
        +List~Movie~ watchedMovies
        +List~Genre~ favoriteGenres
    }

    %% ── DTOs ──
    class MovieDTO {
        +Long id
        +String title
        +String overview
        +String posterPath
        +String backdropPath
        +String releaseDate
        +Double voteAverage
        +Int voteCount
        +Int runtime
        +List~GenreDTO~ genres
    }
    class MovieDetailsDTO {
        +List~CastMemberDTO~ cast
        +List~MovieDTO~ similarMovies
    }
    class UserProfileDTO {
        +UUID id
        +String username
        +String email
        +String avatarUrl
        +List~MovieDTO~ watchedMovies
        +List~String~ favoriteGenres
    }
    class PaginatedResponseDTO~T~ {
        +List~T~ content
        +Int totalElements
        +Int totalPages
        +Int currentPage
        +Int pageSize
    }

    %% ── Integration ──
    class TmdbClient {
        +searchMovies(query, page) TmdbSearchResponse
        +getMovieDetails(tmdbId) TmdbMovieResponse
        +getPopularMovies(page) TmdbSearchResponse
    }

    %% ── Relationships ──
    MovieController --> MovieService
    RecommendationController --> RecommendationService
    UserController --> UserService

    MovieService --> MovieRepository
    MovieService --> TmdbClient
    RecommendationService --> KnnService
    RecommendationService --> MovieRepository
    RecommendationService --> UserRepository
    UserService --> UserRepository
    UserService --> MovieRepository

    Movie "1" --> "*" Genre
    Movie "1" --> "*" MovieCast
    MovieCast --> Person
    User "1" --> "*" Movie : watched
    User "1" --> "*" Genre : favorites

    MovieDTO --|> MovieDetailsDTO : extends
    MovieDetailsDTO ..> MovieDTO : contains
    UserProfileDTO ..> MovieDTO : contains
```
