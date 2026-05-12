package com.watchtonext.api.adapter

import com.watchtonext.api.persistence.repository.MovieRepository
import com.watchtonext.engine.model.Genre
import com.watchtonext.engine.model.Movie
import com.watchtonext.engine.port.MovieMetadataClient
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Component

@Component
class MovieMetadataAdapter(private val movieRepository: MovieRepository) : MovieMetadataClient {

    override fun findByTmdbId(tmdbId: Long): Movie? =
        movieRepository.findByTmdbId(tmdbId)?.toDomain()

    override fun search(query: String): List<Movie> =
        movieRepository.findByTitleContainingIgnoreCase(query).map { it.toDomain() }

    override fun findPopular(limit: Int): List<Movie> =
        movieRepository.findTopByPopularity(PageRequest.of(0, limit)).map { it.toDomain() }

    private fun com.watchtonext.api.persistence.entity.MovieEntity.toDomain() = Movie(
        tmdbId = tmdbId,
        title = title,
        overview = overview,
        posterPath = posterPath,
        voteAverage = voteAverage,
        voteCount = voteCount,
        genres = genres.map { Genre(it.id, it.name) },
    )
}
