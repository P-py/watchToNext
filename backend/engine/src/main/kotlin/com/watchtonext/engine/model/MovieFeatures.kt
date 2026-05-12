package com.watchtonext.engine.model

/**
 * Numeric features used by the content-based KNN recommender.
 * `movieId` is the local DB id (BIGINT), kept stable across calls so the adapter can hydrate results.
 */
data class MovieFeatures(
    val movieId: Long,
    val genreIds: Set<Int>,
    val voteAverage: Double,
    val voteCount: Int,
    val popularity: Double,
)
