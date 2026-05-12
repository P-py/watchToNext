package com.watchtonext.api.controller

import com.watchtonext.api.dto.MovieSummaryDto
import com.watchtonext.api.service.MovieService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/movies")
class MovieController(private val service: MovieService) {

    @GetMapping("/popular")
    fun listPopular(
        @RequestParam(defaultValue = "20") limit: Int,
    ): List<MovieSummaryDto> =
        service.listPopular(limit.coerceIn(1, 100))
}
