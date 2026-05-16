package com.watchtonext.api.service

import com.watchtonext.api.dto.MovieSummaryDto
import com.watchtonext.api.dto.PageDto
import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.persistence.repository.MovieRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import kotlin.math.ceil

@Service
class MovieService(private val movieRepository: MovieRepository) {

    /**
     * Lists the catalog explorer's [sort]-ordered movies, bounded to the top
     * [CATALOG_MAX_MOVIES] titles. Deeper exploration is intentionally funnelled
     * to title search rather than an endless paginated tail.
     */
    @Cacheable(cacheNames = ["movies-popular"], key = "#sort + ':' + #page + ':' + #size")
    @Transactional(readOnly = true)
    fun listPopular(page: Int, size: Int, sort: MovieSort): PageDto<MovieSummaryDto> {
        val maxPages = ceil(CATALOG_MAX_MOVIES.toDouble() / size).toInt()
        if (page > maxPages) {
            return PageDto(emptyList(), CATALOG_MAX_MOVIES.toLong(), maxPages, page, size)
        }
        val pageable = PageRequest.of(page - 1, size)
        val fetched = when (sort) {
            MovieSort.RELEVANCE -> movieRepository.findTopByWeightedRating(RELEVANCE_MIN_VOTES, pageable)
            MovieSort.POPULARITY -> movieRepository.findTopByPopularity(pageable)
            MovieSort.RATING -> movieRepository.findAll(PageRequest.of(page - 1, size, RATING_SORT))
            MovieSort.RELEASE -> movieRepository.findAll(PageRequest.of(page - 1, size, RELEASE_SORT))
        }
        return cappedCatalogPage(fetched, page, size)
    }

    /**
     * Wraps a repository [Page] into a [PageDto] whose totals never exceed
     * [CATALOG_MAX_MOVIES], trimming a page that straddles the cap.
     */
    private fun cappedCatalogPage(
        page: Page<MovieEntity>,
        pageNumber: Int,
        size: Int,
    ): PageDto<MovieSummaryDto> {
        val cappedTotal = minOf(page.totalElements, CATALOG_MAX_MOVIES.toLong())
        val offset = (pageNumber - 1).toLong() * size
        val allowed = (cappedTotal - offset).coerceIn(0L, size.toLong()).toInt()
        val content = page.content.take(allowed).map(MovieSummaryDto::from)
        val totalPages = ceil(cappedTotal.toDouble() / size).toInt().coerceAtLeast(1)
        return PageDto(content, cappedTotal, totalPages, pageNumber, size)
    }

    @Cacheable(
        cacheNames = ["movies-popular"],
        key = "'genre:' + #genreId + ':' + #page + ':' + #size",
    )
    @Transactional(readOnly = true)
    fun listPopularByGenre(genreId: Int, page: Int, size: Int): PageDto<MovieSummaryDto> {
        val mapped = movieRepository
            .findTopByPopularityAndGenre(genreId, PageRequest.of(page - 1, size))
            .map(MovieSummaryDto::from)
        return PageDto.from(mapped)
    }

    @Cacheable(cacheNames = ["movies-search"], key = "#query + ':' + #page + ':' + #size")
    @Transactional(readOnly = true)
    fun searchByTitle(query: String, page: Int, size: Int): PageDto<MovieSummaryDto> {
        val mapped = movieRepository
            .findByTitleContainingIgnoreCaseOrderByPopularityDesc(
                query,
                PageRequest.of(page - 1, size),
            )
            .map(MovieSummaryDto::from)
        return PageDto.from(mapped)
    }

    @Cacheable(cacheNames = ["movies-detail"], key = "#id")
    @Transactional(readOnly = true)
    fun getById(id: Long): MovieSummaryDto =
        movieRepository.findById(id)
            .map(MovieSummaryDto::from)
            .orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Não encontramos o filme solicitado.")
            }

    companion object {
        /**
         * Upper bound on movies browsable through the catalog explorer. Beyond
         * this window users are nudged towards title search.
         */
        const val CATALOG_MAX_MOVIES = 200

        /** Bayesian prior weight (`m`) for [MovieSort.RELEVANCE]'s weighted rating. */
        private const val RELEVANCE_MIN_VOTES = 1000

        private val RATING_SORT = Sort.by(
            Sort.Order.desc("voteAverage").nullsLast(),
            Sort.Order.desc("voteCount").nullsLast(),
        )

        private val RELEASE_SORT = Sort.by(Sort.Order.desc("releaseDate").nullsLast())
    }
}
