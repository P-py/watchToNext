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

    /**
     * Orders the catalog by a Bayesian weighted rating
     * `WR = (v / (v + m)) * R + (m / (v + m)) * C`, where `v`/`R` are the
     * movie's vote count and average, `m` is [minVotes] (the prior weight) and
     * `C` is the catalog-wide mean rating. This favours movies that are both
     * highly rated **and** widely voted on — the most-known classics — over
     * niche high scores and recency-biased trending titles.
     */
    @Query(
        value = """
            SELECT m.* FROM movies m
            ORDER BY (
                CAST(COALESCE(m.vote_count, 0) AS numeric) / (COALESCE(m.vote_count, 0) + :minVotes)
                    * COALESCE(m.vote_average, 0)
                + CAST(:minVotes AS numeric) / (COALESCE(m.vote_count, 0) + :minVotes)
                    * (SELECT COALESCE(AVG(a.vote_average), 0) FROM movies a WHERE a.vote_count > 0)
            ) DESC
        """,
        countQuery = "SELECT COUNT(*) FROM movies",
        nativeQuery = true,
    )
    fun findTopByWeightedRating(minVotes: Int, pageable: Pageable): Page<MovieEntity>

    @Query("SELECT m FROM MovieEntity m WHERE m.voteCount >= :minVoteCount")
    fun findRecommendationCandidates(minVoteCount: Int): List<MovieEntity>

    @Query(
        value = "SELECT m FROM MovieEntity m JOIN m.genres g " +
            "WHERE g.id = :genreId ORDER BY m.popularity DESC NULLS LAST",
        countQuery = "SELECT COUNT(m) FROM MovieEntity m JOIN m.genres g WHERE g.id = :genreId",
    )
    fun findTopByPopularityAndGenre(genreId: Int, pageable: Pageable): Page<MovieEntity>
}
