package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserFavoriteEntity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class FavoriteDtoTest {

    @Test
    fun `from copies userId, movieId and createdAt`() {
        val userId = UUID.fromString("11111111-1111-1111-1111-111111111111")
        val createdAt = OffsetDateTime.of(2026, 5, 13, 10, 0, 0, 0, ZoneOffset.UTC)
        val entity = UserFavoriteEntity(userId = userId, movieId = 42L, createdAt = createdAt)

        val dto = FavoriteDto.from(entity)

        assertThat(dto.userId).isEqualTo(userId)
        assertThat(dto.movieId).isEqualTo(42L)
        assertThat(dto.createdAt).isEqualTo(createdAt)
    }
}
