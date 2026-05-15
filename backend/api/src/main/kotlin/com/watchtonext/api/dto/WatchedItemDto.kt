package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.entity.UserWatchedEntity
import java.time.OffsetDateTime

/**
 * Enriched watched row for the `/watched` history page — embeds the full movie
 * summary so the client renders cards without a follow-up request per movie.
 */
data class WatchedItemDto(
    val movie: MovieSummaryDto,
    val watchedAt: OffsetDateTime,
) {
    companion object {
        fun from(entity: UserWatchedEntity, movie: MovieEntity) =
            WatchedItemDto(MovieSummaryDto.from(movie), entity.watchedAt)
    }
}
