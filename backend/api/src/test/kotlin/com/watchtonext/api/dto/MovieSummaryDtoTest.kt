package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.GenreEntity
import com.watchtonext.api.persistence.entity.MovieEntity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate

class MovieSummaryDtoTest {

    @Test
    fun `from copies every column-bearing field and maps genres`() {
        val action = GenreEntity(id = 28, name = "Action")
        val drama = GenreEntity(id = 18, name = "Drama")
        val entity = MovieEntity(
            id = 7L,
            tmdbId = 603L,
            title = "The Matrix",
            overview = "A hacker discovers reality.",
            posterPath = "/matrix.jpg",
            voteAverage = 8.2,
            voteCount = 24_000,
            popularity = 95.5,
            releaseDate = LocalDate.of(1999, 3, 31),
            genres = mutableSetOf(action, drama),
        )

        val dto = MovieSummaryDto.from(entity)

        assertThat(dto.id).isEqualTo(7L)
        assertThat(dto.tmdbId).isEqualTo(603L)
        assertThat(dto.title).isEqualTo("The Matrix")
        assertThat(dto.overview).isEqualTo("A hacker discovers reality.")
        assertThat(dto.posterPath).isEqualTo("/matrix.jpg")
        assertThat(dto.voteAverage).isEqualTo(8.2)
        assertThat(dto.popularity).isEqualTo(95.5)
        assertThat(dto.releaseDate).isEqualTo(LocalDate.of(1999, 3, 31))
        assertThat(dto.genres).extracting<Int> { it.id }.containsExactlyInAnyOrder(28, 18)
    }

    @Test
    fun `from preserves nullable fields as null`() {
        val entity = MovieEntity(id = 1L, tmdbId = 1L, title = "Bare")

        val dto = MovieSummaryDto.from(entity)

        assertThat(dto.overview).isNull()
        assertThat(dto.posterPath).isNull()
        assertThat(dto.voteAverage).isNull()
        assertThat(dto.popularity).isNull()
        assertThat(dto.releaseDate).isNull()
        assertThat(dto.genres).isEmpty()
    }
}
