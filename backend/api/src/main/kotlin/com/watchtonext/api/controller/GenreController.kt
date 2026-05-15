package com.watchtonext.api.controller

import com.watchtonext.api.dto.GenreDto
import com.watchtonext.api.service.GenreService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/genres")
class GenreController(private val service: GenreService) {

    @GetMapping
    fun list(): List<GenreDto> = service.listGenres()
}
