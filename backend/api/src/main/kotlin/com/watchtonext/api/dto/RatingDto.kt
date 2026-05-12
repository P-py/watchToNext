package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import java.time.OffsetDateTime
import java.util.UUID

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
