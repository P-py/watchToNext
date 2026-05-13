package com.watchtonext.api.dto

import com.watchtonext.api.service.RecommendationResult
import java.time.LocalDate

data class RecommendationDto(
    val movieId: Long,
    val tmdbId: Long,
    val title: String,
    val posterPath: String?,
    val voteAverage: Double?,
    val releaseDate: LocalDate?,
    val score: Double,
) {
    companion object {
        fun from(r: RecommendationResult) = RecommendationDto(
            movieId = r.movie.id,
            tmdbId = r.movie.tmdbId,
            title = r.movie.title,
            posterPath = r.movie.posterPath,
            voteAverage = r.movie.voteAverage,
            releaseDate = r.movie.releaseDate,
            score = r.score,
        )
    }
}
