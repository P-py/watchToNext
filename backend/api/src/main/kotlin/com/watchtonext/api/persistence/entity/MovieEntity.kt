package com.watchtonext.api.persistence.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.LocalDate

@Entity
@Table(name = "movies")
class MovieEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "tmdb_id", nullable = false, unique = true)
    val tmdbId: Long,

    @Column(nullable = false, length = 500)
    val title: String,

    @Column(columnDefinition = "TEXT")
    val overview: String? = null,

    /** Relative path — not present in TMDB 5000 dataset, populated when available. */
    @Column(name = "poster_path", length = 500)
    val posterPath: String? = null,

    @Column(name = "vote_average")
    val voteAverage: Double? = null,

    @Column(name = "vote_count")
    val voteCount: Int? = null,

    @Column
    val popularity: Double? = null,

    @Column(name = "release_date")
    val releaseDate: LocalDate? = null,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "movie_genres",
        joinColumns = [JoinColumn(name = "movie_id")],
        inverseJoinColumns = [JoinColumn(name = "genre_id")],
    )
    val genres: MutableSet<GenreEntity> = mutableSetOf(),

    @OneToMany(mappedBy = "movie", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, orphanRemoval = true)
    val cast: MutableList<CastMemberEntity> = mutableListOf(),
)
