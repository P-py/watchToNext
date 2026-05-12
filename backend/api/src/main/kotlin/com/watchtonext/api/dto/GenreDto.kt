package com.watchtonext.api.dto

import com.watchtonext.api.persistence.entity.GenreEntity

data class GenreDto(
    val id: Int,
    val name: String,
) {
    companion object {
        fun from(entity: GenreEntity) = GenreDto(id = entity.id, name = entity.name)
    }
}
