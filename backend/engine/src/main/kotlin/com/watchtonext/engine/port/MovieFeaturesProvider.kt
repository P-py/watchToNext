package com.watchtonext.engine.port

import com.watchtonext.engine.model.MovieFeatures

/**
 * Source of movie feature vectors for the recommender.
 * Implementations live outside the engine (e.g. a JPA adapter in :api).
 */
interface MovieFeaturesProvider {
    /** All movies the recommender can consider as candidates. */
    fun loadCatalog(): List<MovieFeatures>

    /** Subset of the catalog by movie id — used to fetch the seed feature vectors. */
    fun findByIds(ids: Collection<Long>): List<MovieFeatures>
}
