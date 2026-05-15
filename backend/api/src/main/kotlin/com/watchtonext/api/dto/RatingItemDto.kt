package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import java.time.OffsetDateTime

/**
 * Enriched rating row for the `/ratings` list page — embeds the full movie
 * summary plus the user's score so the client renders cards without a
 * follow-up request per movie.
 */
data class RatingItemDto(
    val movie: MovieSummaryDto,
    val rating: Double,
    val ratedAt: OffsetDateTime,
) {
    companion object {
        fun from(entity: UserMovieRatingEntity, movie: MovieEntity) =
            RatingItemDto(MovieSummaryDto.from(movie), entity.rating, entity.updatedAt)
    }
}
