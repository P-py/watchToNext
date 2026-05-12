package com.watchtonext.api.service

import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.Cursor
import org.springframework.data.redis.core.ScanOptions
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Evicts only the [userId]'s entries from the `recommendations` cache, instead of
 * wiping every user's cache on any rating/favorite change. Uses Redis SCAN + DEL to
 * find entries whose key starts with `<prefix>::recommendations::<userId>:`.
 *
 * Failures (Redis down, network blip) are swallowed and logged — eviction is a
 * best-effort optimization, not a correctness invariant, so it must not propagate.
 */
@Component
class RecommendationCacheEvictor(private val redisTemplate: StringRedisTemplate) {

    private val log = LoggerFactory.getLogger(javaClass)

    fun evictFor(userId: UUID) {
        val pattern = "$KEY_PREFIX$userId:*"
        try {
            val keys = scan(pattern)
            if (keys.isNotEmpty()) {
                redisTemplate.delete(keys)
                log.debug("evicted {} recommendations cache entries for user {}", keys.size, userId)
            }
        } catch (e: Exception) {
            log.warn("failed to evict recommendations cache for user {}: {}", userId, e.message)
        }
    }

    private fun scan(pattern: String): Set<String> {
        val matched = mutableSetOf<String>()
        val options = ScanOptions.scanOptions().match(pattern).count(SCAN_BATCH).build()
        redisTemplate.execute { connection ->
            @Suppress("UNCHECKED_CAST")
            val cursor = connection.keyCommands().scan(options) as Cursor<ByteArray>
            cursor.use { c ->
                while (c.hasNext()) matched.add(String(c.next()))
            }
        }
        return matched
    }

    private companion object {
        // Matches the prefix produced by RedisCacheConfiguration:
        //   <cacheNamePrefix><cacheName>::<entryKey>
        // CacheConfig sets cacheNamePrefix="watchtonext::" and we cache under "recommendations".
        const val KEY_PREFIX = "watchtonext::recommendations::"
        const val SCAN_BATCH = 200L
    }
}
