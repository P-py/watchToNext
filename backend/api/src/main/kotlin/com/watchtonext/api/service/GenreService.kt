package com.watchtonext.api.service

import com.watchtonext.api.dto.GenreDto
import com.watchtonext.api.persistence.repository.GenreRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class GenreService(private val genreRepository: GenreRepository) {

    /** All genres, alphabetically — backs the genre filter on the suggestions page. */
    @Transactional(readOnly = true)
    fun listGenres(): List<GenreDto> =
        genreRepository.findAll()
            .map(GenreDto::from)
            .sortedBy { it.name }
}
