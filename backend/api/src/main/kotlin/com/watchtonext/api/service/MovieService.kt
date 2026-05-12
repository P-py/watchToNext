package com.watchtonext.api.service

import com.watchtonext.api.dto.MovieSummaryDto
import com.watchtonext.api.persistence.repository.MovieRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MovieService(private val movieRepository: MovieRepository) {

    @Transactional(readOnly = true)
    fun listPopular(limit: Int): List<MovieSummaryDto> =
        movieRepository.findTopByPopularity(PageRequest.of(0, limit))
            .map(MovieSummaryDto::from)

    @Transactional(readOnly = true)
    fun searchByTitle(query: String, limit: Int): List<MovieSummaryDto> =
        movieRepository.findByTitleContainingIgnoreCaseOrderByPopularityDesc(
            query,
            PageRequest.of(0, limit),
        ).map(MovieSummaryDto::from)
}
