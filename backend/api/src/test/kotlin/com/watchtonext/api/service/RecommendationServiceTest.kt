package com.watchtonext.api.service

import com.watchtonext.api.config.RecommenderProperties
import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import com.watchtonext.api.persistence.entity.UserWatchedEntity
import com.watchtonext.api.persistence.repository.MovieRepository
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
import com.watchtonext.api.persistence.repository.UserWatchedRepository
import com.watchtonext.engine.model.MovieFeatures
import com.watchtonext.engine.port.MovieFeaturesProvider
import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

class RecommendationServiceTest {

    private val featuresProvider = mockk<MovieFeaturesProvider>()
    private val ratingRepository = mockk<UserMovieRatingRepository>()
    private val favoriteRepository = mockk<UserFavoriteRepository>()
    private val watchedRepository = mockk<UserWatchedRepository>()
    private val movieRepository = mockk<MovieRepository>()
    private val properties = RecommenderProperties(favoriteBoost = 5.0, minVoteCount = 0)

    private val service = RecommendationService(
        featuresProvider,
        ratingRepository,
        favoriteRepository,
        watchedRepository,
        movieRepository,
        properties,
    )

    // Two genres: action(28) and romance(10749). Numeric features differ across movies so
    // MinMax scaling spreads them and cross-genre cosine stays positive (otherwise the
    // recommender's `if (sim > 0)` guard would drop all opposite-genre candidates).
    private val actionA = features(1L, genre = 28, voteAverage = 7.5, voteCount = 1_000, popularity = 50.0)
    private val actionB = features(2L, genre = 28, voteAverage = 7.8, voteCount = 1_200, popularity = 60.0)
    private val actionC = features(3L, genre = 28, voteAverage = 6.9, voteCount = 800, popularity = 40.0)
    private val romanceA = features(4L, genre = 10749, voteAverage = 7.0, voteCount = 700, popularity = 35.0)
    private val romanceB = features(5L, genre = 10749, voteAverage = 7.2, voteCount = 900, popularity = 45.0)

    private val catalog = listOf(actionA, actionB, actionC, romanceA, romanceB)
    private val userId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")

    init {
        every { featuresProvider.loadCatalog() } returns catalog
    }

    private fun features(
        id: Long,
        genre: Int,
        voteAverage: Double,
        voteCount: Int,
        popularity: Double,
    ) = MovieFeatures(
        movieId = id,
        genreIds = setOf(genre),
        voteAverage = voteAverage,
        voteCount = voteCount,
        popularity = popularity,
    )

    private fun rating(movieId: Long, rating: Double = 5.0) =
        UserMovieRatingEntity(userId = userId, movieId = movieId, rating = rating)

    private fun favorite(movieId: Long) =
        UserFavoriteEntity(userId = userId, movieId = movieId)

    private fun watched(movieId: Long) =
        UserWatchedEntity(userId = userId, movieId = movieId)

    private fun movieEntity(id: Long, title: String = "M$id") =
        MovieEntity(id = id, tmdbId = id + 1_000, title = title)

    @Test
    fun `recommendFor returns empty list when the user has no ratings`() {
        every { ratingRepository.findByUserId(userId) } returns emptyList()

        val result = service.recommendFor(userId, limit = 10)

        assertThat(result).isEmpty()
    }

    @Test
    fun `recommendFor maps ranked engine results into DTOs`() {
        every { ratingRepository.findByUserId(userId) } returns listOf(rating(actionA.movieId))
        every { favoriteRepository.findByUserId(userId) } returns emptyList()
        every { watchedRepository.findByUserId(userId) } returns emptyList()
        every { movieRepository.findAllById(any<Iterable<Long>>()) } answers {
            firstArg<Iterable<Long>>().map { movieEntity(it) }
        }

        val result = service.recommendFor(userId, limit = 5)

        // Seed (actionA) is excluded; the other two action movies should appear before romances.
        val ids = result.map { it.movieId }
        assertThat(ids).doesNotContain(actionA.movieId)
        assertThat(ids).contains(actionB.movieId, actionC.movieId)
        assertThat(ids.indexOf(actionB.movieId)).isLessThan(ids.indexOf(romanceA.movieId))
    }

    @Test
    fun `recommendFor excludes movies the user has already watched`() {
        every { ratingRepository.findByUserId(userId) } returns listOf(rating(actionA.movieId))
        every { favoriteRepository.findByUserId(userId) } returns emptyList()
        // actionB would normally rank near the top for an action seed — but it's watched.
        every { watchedRepository.findByUserId(userId) } returns listOf(watched(actionB.movieId))
        every { movieRepository.findAllById(any<Iterable<Long>>()) } answers {
            firstArg<Iterable<Long>>().map { movieEntity(it) }
        }

        val result = service.recommendFor(userId, limit = 5)

        val ids = result.map { it.movieId }
        assertThat(ids).doesNotContain(actionB.movieId)
        assertThat(ids).contains(actionC.movieId)
    }

    @Test
    fun `recommendFor applies favorite boost so the boosted seed dominates ranking`() {
        // User has equal-weight ratings for one action and one romance seed.
        // The romance one is favorited -> 5x boost -> the other romance wins overall.
        every { ratingRepository.findByUserId(userId) } returns listOf(
            rating(actionA.movieId, rating = 4.0),
            rating(romanceA.movieId, rating = 4.0),
        )
        every { favoriteRepository.findByUserId(userId) } returns listOf(favorite(romanceA.movieId))
        every { watchedRepository.findByUserId(userId) } returns emptyList()
        every { movieRepository.findAllById(any<Iterable<Long>>()) } answers {
            firstArg<Iterable<Long>>().map { movieEntity(it) }
        }

        val result = service.recommendFor(userId, limit = 5)

        assertThat(result.first().movieId).isEqualTo(romanceB.movieId)
    }

    @Test
    fun `similarTo throws 404 with the friendly pt-BR reason when the movie does not exist`() {
        every { movieRepository.existsById(99L) } returns false

        assertThatThrownBy { service.similarTo(99L, limit = 10) }
            .isInstanceOfSatisfying(ResponseStatusException::class.java) { ex ->
                assertThat(ex.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
                assertThat(ex.reason).isEqualTo("Não encontramos o filme solicitado.")
            }
    }

    @Test
    fun `similarTo runs a single-seed KNN excluding the seed and hydrates DTOs`() {
        every { movieRepository.existsById(actionA.movieId) } returns true
        every { movieRepository.findAllById(any<Iterable<Long>>()) } answers {
            firstArg<Iterable<Long>>().map { movieEntity(it) }
        }

        val result = service.similarTo(actionA.movieId, limit = 5)

        val ids = result.map { it.movieId }
        assertThat(ids).doesNotContain(actionA.movieId)
        // Other actions should rank above romances for an action seed.
        assertThat(ids.indexOf(actionB.movieId)).isLessThan(ids.indexOf(romanceA.movieId))
    }

    @Test
    fun `similarTo returns empty list when the recommender has no candidates`() {
        // Catalog is just the seed itself -> recommender excludes it -> empty.
        every { featuresProvider.loadCatalog() } returns listOf(actionA)
        every { movieRepository.existsById(actionA.movieId) } returns true

        val isolatedService = RecommendationService(
            featuresProvider,
            ratingRepository,
            favoriteRepository,
            watchedRepository,
            movieRepository,
            properties,
        )

        val result = isolatedService.similarTo(actionA.movieId, limit = 5)

        assertThat(result).isEmpty()
    }

    @Test
    fun `recommendFromSeeds ranks neighbours of the picked movies and excludes the seeds`() {
        every { movieRepository.findAllById(any<Iterable<Long>>()) } answers {
            firstArg<Iterable<Long>>().map { movieEntity(it) }
        }

        val result = service.recommendFromSeeds(listOf(actionA.movieId), limit = 5)

        val ids = result.map { it.movieId }
        assertThat(ids).doesNotContain(actionA.movieId)
        assertThat(ids).contains(actionB.movieId, actionC.movieId)
        assertThat(ids.indexOf(actionB.movieId)).isLessThan(ids.indexOf(romanceA.movieId))
    }

    @Test
    fun `recommendFromSeeds throws 404 with the friendly pt-BR reason when no picked movie exists`() {
        every { movieRepository.findAllById(any<Iterable<Long>>()) } returns emptyList()

        assertThatThrownBy { service.recommendFromSeeds(listOf(404L), limit = 5) }
            .isInstanceOfSatisfying(ResponseStatusException::class.java) { ex ->
                assertThat(ex.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
                assertThat(ex.reason).isEqualTo("Não encontramos os filmes selecionados.")
            }
    }
}
