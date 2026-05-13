package com.watchtonext.api.persistence.repository

import com.watchtonext.api.persistence.entity.MovieEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface MovieRepository : JpaRepository<MovieEntity, Long> {

    fun findByTmdbId(tmdbId: Long): MovieEntity?

    fun findByTitleContainingIgnoreCase(title: String): List<MovieEntity>

    fun findByTitleContainingIgnoreCaseOrderByPopularityDesc(
        title: String,
        pageable: Pageable,
    ): Page<MovieEntity>

    @Query(
        value = "SELECT m FROM MovieEntity m ORDER BY m.popularity DESC NULLS LAST",
        countQuery = "SELECT COUNT(m) FROM MovieEntity m",
    )
    fun findTopByPopularity(pageable: Pageable): Page<MovieEntity>

    @Query("SELECT m FROM MovieEntity m WHERE m.voteCount >= :minVoteCount")
    fun findRecommendationCandidates(minVoteCount: Int): List<MovieEntity>
}
