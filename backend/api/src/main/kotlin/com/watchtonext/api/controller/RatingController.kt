package com.watchtonext.api.controller

import com.watchtonext.api.dto.RateMovieRequest
import com.watchtonext.api.dto.RatingDto
import com.watchtonext.api.dto.RatingStatusDto
import com.watchtonext.api.service.UserPreferenceService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/ratings")
class RatingController(private val service: UserPreferenceService) {

    @GetMapping("/{movieId}")
    fun status(
        @PathVariable movieId: Long,
        @AuthenticationPrincipal jwt: Jwt,
    ): RatingStatusDto {
        val userId = UUID.fromString(jwt.subject)
        return RatingStatusDto(service.getRating(userId, movieId))
    }

    @PutMapping("/{movieId}")
    fun rate(
        @PathVariable movieId: Long,
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody body: RateMovieRequest,
    ): RatingDto {
        val userId = UUID.fromString(jwt.subject)
        return RatingDto.from(service.upsertRating(userId, movieId, body.rating!!))
    }

    @DeleteMapping("/{movieId}")
    fun unrate(
        @PathVariable movieId: Long,
        @AuthenticationPrincipal jwt: Jwt,
    ): ResponseEntity<Void> {
        val userId = UUID.fromString(jwt.subject)
        service.deleteRating(userId, movieId)
        return ResponseEntity.noContent().build()
    }
}
