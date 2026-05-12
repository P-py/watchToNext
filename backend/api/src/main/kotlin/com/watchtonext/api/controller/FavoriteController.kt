package com.watchtonext.api.controller

import com.watchtonext.api.dto.FavoriteDto
import com.watchtonext.api.service.UserPreferenceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/favorites")
class FavoriteController(private val service: UserPreferenceService) {

    @PutMapping("/{movieId}")
    fun favorite(
        @PathVariable movieId: Long,
        @RequestParam userId: UUID,
    ): FavoriteDto = FavoriteDto.from(service.addFavorite(userId, movieId))

    @DeleteMapping("/{movieId}")
    fun unfavorite(
        @PathVariable movieId: Long,
        @RequestParam userId: UUID,
    ): ResponseEntity<Void> {
        service.removeFavorite(userId, movieId)
        return ResponseEntity.noContent().build()
    }
}
