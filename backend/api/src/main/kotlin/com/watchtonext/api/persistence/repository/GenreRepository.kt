package com.watchtonext.api.persistence.repository

import com.watchtonext.api.persistence.entity.GenreEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GenreRepository : JpaRepository<GenreEntity, Int>
