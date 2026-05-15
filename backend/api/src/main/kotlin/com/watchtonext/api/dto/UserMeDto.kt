package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserEntity
import java.time.OffsetDateTime
import java.util.UUID

data class UserMeDto(
    val id: UUID,
    val displayName: String,
    val email: String?,
    val createdAt: OffsetDateTime,
    val ratingsCount: Long,
    val favoritesCount: Long,
    val watchedCount: Long,
) {
    companion object {
        fun from(
            user: UserEntity,
            ratingsCount: Long,
            favoritesCount: Long,
            watchedCount: Long,
        ) = UserMeDto(
            id = user.id,
            displayName = user.displayName,
            email = user.email,
            createdAt = user.createdAt,
            ratingsCount = ratingsCount,
            favoritesCount = favoritesCount,
            watchedCount = watchedCount,
        )
    }
}
