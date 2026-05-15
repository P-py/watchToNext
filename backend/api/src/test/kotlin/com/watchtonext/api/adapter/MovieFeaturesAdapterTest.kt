package com.watchtonext.api.adapter

import com.watchtonext.api.config.RecommenderProperties
import com.watchtonext.api.persistence.entity.GenreEntity
import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.repository.MovieRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class MovieFeaturesAdapterTest {

    private val movieRepository = mockk<MovieRepository>()
    private val properties = RecommenderProperties(favoriteBoost = 1.2, minVoteCount = 75)
    private val adapter = MovieFeaturesAdapter(movieRepository, properties)

    private fun entity(
        id: Long = 1L,
        tmdbId: Long = 603L,
        voteAverage: Double? = 7.5,
        voteCount: Int? = 1000,
        popularity: Double? = 50.0,
        genres: MutableSet<GenreEntity> = mutableSetOf(GenreEntity(28, "Action")),
    ) = MovieEntity(
        id = id,
        tmdbId = tmdbId,
        title = "Matrix",
        voteAverage = voteAverage,
        voteCount = voteCount,
        popularity = popularity,
        genres = genres,
    )

    @Test
    fun `loadCatalog forwards minVoteCount from properties and maps the result`() {
        every { movieRepository.findRecommendationCandidates(75) } returns
            listOf(entity(id = 1L, genres = mutableSetOf(GenreEntity(28, "Action"), GenreEntity(12, "Adventure"))))

        val features = adapter.loadCatalog()

        assertThat(features).hasSize(1)
        assertThat(features[0].movieId).isEqualTo(1L)
        assertThat(features[0].genreIds).containsExactlyInAnyOrder(28, 12)
        assertThat(features[0].voteAverage).isEqualTo(7.5)
        assertThat(features[0].voteCount).isEqualTo(1000)
        assertThat(features[0].popularity).isEqualTo(50.0)
        verify(exactly = 1) { movieRepository.findRecommendationCandidates(75) }
    }

    @Test
    fun `findByIds delegates to findAllById and maps entities`() {
        val ids = listOf(1L, 2L)
        every { movieRepository.findAllById(ids) } returns listOf(
            entity(id = 1L),
            entity(id = 2L, tmdbId = 27205L),
        )

        val features = adapter.findByIds(ids)

        assertThat(features).extracting<Long> { it.movieId }.containsExactly(1L, 2L)
        verify(exactly = 1) { movieRepository.findAllById(ids) }
    }

    @Test
    fun `null numeric fields default to zero`() {
        every { movieRepository.findAllById(listOf(1L)) } returns listOf(
            entity(id = 1L, voteAverage = null, voteCount = null, popularity = null),
        )

        val features = adapter.findByIds(listOf(1L)).single()

        assertThat(features.voteAverage).isEqualTo(0.0)
        assertThat(features.voteCount).isEqualTo(0)
        assertThat(features.popularity).isEqualTo(0.0)
    }

    @Test
    fun `entity with no genres maps to empty genreIds set`() {
        every { movieRepository.findAllById(listOf(1L)) } returns listOf(
            entity(id = 1L, genres = mutableSetOf()),
        )

        val features = adapter.findByIds(listOf(1L)).single()

        assertThat(features.genreIds).isEmpty()
    }
}
