package com.watchtonext.engine.recommender

import com.watchtonext.engine.model.MovieFeatures
import com.watchtonext.engine.model.ScoredMovie
import com.watchtonext.engine.model.WeightedMovie
import kotlin.math.sqrt

/**
 * Item-item content-based KNN recommender.
 *
 * Feature vector layout: [ one-hot genres | voteAverage | voteCount | popularity ]
 * Numeric features are min-max scaled to [0, 1] so they share range with the binary genre features
 * and so cosine never goes negative.
 *
 * Scoring: for each seed s with weight w, every catalog candidate c receives
 *   score[c] += cosine(s, c) * w
 * Already-rated movies (passed in `excludeIds`) and the seeds themselves are filtered out.
 *
 * Deterministic for a given catalog + seed list — ties broken by movieId ascending.
 *
 * ## Per-seed neighbor memoization
 * A seed's cosine to every candidate depends only on the catalog, which is fixed for the lifetime
 * of a recommender instance. So the sorted neighbor list of each seed is computed once and reused:
 * subsequent `recommend` calls only re-apply weights, exclusions and the final top-`limit` cut.
 * Each list is capped to [neighborCacheSize] entries and the cache holds at most [maxCachedSeeds]
 * seeds (LRU eviction) to bound memory.
 *
 * Single-seed callers (`/similar`, `/from`) stay result-identical to the un-memoized version as long
 * as [neighborCacheSize] >= the requested limit, because the final top-`limit` is a subset of the
 * cached top-K. Multi-seed callers are near-identical: a candidate could in theory rank into the
 * final top-`limit` purely through many tiny contributions that each fall outside their seed's top-K.
 */
class ContentKnnRecommender(
    private val catalog: List<MovieFeatures>,
    private val neighborCacheSize: Int = 500,
    private val maxCachedSeeds: Int = 1024,
) {

    private val genreIndex: Map<Int, Int>
    private val vectors: Map<Long, DoubleArray>

    // Access-ordered LinkedHashMap = LRU; guarded by `synchronized(neighborCache)` on every touch.
    private val neighborCache: MutableMap<Long, List<ScoredMovie>> =
        object : LinkedHashMap<Long, List<ScoredMovie>>(16, 0.75f, true) {
            override fun removeEldestEntry(eldest: Map.Entry<Long, List<ScoredMovie>>): Boolean =
                size > maxCachedSeeds
        }

    init {
        require(neighborCacheSize >= 1) {
            "neighborCacheSize must be >= 1, was $neighborCacheSize"
        }
        require(maxCachedSeeds >= 1) {
            "maxCachedSeeds must be >= 1, was $maxCachedSeeds"
        }

        val allGenres = catalog.flatMap { it.genreIds }.toSortedSet()
        genreIndex = allGenres.withIndex().associate { (i, g) -> g to i }

        val voteAvgScaler = MinMax.fit(catalog.map { it.voteAverage })
        val voteCountScaler = MinMax.fit(catalog.map { it.voteCount.toDouble() })
        val popularityScaler = MinMax.fit(catalog.map { it.popularity })

        vectors = catalog.associate { movie ->
            val v = DoubleArray(genreIndex.size + 3)
            movie.genreIds.forEach { g -> genreIndex[g]?.let { v[it] = 1.0 } }
            v[genreIndex.size]     = voteAvgScaler.scale(movie.voteAverage)
            v[genreIndex.size + 1] = voteCountScaler.scale(movie.voteCount.toDouble())
            v[genreIndex.size + 2] = popularityScaler.scale(movie.popularity)
            movie.movieId to v
        }
    }

    fun recommend(
        seeds: List<WeightedMovie>,
        limit: Int,
        excludeIds: Set<Long> = emptySet(),
    ): List<ScoredMovie> {
        if (seeds.isEmpty() || limit <= 0) return emptyList()

        val excluded = excludeIds + seeds.map { it.movieId }
        val scores = HashMap<Long, Double>(catalog.size)

        seeds.forEach { seed ->
            neighborsOf(seed.movieId).forEach { neighbor ->
                if (neighbor.movieId in excluded) return@forEach
                scores.merge(neighbor.movieId, neighbor.score * seed.weight) { a, b -> a + b }
            }
        }

        return scores.entries
            .asSequence()
            .map { ScoredMovie(it.key, it.value) }
            .sortedWith(compareByDescending<ScoredMovie> { it.score }.thenBy { it.movieId })
            .take(limit)
            .toList()
    }

    /**
     * The seed's top-[neighborCacheSize] candidates by cosine (sim > 0), sorted desc by score then
     * movieId. The seed itself is dropped (it is always excluded by `recommend`). Memoized per seed.
     */
    private fun neighborsOf(seedId: Long): List<ScoredMovie> {
        synchronized(neighborCache) { neighborCache[seedId]?.let { return it } }

        val computed = computeNeighbors(seedId)

        synchronized(neighborCache) { neighborCache[seedId] = computed }
        return computed
    }

    private fun computeNeighbors(seedId: Long): List<ScoredMovie> {
        val sv = vectors[seedId] ?: return emptyList()
        return catalog.asSequence()
            .filter { it.movieId != seedId }
            .map { ScoredMovie(it.movieId, cosine(sv, vectors.getValue(it.movieId))) }
            .filter { it.score > 0.0 }
            .sortedWith(compareByDescending<ScoredMovie> { it.score }.thenBy { it.movieId })
            .take(neighborCacheSize)
            .toList()
    }

    private data class MinMax(val min: Double, val max: Double) {
        fun scale(x: Double): Double {
            val span = max - min
            return if (span == 0.0) 0.0 else ((x - min) / span).coerceIn(0.0, 1.0)
        }
        companion object {
            fun fit(values: List<Double>): MinMax =
                if (values.isEmpty()) MinMax(0.0, 0.0)
                else MinMax(values.min(), values.max())
        }
    }

    private fun cosine(a: DoubleArray, b: DoubleArray): Double {
        var dot = 0.0
        var normA = 0.0
        var normB = 0.0
        for (i in a.indices) {
            dot += a[i] * b[i]
            normA += a[i] * a[i]
            normB += b[i] * b[i]
        }
        val denom = sqrt(normA) * sqrt(normB)
        return if (denom == 0.0) 0.0 else dot / denom
    }
}
