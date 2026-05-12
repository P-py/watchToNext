package com.watchtonext.api.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "user_favorites")
@IdClass(UserFavoriteId::class)
class UserFavoriteEntity(
    @Id
    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Id
    @Column(name = "movie_id", nullable = false)
    val movieId: Long,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
)
