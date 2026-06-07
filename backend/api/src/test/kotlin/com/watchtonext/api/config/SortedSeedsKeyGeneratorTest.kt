package com.watchtonext.api.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SortedSeedsKeyGeneratorTest {

    private val generator = SortedSeedsKeyGenerator()

    // The generator ignores target/method; any Method instance works as a stand-in.
    private val anyMethod = Any::class.java.getMethod("toString")

    @Test
    fun `key is insensitive to seed order`() {
        val a = generator.generate(Any(), anyMethod, listOf(2L, 1L, 3L), 20)
        val b = generator.generate(Any(), anyMethod, listOf(3L, 2L, 1L), 20)

        assertThat(a).isEqualTo(b)
    }

    @Test
    fun `key deduplicates repeated seeds`() {
        val a = generator.generate(Any(), anyMethod, listOf(1L, 1L, 2L), 20)
        val b = generator.generate(Any(), anyMethod, listOf(1L, 2L), 20)

        assertThat(a).isEqualTo(b)
    }

    @Test
    fun `key distinguishes different limits`() {
        val a = generator.generate(Any(), anyMethod, listOf(1L, 2L), 20)
        val b = generator.generate(Any(), anyMethod, listOf(1L, 2L), 10)

        assertThat(a).isNotEqualTo(b)
    }
}
