package com.watchtonext.engine.model

/** A seed for the recommender: a movie the user liked, weighted by their preference signal. */
data class WeightedMovie(val movieId: Long, val weight: Double)
