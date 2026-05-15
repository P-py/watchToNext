package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import java.time.OffsetDateTime

/**
 * Enriched favorite row for the `/favorites` list page — embeds the full movie
 * summary so the client renders cards without a follow-up request per movie.
 */
data class FavoriteItemDto(
    val movie: MovieSummaryDto,
    val favoritedAt: OffsetDateTime,
) {
    companion object {
        fun from(entity: UserFavoriteEntity, movie: MovieEntity) =
            FavoriteItemDto(MovieSummaryDto.from(movie), entity.createdAt)
    }
}
