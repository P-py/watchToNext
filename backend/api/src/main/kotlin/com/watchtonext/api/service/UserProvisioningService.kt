package com.watchtonext.api.service

import com.watchtonext.api.persistence.entity.UserEntity
import com.watchtonext.api.persistence.repository.UserRepository
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.UUID

/**
 * Idempotent on-demand provisioning of a [UserEntity] from a Keycloak JWT.
 *
 * The persisted row's primary key is the token's `sub` claim, so this service is the only
 * write path the auth filter touches on the `users` table. On creation we seed
 * `displayName` from the JWT claims; on subsequent calls we **only reconcile `email`**,
 * leaving `displayName` for the user to edit via `PATCH /users/me` without it being
 * silently overwritten on the next login.
 */
@Service
class UserProvisioningService(private val userRepository: UserRepository) {

    fun provision(jwt: Jwt): UserEntity {
        val id = UUID.fromString(jwt.subject)
        val claimedEmail = jwt.getClaimAsString(EMAIL_CLAIM)

        val existing = userRepository.findById(id).orElse(null)
        if (existing == null) {
            val claimedDisplayName = resolveDisplayName(jwt, id)
            return userRepository.save(
                UserEntity(id = id, displayName = claimedDisplayName, email = claimedEmail),
            )
        }

        if (existing.email == claimedEmail) return existing

        existing.email = claimedEmail
        existing.updatedAt = OffsetDateTime.now()
        return userRepository.save(existing)
    }

    private fun resolveDisplayName(jwt: Jwt, id: UUID): String =
        jwt.getClaimAsString(PREFERRED_USERNAME_CLAIM)
            ?: jwt.getClaimAsString(NAME_CLAIM)
            ?: "user-${id.toString().take(FALLBACK_NAME_SUFFIX_LEN)}"

    private companion object {
        const val PREFERRED_USERNAME_CLAIM = "preferred_username"
        const val NAME_CLAIM = "name"
        const val EMAIL_CLAIM = "email"
        const val FALLBACK_NAME_SUFFIX_LEN = 8
    }
}
