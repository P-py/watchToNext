package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserWatchedEntity
import java.time.OffsetDateTime
import java.util.UUID

data class WatchedDto(
    val userId: UUID,
    val movieId: Long,
    val watchedAt: OffsetDateTime,
) {
    companion object {
        fun from(e: UserWatchedEntity) = WatchedDto(e.userId, e.movieId, e.watchedAt)
    }
}
