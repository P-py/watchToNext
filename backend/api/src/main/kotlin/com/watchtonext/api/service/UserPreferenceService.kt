package com.watchtonext.api.service

import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import com.watchtonext.api.persistence.entity.UserFavoriteId
import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import com.watchtonext.api.persistence.entity.UserMovieRatingId
import com.watchtonext.api.persistence.repository.MovieRepository
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
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
    private val movieRepository: MovieRepository,
) {

    @Transactional
    fun upsertRating(userId: UUID, movieId: Long, rating: Double): UserMovieRatingEntity {
        if (!movieRepository.existsById(movieId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "movie $movieId not found")
        }
        val id = UserMovieRatingId(userId, movieId)
        val existing = ratingRepository.findById(id).orElse(null)
        return if (existing == null) {
            ratingRepository.save(UserMovieRatingEntity(userId, movieId, rating))
        } else {
            existing.rating = rating
            existing.updatedAt = OffsetDateTime.now()
            ratingRepository.save(existing)
        }
    }

    @Transactional
    fun deleteRating(userId: UUID, movieId: Long) {
        ratingRepository.deleteById(UserMovieRatingId(userId, movieId))
    }

    @Transactional
    fun addFavorite(userId: UUID, movieId: Long): UserFavoriteEntity {
        if (!movieRepository.existsById(movieId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "movie $movieId not found")
        }
        val id = UserFavoriteId(userId, movieId)
        return favoriteRepository.findById(id).orElseGet {
            favoriteRepository.save(UserFavoriteEntity(userId, movieId))
        }
    }

    @Transactional
    fun removeFavorite(userId: UUID, movieId: Long) {
        favoriteRepository.deleteById(UserFavoriteId(userId, movieId))
    }
}
