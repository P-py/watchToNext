package com.watchtonext.api.config

import org.springframework.cache.interceptor.KeyGenerator
import org.springframework.stereotype.Component
import java.lang.reflect.Method

/**
 * Order-insensitive cache key for seed-based recommendations.
 *
 * The KNN result depends only on the *set* of seed movie ids, so `[1, 2]` and `[2, 1]` must map to
 * the same cache entry. Any collection argument is deduplicated and sorted into a canonical form;
 * scalar arguments (e.g. `limit`) are kept positionally. Example: `(listOf(2, 1), 20)` → `[1,2]:20`.
 */
@Component
class SortedSeedsKeyGenerator : KeyGenerator {

    override fun generate(target: Any, method: Method, vararg params: Any?): Any =
        params.joinToString(":") { param ->
            when (param) {
                is Collection<*> -> param.asSequence()
                    .filterNotNull()
                    .map { it.toString() }
                    .distinct()
                    .sorted()
                    .joinToString(",", "[", "]")
                null -> "null"
                else -> param.toString()
            }
        }
}
