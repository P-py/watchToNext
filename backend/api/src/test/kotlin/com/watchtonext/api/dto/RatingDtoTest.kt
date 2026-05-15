package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserMovieRatingEntity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class RatingDtoTest {

    @Test
    fun `from copies userId, movieId, rating and updatedAt`() {
        val userId = UUID.fromString("11111111-1111-1111-1111-111111111111")
        val updatedAt = OffsetDateTime.of(2026, 5, 13, 10, 0, 0, 0, ZoneOffset.UTC)
        val entity = UserMovieRatingEntity(
            userId = userId,
            movieId = 42L,
            rating = 4.5,
            updatedAt = updatedAt,
        )

        val dto = RatingDto.from(entity)

        assertThat(dto.userId).isEqualTo(userId)
        assertThat(dto.movieId).isEqualTo(42L)
        assertThat(dto.rating).isEqualTo(4.5)
        assertThat(dto.updatedAt).isEqualTo(updatedAt)
    }
}
