package com.watchtonext.api.seed

import com.opencsv.CSVReader
import org.flywaydb.core.Flyway
import org.slf4j.LoggerFactory
import java.io.File
import java.sql.Connection
import java.sql.DriverManager

private val log = LoggerFactory.getLogger("SeedMoviesRunner")

fun main() {
    val url      = System.getenv("SPRING_DATASOURCE_URL")      ?: "jdbc:postgresql://localhost:5432/watchtonext"
    val user     = System.getenv("SPRING_DATASOURCE_USERNAME") ?: "watchtonext"
    val password = System.getenv("SPRING_DATASOURCE_PASSWORD") ?: "watchtonext"
    val csvPath  = System.getProperty("seed.csvPath") ?: System.getenv("SEED_CSV_PATH") ?: "../"
    val batchSize = (System.getProperty("seed.batchSize") ?: System.getenv("SEED_BATCH_SIZE"))
        ?.toIntOrNull()?.takeIf { it > 0 } ?: 5_000
    val maxRows   = (System.getProperty("seed.maxRows") ?: System.getenv("SEED_MAX_ROWS"))
        ?.toIntOrNull()?.takeIf { it > 0 } ?: Int.MAX_VALUE

    log.info("Running Flyway schema migrations...")
    Flyway.configure()
        .dataSource(url, user, password)
        .locations("classpath:db/migration")
        .load()
        .migrate()

    log.info("Seeding from '$csvPath' (batchSize=$batchSize, maxRows=${if (maxRows == Int.MAX_VALUE) "∞" else maxRows})")
    DriverManager.getConnection(url, user, password).use { conn ->
        MovieSeeder(conn, File(csvPath), batchSize, maxRows).seed()
    }
}

internal class MovieSeeder(
    private val conn: Connection,
    private val csvDir: File,
    private val batchSize: Int = 5_000,
    private val maxRows: Int = Int.MAX_VALUE,
) {

    private data class GenreRow(val id: Int, val name: String)

    // Standard TMDB genre IDs — https://developer.themoviedb.org/reference/genre-movie-list
    private val GENRE_IDS = mapOf(
        "Action"           to 28,
        "Adventure"        to 12,
        "Animation"        to 16,
        "Comedy"           to 35,
        "Crime"            to 80,
        "Documentary"      to 99,
        "Drama"            to 18,
        "Family"           to 10751,
        "Fantasy"          to 14,
        "History"          to 36,
        "Horror"           to 27,
        "Music"            to 10402,
        "Mystery"          to 9648,
        "Romance"          to 10749,
        "Science Fiction"  to 878,
        "TV Movie"         to 10770,
        "Thriller"         to 53,
        "War"              to 10752,
        "Western"          to 37,
    )

    fun seed() {
        val moviesFile = csvDir.resolve("TMDB_movie_dataset_v11.csv")

        require(moviesFile.exists()) {
            "Missing ${moviesFile.absolutePath} — download from " +
            "https://www.kaggle.com/datasets/asaniczka/tmdb-movies-dataset-2023-930k-movies"
        }

        val existing = conn.createStatement()
            .executeQuery("SELECT COUNT(*) FROM movies")
            .use { rs -> rs.next(); rs.getLong(1) }

        if (existing > 0L) {
            log.info("Database already contains $existing movies — resuming (duplicates skipped via ON CONFLICT).")
        }

        conn.autoCommit = false
        try {
            insertMovies(moviesFile)
            conn.commit()
            log.info("Seed complete.")
        } catch (e: Exception) {
            conn.rollback()
            throw e
        } finally {
            conn.autoCommit = true
        }
    }

    private fun insertMovies(file: File) {
        val genrePs = conn.prepareStatement(
            "INSERT INTO genres(id, name) VALUES (?, ?) ON CONFLICT(id) DO NOTHING"
        )
        val moviePs = conn.prepareStatement(
            """INSERT INTO movies(tmdb_id, title, overview, poster_path, vote_average, vote_count, popularity, release_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(tmdb_id) DO NOTHING
               RETURNING id"""
        )
        val movieGenrePs = conn.prepareStatement(
            "INSERT INTO movie_genres(movie_id, genre_id) VALUES (?, ?) ON CONFLICT DO NOTHING"
        )

        genrePs.use { gps ->
        moviePs.use { mps ->
        movieGenrePs.use { mgps ->

        csvReader(file).use { reader ->
            val headers = reader.readNext() ?: return
            val idx = headers.indexed()
            var inserted = 0
            var processed = 0
            var skippedAdult = 0

            var row: Array<String>?
            loop@ while (reader.readNext().also { row = it } != null) {
                val r = row!!
                processed++

                // Academic project — never seed adult / inappropriate titles.
                // TMDB marks them with the `adult` boolean column.
                if (r.at(idx, "adult")?.equals("true", ignoreCase = true) == true) {
                    skippedAdult++
                    continue
                }

                val tmdbId = r.at(idx, "id")?.toLongOrNull() ?: continue
                val title  = r.at(idx, "title")?.takeIf { it.isNotBlank() } ?: continue

                val genres = parseGenres(r.at(idx, "genres") ?: "")

                genres.forEach { g ->
                    gps.setInt(1, g.id)
                    gps.setString(2, g.name)
                    gps.addBatch()
                }
                gps.executeBatch()

                mps.setLong(1, tmdbId)
                mps.setString(2, title)
                mps.setString(3, r.at(idx, "overview")?.takeIf { it.isNotBlank() })
                mps.setString(4, r.at(idx, "poster_path")?.takeIf { it.isNotBlank() })
                mps.setObject(5, r.at(idx, "vote_average")?.toDoubleOrNull())
                mps.setObject(6, r.at(idx, "vote_count")?.toIntOrNull())
                mps.setObject(7, r.at(idx, "popularity")?.toDoubleOrNull())
                mps.setObject(8, r.at(idx, "release_date")
                    ?.takeIf { it.isNotBlank() }
                    ?.let { runCatching { java.sql.Date.valueOf(it) }.getOrNull() })

                val movieId: Long = mps.executeQuery().use { rs ->
                    if (rs.next()) rs.getLong(1) else return@use -1L
                }
                if (movieId < 0) continue

                genres.forEach { g ->
                    mgps.setLong(1, movieId)
                    mgps.setInt(2, g.id)
                    mgps.addBatch()
                }
                mgps.executeBatch()

                inserted++

                if (inserted % batchSize == 0) {
                    conn.commit()
                    log.info("  $inserted inserted / $processed processed — batch committed")
                }

                if (inserted >= maxRows) {
                    log.info("  reached maxRows=$maxRows — stopping")
                    break@loop
                }
            }

            log.info(
                "Inserted $inserted movies total (processed $processed rows, " +
                    "$skippedAdult adult rows filtered out)."
            )
        }
        }}}
    }

    // Genres in this dataset are comma-separated names, e.g. "Action, Drama, Thriller"
    private fun parseGenres(raw: String): List<GenreRow> {
        if (raw.isBlank()) return emptyList()
        return raw.split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .mapNotNull { name -> GENRE_IDS[name]?.let { id -> GenreRow(id, name) } }
    }

    private fun csvReader(file: File) = CSVReader(file.bufferedReader(Charsets.UTF_8))

    private fun Array<String>.indexed(): Map<String, Int> =
        withIndex().associate { (i, h) -> h.trim() to i }

    private fun Array<String>.at(idx: Map<String, Int>, col: String): String? =
        idx[col]?.let { getOrNull(it)?.trim()?.takeIf { v -> v.isNotEmpty() } }
}
