package com.watchtonext.api.controller

import com.watchtonext.api.dto.MovieSummaryDto
import com.watchtonext.api.dto.PageDto
import com.watchtonext.api.service.MovieService
import com.watchtonext.api.service.MovieSort
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/movies")
@Validated
class MovieController(private val service: MovieService) {

    @GetMapping("/popular")
    fun listPopular(
        @RequestParam(defaultValue = "1") @Min(1) page: Int,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) size: Int,
        @RequestParam(required = false) genreId: Int?,
        @RequestParam(defaultValue = "RELEVANCE") sort: MovieSort,
    ): PageDto<MovieSummaryDto> =
        if (genreId != null) service.listPopularByGenre(genreId, page, size)
        else service.listPopular(page, size, sort)

    @GetMapping
    fun search(
        @RequestParam @NotBlank q: String,
        @RequestParam(defaultValue = "1") @Min(1) page: Int,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) size: Int,
    ): PageDto<MovieSummaryDto> =
        service.searchByTitle(q.trim(), page, size)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): MovieSummaryDto =
        service.getById(id)
}
