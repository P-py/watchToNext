package com.watchtonext.api.service

import com.watchtonext.api.dto.UpdateUserMeRequest
import com.watchtonext.api.dto.UserMeDto
import com.watchtonext.api.persistence.entity.UserEntity
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
import com.watchtonext.api.persistence.repository.UserRepository
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
class UserService(
    private val userProvisioningService: UserProvisioningService,
    private val userRepository: UserRepository,
    private val ratingRepository: UserMovieRatingRepository,
    private val favoriteRepository: UserFavoriteRepository,
) {

    fun getMe(jwt: Jwt): UserMeDto {
        val user = loadUser(jwt)
        return dtoFor(user)
    }

    @Transactional
    fun updateMe(jwt: Jwt, request: UpdateUserMeRequest): UserMeDto {
        val user = loadUser(jwt)
        // request.displayName is non-null/non-blank by @Valid + @NotBlank — bean validation
        // runs before the controller dispatches; if it reaches here the value is safe.
        user.displayName = request.displayName!!.trim()
        user.updatedAt = OffsetDateTime.now()
        return dtoFor(userRepository.save(user))
    }

    private fun loadUser(jwt: Jwt): UserEntity {
        // Defensive: UserProvisioningFilter normally creates the row before this runs,
        // but it swallows exceptions on failure. Calling provision again is idempotent
        // and costs one extra SELECT when the row already exists.
        userProvisioningService.provision(jwt)

        val id = UUID.fromString(jwt.subject)
        return userRepository.findById(id).orElseThrow {
            IllegalStateException("user row missing after provisioning for sub=$id")
        }
    }

    private fun dtoFor(user: UserEntity): UserMeDto {
        val ratingsCount = ratingRepository.countByUserId(user.id)
        val favoritesCount = favoriteRepository.countByUserId(user.id)
        return UserMeDto.from(user, ratingsCount, favoritesCount)
    }
}
