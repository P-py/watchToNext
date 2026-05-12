package com.watchtonext.api.service

import com.watchtonext.api.config.RecommenderProperties
import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.repository.MovieRepository
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
import com.watchtonext.engine.model.WeightedMovie
import com.watchtonext.engine.port.MovieFeaturesProvider
import com.watchtonext.engine.recommender.ContentKnnRecommender
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import java.util.concurrent.atomic.AtomicReference

@Service
class RecommendationService(
    private val featuresProvider: MovieFeaturesProvider,
    private val ratingRepository: UserMovieRatingRepository,
    private val favoriteRepository: UserFavoriteRepository,
    private val movieRepository: MovieRepository,
    private val properties: RecommenderProperties,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val recommenderRef = AtomicReference<ContentKnnRecommender?>(null)

    @Transactional(readOnly = true)
    fun recommendFor(userId: UUID, limit: Int): List<RecommendationResult> {
        val ratings = ratingRepository.findByUserId(userId)
        if (ratings.isEmpty()) return emptyList()

        val favoriteIds = favoriteRepository.findByUserId(userId).map { it.movieId }.toSet()

        val seeds = ratings.map { r ->
            val multiplier = if (r.movieId in favoriteIds) properties.favoriteBoost else 1.0
            WeightedMovie(movieId = r.movieId, weight = r.rating * multiplier)
        }

        val excluded = ratings.map { it.movieId }.toSet()
        val ranked = recommender().recommend(seeds, limit, excluded)
        if (ranked.isEmpty()) return emptyList()

        val moviesById = movieRepository.findAllById(ranked.map { it.movieId }).associateBy { it.id }
        return ranked.mapNotNull { scored ->
            moviesById[scored.movieId]?.let { RecommendationResult(it, scored.score) }
        }
    }

    private fun recommender(): ContentKnnRecommender {
        recommenderRef.get()?.let { return it }
        synchronized(this) {
            recommenderRef.get()?.let { return it }
            log.info("Building recommender catalog (minVoteCount={})...", properties.minVoteCount)
            val started = System.currentTimeMillis()
            val catalog = featuresProvider.loadCatalog()
            val built = ContentKnnRecommender(catalog)
            recommenderRef.set(built)
            log.info("Recommender ready — {} candidate movies in {} ms",
                catalog.size, System.currentTimeMillis() - started)
            return built
        }
    }
}

data class RecommendationResult(val movie: MovieEntity, val score: Double)
