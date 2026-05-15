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
 * write path for the `users` table. It is meant to be invoked once per authenticated request
 * (filter or controller advice — wired in a separate card) and will reconcile `displayName`
 * and `email` whenever the claims diverge from the stored row.
 */
@Service
class UserProvisioningService(private val userRepository: UserRepository) {

    fun provision(jwt: Jwt): UserEntity {
        val id = UUID.fromString(jwt.subject)
        val claimedDisplayName = resolveDisplayName(jwt, id)
        val claimedEmail = jwt.getClaimAsString(EMAIL_CLAIM)

        val existing = userRepository.findById(id).orElse(null)
        if (existing == null) {
            return userRepository.save(
                UserEntity(id = id, displayName = claimedDisplayName, email = claimedEmail),
            )
        }

        val needsUpdate = existing.displayName != claimedDisplayName || existing.email != claimedEmail
        if (!needsUpdate) return existing

        existing.displayName = claimedDisplayName
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
