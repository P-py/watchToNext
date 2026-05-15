package com.watchtonext.api.service

import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import com.watchtonext.api.persistence.entity.UserFavoriteId
import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import com.watchtonext.api.persistence.entity.UserMovieRatingId
import com.watchtonext.api.persistence.entity.UserWatchedEntity
import com.watchtonext.api.persistence.entity.UserWatchedId
import com.watchtonext.api.persistence.repository.MovieRepository
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
import com.watchtonext.api.persistence.repository.UserWatchedRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.OffsetDateTime
import java.util.UUID

@Service
class UserPreferenceService(
    private val ratingRepository: UserMovieRatingRepository,
    private val favoriteRepository: UserFavoriteRepository,
    private val watchedRepository: UserWatchedRepository,
    private val movieRepository: MovieRepository,
    private val recommendationCacheEvictor: RecommendationCacheEvictor,
) {

    @Transactional
    fun upsertRating(userId: UUID, movieId: Long, rating: Double): UserMovieRatingEntity {
        if (!movieRepository.existsById(movieId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Não encontramos o filme solicitado.")
        }
        val id = UserMovieRatingId(userId, movieId)
        val existing = ratingRepository.findById(id).orElse(null)
        val saved = if (existing == null) {
            ratingRepository.save(UserMovieRatingEntity(userId, movieId, rating))
        } else {
            existing.rating = rating
            existing.updatedAt = OffsetDateTime.now()
            ratingRepository.save(existing)
        }
        recommendationCacheEvictor.evictFor(userId)
        return saved
    }

    @Transactional
    fun deleteRating(userId: UUID, movieId: Long) {
        ratingRepository.deleteById(UserMovieRatingId(userId, movieId))
        recommendationCacheEvictor.evictFor(userId)
    }

    @Transactional
    fun addFavorite(userId: UUID, movieId: Long): UserFavoriteEntity {
        if (!movieRepository.existsById(movieId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Não encontramos o filme solicitado.")
        }
        val id = UserFavoriteId(userId, movieId)
        val saved = favoriteRepository.findById(id).orElseGet {
            favoriteRepository.save(UserFavoriteEntity(userId, movieId))
        }
        recommendationCacheEvictor.evictFor(userId)
        return saved
    }

    @Transactional
    fun removeFavorite(userId: UUID, movieId: Long) {
        favoriteRepository.deleteById(UserFavoriteId(userId, movieId))
        recommendationCacheEvictor.evictFor(userId)
    }

    @Transactional(readOnly = true)
    fun listFavorites(userId: UUID): List<UserFavoriteEntity> =
        favoriteRepository.findByUserId(userId)

    @Transactional
    fun markWatched(userId: UUID, movieId: Long): UserWatchedEntity {
        if (!movieRepository.existsById(movieId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Não encontramos o filme solicitado.")
        }
        val id = UserWatchedId(userId, movieId)
        val saved = watchedRepository.findById(id).orElseGet {
            watchedRepository.save(UserWatchedEntity(userId, movieId))
        }
        recommendationCacheEvictor.evictFor(userId)
        return saved
    }

    @Transactional
    fun unmarkWatched(userId: UUID, movieId: Long) {
        watchedRepository.deleteById(UserWatchedId(userId, movieId))
        recommendationCacheEvictor.evictFor(userId)
    }

    @Transactional(readOnly = true)
    fun isWatched(userId: UUID, movieId: Long): Boolean =
        watchedRepository.existsById(UserWatchedId(userId, movieId))
}
