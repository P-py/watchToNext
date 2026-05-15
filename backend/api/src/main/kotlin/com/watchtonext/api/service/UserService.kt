package com.watchtonext.api.service

import com.watchtonext.api.dto.UserMeDto
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
import com.watchtonext.api.persistence.repository.UserRepository
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userProvisioningService: UserProvisioningService,
    private val userRepository: UserRepository,
    private val ratingRepository: UserMovieRatingRepository,
    private val favoriteRepository: UserFavoriteRepository,
) {

    fun getMe(jwt: Jwt): UserMeDto {
        // Defensive: UserProvisioningFilter normally creates the row before this runs,
        // but it swallows exceptions on failure. Calling provision again is idempotent
        // and costs one extra SELECT when the row already exists.
        userProvisioningService.provision(jwt)

        val id = UUID.fromString(jwt.subject)
        val user = userRepository.findById(id).orElseThrow {
            IllegalStateException("user row missing after provisioning for sub=$id")
        }
        val ratingsCount = ratingRepository.countByUserId(id)
        val favoritesCount = favoriteRepository.countByUserId(id)
        return UserMeDto.from(user, ratingsCount, favoritesCount)
    }
}
