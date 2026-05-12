package com.watchtonext.api.controller

import com.watchtonext.api.dto.FavoriteDto
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
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/users/{userId}")
class UserPreferenceController(private val service: UserPreferenceService) {

    @PutMapping("/ratings/{movieId}")
    fun rate(
        @PathVariable userId: UUID,
        @PathVariable movieId: Long,
        @Valid @RequestBody body: RateMovieRequest,
    ): RatingDto = RatingDto.from(service.upsertRating(userId, movieId, body.rating!!))

    @DeleteMapping("/ratings/{movieId}")
    fun unrate(
        @PathVariable userId: UUID,
        @PathVariable movieId: Long,
    ): ResponseEntity<Void> {
        service.deleteRating(userId, movieId)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/favorites/{movieId}")
    fun favorite(
        @PathVariable userId: UUID,
        @PathVariable movieId: Long,
    ): FavoriteDto = FavoriteDto.from(service.addFavorite(userId, movieId))

    @DeleteMapping("/favorites/{movieId}")
    fun unfavorite(
        @PathVariable userId: UUID,
        @PathVariable movieId: Long,
    ): ResponseEntity<Void> {
        service.removeFavorite(userId, movieId)
        return ResponseEntity.noContent().build()
    }
}
