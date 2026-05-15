package com.watchtonext.api.service

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatCode
import org.junit.jupiter.api.Test
import org.springframework.data.redis.connection.RedisConnection
import org.springframework.data.redis.connection.RedisKeyCommands
import org.springframework.data.redis.core.Cursor
import org.springframework.data.redis.core.RedisCallback
import org.springframework.data.redis.core.ScanOptions
import org.springframework.data.redis.core.StringRedisTemplate
import java.util.UUID

class RecommendationCacheEvictorTest {

    private val redisTemplate = mockk<StringRedisTemplate>()
    private val evictor = RecommendationCacheEvictor(redisTemplate)
    private val userId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")

    @Suppress("UNCHECKED_CAST")
    private fun stubScan(matches: List<String>) {
        val connection = mockk<RedisConnection>()
        val keyCommands = mockk<RedisKeyCommands>()
        every { connection.keyCommands() } returns keyCommands
        val cursor = mockk<Cursor<ByteArray>>()
        every { keyCommands.scan(any<ScanOptions>()) } returns cursor

        val iterator = matches.map { it.toByteArray() }.iterator()
        every { cursor.hasNext() } answers { iterator.hasNext() }
        every { cursor.next() } answers { iterator.next() }
        every { cursor.close() } returns Unit

        val callbackSlot = slot<RedisCallback<*>>()
        every { redisTemplate.execute(capture(callbackSlot)) } answers {
            callbackSlot.captured.doInRedis(connection)
        }
    }

    @Test
    fun `evictFor deletes every matching key when scan finds entries`() {
        val matched = listOf(
            "watchtonext::recommendations::$userId:20",
            "watchtonext::recommendations::$userId:50",
        )
        stubScan(matched)
        every { redisTemplate.delete(any<Collection<String>>()) } returns matched.size.toLong()

        evictor.evictFor(userId)

        verify(exactly = 1) {
            redisTemplate.delete(match<Collection<String>> { it.toSet() == matched.toSet() })
        }
    }

    @Test
    fun `evictFor skips delete when scan finds no entries`() {
        stubScan(emptyList())

        evictor.evictFor(userId)

        verify(exactly = 0) { redisTemplate.delete(any<Collection<String>>()) }
    }

    @Test
    fun `evictFor swallows Redis exceptions so a cache failure cannot break the caller`() {
        every { redisTemplate.execute(any<RedisCallback<*>>()) } throws
            RuntimeException("redis is on fire")

        assertThatCode { evictor.evictFor(userId) }.doesNotThrowAnyException()
    }

    @Test
    fun `evictFor scans for keys under the recommendations cache prefix for the user`() {
        val matched = listOf("watchtonext::recommendations::$userId:20")
        val capturedOptions = slot<ScanOptions>()
        val connection = mockk<RedisConnection>()
        val keyCommands = mockk<RedisKeyCommands>()
        val cursor = mockk<Cursor<ByteArray>>()
        every { connection.keyCommands() } returns keyCommands
        every { keyCommands.scan(capture(capturedOptions)) } returns cursor
        val iter = matched.map { it.toByteArray() }.iterator()
        every { cursor.hasNext() } answers { iter.hasNext() }
        every { cursor.next() } answers { iter.next() }
        every { cursor.close() } returns Unit
        val cbSlot = slot<RedisCallback<*>>()
        every { redisTemplate.execute(capture(cbSlot)) } answers {
            cbSlot.captured.doInRedis(connection)
        }
        every { redisTemplate.delete(any<Collection<String>>()) } returns 1L

        evictor.evictFor(userId)

        assertThat(capturedOptions.captured.pattern)
            .isEqualTo("watchtonext::recommendations::$userId:*")
    }
}
