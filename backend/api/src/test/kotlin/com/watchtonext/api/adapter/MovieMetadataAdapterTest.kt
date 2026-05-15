package com.watchtonext.api.adapter

import com.watchtonext.api.persistence.entity.GenreEntity
import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.repository.MovieRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest

class MovieMetadataAdapterTest {

    private val movieRepository = mockk<MovieRepository>()
    private val adapter = MovieMetadataAdapter(movieRepository)

    private fun entity(
        id: Long = 1L,
        tmdbId: Long = 603L,
        title: String = "Matrix",
        voteAverage: Double? = 8.2,
        voteCount: Int? = 12000,
        genres: MutableSet<GenreEntity> = mutableSetOf(GenreEntity(28, "Action"), GenreEntity(878, "Science Fiction")),
    ) = MovieEntity(
        id = id,
        tmdbId = tmdbId,
        title = title,
        overview = "A hacker discovers reality is a simulation.",
        posterPath = "/poster.jpg",
        voteAverage = voteAverage,
        voteCount = voteCount,
        genres = genres,
    )

    @Test
    fun `findByTmdbId returns mapped Movie when entity exists`() {
        every { movieRepository.findByTmdbId(603L) } returns entity()

        val movie = adapter.findByTmdbId(603L)

        assertThat(movie).isNotNull
        assertThat(movie!!.tmdbId).isEqualTo(603L)
        assertThat(movie.title).isEqualTo("Matrix")
        assertThat(movie.posterPath).isEqualTo("/poster.jpg")
        assertThat(movie.voteAverage).isEqualTo(8.2)
        assertThat(movie.voteCount).isEqualTo(12000)
        assertThat(movie.genres).extracting<Int> { it.id }.containsExactlyInAnyOrder(28, 878)
    }

    @Test
    fun `findByTmdbId returns null when entity is missing`() {
        every { movieRepository.findByTmdbId(0L) } returns null

        assertThat(adapter.findByTmdbId(0L)).isNull()
    }

    @Test
    fun `search maps every entity returned by the repository`() {
        every { movieRepository.findByTitleContainingIgnoreCase("matrix") } returns listOf(
            entity(id = 1L, tmdbId = 603L, title = "The Matrix"),
            entity(id = 2L, tmdbId = 604L, title = "The Matrix Reloaded"),
        )

        val results = adapter.search("matrix")

        assertThat(results).extracting<Long> { it.tmdbId }.containsExactly(603L, 604L)
        verify(exactly = 1) { movieRepository.findByTitleContainingIgnoreCase("matrix") }
    }

    @Test
    fun `search returns empty list when repository has no matches`() {
        every { movieRepository.findByTitleContainingIgnoreCase("zzz") } returns emptyList()

        assertThat(adapter.search("zzz")).isEmpty()
    }

    @Test
    fun `findPopular requests a first-page Pageable of the requested size and maps content`() {
        val pageable = PageRequest.of(0, 5)
        every { movieRepository.findTopByPopularity(pageable) } returns
            PageImpl(listOf(entity(id = 1L), entity(id = 2L, tmdbId = 27205L, title = "Inception")), pageable, 2L)

        val results = adapter.findPopular(limit = 5)

        assertThat(results).hasSize(2)
        assertThat(results[1].title).isEqualTo("Inception")
        verify(exactly = 1) { movieRepository.findTopByPopularity(pageable) }
    }
}
