package com.watchtonext.api.service

import com.watchtonext.api.dto.MovieSummaryDto
import com.watchtonext.api.dto.PageDto
import com.watchtonext.api.persistence.repository.MovieRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class MovieService(private val movieRepository: MovieRepository) {

    @Cacheable(cacheNames = ["movies-popular"], key = "#page + ':' + #size")
    @Transactional(readOnly = true)
    fun listPopular(page: Int, size: Int): PageDto<MovieSummaryDto> {
        val mapped = movieRepository
            .findTopByPopularity(PageRequest.of(page - 1, size))
            .map(MovieSummaryDto::from)
        return PageDto.from(mapped)
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
}
