package com.watchtonext.api.service

/**
 * Ordering strategies for the `/movies/popular` catalog explorer.
 *
 * [RELEVANCE] is the default: a Bayesian weighted rating that blends each
 * movie's own score with the catalog mean, so well-known, well-rated classics
 * surface above niche titles and volatile trending entries.
 */
enum class MovieSort {
    RELEVANCE,
    POPULARITY,
    RATING,
    RELEASE,
}
