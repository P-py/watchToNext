package com.watchtonext.api.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "cast_members")
class CastMemberEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    val movie: MovieEntity,

    @Column(name = "tmdb_person_id")
    val tmdbPersonId: Long? = null,

    @Column(nullable = false, length = 200)
    val name: String,

    @Column(name = "character_name", length = 300)
    val characterName: String? = null,

    @Column(name = "cast_order")
    val castOrder: Int? = null,

    @Column(name = "profile_path", length = 500)
    val profilePath: String? = null,
)
