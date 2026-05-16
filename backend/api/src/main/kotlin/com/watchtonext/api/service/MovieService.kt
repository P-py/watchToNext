package com.watchtonext.api.service

import com.watchtonext.api.dto.MovieSuggestionDto
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
    fun listPopular(page: Int, size: Int, sort: MovieSort): PageDto<MovieSummaryDto> =
        cappedResult(page, size, CATALOG_MAX_MOVIES) {
            val pageable = PageRequest.of(page - 1, size)
            when (sort) {
                MovieSort.RELEVANCE -> movieRepository.findTopByWeightedRating(RELEVANCE_MIN_VOTES, pageable)
                MovieSort.POPULARITY -> movieRepository.findTopByPopularity(pageable)
                MovieSort.RATING -> movieRepository.findAll(PageRequest.of(page - 1, size, RATING_SORT))
                MovieSort.RELEASE -> movieRepository.findAll(PageRequest.of(page - 1, size, RELEASE_SORT))
            }
        }

    /**
     * Runs [fetch] and wraps its [Page] into a [PageDto] whose totals never
     * exceed [maxResults], trimming a page that straddles the cap. Any page past
     * the cap short-circuits to an empty page without touching the database.
     * Shared by the catalog explorer ([CATALOG_MAX_MOVIES]) and title search
     * ([SEARCH_MAX_RESULTS]), which use deliberately different windows.
     */
    private inline fun cappedResult(
        pageNumber: Int,
        size: Int,
        maxResults: Int,
        fetch: () -> Page<MovieEntity>,
    ): PageDto<MovieSummaryDto> {
        val maxPages = ceil(maxResults.toDouble() / size).toInt()
        if (pageNumber > maxPages) {
            return PageDto(emptyList(), maxResults.toLong(), maxPages, pageNumber, size)
        }
        val page = fetch()
        val cappedTotal = minOf(page.totalElements, maxResults.toLong())
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

    /**
     * Paginated fuzzy title search (accent- and typo-tolerant). Bounded to
     * [SEARCH_MAX_RESULTS] — a far roomier window than the curated catalog
     * explorer, since search is intentional, in-depth exploration — while still
     * capping pathologically broad queries.
     */
    @Cacheable(cacheNames = ["movies-search"], key = "#query + ':' + #page + ':' + #size")
    @Transactional(readOnly = true)
    fun searchByTitle(query: String, page: Int, size: Int): PageDto<MovieSummaryDto> =
        cappedResult(page, size, SEARCH_MAX_RESULTS) {
            movieRepository.searchByTitleFuzzy(query, PageRequest.of(page - 1, size))
        }

    /**
     * Autocomplete suggestions for [query] — up to [limit] fuzzy title matches,
     * prefix matches first. Lighter than [searchByTitle]: no pagination, a
     * minimal DTO, and a longer cache TTL.
     */
    @Cacheable(cacheNames = ["movies-suggest"], key = "#query + ':' + #limit")
    @Transactional(readOnly = true)
    fun suggest(query: String, limit: Int): List<MovieSuggestionDto> =
        movieRepository.suggestByTitle(query, limit).map(MovieSuggestionDto::from)

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
         * Upper bound on results paginated through the catalog explorer — a
         * curated "top movies" browse. Beyond this window users are nudged
         * towards title search.
         */
        const val CATALOG_MAX_MOVIES = 200

        /**
         * Upper bound on title-search results. Deliberately far higher than
         * [CATALOG_MAX_MOVIES] so search supports free, in-depth exploration;
         * the cap only bounds pathologically broad queries.
         */
        const val SEARCH_MAX_RESULTS = 1000

        /** Bayesian prior weight (`m`) for [MovieSort.RELEVANCE]'s weighted rating. */
        private const val RELEVANCE_MIN_VOTES = 1000

        private val RATING_SORT = Sort.by(
            Sort.Order.desc("voteAverage").nullsLast(),
            Sort.Order.desc("voteCount").nullsLast(),
        )

        private val RELEASE_SORT = Sort.by(Sort.Order.desc("releaseDate").nullsLast())
    }
}
