package com.watchtonext.api.controller

import com.watchtonext.api.dto.WatchedDto
import com.watchtonext.api.dto.WatchedItemDto
import com.watchtonext.api.dto.WatchedStatusDto
import com.watchtonext.api.service.UserPreferenceService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/watched")
class WatchedController(private val service: UserPreferenceService) {

    @GetMapping
    fun list(@AuthenticationPrincipal jwt: Jwt): List<WatchedItemDto> {
        val userId = UUID.fromString(jwt.subject)
        return service.listWatchedItems(userId)
    }

    @PutMapping("/{movieId}")
    fun mark(
        @PathVariable movieId: Long,
        @AuthenticationPrincipal jwt: Jwt,
    ): WatchedDto {
        val userId = UUID.fromString(jwt.subject)
        return WatchedDto.from(service.markWatched(userId, movieId))
    }

    @DeleteMapping("/{movieId}")
    fun unmark(
        @PathVariable movieId: Long,
        @AuthenticationPrincipal jwt: Jwt,
    ): ResponseEntity<Void> {
        val userId = UUID.fromString(jwt.subject)
        service.unmarkWatched(userId, movieId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{movieId}")
    fun status(
        @PathVariable movieId: Long,
        @AuthenticationPrincipal jwt: Jwt,
    ): WatchedStatusDto {
        val userId = UUID.fromString(jwt.subject)
        return WatchedStatusDto(service.isWatched(userId, movieId))
    }
}
