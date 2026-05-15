package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.MovieEntity
import com.watchtonext.api.service.RecommendationResult
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate

class RecommendationDtoTest {

    @Test
    fun `from maps every field including releaseDate and score`() {
        val entity = MovieEntity(
            id = 11L,
            tmdbId = 27_205L,
            title = "Inception",
            posterPath = "/inception.jpg",
            voteAverage = 8.4,
            releaseDate = LocalDate.of(2010, 7, 16),
        )

        val dto = RecommendationDto.from(RecommendationResult(entity, score = 0.87))

        assertThat(dto.movieId).isEqualTo(11L)
        assertThat(dto.tmdbId).isEqualTo(27_205L)
        assertThat(dto.title).isEqualTo("Inception")
        assertThat(dto.posterPath).isEqualTo("/inception.jpg")
        assertThat(dto.voteAverage).isEqualTo(8.4)
        assertThat(dto.releaseDate).isEqualTo(LocalDate.of(2010, 7, 16))
        assertThat(dto.score).isEqualTo(0.87)
    }

    @Test
    fun `from leaves releaseDate null when the entity has no date`() {
        val entity = MovieEntity(id = 1L, tmdbId = 1L, title = "Bare")

        val dto = RecommendationDto.from(RecommendationResult(entity, score = 0.1))

        assertThat(dto.releaseDate).isNull()
    }
}
