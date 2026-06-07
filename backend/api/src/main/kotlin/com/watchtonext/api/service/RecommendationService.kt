package com.watchtonext.api.service

import com.watchtonext.api.config.RecommenderProperties
import com.watchtonext.api.dto.RecommendationDto
import com.watchtonext.api.persistence.repository.MovieRepository
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
import com.watchtonext.api.persistence.repository.UserWatchedRepository
import com.watchtonext.engine.model.WeightedMovie
import com.watchtonext.engine.port.MovieFeaturesProvider
import com.watchtonext.engine.recommender.ContentKnnRecommender
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import java.util.concurrent.atomic.AtomicReference

@Service
class RecommendationService(
    private val featuresProvider: MovieFeaturesProvider,
    private val ratingRepository: UserMovieRatingRepository,
    private val favoriteRepository: UserFavoriteRepository,
    private val watchedRepository: UserWatchedRepository,
    private val movieRepository: MovieRepository,
    private val properties: RecommenderProperties,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val recommenderRef = AtomicReference<ContentKnnRecommender?>(null)

    @Cacheable(
        cacheNames = ["recommendations"],
        key = "#userId.toString() + ':' + #limit",
        unless = "#result.isEmpty()",
    )
    @Transactional(readOnly = true)
    fun recommendFor(userId: UUID, limit: Int): List<RecommendationDto> {
        val ratings = ratingRepository.findByUserId(userId)
        if (ratings.isEmpty()) return emptyList()

        val favoriteIds = favoriteRepository.findByUserId(userId).map { it.movieId }.toSet()

        val seeds = ratings.map { r ->
            val multiplier = if (r.movieId in favoriteIds) properties.favoriteBoost else 1.0
            WeightedMovie(movieId = r.movieId, weight = r.rating * multiplier)
        }

        // Exclude both rated and watched movies — never recommend something the user
        // has already seen, even when they watched it without rating it.
        val watchedIds = watchedRepository.findByUserId(userId).map { it.movieId }
        val excluded = ratings.map { it.movieId }.toSet() + watchedIds
        val ranked = recommender().recommend(seeds, limit, excluded)
        if (ranked.isEmpty()) return emptyList()

        val moviesById = movieRepository.findAllById(ranked.map { it.movieId }).associateBy { it.id }
        return ranked.mapNotNull { scored ->
            moviesById[scored.movieId]?.let { RecommendationDto.from(RecommendationResult(it, scored.score)) }
        }
    }

    @Cacheable(
        cacheNames = ["recommendations-similar"],
        key = "#movieId + ':' + #limit",
        unless = "#result.isEmpty()",
    )
    @Transactional(readOnly = true)
    fun similarTo(movieId: Long, limit: Int): List<RecommendationDto> {
        if (!movieRepository.existsById(movieId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Não encontramos o filme solicitado.")
        }

        val seeds = listOf(WeightedMovie(movieId = movieId, weight = 1.0))
        val ranked = recommender().recommend(seeds, limit, setOf(movieId))
        if (ranked.isEmpty()) return emptyList()

        val moviesById = movieRepository.findAllById(ranked.map { it.movieId }).associateBy { it.id }
        return ranked.mapNotNull { scored ->
            moviesById[scored.movieId]?.let { RecommendationDto.from(RecommendationResult(it, scored.score)) }
        }
    }

    /**
     * Recommendations seeded by an ad-hoc set of movies the user picked, each
     * weighted equally. The seeds themselves are excluded from the result.
     *
     * Cached by the *set* of seeds (order-insensitive) + limit via [sortedSeedsKeyGenerator],
     * so `[1,2]` and `[2,1]` share an entry. No eviction: results depend only on movie
     * features, not user state — the cache TTL handles staleness.
     */
    @Cacheable(
        cacheNames = ["recommendations-from"],
        keyGenerator = "sortedSeedsKeyGenerator",
        unless = "#result.isEmpty()",
    )
    @Transactional(readOnly = true)
    fun recommendFromSeeds(movieIds: List<Long>, limit: Int): List<RecommendationDto> {
        val seedIds = movieRepository.findAllById(movieIds).map { it.id }.toSet()
        if (seedIds.isEmpty()) {
            throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Não encontramos os filmes selecionados.",
            )
        }

        val seeds = seedIds.map { WeightedMovie(movieId = it, weight = 1.0) }
        val ranked = recommender().recommend(seeds, limit, seedIds)
        if (ranked.isEmpty()) return emptyList()

        val moviesById = movieRepository.findAllById(ranked.map { it.movieId }).associateBy { it.id }
        return ranked.mapNotNull { scored ->
            moviesById[scored.movieId]?.let { RecommendationDto.from(RecommendationResult(it, scored.score)) }
        }
    }

    /**
     * Eagerly builds the catalog + recommender so the first real request after boot doesn't
     * pay the cold-start cost. Safe to call repeatedly — the build runs at most once per instance.
     */
    fun warmUp() {
        recommender()
    }

    private fun recommender(): ContentKnnRecommender {
        recommenderRef.get()?.let { return it }
        synchronized(this) {
            recommenderRef.get()?.let { return it }
            log.info("Building recommender catalog (minVoteCount={})...", properties.minVoteCount)
            val started = System.currentTimeMillis()
            val catalog = featuresProvider.loadCatalog()
            val built = ContentKnnRecommender(
                catalog,
                neighborCacheSize = properties.neighborCacheSize,
                maxCachedSeeds = properties.maxCachedSeeds,
            )
            recommenderRef.set(built)
            log.info(
                "Recommender ready — {} candidate movies in {} ms",
                catalog.size, System.currentTimeMillis() - started,
            )
            return built
        }
    }
}
