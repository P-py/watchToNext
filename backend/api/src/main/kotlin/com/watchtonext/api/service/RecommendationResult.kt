package com.watchtonext.api.service

import com.watchtonext.api.persistence.entity.MovieEntity

/** A scored recommendation paired with the hydrated movie entity for DTO mapping. */
data class RecommendationResult(val movie: MovieEntity, val score: Double)
