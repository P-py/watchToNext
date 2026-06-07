package com.watchtonext.api.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "recommender")
data class RecommenderProperties(
    /** Multiplier applied on top of the user's rating when the movie is also favorited. */
    val favoriteBoost: Double = 1.2,
    /** Lower bound on vote_count for a movie to be eligible as a recommendation candidate. */
    val minVoteCount: Int = 50,
    /** Max neighbors memoized per seed in the engine (top-K by cosine). Must be >= the largest limit. */
    val neighborCacheSize: Int = 500,
    /** Max distinct seeds kept in the engine's neighbor cache (LRU eviction beyond this). */
    val maxCachedSeeds: Int = 1024,
)
