package com.watchtonext.api.config

import org.slf4j.LoggerFactory
import org.springframework.cache.Cache
import org.springframework.cache.annotation.CachingConfigurer
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.interceptor.CacheErrorHandler
import org.springframework.cache.interceptor.SimpleCacheErrorHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.StringRedisSerializer
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator
import java.time.Duration

@Configuration
@EnableCaching
class CacheConfig : CachingConfigurer {

    private val log = LoggerFactory.getLogger(javaClass)

    @Bean
    fun cacheManager(connectionFactory: RedisConnectionFactory): RedisCacheManager {
        val defaults = RedisCacheConfiguration.defaultCacheConfig()
            .prefixCacheNameWith("watchtonext::")
            .disableCachingNullValues()
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(StringRedisSerializer()),
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    GenericJacksonJsonRedisSerializer.builder()
                        .enableDefaultTyping(
                            BasicPolymorphicTypeValidator.builder()
                                .allowIfSubType("com.watchtonext.")
                                .allowIfSubType("java.util.")
                                .allowIfSubType("java.time.")
                                .build(),
                        )
                        .build(),
                ),
            )

        val perCacheTtl = mapOf(
            "movies-popular" to defaults.entryTtl(Duration.ofMinutes(5)),
            "movies-search" to defaults.entryTtl(Duration.ofMinutes(2)),
            "movies-suggest" to defaults.entryTtl(Duration.ofMinutes(10)),
            "movies-detail" to defaults.entryTtl(Duration.ofHours(1)),
            "recommendations" to defaults.entryTtl(Duration.ofMinutes(2)),
            "recommendations-similar" to defaults.entryTtl(Duration.ofMinutes(10)),
        )

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaults)
            .withInitialCacheConfigurations(perCacheTtl)
            .build()
    }

    /**
     * Keeps the API responsive when Redis is unreachable: cache errors are logged at WARN
     * and the underlying call still executes as if the cache returned a miss.
     */
    override fun errorHandler(): CacheErrorHandler = object : SimpleCacheErrorHandler() {
        override fun handleCacheGetError(exception: RuntimeException, cache: Cache, key: Any) {
            log.warn("cache get failed (cache={}, key={}): {}", cache.name, key, exception.message)
        }

        override fun handleCachePutError(exception: RuntimeException, cache: Cache, key: Any, value: Any?) {
            log.warn("cache put failed (cache={}, key={}): {}", cache.name, key, exception.message)
        }

        override fun handleCacheEvictError(exception: RuntimeException, cache: Cache, key: Any) {
            log.warn("cache evict failed (cache={}, key={}): {}", cache.name, key, exception.message)
        }

        override fun handleCacheClearError(exception: RuntimeException, cache: Cache) {
            log.warn("cache clear failed (cache={}): {}", cache.name, exception.message)
        }
    }
}
