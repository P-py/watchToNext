package com.watchtonext.api.persistence.repository

import com.watchtonext.api.persistence.entity.UserWatchedEntity
import com.watchtonext.api.persistence.entity.UserWatchedId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserWatchedRepository : JpaRepository<UserWatchedEntity, UserWatchedId> {
    fun findByUserId(userId: UUID): List<UserWatchedEntity>

    fun countByUserId(userId: UUID): Long
}
