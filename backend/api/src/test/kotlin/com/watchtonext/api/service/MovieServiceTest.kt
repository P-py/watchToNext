package com.watchtonext.api.service

import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.repository.MovieRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

class MovieServiceTest {

    private val movieRepository = mockk<MovieRepository>()
    private val service = MovieService(movieRepository)

    private fun entity(id: Long = 1L, title: String = "Matrix") = MovieEntity(
        id = id,
        tmdbId = 603L,
        title = title,
    )

    @Test
    fun `listPopular wraps the repository Page into a 1-indexed PageDto`() {
        val pageable = PageRequest.of(1, 20)
        every { movieRepository.findTopByPopularity(pageable) } returns
            PageImpl(listOf(entity(1L, "Matrix"), entity(2L, "Inception")), pageable, 42L)

        val result = service.listPopular(page = 2, size = 20, sort = MovieSort.POPULARITY)

        assertThat(result.content).hasSize(2)
        assertThat(result.totalElements).isEqualTo(42L)
        assertThat(result.currentPage).isEqualTo(2)
        assertThat(result.pageSize).isEqualTo(20)
        verify(exactly = 1) { movieRepository.findTopByPopularity(pageable) }
    }

    @Test
    fun `listPopular defaults to the weighted-rating query for RELEVANCE`() {
        val pageable = PageRequest.of(0, 20)
        every { movieRepository.findTopByWeightedRating(any(), pageable) } returns
            PageImpl(listOf(entity(1L, "The Godfather")), pageable, 1L)

        val result = service.listPopular(page = 1, size = 20, sort = MovieSort.RELEVANCE)

        assertThat(result.content).hasSize(1)
        verify(exactly = 1) { movieRepository.findTopByWeightedRating(any(), pageable) }
    }

    @Test
    fun `listPopular caps totals at the catalog window`() {
        val pageable = PageRequest.of(0, 20)
        every { movieRepository.findTopByPopularity(pageable) } returns
            PageImpl(List(20) { entity(it.toLong()) }, pageable, 9_999L)

        val result = service.listPopular(page = 1, size = 20, sort = MovieSort.POPULARITY)

        assertThat(result.totalElements).isEqualTo(MovieService.CATALOG_MAX_MOVIES.toLong())
        assertThat(result.totalPages).isEqualTo(MovieService.CATALOG_MAX_MOVIES / 20)
    }

    @Test
    fun `listPopular returns an empty page past the catalog cap without hitting the repository`() {
        val result = service.listPopular(page = 99, size = 20, sort = MovieSort.RELEVANCE)

        assertThat(result.content).isEmpty()
        assertThat(result.totalElements).isEqualTo(MovieService.CATALOG_MAX_MOVIES.toLong())
        verify(exactly = 0) { movieRepository.findTopByWeightedRating(any(), any()) }
    }

    @Test
    fun `searchByTitle delegates to the substring query with the right Pageable`() {
        val pageable = PageRequest.of(0, 10)
        every {
            movieRepository.searchByTitleSubstring("matrix", pageable)
        } returns PageImpl(listOf(entity()), pageable, 1L)

        val result = service.searchByTitle("matrix", page = 1, size = 10)

        assertThat(result.content).hasSize(1)
        assertThat(result.totalElements).isEqualTo(1L)
        assertThat(result.currentPage).isEqualTo(1)
    }

    @Test
    fun `searchByTitle caps results at the roomier search window`() {
        val pageable = PageRequest.of(0, 20)
        every {
            movieRepository.searchByTitleSubstring("the", pageable)
        } returns PageImpl(List(20) { entity(it.toLong()) }, pageable, 5_000L)

        val result = service.searchByTitle("the", page = 1, size = 20)

        assertThat(result.totalElements).isEqualTo(MovieService.SEARCH_MAX_RESULTS.toLong())
        assertThat(result.totalPages).isEqualTo(MovieService.SEARCH_MAX_RESULTS / 20)
    }

    @Test
    fun `suggest maps the limited repository hits into MovieSuggestionDto`() {
        every { movieRepository.suggestByTitle("god", 8) } returns
            listOf(entity(1L, "The Godfather"), entity(2L, "The Godfather Part II"))

        val result = service.suggest("god", 8)

        assertThat(result).hasSize(2)
        assertThat(result.map { it.title })
            .containsExactly("The Godfather", "The Godfather Part II")
    }

    @Test
    fun `getById returns the mapped DTO when the movie exists`() {
        every { movieRepository.findById(1L) } returns Optional.of(entity(id = 1L, title = "Matrix"))

        val result = service.getById(1L)

        assertThat(result.id).isEqualTo(1L)
        assertThat(result.title).isEqualTo("Matrix")
    }

    @Test
    fun `getById throws 404 with the friendly pt-BR reason when missing`() {
        every { movieRepository.findById(99L) } returns Optional.empty()

        assertThatThrownBy { service.getById(99L) }
            .isInstanceOfSatisfying(ResponseStatusException::class.java) { ex ->
                assertThat(ex.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
                assertThat(ex.reason).isEqualTo("Não encontramos o filme solicitado.")
            }
    }
}
