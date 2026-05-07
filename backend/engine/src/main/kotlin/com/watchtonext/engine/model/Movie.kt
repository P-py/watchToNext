package com.watchtonext.engine.model

data class Movie(
    val tmdbId: Long,
    val title: String,
    val overview: String?,
    /** Relative path — prepend https://image.tmdb.org/t/p/w500 for full URL. Null for dataset movies. */
    val posterPath: String?,
    val voteAverage: Double?,
    val voteCount: Int?,
    val genres: List<Genre>,
    val cast: List<CastMember>,
)
