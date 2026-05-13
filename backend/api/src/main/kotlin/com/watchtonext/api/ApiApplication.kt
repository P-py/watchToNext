package com.watchtonext.api

import com.watchtonext.api.config.CorsProperties
import com.watchtonext.api.config.RecommenderProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.data.redis.autoconfigure.DataRedisRepositoriesAutoConfiguration
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

/**
 * Redis is used here only as a cache (see CacheConfig), never as a repository store.
 * DataRedisRepositoriesAutoConfiguration is excluded so its scanner doesn't try to
 * claim the JPA repository interfaces and emit "Could not safely identify store
 * assignment" INFO logs on boot.
 */
@SpringBootApplication(exclude = [DataRedisRepositoriesAutoConfiguration::class])
@EnableConfigurationProperties(RecommenderProperties::class, CorsProperties::class)
class ApiApplication

fun main(args: Array<String>) {
	runApplication<ApiApplication>(*args)
}
