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
import io.mockk.every
import io.mockk.justRun
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional
import java.util.UUID

class UserPreferenceServiceTest {

    private val ratingRepository = mockk<UserMovieRatingRepository>()
    private val favoriteRepository = mockk<UserFavoriteRepository>()
    private val watchedRepository = mockk<UserWatchedRepository>()
    private val movieRepository = mockk<MovieRepository>()
    private val cacheEvictor = mockk<RecommendationCacheEvictor>()
    private val service = UserPreferenceService(
        ratingRepository,
        favoriteRepository,
        watchedRepository,
        movieRepository,
        cacheEvictor,
    )

    private val userId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")
    private val movieId = 42L
    private val ratingId = UserMovieRatingId(userId, movieId)
    private val favoriteId = UserFavoriteId(userId, movieId)
    private val watchedId = UserWatchedId(userId, movieId)

    @Test
    fun `upsertRating saves a fresh entity and evicts cache when no prior rating exists`() {
        every { movieRepository.existsById(movieId) } returns true
        every { ratingRepository.findById(ratingId) } returns Optional.empty()
        val captured = slot<UserMovieRatingEntity>()
        every { ratingRepository.save(capture(captured)) } answers { captured.captured }
        justRun { cacheEvictor.evictFor(userId) }

        val result = service.upsertRating(userId, movieId, rating = 4.5)

        assertThat(result.userId).isEqualTo(userId)
        assertThat(result.movieId).isEqualTo(movieId)
        assertThat(result.rating).isEqualTo(4.5)
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `upsertRating updates the existing entity's rating and updatedAt`() {
        val existing = UserMovieRatingEntity(userId = userId, movieId = movieId, rating = 3.0)
        val previousUpdatedAt = existing.updatedAt
        every { movieRepository.existsById(movieId) } returns true
        every { ratingRepository.findById(ratingId) } returns Optional.of(existing)
        every { ratingRepository.save(existing) } returns existing
        justRun { cacheEvictor.evictFor(userId) }

        val result = service.upsertRating(userId, movieId, rating = 4.0)

        assertThat(result.rating).isEqualTo(4.0)
        assertThat(result.updatedAt).isAfterOrEqualTo(previousUpdatedAt)
        verify(exactly = 0) {
            ratingRepository.save(match<UserMovieRatingEntity> { it !== existing })
        }
    }

    @Test
    fun `upsertRating throws 404 with the friendly pt-BR reason when the movie is missing`() {
        every { movieRepository.existsById(movieId) } returns false

        assertThatThrownBy { service.upsertRating(userId, movieId, rating = 4.0) }
            .isInstanceOfSatisfying(ResponseStatusException::class.java) { ex ->
                assertThat(ex.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
                assertThat(ex.reason).isEqualTo("Não encontramos o filme solicitado.")
            }
        verify(exactly = 0) { cacheEvictor.evictFor(any()) }
    }

    @Test
    fun `deleteRating delegates to the repository and evicts cache`() {
        justRun { ratingRepository.deleteById(ratingId) }
        justRun { cacheEvictor.evictFor(userId) }

        service.deleteRating(userId, movieId)

        verify(exactly = 1) { ratingRepository.deleteById(ratingId) }
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `addFavorite is idempotent — no save when the favorite already exists`() {
        val existing = UserFavoriteEntity(userId, movieId)
        every { movieRepository.existsById(movieId) } returns true
        every { favoriteRepository.findById(favoriteId) } returns Optional.of(existing)
        justRun { cacheEvictor.evictFor(userId) }

        val result = service.addFavorite(userId, movieId)

        assertThat(result).isSameAs(existing)
        verify(exactly = 0) { favoriteRepository.save(any()) }
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `addFavorite saves a new entity when the favorite does not exist yet`() {
        every { movieRepository.existsById(movieId) } returns true
        every { favoriteRepository.findById(favoriteId) } returns Optional.empty()
        val captured = slot<UserFavoriteEntity>()
        every { favoriteRepository.save(capture(captured)) } answers { captured.captured }
        justRun { cacheEvictor.evictFor(userId) }

        val result = service.addFavorite(userId, movieId)

        assertThat(result.userId).isEqualTo(userId)
        assertThat(result.movieId).isEqualTo(movieId)
        verify(exactly = 1) { favoriteRepository.save(any()) }
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `addFavorite throws 404 with the friendly pt-BR reason when the movie is missing`() {
        every { movieRepository.existsById(movieId) } returns false

        assertThatThrownBy { service.addFavorite(userId, movieId) }
            .isInstanceOfSatisfying(ResponseStatusException::class.java) { ex ->
                assertThat(ex.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
                assertThat(ex.reason).isEqualTo("Não encontramos o filme solicitado.")
            }
        verify(exactly = 0) { cacheEvictor.evictFor(any()) }
    }

    @Test
    fun `removeFavorite delegates to the repository and evicts cache`() {
        justRun { favoriteRepository.deleteById(favoriteId) }
        justRun { cacheEvictor.evictFor(userId) }

        service.removeFavorite(userId, movieId)

        verify(exactly = 1) { favoriteRepository.deleteById(favoriteId) }
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `markWatched saves a new entity when not yet watched and evicts cache`() {
        every { movieRepository.existsById(movieId) } returns true
        every { watchedRepository.findById(watchedId) } returns Optional.empty()
        val captured = slot<UserWatchedEntity>()
        every { watchedRepository.save(capture(captured)) } answers { captured.captured }
        justRun { cacheEvictor.evictFor(userId) }

        val result = service.markWatched(userId, movieId)

        assertThat(result.userId).isEqualTo(userId)
        assertThat(result.movieId).isEqualTo(movieId)
        verify(exactly = 1) { watchedRepository.save(any()) }
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `markWatched is idempotent — no save when already watched`() {
        val existing = UserWatchedEntity(userId, movieId)
        every { movieRepository.existsById(movieId) } returns true
        every { watchedRepository.findById(watchedId) } returns Optional.of(existing)
        justRun { cacheEvictor.evictFor(userId) }

        val result = service.markWatched(userId, movieId)

        assertThat(result).isSameAs(existing)
        verify(exactly = 0) { watchedRepository.save(any()) }
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `markWatched throws 404 with the friendly pt-BR reason when the movie is missing`() {
        every { movieRepository.existsById(movieId) } returns false

        assertThatThrownBy { service.markWatched(userId, movieId) }
            .isInstanceOfSatisfying(ResponseStatusException::class.java) { ex ->
                assertThat(ex.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
                assertThat(ex.reason).isEqualTo("Não encontramos o filme solicitado.")
            }
        verify(exactly = 0) { cacheEvictor.evictFor(any()) }
    }

    @Test
    fun `unmarkWatched delegates to the repository and evicts cache`() {
        justRun { watchedRepository.deleteById(watchedId) }
        justRun { cacheEvictor.evictFor(userId) }

        service.unmarkWatched(userId, movieId)

        verify(exactly = 1) { watchedRepository.deleteById(watchedId) }
        verify(exactly = 1) { cacheEvictor.evictFor(userId) }
    }

    @Test
    fun `isWatched reflects repository presence`() {
        every { watchedRepository.existsById(watchedId) } returns true
        assertThat(service.isWatched(userId, movieId)).isTrue()

        every { watchedRepository.existsById(watchedId) } returns false
        assertThat(service.isWatched(userId, movieId)).isFalse()
    }

    @Test
    fun `listFavorites delegates to the repository and returns the user's favorites`() {
        val favorites = listOf(UserFavoriteEntity(userId, 1L), UserFavoriteEntity(userId, 2L))
        every { favoriteRepository.findByUserId(userId) } returns favorites

        val result = service.listFavorites(userId)

        assertThat(result).isEqualTo(favorites)
        verify(exactly = 1) { favoriteRepository.findByUserId(userId) }
    }

    @Test
    fun `getRating returns the stored rating when one exists`() {
        val existing = UserMovieRatingEntity(userId = userId, movieId = movieId, rating = 4.5)
        every { ratingRepository.findById(ratingId) } returns Optional.of(existing)

        assertThat(service.getRating(userId, movieId)).isEqualTo(4.5)
    }

    @Test
    fun `getRating returns null when the user has not rated the movie`() {
        every { ratingRepository.findById(ratingId) } returns Optional.empty()

        assertThat(service.getRating(userId, movieId)).isNull()
    }
}
