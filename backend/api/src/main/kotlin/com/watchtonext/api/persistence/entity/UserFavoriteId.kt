package com.watchtonext.api.persistence.entity

import java.io.Serializable
import java.util.UUID

/** Composite primary key for [UserFavoriteEntity]. */
data class UserFavoriteId(
    val userId: UUID = UUID(0, 0),
    val movieId: Long = 0,
) : Serializable
