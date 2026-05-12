package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.MovieEntity
import java.time.LocalDate

data class MovieSummaryDto(
    val id: Long,
    val tmdbId: Long,
    val title: String,
    val overview: String?,
    val posterPath: String?,
    val voteAverage: Double?,
    val popularity: Double?,
    val releaseDate: LocalDate?,
    val genres: List<GenreDto>,
) {
    companion object {
        fun from(entity: MovieEntity) = MovieSummaryDto(
            id = entity.id,
            tmdbId = entity.tmdbId,
            title = entity.title,
            overview = entity.overview,
            posterPath = entity.posterPath,
            voteAverage = entity.voteAverage,
            popularity = entity.popularity,
            releaseDate = entity.releaseDate,
            genres = entity.genres.map(GenreDto::from),
        )
    }
}
