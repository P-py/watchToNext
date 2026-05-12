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
 */
class ContentKnnRecommender(private val catalog: List<MovieFeatures>) {

    private val genreIndex: Map<Int, Int>
    private val vectors: Map<Long, DoubleArray>

    init {
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
            val sv = vectors[seed.movieId] ?: return@forEach
            catalog.forEach { candidate ->
                if (candidate.movieId in excluded) return@forEach
                val cv = vectors.getValue(candidate.movieId)
                val sim = cosine(sv, cv)
                if (sim > 0.0) {
                    scores.merge(candidate.movieId, sim * seed.weight) { a, b -> a + b }
                }
            }
        }

        return scores.entries
            .asSequence()
            .map { ScoredMovie(it.key, it.value) }
            .sortedWith(compareByDescending<ScoredMovie> { it.score }.thenBy { it.movieId })
            .take(limit)
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
