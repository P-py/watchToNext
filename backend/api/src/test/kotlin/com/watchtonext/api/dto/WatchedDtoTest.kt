package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.UserWatchedEntity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.util.UUID

class WatchedDtoTest {

    @Test
    fun `from maps every field of the entity`() {
        val userId = UUID.fromString("11111111-1111-1111-1111-111111111111")
        val watchedAt = OffsetDateTime.parse("2026-05-15T03:00:00Z")
        val entity = UserWatchedEntity(userId = userId, movieId = 42L, watchedAt = watchedAt)

        val dto = WatchedDto.from(entity)

        assertThat(dto.userId).isEqualTo(userId)
        assertThat(dto.movieId).isEqualTo(42L)
        assertThat(dto.watchedAt).isEqualTo(watchedAt)
    }
}
