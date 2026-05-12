package com.watchtonext.engine.model

/** A scored recommendation result emitted by the recommender. */
data class ScoredMovie(val movieId: Long, val score: Double)
