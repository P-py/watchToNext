package com.watchtonext.api.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "genres")
class GenreEntity(
    @Id
    val id: Int,

    @Column(nullable = false, length = 100)
    val name: String,
)
