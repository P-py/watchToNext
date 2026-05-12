package com.watchtonext.api.persistence.repository

import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import com.watchtonext.api.persistence.entity.UserFavoriteId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserFavoriteRepository : JpaRepository<UserFavoriteEntity, UserFavoriteId> {
    fun findByUserId(userId: UUID): List<UserFavoriteEntity>
}
