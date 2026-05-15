package com.watchtonext.api.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "user_watched_movies")
@IdClass(UserWatchedId::class)
class UserWatchedEntity(
    @Id
    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Id
    @Column(name = "movie_id", nullable = false)
    val movieId: Long,

    @Column(name = "watched_at", nullable = false, updatable = false)
    val watchedAt: OffsetDateTime = OffsetDateTime.now(),
)
