# Recommender Model — Variable Reference

> **Academic project — temporary, non-commercial.** Not a production service and not affiliated with any movie studio, streaming provider, or TMDB. See the [README](../README.md) for the full disclaimer.

This document is the single source of truth for the variables the recommender consumes, why each one was chosen, and how they combine into a recommendation. Implementation lives in `:engine` (`ContentKnnRecommender`) and `:api` (`MovieFeaturesAdapter`, `RecommendationService`).

## Approach

**Content-based item-item KNN.** Every movie in the candidate pool is encoded as a numeric vector. Similarity between two movies is **cosine** over that vector. A user's recommendations come from aggregating cosine similarity between the movies they've shown preference for (seeds) and every other candidate, weighted by how strongly they like each seed.

No collaborative filtering, no user-user matrix, no external ratings dataset. The preference signal is built entirely from the user's own in-app behaviour (ratings + favorites).

## Pipeline

```
movies table ──► MovieEntity ──► MovieFeatures ──► numeric vector ──┐
                                                                    ├─► cosine(seed, candidate) × weight ──► score ──► top-N
user_movie_ratings + user_favorites ──► WeightedMovie (seeds) ──────┘
```

## Movie variables (feature vector)

The catalog is built once and cached in memory by `ContentKnnRecommender`. All numeric features are **min-max scaled** to `[0, 1]` so they share range with the binary genre dimensions and so cosine values stay non-negative.

| Variable        | Source column                | Type / encoding                | Rationale |
|-----------------|------------------------------|--------------------------------|-----------|
| **Genres**      | `movie_genres` (M:N)         | one-hot per `genres.id`        | Strongest single signal of "kind of movie". Categorical match dominates the cosine when present. |
| **voteAverage** | `movies.vote_average`        | scalar, min-max `[0, 1]`       | Aggregate quality signal. Differentiates movies inside the same genre. |
| **voteCount**   | `movies.vote_count`          | scalar, min-max `[0, 1]`       | Confidence/popularity weight on `voteAverage` — a 9.5 average from 12 votes shouldn't outrank an 8.0 from 50 000 votes. |
| **popularity**  | `movies.popularity`          | scalar, min-max `[0, 1]`       | TMDB's traffic-based popularity. Captures cultural relevance that ratings alone miss. |

Candidates are filtered up front by `recommender.min-vote-count` (default `50`) so the pool excludes movies with too little rating signal. Configurable in `application.properties`.

## User signal (seed weights)

Built per request by `RecommendationService.recommendFor(userId, limit)` from the two preference tables. There is no `users` table — `userId` is opaque.

| Variable          | Source                                          | Type            | Rationale |
|-------------------|-------------------------------------------------|-----------------|-----------|
| **History**       | `user_movie_ratings` for the user (any rating)  | `List<rated movie>` → seeds | Every rated movie becomes a seed. Movies the user has rated are filtered out of the candidate pool to prevent recommending what they've already seen. |
| **Rating**        | `user_movie_ratings.rating` (`0.0`–`5.0`)       | scalar          | Base weight on the seed. Higher rating ⇒ stronger pull toward similar movies. |
| **Favorite boost**| `user_favorites` for the user (presence)        | multiplier      | If the rated movie is also favorited, the seed weight is multiplied by `recommender.favorite-boost` (default `1.2`). Favoriting amplifies — it doesn't replace — the rating signal. |

Final per-seed weight:

```
weight = rating × (favoriteBoost if favorited else 1.0)
```

Final candidate score:

```
score(c) = Σ_{s ∈ seeds}  cosine(vec(s), vec(c)) × weight(s)
```

Already-rated movies are excluded. Results are sorted by `score` descending, ties broken by `movieId` ascending so the same input always produces the same output.

## Variables rejected (and why)

| Rejected             | Reason |
|----------------------|--------|
| **Cast / credits**       | Not present in the Kaggle 930k dataset. Adding it would require a separate credits seeder and is out of scope for the current model. |
| **Overview embeddings** | Significant infrastructure cost (embedding model, vector store) for marginal academic-demo gain. Deferred indefinitely. |
| **MovieLens user ratings** | Irrelevant: the recommender consumes the user's own in-app history, not someone else's ratings. |
| **Session telemetry** (clicks, watch time, completion rate) | No instrumentation exists. Out of scope for the demo. |
| **Per-dimension weighting**  | All dimensions contribute equally to the cosine. Tuning weights belongs to a later evaluation pass once we have offline metrics. |
| **`release_date` / recency** | Available in the schema but not currently used. Candidate for a future expansion of the feature vector. |

## Configuration

| Property                          | Default | Effect |
|-----------------------------------|---------|--------|
| `recommender.favorite-boost`      | `1.2`   | Multiplier applied to a seed's weight when the movie is also favorited. |
| `recommender.min-vote-count`      | `50`    | Lower bound on `vote_count` for a movie to be eligible as a candidate. Set to `0` to open up the full catalog. |

## Implementation pointers

- Vector construction & cosine: `backend/engine/src/main/kotlin/com/watchtonext/engine/recommender/ContentKnnRecommender.kt`
- Adapter `MovieEntity → MovieFeatures`: `backend/api/src/main/kotlin/com/watchtonext/api/adapter/MovieFeaturesAdapter.kt`
- Orchestration & seed building: `backend/api/src/main/kotlin/com/watchtonext/api/service/RecommendationService.kt`
- Unit tests covering ranking behaviour: `backend/engine/src/test/kotlin/com/watchtonext/engine/recommender/ContentKnnRecommenderTest.kt`
