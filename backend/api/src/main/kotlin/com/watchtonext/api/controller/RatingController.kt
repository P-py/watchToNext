package com.watchtonext.api.controller

import com.watchtonext.api.dto.RateMovieRequest
import com.watchtonext.api.dto.RatingDto
import com.watchtonext.api.service.UserPreferenceService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/ratings")
class RatingController(private val service: UserPreferenceService) {

    @PutMapping("/{movieId}")
    fun rate(
        @PathVariable movieId: Long,
        @RequestParam userId: UUID,
        @Valid @RequestBody body: RateMovieRequest,
    ): RatingDto = RatingDto.from(service.upsertRating(userId, movieId, body.rating!!))

    @DeleteMapping("/{movieId}")
    fun unrate(
        @PathVariable movieId: Long,
        @RequestParam userId: UUID,
    ): ResponseEntity<Void> {
        service.deleteRating(userId, movieId)
        return ResponseEntity.noContent().build()
    }
}
