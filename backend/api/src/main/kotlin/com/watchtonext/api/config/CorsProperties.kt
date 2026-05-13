package com.watchtonext.api.config

import org.springframework.boot.context.properties.ConfigurationProperties

/**
 * CORS allowlist for the browser frontend. Origins is a comma-separated list at
 * the source (env var / properties) and is split into the [origins] list at
 * binding time.
 */
@ConfigurationProperties(prefix = "app.cors")
data class CorsProperties(
    /** Comma-separated origins, ex. `http://localhost:3000,https://app.example.com`. */
    val allowedOrigins: String = "http://localhost:3000",
) {
    val origins: List<String>
        get() = allowedOrigins.split(",").map { it.trim() }.filter { it.isNotEmpty() }
}
