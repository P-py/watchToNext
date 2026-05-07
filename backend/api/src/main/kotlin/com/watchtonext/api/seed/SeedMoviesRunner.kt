package com.watchtonext.api.seed

import com.opencsv.CSVReader
import org.flywaydb.core.Flyway
import org.slf4j.LoggerFactory
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.io.File
import java.sql.Connection
import java.sql.DriverManager
import java.sql.Types

private val log = LoggerFactory.getLogger("SeedMoviesRunner")

fun main() {
    val url      = System.getenv("SPRING_DATASOURCE_URL")      ?: "jdbc:postgresql://localhost:5432/watchtonext"
    val user     = System.getenv("SPRING_DATASOURCE_USERNAME") ?: "watchtonext"
    val password = System.getenv("SPRING_DATASOURCE_PASSWORD") ?: "watchtonext"
    val csvPath  = System.getProperty("seed.csvPath") ?: System.getenv("SEED_CSV_PATH") ?: "../"

    log.info("Running Flyway schema migrations...")
    Flyway.configure()
        .dataSource(url, user, password)
        .locations("classpath:db/migration")
        .load()
        .migrate()

    log.info("Seeding from CSVs at '$csvPath'")
    DriverManager.getConnection(url, user, password).use { conn ->
        MovieSeeder(conn, File(csvPath)).seed()
    }
}

internal class MovieSeeder(private val conn: Connection, private val csvDir: File) {

    private val mapper = jacksonObjectMapper()

    fun seed() {
        val moviesFile  = csvDir.resolve("tmdb_5000_movies.csv")
        val creditsFile = csvDir.resolve("tmdb_5000_credits.csv")

        require(moviesFile.exists())  { "Missing ${moviesFile.absolutePath} — download from Kaggle first." }
        require(creditsFile.exists()) { "Missing ${creditsFile.absolutePath} — download from Kaggle first." }

        val existing = conn.createStatement()
            .executeQuery("SELECT COUNT(*) FROM movies")
            .use { rs -> rs.next(); rs.getLong(1) }

        if (existing > 0L) {
            log.info("Database already contains $existing movies — skipping seed.")
            return
        }

        log.info("Parsing cast data...")
        val castByTmdbId = parseCast(creditsFile)

        log.info("Inserting movies...")
        conn.autoCommit = false
        try {
            insertMovies(moviesFile, castByTmdbId)
            conn.commit()
            log.info("Seed complete.")
        } catch (e: Exception) {
            conn.rollback()
            throw e
        } finally {
            conn.autoCommit = true
        }
    }

    // ── CSV parsers ────────────────────────────────────────────────────────────

    private data class CastRow(
        val tmdbPersonId: Long?,
        val name: String,
        val character: String?,
        val order: Int?,
        val profilePath: String?,
    )

    private data class GenreRow(val id: Int, val name: String)

    private fun parseCast(file: File): Map<Long, List<CastRow>> {
        val result = HashMap<Long, List<CastRow>>()
        csvReader(file).use { reader ->
            val headers = reader.readNext() ?: return result
            val idx = headers.indexed()

            var row: Array<String>?
            while (reader.readNext().also { row = it } != null) {
                val r = row!!
                val tmdbId = r.at(idx, "movie_id")?.toLongOrNull() ?: continue
                val castJson = r.at(idx, "cast") ?: continue

                val entries = runCatching {
                    mapper.readValue(castJson, List::class.java)
                        .take(10)
                        .map { raw ->
                            @Suppress("UNCHECKED_CAST")
                            val c = raw as Map<String, Any?>
                            CastRow(
                                tmdbPersonId = (c["id"] as? Number)?.toLong(),
                                name         = c["name"] as? String ?: "",
                                character    = c["character"] as? String,
                                order        = (c["order"] as? Number)?.toInt(),
                                profilePath  = c["profile_path"] as? String,
                            )
                        }
                }.getOrDefault(emptyList())

                result[tmdbId] = entries
            }
        }
        return result
    }

    private fun insertMovies(file: File, castByTmdbId: Map<Long, List<CastRow>>) {
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
        val castPs = conn.prepareStatement(
            """INSERT INTO cast_members(movie_id, tmdb_person_id, name, character_name, cast_order, profile_path)
               VALUES (?, ?, ?, ?, ?, ?)"""
        )

        genrePs.use { gps ->
        moviePs.use { mps ->
        movieGenrePs.use { mgps ->
        castPs.use { cps ->

        csvReader(file).use { reader ->
            val headers = reader.readNext() ?: return
            val idx = headers.indexed()
            var count = 0

            var row: Array<String>?
            while (reader.readNext().also { row = it } != null) {
                val r = row!!

                val tmdbId = r.at(idx, "id")?.toLongOrNull() ?: continue
                val title  = r.at(idx, "title")?.takeIf { it.isNotBlank() } ?: continue

                val genres = parseGenres(r.at(idx, "genres") ?: "[]")

                genres.forEach { g ->
                    gps.setInt(1, g.id)
                    gps.setString(2, g.name)
                    gps.addBatch()
                }
                gps.executeBatch()

                mps.setLong(1, tmdbId)
                mps.setString(2, title)
                mps.setString(3, r.at(idx, "overview")?.takeIf { it.isNotBlank() })
                mps.setNull(4, Types.VARCHAR)   // poster_path not in TMDB 5000 dataset
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

                castByTmdbId[tmdbId]?.forEach { c ->
                    cps.setLong(1, movieId)
                    cps.setObject(2, c.tmdbPersonId)
                    cps.setString(3, c.name)
                    cps.setString(4, c.character)
                    cps.setObject(5, c.order)
                    cps.setString(6, c.profilePath)
                    cps.addBatch()
                }
                cps.executeBatch()

                if (++count % 500 == 0) log.info("  $count movies inserted...")
            }

            log.info("Inserted $count movies total.")
        }
        }}}}
    }

    private fun parseGenres(json: String): List<GenreRow> = runCatching {
        @Suppress("UNCHECKED_CAST")
        (mapper.readValue(json, List::class.java) as List<Map<String, Any?>>).map { g ->
            GenreRow(id = (g["id"] as Number).toInt(), name = g["name"] as String)
        }
    }.getOrDefault(emptyList())

    // ── helpers ────────────────────────────────────────────────────────────────

    private fun csvReader(file: File) = CSVReader(file.bufferedReader(Charsets.UTF_8))

    private fun Array<String>.indexed(): Map<String, Int> =
        withIndex().associate { (i, h) -> h.trim() to i }

    private fun Array<String>.at(idx: Map<String, Int>, col: String): String? =
        idx[col]?.let { getOrNull(it)?.trim()?.takeIf { v -> v.isNotEmpty() } }
}
