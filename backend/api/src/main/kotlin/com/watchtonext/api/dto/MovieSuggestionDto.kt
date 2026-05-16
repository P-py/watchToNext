package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.MovieEntity
import java.time.LocalDate

/**
 * Minimal movie shape for the `/movies/suggest` autocomplete endpoint — just
 * enough to render a suggestion row, without the full `MovieSummaryDto` payload.
 */
data class MovieSuggestionDto(
    val id: Long,
    val title: String,
    val releaseDate: LocalDate?,
) {
    companion object {
        fun from(entity: MovieEntity) = MovieSuggestionDto(
            id = entity.id,
            title = entity.title,
            releaseDate = entity.releaseDate,
        )
    }
}
