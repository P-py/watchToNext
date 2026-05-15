package com.watchtonext.api.service

import com.watchtonext.api.dto.FavoriteItemDto
import com.watchtonext.api.dto.RatingItemDto
import com.watchtonext.api.dto.WatchedItemDto
import com.watchtonext.api.persistence.entity.MovieEntity
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

    @Transactional(readOnly = true)
    fun getRating(userId: UUID, movieId: Long): Double? =
        ratingRepository.findById(UserMovieRatingId(userId, movieId))
            .map { it.rating }
            .orElse(null)

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

    @Transactional(readOnly = true)
    fun listFavoriteItems(userId: UUID): List<FavoriteItemDto> {
        val favorites = favoriteRepository.findByUserId(userId)
        val moviesById = moviesByIdFor(favorites.map { it.movieId })
        return favorites
            .mapNotNull { fav -> moviesById[fav.movieId]?.let { FavoriteItemDto.from(fav, it) } }
            .sortedByDescending { it.favoritedAt }
    }

    @Transactional(readOnly = true)
    fun listWatchedItems(userId: UUID): List<WatchedItemDto> {
        val watched = watchedRepository.findByUserId(userId)
        val moviesById = moviesByIdFor(watched.map { it.movieId })
        return watched
            .mapNotNull { entry -> moviesById[entry.movieId]?.let { WatchedItemDto.from(entry, it) } }
            .sortedByDescending { it.watchedAt }
    }

    @Transactional(readOnly = true)
    fun listRatingItems(userId: UUID): List<RatingItemDto> {
        val ratings = ratingRepository.findByUserId(userId)
        val moviesById = moviesByIdFor(ratings.map { it.movieId })
        return ratings
            .mapNotNull { rating -> moviesById[rating.movieId]?.let { RatingItemDto.from(rating, it) } }
            .sortedByDescending { it.ratedAt }
    }

    /** Loads the movies backing a preference list in one query, keyed by id. */
    private fun moviesByIdFor(movieIds: List<Long>): Map<Long, MovieEntity> =
        movieRepository.findAllById(movieIds).associateBy { it.id }
}
