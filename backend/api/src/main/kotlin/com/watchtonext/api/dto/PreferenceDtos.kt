package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import com.watchtonext.api.service.RecommendationResult
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import java.time.OffsetDateTime
import java.util.UUID

data class RateMovieRequest(
    @field:NotNull
    @field:DecimalMin("0.0")
    @field:DecimalMax("5.0")
    val rating: Double?,
)

data class RatingDto(
    val userId: UUID,
    val movieId: Long,
    val rating: Double,
    val updatedAt: OffsetDateTime,
) {
    companion object {
        fun from(e: UserMovieRatingEntity) = RatingDto(e.userId, e.movieId, e.rating, e.updatedAt)
    }
}

data class FavoriteDto(
    val userId: UUID,
    val movieId: Long,
    val createdAt: OffsetDateTime,
) {
    companion object {
        fun from(e: UserFavoriteEntity) = FavoriteDto(e.userId, e.movieId, e.createdAt)
    }
}

data class RecommendationDto(
    val movieId: Long,
    val tmdbId: Long,
    val title: String,
    val posterPath: String?,
    val voteAverage: Double?,
    val score: Double,
) {
    companion object {
        fun from(r: RecommendationResult) = RecommendationDto(
            movieId = r.movie.id,
            tmdbId = r.movie.tmdbId,
            title = r.movie.title,
            posterPath = r.movie.posterPath,
            voteAverage = r.movie.voteAverage,
            score = r.score,
        )
    }
}
