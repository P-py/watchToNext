package com.watchtonext.api.adapter

import com.watchtonext.api.config.RecommenderProperties
import com.watchtonext.api.persistence.repository.MovieRepository
import com.watchtonext.engine.model.MovieFeatures
import com.watchtonext.engine.port.MovieFeaturesProvider
import org.springframework.stereotype.Component

@Component
class MovieFeaturesAdapter(
    private val movieRepository: MovieRepository,
    private val properties: RecommenderProperties,
) : MovieFeaturesProvider {

    override fun loadCatalog(): List<MovieFeatures> =
        movieRepository.findRecommendationCandidates(properties.minVoteCount).map { it.toFeatures() }

    override fun findByIds(ids: Collection<Long>): List<MovieFeatures> =
        movieRepository.findAllById(ids).map { it.toFeatures() }

    private fun com.watchtonext.api.persistence.entity.MovieEntity.toFeatures() = MovieFeatures(
        movieId = id,
        genreIds = genres.map { it.id }.toSet(),
        voteAverage = voteAverage ?: 0.0,
        voteCount = voteCount ?: 0,
        popularity = popularity ?: 0.0,
    )
}
