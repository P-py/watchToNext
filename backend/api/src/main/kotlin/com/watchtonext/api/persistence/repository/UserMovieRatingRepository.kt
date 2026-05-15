package com.watchtonext.api.persistence.repository

import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import com.watchtonext.api.persistence.entity.UserMovieRatingId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserMovieRatingRepository : JpaRepository<UserMovieRatingEntity, UserMovieRatingId> {
    fun findByUserId(userId: UUID): List<UserMovieRatingEntity>

    fun countByUserId(userId: UUID): Long
}
