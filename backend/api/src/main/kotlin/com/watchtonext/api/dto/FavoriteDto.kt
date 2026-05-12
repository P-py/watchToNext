package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import java.time.OffsetDateTime
import java.util.UUID

data class FavoriteDto(
    val userId: UUID,
    val movieId: Long,
    val createdAt: OffsetDateTime,
) {
    companion object {
        fun from(e: UserFavoriteEntity) = FavoriteDto(e.userId, e.movieId, e.createdAt)
    }
}
