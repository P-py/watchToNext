package com.watchtonext.api.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest

class PageDtoTest {

    @Test
    fun `from translates Spring's zero-indexed page into 1-indexed currentPage`() {
        val page = PageImpl(listOf("a", "b", "c"), PageRequest.of(2, 3), 30L)

        val dto = PageDto.from(page)

        assertThat(dto.content).containsExactly("a", "b", "c")
        assertThat(dto.totalElements).isEqualTo(30L)
        assertThat(dto.totalPages).isEqualTo(10)
        assertThat(dto.currentPage).isEqualTo(3)
        assertThat(dto.pageSize).isEqualTo(3)
    }

    @Test
    fun `from handles an empty page without leaking Spring internals`() {
        val page = PageImpl<String>(emptyList(), PageRequest.of(0, 20), 0L)

        val dto = PageDto.from(page)

        assertThat(dto.content).isEmpty()
        assertThat(dto.totalElements).isZero
        assertThat(dto.totalPages).isZero
        assertThat(dto.currentPage).isEqualTo(1)
        assertThat(dto.pageSize).isEqualTo(20)
    }
}
