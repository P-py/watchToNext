package com.watchtonext.api.config

import com.watchtonext.api.service.RecommendationService
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

/**
 * Builds the KNN catalog + recommender as soon as the application is ready, so the first real
 * request doesn't pay the cold-start cost of loading the candidate catalog.
 *
 * Failures are swallowed and logged: warm-up is an optimization, not a correctness invariant —
 * if it fails (e.g. a DB blip at boot), the recommender is still built lazily on first request.
 */
@Component
class RecommenderWarmUp(private val recommendationService: RecommendationService) {

    private val log = LoggerFactory.getLogger(javaClass)

    @EventListener(ApplicationReadyEvent::class)
    fun warmUp() {
        try {
            recommendationService.warmUp()
        } catch (e: Exception) {
            log.warn("recommender warm-up failed; will build lazily on first request: {}", e.message)
        }
    }
}
