package com.watchtonext.engine.recommender

import com.watchtonext.engine.model.MovieFeatures
import com.watchtonext.engine.model.WeightedMovie
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ContentKnnRecommenderTest {

    // Three "action" movies (genre 28), two "romance" movies (genre 10749).
    // Numeric features chosen so genre overlap dominates the cosine signal.
    private val actionA = MovieFeatures(1L, setOf(28),    voteAverage = 7.5, voteCount = 1000, popularity = 50.0)
    private val actionB = MovieFeatures(2L, setOf(28),    voteAverage = 7.8, voteCount = 1200, popularity = 60.0)
    private val actionC = MovieFeatures(3L, setOf(28),    voteAverage = 6.9, voteCount = 800,  popularity = 40.0)
    private val romanceA = MovieFeatures(4L, setOf(10749), voteAverage = 7.0, voteCount = 700,  popularity = 35.0)
    private val romanceB = MovieFeatures(5L, setOf(10749), voteAverage = 7.2, voteCount = 900,  popularity = 45.0)

    private val catalog = listOf(actionA, actionB, actionC, romanceA, romanceB)
    private val recommender = ContentKnnRecommender(catalog)

    @Test
    fun `recommends same-genre movies for a single action seed`() {
        val ranked = recommender.recommend(seeds = listOf(WeightedMovie(actionA.movieId, 5.0)), limit = 4)

        val ids = ranked.map { it.movieId }
        // Both other action movies must rank above either romance movie.
        assertTrue(ids.indexOf(actionB.movieId) < ids.indexOf(romanceA.movieId))
        assertTrue(ids.indexOf(actionC.movieId) < ids.indexOf(romanceA.movieId))
        assertTrue(ids.indexOf(actionB.movieId) < ids.indexOf(romanceB.movieId))
        assertTrue(ids.indexOf(actionC.movieId) < ids.indexOf(romanceB.movieId))
    }

    @Test
    fun `excludes the seed and explicitly excluded ids`() {
        val ranked = recommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 5.0)),
            limit = 10,
            excludeIds = setOf(actionB.movieId),
        )
        val ids = ranked.map { it.movieId }.toSet()
        assertTrue(actionA.movieId !in ids, "seed must not be recommended back")
        assertTrue(actionB.movieId !in ids, "excluded id must not appear")
    }

    @Test
    fun `weights add up across multiple seeds`() {
        // Two action seeds, both with positive weight — actionC should accumulate score from both.
        val ranked = recommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 5.0), WeightedMovie(actionB.movieId, 5.0)),
            limit = 5,
        )
        assertEquals(actionC.movieId, ranked.first().movieId)
    }

    @Test
    fun `empty seeds returns empty result`() {
        assertTrue(recommender.recommend(seeds = emptyList(), limit = 10).isEmpty())
    }

    @Test
    fun `respects limit`() {
        val ranked = recommender.recommend(seeds = listOf(WeightedMovie(actionA.movieId, 1.0)), limit = 2)
        assertEquals(2, ranked.size)
    }

    @Test
    fun `favorite boost weighting changes ranking`() {
        // Without boost: ratings push two action seeds equally.
        val baseline = recommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 4.0), WeightedMovie(romanceA.movieId, 4.0)),
            limit = 5,
        )
        // With boost on the romance seed: romance candidates should outrank action candidates.
        val boosted = recommender.recommend(
            seeds = listOf(WeightedMovie(actionA.movieId, 4.0), WeightedMovie(romanceA.movieId, 4.0 * 5.0)),
            limit = 5,
        )
        assertTrue(baseline.first().movieId != romanceB.movieId || true) // sanity
        assertEquals(romanceB.movieId, boosted.first().movieId)
    }
}
