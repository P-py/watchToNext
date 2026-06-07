package com.watchtonext.engine.recommender

import com.watchtonext.engine.model.MovieFeatures
import com.watchtonext.engine.model.WeightedMovie
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ContentKnnRecommenderTest {

    // Three "action" movies (genre 28), two "romance" movies (genre 10749).
    // Numeric features chosen so genre overlap dominates the cosine signal.
    private val actionA = MovieFeatures(1L, setOf(28), voteAverage = 7.5, voteCount = 1000, popularity = 50.0)
    private val actionB = MovieFeatures(2L, setOf(28), voteAverage = 7.8, voteCount = 1200, popularity = 60.0)
    private val actionC = MovieFeatures(3L, setOf(28), voteAverage = 6.9, voteCount = 800, popularity = 40.0)
    private val romanceA = MovieFeatures(4L, setOf(10749), voteAverage = 7.0, voteCount = 700, popularity = 35.0)
    private val romanceB = MovieFeatures(5L, setOf(10749), voteAverage = 7.2, voteCount = 900, popularity = 45.0)

    private val catalog = listOf(actionA, actionB, actionC, romanceA, romanceB)
    private val recommender = ContentKnnRecommender(catalog)

    @Test
    fun `recommends same-genre movies for a single action seed`() {
        val ranked = recommender.recommend(seeds = listOf(WeightedMovie(actionA.movieId, 5.0)), limit = 4)
        val ids = ranked.map { it.movieId }

        assertThat(ids.indexOf(actionB.movieId)).isLessThan(ids.indexOf(romanceA.movieId))
        assertThat(ids.indexOf(actionC.movieId)).isLessThan(ids.indexOf(romanceA.movieId))
        assertThat(ids.indexOf(actionB.movieId)).isLessThan(ids.indexOf(romanceB.movieId))
        assertThat(ids.indexOf(actionC.movieId)).isLessThan(ids.indexOf(romanceB.movieId))
    }

    @Test
    fun `excludes the seed and explicitly excluded ids`() {
        val ranked = recommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 5.0)),
            limit = 10,
            excludeIds = setOf(actionB.movieId),
        )
        val ids = ranked.map { it.movieId }

        assertThat(ids).doesNotContain(actionA.movieId, actionB.movieId)
    }

    @Test
    fun `weights add up across multiple seeds`() {
        val ranked = recommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 5.0), WeightedMovie(actionB.movieId, 5.0)),
            limit = 5,
        )

        assertThat(ranked.first().movieId).isEqualTo(actionC.movieId)
    }

    @Test
    fun `empty seeds returns empty result`() {
        assertThat(recommender.recommend(seeds = emptyList(), limit = 10)).isEmpty()
    }

    @Test
    fun `non-positive limit returns empty result`() {
        assertThat(recommender.recommend(seeds = listOf(WeightedMovie(actionA.movieId, 1.0)), limit = 0)).isEmpty()
    }

    @Test
    fun `respects limit`() {
        val ranked = recommender.recommend(seeds = listOf(WeightedMovie(actionA.movieId, 1.0)), limit = 2)

        assertThat(ranked).hasSize(2)
    }

    @Test
    fun `favorite boost weighting changes ranking`() {
        val boosted = recommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 4.0), WeightedMovie(romanceA.movieId, 4.0 * 5.0)),
            limit = 5,
        )

        assertThat(boosted.first().movieId).isEqualTo(romanceB.movieId)
    }

    @Test
    fun `unknown seed id is ignored without crashing`() {
        val ranked = recommender.recommend(
            seeds = listOf(WeightedMovie(movieId = 9_999L, weight = 1.0)),
            limit = 5,
        )

        // No seeds in the catalog -> nothing to score against -> empty result.
        assertThat(ranked).isEmpty()
    }

    @Test
    fun `single-movie catalog recommends nothing for that seed`() {
        val singletonRecommender = ContentKnnRecommender(listOf(actionA))

        val ranked = singletonRecommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 1.0)),
            limit = 5,
        )

        // Only candidate is the seed itself, which is excluded.
        assertThat(ranked).isEmpty()
    }

    @Test
    fun `empty catalog yields empty recommendations`() {
        val emptyRecommender = ContentKnnRecommender(emptyList())

        val ranked = emptyRecommender.recommend(
            seeds = listOf(WeightedMovie(1L, 1.0)),
            limit = 5,
        )

        assertThat(ranked).isEmpty()
    }

    @Test
    fun `repeated calls return identical results (memoized neighbors)`() {
        val seeds = listOf(WeightedMovie(actionA.movieId, 5.0))
        val first = recommender.recommend(seeds, limit = 4)
        val second = recommender.recommend(seeds, limit = 4)

        assertThat(second).isEqualTo(first)
    }

    @Test
    fun `neighbor cap keeps single-seed results identical to the full ranking`() {
        // Cap below catalog size; for a single seed the top-`limit` (limit <= cap) must still
        // match the uncapped recommender, since top-`limit` is a subset of the cached top-K.
        val capped = ContentKnnRecommender(catalog, neighborCacheSize = 2)
        val full = ContentKnnRecommender(catalog, neighborCacheSize = 500)
        val seeds = listOf(WeightedMovie(actionA.movieId, 3.0))

        assertThat(capped.recommend(seeds, limit = 2)).isEqualTo(full.recommend(seeds, limit = 2))
    }

    @Test
    fun `lru eviction of cached seeds does not change results`() {
        val tiny = ContentKnnRecommender(catalog, maxCachedSeeds = 1)
        val seeds = listOf(WeightedMovie(actionA.movieId, 1.0))

        val before = tiny.recommend(seeds, limit = 3)
        // A different seed evicts actionA's memoized neighbors (cache holds at most one seed).
        tiny.recommend(listOf(WeightedMovie(romanceA.movieId, 1.0)), limit = 3)
        val after = tiny.recommend(seeds, limit = 3)

        assertThat(after).isEqualTo(before)
    }

    @Test
    fun `zero-vector candidate is filtered by cosine guard`() {
        // A candidate with no genres (empty set) and all numeric features at the min value
        // produces a zero-norm vector; cosine must return 0 (not NaN) and the candidate must
        // be skipped rather than tying with positive matches.
        val zero = MovieFeatures(99L, emptySet(), voteAverage = 0.0, voteCount = 0, popularity = 0.0)
        val r = ContentKnnRecommender(listOf(actionA, actionB, zero))

        val ranked = r.recommend(seeds = listOf(WeightedMovie(actionA.movieId, 1.0)), limit = 5)

        assertThat(ranked.map { it.movieId }).doesNotContain(zero.movieId)
    }
}
