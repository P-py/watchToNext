package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.GenreEntity
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GenreDtoTest {

    @Test
    fun `from copies id and name`() {
        val dto = GenreDto.from(GenreEntity(id = 28, name = "Action"))

        assertThat(dto.id).isEqualTo(28)
        assertThat(dto.name).isEqualTo("Action")
    }
}
