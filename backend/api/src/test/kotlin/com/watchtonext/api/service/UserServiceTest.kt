package com.watchtonext.api.service

import com.watchtonext.api.persistence.entity.UserEntity
import com.watchtonext.api.persistence.repository.UserFavoriteRepository
import com.watchtonext.api.persistence.repository.UserMovieRatingRepository
import com.watchtonext.api.persistence.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.jwt.Jwt
import java.time.Instant
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

class UserServiceTest {

    private val userProvisioningService = mockk<UserProvisioningService>()
    private val userRepository = mockk<UserRepository>()
    private val ratingRepository = mockk<UserMovieRatingRepository>()
    private val favoriteRepository = mockk<UserFavoriteRepository>()
    private val service = UserService(
        userProvisioningService,
        userRepository,
        ratingRepository,
        favoriteRepository,
    )

    private val subject = UUID.fromString("11111111-1111-1111-1111-111111111111")

    private fun jwt(): Jwt = Jwt.withTokenValue("token")
        .header("alg", "none")
        .subject(subject.toString())
        .issuedAt(Instant.parse("2026-01-01T00:00:00Z"))
        .expiresAt(Instant.parse("2026-01-01T01:00:00Z"))
        .claim("preferred_username", "alice")
        .claim("email", "alice@example.com")
        .build()

    private fun existingUser() = UserEntity(
        id = subject,
        displayName = "alice",
        email = "alice@example.com",
        createdAt = OffsetDateTime.parse("2026-05-15T03:00:00Z"),
    )

    @Test
    fun `getMe provisions defensively then returns DTO with counts`() {
        val token = jwt()
        val user = existingUser()
        every { userProvisioningService.provision(token) } returns user
        every { userRepository.findById(subject) } returns Optional.of(user)
        every { ratingRepository.countByUserId(subject) } returns 7L
        every { favoriteRepository.countByUserId(subject) } returns 3L

        val dto = service.getMe(token)

        assertThat(dto.id).isEqualTo(subject)
        assertThat(dto.displayName).isEqualTo("alice")
        assertThat(dto.email).isEqualTo("alice@example.com")
        assertThat(dto.createdAt).isEqualTo(user.createdAt)
        assertThat(dto.ratingsCount).isEqualTo(7L)
        assertThat(dto.favoritesCount).isEqualTo(3L)
        verify(exactly = 1) { userProvisioningService.provision(token) }
    }

    @Test
    fun `getMe throws IllegalStateException when findById is empty after provisioning`() {
        val token = jwt()
        every { userProvisioningService.provision(token) } returns existingUser()
        every { userRepository.findById(subject) } returns Optional.empty()

        assertThatThrownBy { service.getMe(token) }
            .isInstanceOf(IllegalStateException::class.java)
            .hasMessageContaining(subject.toString())
        verify(exactly = 0) { ratingRepository.countByUserId(any()) }
        verify(exactly = 0) { favoriteRepository.countByUserId(any()) }
    }
}
