package com.watchtonext.api.controller

import com.watchtonext.api.dto.RecommendationDto
import com.watchtonext.api.service.RecommendationService
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/recommendations")
@Validated
class RecommendationController(private val service: RecommendationService) {

    @GetMapping
    fun recommend(
        @RequestParam userId: UUID,
        @RequestParam(defaultValue = "20") limit: Int,
    ): List<RecommendationDto> =
        service.recommendFor(userId, limit.coerceIn(1, 100))

    @GetMapping("/similar")
    fun similar(
        @RequestParam @Min(1) movieId: Long,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) limit: Int,
    ): List<RecommendationDto> =
        service.similarTo(movieId, limit)
}
