package com.watchtonext.engine.port

import com.watchtonext.engine.model.Movie

interface MovieMetadataClient {
    fun findByTmdbId(tmdbId: Long): Movie?
    fun search(query: String): List<Movie>
    fun findPopular(limit: Int = 20): List<Movie>
}
